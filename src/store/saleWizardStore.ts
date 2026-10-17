import { create } from 'zustand';
import { Cliente, ItemCarrito, Producto, TotalesCalculados } from '../types';
import { calculateTotals } from '../utils/calculations';

interface SaleWizardState {
  currentStep: number;
  clienteSeleccionado: Cliente | null;
  items: ItemCarrito[];
  totales: TotalesCalculados;

  setStep: (step: number) => void;
  nextStep: () => void;
  prevStep: () => void;

  setCliente: (cliente: Cliente | null) => void;

  addItem: (producto: Producto, cantidad?: number) => boolean;
  updateItemQuantity: (productoId: number, cantidad: number) => boolean;
  removeItem: (productoId: number) => void;
  clearCart: () => void;
  resetWizard: () => void;
}

export const useSaleWizardStore = create<SaleWizardState>((set, get) => ({
  currentStep: 1,
  clienteSeleccionado: null,
  items: [],
  totales: {
    subtotal: 0,
    impuesto: 0,
    total: 0,
    gananciaEstimada: 0,
    itemsTotales: 0,
  },

  setStep: (step: number) => set({ currentStep: step }),

  nextStep: () => {
    const { currentStep } = get();
    if (currentStep < 4) {
      set({ currentStep: currentStep + 1 });
    }
  },

  prevStep: () => {
    const { currentStep } = get();
    if (currentStep > 1) {
      set({ currentStep: currentStep - 1 });
    }
  },

  setCliente: (cliente: Cliente | null) => set({ clienteSeleccionado: cliente }),

  addItem: (producto: Producto, cantidad: number = 1): boolean => {
    const { items } = get();
    const existingIndex = items.findIndex((i) => i.producto.id === producto.id);
    const nuevaCantidad = existingIndex >= 0 ? items[existingIndex].cantidad + cantidad : cantidad;

    // Control de límite de stock
    if (nuevaCantidad > producto.stock) {
      return false; // Stock insuficiente
    }

    let updatedItems: ItemCarrito[];
    if (existingIndex >= 0) {
      updatedItems = [...items];
      updatedItems[existingIndex] = {
        ...updatedItems[existingIndex],
        cantidad: nuevaCantidad,
        subtotal: nuevaCantidad * producto.precio_venta,
      };
    } else {
      updatedItems = [
        ...items,
        {
          producto,
          cantidad,
          precio_unitario: producto.precio_venta,
          subtotal: cantidad * producto.precio_venta,
        },
      ];
    }

    const calculationItems = updatedItems.map((it) => ({
      cantidad: it.cantidad,
      precio_unitario: it.precio_unitario,
      precio_compra: it.producto.precio_compra,
    }));

    set({
      items: updatedItems,
      totales: calculateTotals(calculationItems),
    });

    return true;
  },

  updateItemQuantity: (productoId: number, cantidad: number): boolean => {
    const { items } = get();
    const item = items.find((i) => i.producto.id === productoId);
    if (!item) return false;

    if (cantidad <= 0) {
      get().removeItem(productoId);
      return true;
    }

    if (cantidad > item.producto.stock) {
      return false; // Stock insuficiente
    }

    const updatedItems = items.map((i) => {
      if (i.producto.id === productoId) {
        return {
          ...i,
          cantidad,
          subtotal: cantidad * i.precio_unitario,
        };
      }
      return i;
    });

    const calculationItems = updatedItems.map((it) => ({
      cantidad: it.cantidad,
      precio_unitario: it.precio_unitario,
      precio_compra: it.producto.precio_compra,
    }));

    set({
      items: updatedItems,
      totales: calculateTotals(calculationItems),
    });

    return true;
  },

  removeItem: (productoId: number) => {
    const { items } = get();
    const updatedItems = items.filter((i) => i.producto.id !== productoId);

    const calculationItems = updatedItems.map((it) => ({
      cantidad: it.cantidad,
      precio_unitario: it.precio_unitario,
      precio_compra: it.producto.precio_compra,
    }));

    set({
      items: updatedItems,
      totales: calculateTotals(calculationItems),
    });
  },

  clearCart: () => {
    set({
      items: [],
      totales: {
        subtotal: 0,
        impuesto: 0,
        total: 0,
        gananciaEstimada: 0,
        itemsTotales: 0,
      },
    });
  },

  resetWizard: () => {
    set({
      currentStep: 1,
      clienteSeleccionado: null,
      items: [],
      totales: {
        subtotal: 0,
        impuesto: 0,
        total: 0,
        gananciaEstimada: 0,
        itemsTotales: 0,
      },
    });
  },
}));


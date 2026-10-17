import { create } from 'zustand';

interface RefreshState {
  productsVersion: number;
  salesVersion: number;
  clientsVersion: number;
  dashboardVersion: number;
  bumpProducts: () => void;
  bumpSales: () => void;
  bumpClients: () => void;
  bumpDashboard: () => void;
}

export const useRefreshStore = create<RefreshState>((set) => ({
  productsVersion: 0,
  salesVersion: 0,
  clientsVersion: 0,
  dashboardVersion: 0,
  bumpProducts: () => set((s) => ({ productsVersion: s.productsVersion + 1 })),
  bumpSales: () => set((s) => ({ salesVersion: s.salesVersion + 1 })),
  bumpClients: () => set((s) => ({ clientsVersion: s.clientsVersion + 1 })),
  bumpDashboard: () => set((s) => ({ dashboardVersion: s.dashboardVersion + 1 })),
}));
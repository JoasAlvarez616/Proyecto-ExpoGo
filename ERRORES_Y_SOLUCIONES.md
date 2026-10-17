# Bitácora de Errores y Soluciones — Proyecto Expo Go (SDK 57)

Este documento resume de forma clara y directa los principales errores técnicos presentados durante la construcción y actualización del proyecto a **Expo SDK 57**, explicando su causa y la forma en que se resolvieron.

---

## 1. Bloqueo de Scripts en PowerShell de Windows
- **El problema:** Al ejecutar comandos como `npm -v` o `npx expo start`, la consola arrojaba un error de seguridad de Windows indicando que la ejecución de scripts estaba deshabilitada (`UnauthorizedAccess / npm.ps1`).
- **La causa:** La directiva de ejecución (*ExecutionPolicy*) de PowerShell por defecto restringe la ejecución de archivos `.ps1` no firmados.
- **Cómo se resolvió:** Se utilizó la llamada directa al binario ejecutable de Windows `npm.cmd` y `npx.cmd`, lo que omite el script `.ps1` y permite ejecutar instalaciones y compilaciones sin necesidad de alterar los privilegios del sistema operativo.

---

## 2. Incompatibilidad de Tipos en el Formulario de Productos
- **El problema:** TypeScript marcó un error al intentar enviar el formulario de producto hacia el servicio (`ProductoService`), indicando que `imagen_uri` y `descripcion` no eran compatibles.
- **La causa:** El esquema de validación de **Zod** permitía valores `null` o `undefined` cuando el usuario dejaba el campo vacío, pero la interfaz TypeScript del modelo solo admitía `string | undefined`.
- **Cómo se resolvió:** Se actualizó la interfaz `ProductoInput` en `src/types/index.ts` para que aceptara explícitamente `string | null | undefined`, alineando el tipado estricto con los datos generados por Zod y `react-hook-form`.

---

## 3. Fallo de Metro Bundler por Plugin Innecesario en `app.json`
- **El problema:** Durante el empaquetado de la aplicación, el proceso fallaba con el error `Cannot find module .../build/SQLiteDatabase`.
- **La causa:** Se había colocado `["expo-sqlite", { "enableFTS": true }]` dentro de la sección `"plugins"` de `app.json`. Los *config plugins* son para compilaciones nativas avanzadas (Prebuild / Bare React Native). En **Expo Go**, `expo-sqlite` ya viene precompilado en el cliente nativo del teléfono y no debe declararse como plugin de build.
- **Cómo se resolvió:** Se retiró `expo-sqlite` del arreglo `"plugins"` de `app.json`, dejando únicamente `"expo-router"`. Con este cambio, Metro empaquetó la base de datos sin errores.

---

## 4. Conflicto de Dependencias (Peer Dependencies) al Subir a SDK 57
- **El problema:** Al actualizar `package.json` a SDK 57, npm arrojaba un error `ERESOLVE could not resolve` indicando conflicto entre versiones de React 18 y React 19.
- **La causa:** La carpeta `node_modules` y el archivo `package-lock.json` antiguos tenían ancladas las dependencias del SDK 51 anterior, lo que impedía resolver el árbol de dependencias moderno de React 19.
- **Cómo se resolvió:** Se eliminaron por completo `node_modules` y `package-lock.json`, permitiendo que npm construyera un árbol limpio desde cero con el paquete oficial de Expo SDK 57 (`react@19.2.3`, `react-native@0.86.3` y `zustand@^5`).

---

## 5. Desfase de Versiones entre `react` y `react-dom`
- **El problema:** npm intentó descargar automáticamente `react-dom@19.3.1`, entrando en conflicto con `react@19.2.3` que venía fijado por Expo SDK 57.
- **La causa:** No se había especificado la versión exacta de `react-dom` en `package.json`, por lo que npm tomó la última disponible en el registro.
- **Cómo se resolvió:** Se añadió `"react-dom": "19.2.3"` en las dependencias de `package.json`, asegurando paridad de versión exacta entre el núcleo de React y el renderizador DOM.

---

## 6. Falta de `babel-preset-expo` en DevDependencies
- **El problema:** Al compilar para Android, Metro Bundler notificó que faltaba el preset de Babel para transformar los módulos de JavaScript/TypeScript.
- **La causa:** El preset no estaba explícitamente instalado en el entorno de desarrollo local.
- **Cómo se resolvió:** Se incluyó `"babel-preset-expo": "~57.0.16"` en la sección `devDependencies` de `package.json` y se ejecutó la instalación.

---

## 7. Propiedad `backgroundColor` No Soportada en `StatusBar` de SDK 57
- **El problema:** TypeScript marcó un error en `app/_layout.tsx`: `Property 'backgroundColor' does not exist on type 'IntrinsicAttributes & StatusBarProps'`.
- **La causa:** En la versión moderna de `expo-status-bar` (SDK 57), el color de fondo ya no se maneja mediante esa propiedad en el componente, sino a través del contenedor o tema nativo, recibiendo únicamente `style={'light' | 'dark'}`.
- **Cómo se resolvió:** Se removió `backgroundColor={colors.background}` de la etiqueta `<StatusBar />`, dejando `<StatusBar style={isDark ? 'light' : 'dark'} />`.

---

## 8. Cambio de Sintaxis `StyleSheet.absoluteFillObject` en React Native 0.86
- **El problema:** En el componente de deslizamiento para eliminar (`SwipeableRow.tsx`), TypeScript marcó que `absoluteFillObject` no existía en `typeof StyleSheet`.
- **La causa:** En la versión moderna de React Native (0.86), la constante estandarizada para cubrir el 100% del contenedor padre es `StyleSheet.absoluteFill`.
- **Cómo se resolvió:** Se reemplazó `...StyleSheet.absoluteFillObject` por `...StyleSheet.absoluteFill`.

---

## 📊 Resumen del Estado Final

| Aspecto | Estado Inicial | Estado Final tras Correcciones |
| :--- | :--- | :--- |
| **Versión Expo** | SDK 51 | **SDK 57 (`57.0.30`) — 100% compatible con la app de Expo Go** |
| **Versión React** | React 18 | **React 19 (`19.2.3`)** |
| **Versión React Native** | 0.74.5 | **0.86.3** |
| **TypeScript** | Errores de tipado | **0 errores (`npx tsc --noEmit` completado exitosamente)** |
| **Metro Bundler** | Fallos de resolución | **1.814 módulos empaquetados con éxito en 0 errores** |


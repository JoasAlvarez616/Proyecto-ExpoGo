// No-op: evita bucles de useFocusEffect.
// El refresco se hace con pull-to-refresh en cada lista.
export function useRefreshOnFocus(_refresh: () => void) {
  // intencionalmente vacío
}
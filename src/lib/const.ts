export enum PageState {
  pendding = 0,
  loading = 1,
  ready = 2,
  unload = 3,
}
export enum ComponentState {
  pendding = 0,
  attached = 1,
  ready = 2,
  detached = 3,
}
export enum NavigationFailureType {
  redirected = 2,
  aborted = 4,
  cancelled = 8,
  duplicated = 16,
}

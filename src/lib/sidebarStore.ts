type Listener = (open: boolean) => void;

let _open = false;
const _listeners = new Set<Listener>();

export const sidebarStore = {
  get: () => _open,
  toggle: () => {
    _open = !_open;
    _listeners.forEach((l) => l(_open));
  },
  close: () => {
    if (_open) {
      _open = false;
      _listeners.forEach((l) => l(false));
    }
  },
  subscribe: (fn: Listener): (() => void) => {
    _listeners.add(fn);
    return () => { _listeners.delete(fn); };
  },
};

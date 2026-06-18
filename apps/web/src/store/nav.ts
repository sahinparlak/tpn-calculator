import { create } from 'zustand';

// Single-page view-state machine that emulates the mobile navigation stack:
// push = forward, replace = swap current, back = pop. The calculator is home.
export type Route =
  | { view: 'calculator' }
  | { view: 'profiles' }
  | { view: 'detail'; id: string }
  | { view: 'edit'; id: string }
  | { view: 'import' };

interface NavState {
  stack: Route[];
  push: (route: Route) => void;
  replace: (route: Route) => void;
  back: () => void;
}

export const useNav = create<NavState>((set) => ({
  stack: [{ view: 'calculator' }],
  push: (route) => set((s) => ({ stack: [...s.stack, route] })),
  replace: (route) => set((s) => ({ stack: [...s.stack.slice(0, -1), route] })),
  back: () => set((s) => (s.stack.length > 1 ? { stack: s.stack.slice(0, -1) } : s)),
}));

export function useRoute(): Route {
  return useNav((s) => s.stack[s.stack.length - 1] ?? { view: 'calculator' });
}

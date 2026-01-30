import { create } from 'zustand'
import type { User } from '@/types/auth'
import { getUser, removeUser, setUser as setStorageUser } from '@/lib/auth'

interface AppState {
  // UI State
  sidebarCollapsed: boolean
  toggleSidebar: () => void

  // Auth State
  user: User | null
  setUser: (user: User) => void
  logout: () => void
}

export const useAppStore = create<AppState>((set) => ({
  // UI
  sidebarCollapsed: false,
  toggleSidebar: () => set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),

  // Auth
  user: getUser(),
  setUser: (user: User) => {
    setStorageUser(user);
    set({ user });
  },
  logout: () => {
    removeUser();
    set({ user: null });
  }
}))

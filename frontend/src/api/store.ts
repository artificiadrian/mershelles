import { create } from "zustand"

type AuthStore = {
  authenticated: boolean
  login: (password: string) => void
  logout: () => void
}

export const useAuthStore = create<AuthStore>((set) => ({
  authenticated: false,
  login: (password: string) => {
    set({ authenticated: true })
    sessionStorage.setItem("password", password)
  },
  logout: () => {
    sessionStorage.removeItem("password")
  },
}))

type InfoStore = {
  username: string
  hostname: string
  cwd: string
}

export const useInfoStore = create<InfoStore>((set) => ({
  username: "adrian",
  hostname: "test",
  cwd: "/home/x",
}))

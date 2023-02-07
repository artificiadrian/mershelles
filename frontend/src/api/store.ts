import { create } from "zustand"
import { InitResponse } from "./api"

type AuthStore = {
  authenticated: boolean
  login: () => void
  logout: () => void
}

export const useAuthStore = create<AuthStore>((set) => ({
  authenticated: false,
  login: () => {
    set({ authenticated: true })
  },
  logout: () => {
    set({ authenticated: false })
    document.cookie = ""
  },
}))

type InfoStore = {
  info: InitResponse
  cwd: string
  setCwd: (cwd: string) => void
  setInfo: (info: InitResponse) => void
}

export const useInfoStore = create<InfoStore>((set) => ({
  cwd: "?",
  info: {
    cwd: "?",
    hostname: "?",
    isSuperUser: false,
    machine: "?",
    os: "?",
    release: "?",
    version: "?",
    writeable: false,
    username: "?",
  },
  setCwd: (cwd: string) => set({ cwd }),
  setInfo: (info: InitResponse) => set({ info }),
}))

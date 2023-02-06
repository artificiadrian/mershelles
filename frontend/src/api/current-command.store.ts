import { create } from "zustand"

type CurrentCommandState = {
  currentCommand: string
  isExecuting: boolean
  execute: (command: string) => void
  done: () => void
}

export const useCurrentCommandStore = create<CurrentCommandState>((set) => ({
  currentCommand: "",
  isExecuting: false,
  execute: (command: string) =>
    set({ currentCommand: command, isExecuting: true }),
  done: () => set({ isExecuting: false, currentCommand: "" }),
}))

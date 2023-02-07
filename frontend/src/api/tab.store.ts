import { create } from "zustand"

export type Tab = "shell" | "file-browser"

export type TabState = {
  currentTab: Tab
  setCurrentTab: (tab: Tab) => void
}

export const useTabStore = create<TabState>((set) => ({
  currentTab: "shell",
  setCurrentTab: (tab: Tab) => set({ currentTab: tab }),
}))

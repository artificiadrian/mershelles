import { useEffect } from "react"
import { useLogStore } from "./api/log.store"
import { Tab, useTabStore } from "./api/tab.store"
import Auth from "./Auth"
import Shell from "./Shell"

function App() {
  const { currentTab } = useTabStore()
  return (
    <div className="h-screen md:p-8">
      <Auth>
        <div className="h-full bg-neutral-900 md:rounded-xl shadow-2xl">
          <Toolbar />
          <div className="h-[calc(100%-2rem)] md:h-[calc(100%-3rem)]">
            {currentTab === "shell" && <Shell />}
          </div>
        </div>
      </Auth>
    </div>
  )
}

function TabItem({ children, tab }: { children: React.ReactNode; tab: Tab }) {
  const active = useTabStore((state) => state.currentTab === tab)
  const { setCurrentTab } = useTabStore()
  return (
    <button
      onClick={() => setCurrentTab(tab)}
      className={`hover:text-primary-500 focus:ring-0 focus:border-primary-500 border-b-2 border-transparent transition ${
        active && "text-primary-500  border-primary-500"
      }`}
    >
      {children}
    </button>
  )
}

function Toolbar() {
  return (
    <nav className="select-none font-sans h-8 md:h-12 px-2 md:px-4 text-sm md:text-base border-b border-b-neutral-700 flex flex-row items-center gap-4 ">
      <TabItem tab="shell">Shell</TabItem>
      <TabItem tab="file-browser">File Browser</TabItem>
      <div className="flex-1"></div>
      <h1 className="text-neutral-600 opacity-50">Mershelles</h1>
    </nav>
  )
}

export default App

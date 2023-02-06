import Auth from "./Auth"
import Shell from "./Shell"
import Toolbar from "./Toolbar"

function App() {
  return (
    <div className="h-screen p-8 flex flex-row items-stretch gap-8">
      <Auth>
        <Shell />
        <Toolbar />
      </Auth>
    </div>
  )
}

export default App

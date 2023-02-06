import { useState } from "react"
import { auth } from "./api/api"
import { useAuthStore } from "./api/store"

type Props = {
  children: React.ReactNode
}

export default function Auth({ children }: Props) {
  const { authenticated, login } = useAuthStore()
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  async function onClick() {
    setIsLoading(true)
    const response = await auth(password)
    if (response.success) {
      login(password)
    }
    setIsLoading(false)
  }

  if (!authenticated) {
    return (
      <div className="h-full w-full flex-1 grid place-items-center">
        <div className="bg-neutral-900 rounded-xl p-8">
          <div>
            <input
              disabled={isLoading}
              onChange={(e) => setPassword(e.target.value)}
              className="w-52 bg-transparent p-1 px-2 border border-neutral-700 bg-neutral-900 rounded"
              type="password"
              placeholder="Password"
            ></input>
          </div>
          <button
            disabled={!password || isLoading}
            onClick={onClick}
            className="rounded p-1 px-4 bg-primary-600 disabled:bg-neutral-700 disabled:text-neutral-500"
          >
            {isLoading ? "Loading..." : "Login"}
          </button>
        </div>
      </div>
    )
  }
  return <>{children}</>
}

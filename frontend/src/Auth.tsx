import { useEffect, useState } from "react"
import { auth, init, InitResponse } from "./api/api"
import { LogLine, useLogStore } from "./api/log.store"
import { useAuthStore, useInfoStore } from "./api/store"

type Props = {
  children: React.ReactNode
}

function welcome(info: InitResponse, log: (line: LogLine) => void) {
  log({
    type: "output",
    output: `Welcome to Mershelles on ${info.os} ${info.release} ${info.machine} ${info.version}`,
  })
  log({ type: "help" })
}

export default function Auth({ children }: Props) {
  const { authenticated, login } = useAuthStore()
  const { log, clear } = useLogStore()
  const { setInfo } = useInfoStore()
  const [password, setPassword] = useState(
    localStorage.getItem("mershelles") || ""
  )
  const [isLoading, setIsLoading] = useState(false)

  async function onClick() {
    setIsLoading(true)
    const response = await auth(password)
    if (response.success) {
      await initMershelles()
    }
    setIsLoading(false)
  }

  async function initMershelles() {
    setIsLoading(true)
    const response = await init()
    if (response.success) {
      setInfo(response)
      clear()
      welcome(response, log)
      login()
    }
    setIsLoading(false)
  }

  useEffect(() => {
    initMershelles().then(() => {})
  }, [])

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
            disabled={isLoading}
            onClick={onClick}
            className="mt-4 w-full rounded p-1 px-4 bg-primary-600 disabled:bg-neutral-700 disabled:text-neutral-500"
          >
            {isLoading ? "Loading..." : "Login"}
          </button>
        </div>
      </div>
    )
  }
  return <>{children}</>
}

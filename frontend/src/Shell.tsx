import { useEffect, useRef } from "react"
import { create } from "zustand"
import { download, exec, InitResponse } from "./api/api"
import { useCurrentCommandStore } from "./api/current-command.store"
import { LogLine, useLogStore } from "./api/log.store"
import { useInfoStore } from "./api/store"
import Log from "./Log"

function minifyCwd(cwd: string) {
  const parts = cwd.split("/")
  if (parts.length <= 2) return cwd
  const miniParts = parts.map((p) => p[0])
  return miniParts.join("/").slice(0, -1) + parts[parts.length - 1]
}

export default function Shell() {
  const { info, cwd } = useInfoStore()
  const { isExecuting, execute, done, currentCommand } =
    useCurrentCommandStore()
  const { clear, log } = useLogStore()
  const logRef = useRef<HTMLDivElement>(null)
  const minifiedCwd = minifyCwd(cwd)

  async function interceptCommand(command: string) {
    command = command.trim()
    if (command === "clear") {
      clear()
      return true
    } else if (command === "") {
      log({ type: "output", output: "" })
      return true
    } else if (command === "help") {
      log({ type: "help" })
      return true
    } else if (command.startsWith("download")) {
      const path = command.split(" ")[1]
      window.open(`http://localhost:8080?cwd=${cwd}&download=${path}`, "_blank")
      log({ type: "output", output: `Trying to download ${path}` })
      return true
    }
    return false
  }

  async function onSubmit(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key !== "Enter") return
    const target = e.target as any
    const command = target.value + ""
    target.value = ""
    execute(command)

    if (await interceptCommand(command)) {
      done()
      return
    }

    const response = await exec(command)
    log({ type: "input", command })

    if (response.success) {
      if (response.output.length === 0) {
        log({ type: "output", output: "No output." })
      } else {
        response.output
          .split("\n")
          .forEach((line) => log({ type: "output", output: line }))
      }
    } else {
      log({ type: "error", error: response.error })
    }
    done()
  }

  return (
    <div className="font-mono h-full flex flex-col">
      <div
        ref={logRef}
        className="flex-1 overflow-auto md:p-4 p-2 text-xs md:text-base"
      >
        <Log parentRef={logRef} />
      </div>
      <div className="border-t border-neutral-700 flex flex-col items-stretch md:flex-row md:items-baseline  md:pl-4 md:rounded-bl-xl">
        <div className="px-2 md:p-0 md:rounded-bl-xl text-xs md:text-sm">
          <span className={`${info.isSuperUser ? "text-red-500" : ""}`}>
            {info.username}
          </span>
          @{info.hostname}
        </div>
        <div className=" px-2 md:p-0 md:mx-4 font-bold text-xs md:text-sm">
          {minifiedCwd}
        </div>
        <input
          disabled={isExecuting}
          onKeyDown={onSubmit}
          type="text"
          className="md:flex-1 text-xs md:text-base border-t md:border-t-0 md:border-l transition border-neutral-700  p-2 md:p-4 md:rounded-br-xl bg-neutral-900"
          placeholder={
            isExecuting ? `Executing ${currentCommand} ...` : "Enter command"
          }
        ></input>
      </div>
    </div>
  )
}

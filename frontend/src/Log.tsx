import { useRef } from "react"
import { useCurrentCommandStore } from "./api/current-command.store"
import {
  LogLine,
  LogLineError,
  LogLineInput,
  LogLineOutput,
  useLogStore,
} from "./api/log.store"

export default function Log() {
  const { buffer } = useLogStore()
  const { isExecuting, currentCommand } = useCurrentCommandStore()
  return (
    <>
      {buffer.map((line, i) => (
        <LogLineItem key={i} line={line} />
      ))}
      {isExecuting && (
        <p>
          <span className="text-neutral-500">Executing</span> {currentCommand}
        </p>
      )}
    </>
  )
}

function LogLineItem({ line }: { line: LogLine }) {
  if (line.type === "input") {
    return <LogLineInputItem line={line as LogLineInput} />
  } else if (line.type === "output") {
    return <LogLineOutputItem line={line as LogLineOutput} />
  } else if (line.type === "error") {
    return <LogLineErrorItem line={line as LogLineError} />
  }

  return <div>wtf?</div>
}

function LogLineInputItem({ line }: { line: LogLineInput }) {
  return <p className="text-neutral-500">{line.command}</p>
}

function LogLineOutputItem({ line }: { line: LogLineOutput }) {
  return <p>{line.output}</p>
}

function LogLineErrorItem({ line }: { line: LogLineError }) {
  return <p className="text-red-500">{line.error}</p>
}

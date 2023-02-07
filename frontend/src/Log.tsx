import { useCurrentCommandStore } from "./api/current-command.store"
import { LogLine, LogLineType, useLogStore } from "./api/log.store"
import { useVirtualizer } from "@tanstack/react-virtual"
import { useEffect } from "react"

const estimateLogSize = (type: LogLineType) => {
  if (type === "input") return 30
  if (type === "help") return 150
  return 20
}

export default function Log({
  parentRef,
}: {
  parentRef: React.RefObject<HTMLDivElement>
}) {
  const { buffer, setOnLog } = useLogStore()
  const { isExecuting, currentCommand } = useCurrentCommandStore()

  function estimateSize(index: number) {
    return estimateLogSize(buffer[index].type)
  }

  const virtualizer = useVirtualizer({
    count: buffer.length,
    getScrollElement: () => parentRef.current,
    estimateSize,
  })

  useEffect(() => {
    setOnLog(() => {
      setTimeout(() => {
        virtualizer.scrollToOffset(virtualizer.getTotalSize())
      }, 1)
    })

    return () => {
      setOnLog(() => {})
    }
  }, [])

  return (
    <>
      <div
        style={{
          height: `${virtualizer.getTotalSize()}px`,
          width: "100%",
          position: "relative",
        }}
      >
        {virtualizer.getVirtualItems().map((virtualItem) => {
          return (
            <div
              key={virtualItem.index}
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                width: "100%",
                height: `${virtualItem.size}px`,
                transform: `translateY(${virtualItem.start}px)`,
              }}
            >
              <LogLineItem line={buffer[virtualItem.index]} />
            </div>
          )
        })}
      </div>
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
    return <pre className="text-neutral-500 pt-2">{line.command}</pre>
  } else if (line.type === "output") {
    return <pre>{line.output}</pre>
  } else if (line.type === "error") {
    return <pre className="text-red-500">{line.error}</pre>
  } else if (line.type === "help") {
    return <LogHelp />
  }

  return <pre>unknown log line: {JSON.stringify(line)}</pre>
}

function LogHelp() {
  return (
    <div className="bg-neutral-800 py-2 my-2">
      <CommandHelp name={"clear"} description={"Clear log"}></CommandHelp>
      <CommandHelp name={"help"} description={"Show help"}></CommandHelp>
      <CommandHelp
        name={"download <path>"}
        description={"Download file"}
      ></CommandHelp>
      <CommandHelp
        name={"upload <path>"}
        description={"Upload file to path"}
      ></CommandHelp>
      <CommandHelp
        name={"eval <code>"}
        description={"Eval php code"}
      ></CommandHelp>
    </div>
  )
}

function CommandHelp({
  name,
  description,
}: {
  name: string
  description: string
}) {
  return (
    <>
      <pre>
        <span className="text-primary-300 w-48"> {name}</span>
        <span className="text-neutral-300"> - {description}</span>
      </pre>
    </>
  )
}

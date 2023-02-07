import { useCurrentCommandStore } from "./api/current-command.store"
import { LogLine, useLogStore } from "./api/log.store"
import { useVirtualizer } from "@tanstack/react-virtual"
import { useEffect } from "react"

export default function Log({
  parentRef,
}: {
  parentRef: React.RefObject<HTMLDivElement>
}) {
  const { buffer, setOnLog } = useLogStore()
  const { isExecuting, currentCommand } = useCurrentCommandStore()

  function estimateSize(index: number) {
    return buffer[index].type === "input" ? 30 : 20
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
    return <p className="text-neutral-500 pt-2">{line.command}</p>
  } else if (line.type === "output") {
    return <p>{line.output}</p>
  } else if (line.type === "error") {
    return <p className="text-red-500">{line.error}</p>
  }

  return <p>unknown log line: {JSON.stringify(line)}</p>
}

import { create } from "zustand"

type LogState = {
  buffer: LogLine[]
  log: (line: LogLine) => void
  clear: () => void
  onLog: (line: LogLine) => void
  setOnLog: (onLog: (line: LogLine) => void) => void
}

export type LogLineType = "input" | "error" | "output" | "help"

export type LogLineBase = {
  type: LogLineType
}

export type LogLine = LogLineInput | LogLineError | LogLineOutput | LogLineHelp

export type LogLineInput = LogLineBase & {
  type: "input"
  command: string
}

export type LogLineError = LogLineBase & {
  type: "error"
  error: string
}

export type LogLineHelp = LogLineBase & {
  type: "help"
}

export type LogLineOutput = LogLineBase & {
  type: "output"
  output: string
}

export const useLogStore = create<LogState>((set) => ({
  buffer: [] as LogLine[],
  log: (line: LogLine) =>
    set((state) => {
      const newBuffer = [...state.buffer, line]
      if (newBuffer.length > 1024) {
        newBuffer.shift()
      }
      state.onLog(line)
      return { buffer: newBuffer }
    }),
  clear: () => set({ buffer: [] }),
  onLog: (line: LogLine) => {},
  setOnLog: (onLog: (line: LogLine) => void) => set({ onLog }),
}))

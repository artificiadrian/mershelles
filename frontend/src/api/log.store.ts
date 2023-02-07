import { create } from "zustand"

type LogState = {
  buffer: LogLine[]
  log: (line: LogLine) => void
  clear: () => void
}

type LogLineType = "input" | "error" | "output"

export type LogLineBase = {
  type: LogLineType
}

export type LogLine = LogLineInput | LogLineError | LogLineOutput

export type LogLineInput = LogLineBase & {
  type: "input"
  command: string
}

export type LogLineError = LogLineBase & {
  type: "error"
  error: string
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
      return { buffer: newBuffer }
    }),
  clear: () => set({ buffer: [] }),
}))

import { create } from "zustand"

type LogState = {
  buffer: LogLine[]
  add: (line: LogLine) => void
  addInput: (command: string) => void
  addError: (error: string) => void
  addOutput: (output: string) => void
  clear: () => void
}

type LogLineType = "input" | "error" | "output"

export type LogLine = {
  type: LogLineType
}

export type LogLineInput = LogLine & {
  type: "input"
  command: string
}

export type LogLineError = LogLine & {
  type: "error"
  error: string
}

export type LogLineOutput = LogLine & {
  type: "output"
  output: string
}

export const useLogStore = create<LogState>((set) => ({
  buffer: [] as LogLine[],
  add: (line: LogLine) => set((state) => ({ buffer: [...state.buffer, line] })),
  clear: () => set({ buffer: [] }),
  addInput: (command: string) =>
    set((state) => ({
      buffer: [
        ...state.buffer,
        {
          type: "input",
          command,
        } as LogLineInput,
      ],
    })),
  addError: (error: string) =>
    set((state) => ({
      buffer: [
        ...state.buffer,
        {
          type: "error",
          error,
        } as LogLineError,
      ],
    })),
  addOutput: (output: string) =>
    set((state) => ({
      buffer: [
        ...state.buffer,
        {
          type: "output",
          output,
        } as LogLineOutput,
      ],
    })),
}))

/*
 * init -> get basic data, check if auth needed
 * auth -> authenticate with cookie
 * logout -> logout
 * destroy -> destroy shell
 * exec -> execute command
 * upload -> upload file
 * download -> download file
 */

import { useInfoStore } from "./store"

type RequestType =
  | "init"
  | "auth"
  | "destroy"
  | "exec"
  | "upload"
  | "download"
  | "ls"

type Request = {
  type: RequestType
}

type Response = {
  success: boolean
  cwd: string
}

type ErrorResponse = Response & {
  success: false
  error: string
}

type SuccessResponse = Response & {
  success: true
}

const randomAlphanumeric = (length: number) => {
  let result = ""
  const characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789"
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length))
  }
  return result
}

export async function request<TRequest, TResponse>(
  request: TRequest & Request
): Promise<(TResponse & SuccessResponse) | ErrorResponse> {
  const delimiter = randomAlphanumeric(16)
  const startDelimiter = "MERSHELLES_START_" + delimiter
  const endDelimiter = "MERSHELLES_END_" + delimiter

  const { file, ...rest } = request as any

  const formData = new FormData()
  Object.keys(rest).forEach((key) => {
    formData.append(key, rest[key])
  })
  formData.append("delimiter", delimiter)
  if (request.type !== "auth") {
    formData.append("password", sessionStorage.getItem("password") || "")
  }
  formData.append("cwd", useInfoStore.getState()?.cwd || "")

  if (file) {
    formData.append("file", file)
  }

  const res = await fetch("http://localhost:8080", {
    // todo change to relative path
    method: "POST",
    body: formData,
  })

  const text = await res.text()
  const start = text.indexOf(startDelimiter) + startDelimiter.length
  const end = text.indexOf(endDelimiter)
  const encoded = text.substring(start, end)
  const response = JSON.parse(atob(encoded)) as
    | (TResponse & SuccessResponse)
    | ErrorResponse
  if (response.success) {
    useInfoStore.setState({ cwd: response.cwd })
  }
  return response
}

type InitResponse = {
  authNeeded: boolean
}

type AuthRequest = {
  password: string
}

type _ = {}

export const init = async () => request<_, InitResponse>({ type: "init" })

export const auth = async (password: string) =>
  request<AuthRequest, _>({ type: "auth", password })

export const destroy = async () => request<_, _>({ type: "destroy" })

type ExecRequest = {
  command: string
}

type ExecResponse = {
  output: string
}

export const exec = async (command: string) =>
  request<ExecRequest, ExecResponse>({ type: "exec", command })

type UploadRequest = {
  file: File
}

type UploadResponse = {
  path: string
}

export const upload = async (file: File) =>
  request<UploadRequest, UploadResponse>({ type: "upload", file })

type DownloadRequest = {
  path: string
}

type DownloadResponse = {
  downloadUrl: string
}

export const download = async (path: string) =>
  request<DownloadRequest, DownloadResponse>({ type: "download", path })

type LsRequest = {
  path: string
}

export type FileInfo = {
  name: string
  isDir: boolean
  size: number
  mode: number
  lastModified: number
}

type LsResponse = {
  files: FileInfo[]
}

export const ls = async (path: string) =>
  request<LsRequest, LsResponse>({ type: "ls", path })

import { useEffect, useState } from "react"
import { create } from "zustand"
import { exec, FileInfo, ls } from "./api/api"
import { useInfoStore } from "./api/store"

type FileBrowserState = {
  files: FileInfo[]
  setFiles: (files: FileInfo[]) => void
}

const useFileBrowserStore = create<FileBrowserState>((set) => ({
  files: [],
  setFiles: (files) => set({ files }),
}))

export default function FileBrowser() {
  const { setFiles } = useFileBrowserStore()
  const { cwd } = useInfoStore()

  useEffect(() => {
    ls(cwd).then((response) => {
      if (response.success) {
        // order by name

        setFiles(
          response.files.sort((a, b) => {
            if (a.name < b.name) return -1
            if (a.name > b.name) return 1
            return 0
          })
        )
      }
    })
  }, [cwd])

  return (
    <div className="font-mono h-full flex flex-col md:px-4 md:pb-4">
      <Path />
      <div className="flex-1 overflow-auto">
        <FileList />
      </div>
    </div>
  )
}

function FileList() {
  const { files } = useFileBrowserStore()
  return (
    <table>
      <thead>
        <tr>
          <th className="text-start pr-8">Mode</th>
          <th className="text-start pr-8">Name</th>
          <th className="text-start pr-8">Size</th>
          <th className="text-start pr-8">Last Modified</th>
        </tr>
      </thead>
      <tbody>
        {files.map((file) => (
          <FileEntry key={file.name} file={file} />
        ))}
      </tbody>
    </table>
  )
}

function FileEntry({ file }: { file: FileInfo }) {
  const { setCwd } = useInfoStore()
  async function cd() {
    const response = await exec(`cd ${file.name}`)
    const newCwd = response.cwd
    setCwd(newCwd)
    if (!response.success) {
      console.log("error")
      return
    }
  }
  return (
    <tr
      onClick={cd}
      className={`${
        file.isDir ? "cursor-pointer group transition hover:bg-neutral-800" : ""
      }`}
    >
      <td className="pr-8">
        {file.isDir ? "d" : "-"}
        {file.mode}
      </td>
      <td className="group-hover:underline pr-8">{file.name}</td>
      <td className="pr-8">{file.size}</td>
      <td className="pr-8">
        {new Date(file.lastModified * 1000).toISOString()}
      </td>
    </tr>
  )
}

function Path() {
  const { cwd, setCwd } = useInfoStore()
  const [localCwd, setLocalCwd] = useState(cwd)

  useEffect(() => {
    setLocalCwd(cwd)
  }, [cwd])

  async function onSubmit(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key !== "Enter") return
    const target = e.target as any
    let path = target.value + ""
    target.value = ""
    if (path === "") {
      path = "/"
    }

    const response = await exec(`cd ${path}`)
    const newCwd = response.cwd
    setCwd(newCwd)
    if (!response.success) {
      console.log("error")
      return
    }
  }

  return (
    <input
      className="bg-transparent focus:ring-0 py-2"
      type="text"
      value={localCwd}
      onKeyDown={onSubmit}
      onChange={(e) => setLocalCwd(e.target.value)}
    />
  )
}

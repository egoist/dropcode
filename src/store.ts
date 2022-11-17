import { nanoid } from "nanoid"
import { fs, path, dialog, os } from "@tauri-apps/api"
import { BaseDirectory } from "@tauri-apps/api/fs"
import { createStore } from "solid-js/store"

export interface Snippet {
  id: string
  name: string
  createdAt: string
  updatedAt: string
  language?: string
  deletedAt?: string
  vscodeSnippet?: {
    prefix?: string
  }
}

interface AppData {
  folders: string[]
}

const [state, setState] = createStore<{
  ready: boolean
  app: AppData
  folder: string | null
  snippets: Snippet[]
  isMac: boolean
  isSidebarCollapsed: boolean
}>({
  ready: false,
  app: {
    folders: [],
  },
  folder: null,
  snippets: [],
  isMac: /macintosh/i.test(navigator.userAgent),
  isSidebarCollapsed: false
})

export { state }

const writeSnippetsJson = async (folder: string, snippets: Snippet[]) => {
  console.log("writing snippets.json")
  await fs.writeTextFile(
    await path.join(folder, "snippets.json"),
    JSON.stringify(snippets)
  )
}

const writeAppJson = async (appData: AppData) => {
  await fs.createDir("", { dir: BaseDirectory.App, recursive: true })
  await fs.writeTextFile("app.json", JSON.stringify(appData), {
    dir: BaseDirectory.App,
  })
}

const pathExists = async (path: string, baseDir?: BaseDirectory) => {
  const exists: boolean = await fs.exists(path, { dir: baseDir })
  return exists
}

export const actions = {
  init: async () => {
    const text = await fs
      .readTextFile("app.json", { dir: BaseDirectory.App })
      .catch((error) => {
        console.error(error)
        return "{}"
      })
    const appData: Partial<AppData> = JSON.parse(text)

    if (appData.folders) {
      setState("app", "folders", appData.folders)
    }
    setState("ready", true)
  },

  setFolder: (folder: string | null) => {
    setState("folder", folder)
  },

  removeFolderFromHistory: async (folder: string) => {
    setState(
      "app",
      "folders",
      state.app.folders.filter((f) => f !== folder)
    )
    await writeAppJson(state.app)
  },

  loadFolder: async (folder: string) => {
    const exists = await pathExists(folder)

    if (!exists) {
      await actions.removeFolderFromHistory(folder)
      await dialog.message("Folder doesn't exist")
      return
    }
    const snippetsPath = await path.join(folder, "snippets.json")
    const text = await fs.readTextFile(snippetsPath).catch((error) => {
      console.error(error)
      return null
    })
    if (text) {
      const snippets = JSON.parse(text)
      setState("snippets", snippets)
    } else {
      setState("snippets", [])
    }

    if (state.app.folders.includes(folder)) {
      setState("app", "folders", [
        folder,
        ...state.app.folders.filter((f) => f !== folder),
      ])
    } else {
      setState("app", "folders", [folder, ...state.app.folders.slice(0, 10)])
    }

    await writeAppJson(state.app)
  },

  createSnippet: async (snippet: Snippet, content: string) => {
    if (!state.folder) return

    const filepath = await path.join(state.folder, snippet.id)
    await fs.writeTextFile(filepath, content)
    const snippets = [...state.snippets, snippet]
    await writeSnippetsJson(state.folder, snippets)
    setState("snippets", snippets)
  },

  getRandomId: () => {
    return nanoid(10)
  },

  readSnippetContent: async (id: string) => {
    if (!state.folder) return ""
    const text = await fs.readTextFile(await path.join(state.folder, id))
    return text
  },

  updateSnippet: async <K extends keyof Snippet, V extends Snippet[K]>(
    id: string,
    key: K,
    value: V
  ) => {
    if (!state.folder) return

    const snippets = state.snippets.map((snippet) => {
      if (snippet.id === id) {
        return { ...snippet, [key]: value, updatedAt: new Date().toISOString() }
      }
      return snippet
    })

    setState("snippets", snippets)

    await writeSnippetsJson(state.folder, snippets)
    await actions.syncSnippetsToVscode()
  },

  updateSnippetContent: async (id: string, content: string) => {
    if (!state.folder) return

    await fs.writeTextFile(await path.join(state.folder, id), content)
    await actions.updateSnippet(id, "updatedAt", new Date().toISOString())
  },

  moveSnippetsToTrash: async (ids: string[], restore = false) => {
    if (!state.folder) return

    const snippets = state.snippets.map((snippet) => {
      if (ids.includes(snippet.id)) {
        return {
          ...snippet,
          deletedAt: restore ? undefined : new Date().toISOString(),
        }
      }
      return snippet
    })

    setState("snippets", snippets)

    await writeSnippetsJson(state.folder, snippets)
    await actions.syncSnippetsToVscode()
  },

  deleteSnippetForever: async (id: string) => {
    if (!state.folder) return

    const snippets = state.snippets.filter((snippet) => {
      return id !== snippet.id
    })
    await writeSnippetsJson(state.folder, snippets)
    await fs.removeFile(await path.join(state.folder, id))
    setState("snippets", snippets)
  },

  emptyTrash: async () => {
    if (!state.folder) return
    const toDelete: string[] = []
    const snippets = state.snippets.filter((snippet) => {
      if (snippet.deletedAt) {
        toDelete.push(snippet.id)
      }
      return !snippet.deletedAt
    })
    await writeSnippetsJson(state.folder, snippets)
    await Promise.all(
      toDelete.map(async (id) => {
        return fs.removeFile(await path.join(state.folder!, id))
      })
    )
    setState("snippets", snippets)
  },

  getFolderHistory: async () => {
    const text = await fs
      .readTextFile("folders.json", { dir: BaseDirectory.App })
      .catch(() => "[]")
    const folders: string[] = JSON.parse(text)
    return folders
  },

  syncSnippetsToVscode: async () => {
    if (!state.folder) return

    const folderName = state.folder.split(path.sep).pop()!

    type VSCodeSnippets = Record<
      string,
      { scope: string; prefix: string[]; body: string[]; __folderName: string }
    >

    const newSnippets: VSCodeSnippets = {}

    for (const s of state.snippets) {
      const prefix = s.vscodeSnippet?.prefix?.trim()

      if (!prefix || s.deletedAt) {
        continue
      }

      newSnippets[s.name] = {
        scope: "",
        prefix: prefix
          .split(",")
          .map((v) => v.trim())
          .filter(Boolean),
        body: [await actions.readSnippetContent(s.id)],
        __folderName: folderName,
      }
    }

    const snippetsFileName = "dropcode.code-snippets"
    const codeSnippetsDir = `Code${path.sep}User${path.sep}snippets`
    const snippetsFilePath = `${codeSnippetsDir}${path.sep}${snippetsFileName}`

    // VSCode is not installed
    if (!(await pathExists("Code", BaseDirectory.Data))) {
      return
    }

    // Get existing snippets
    const snippets: VSCodeSnippets = (await pathExists(
      snippetsFilePath,
      BaseDirectory.Data
    ))
      ? JSON.parse(
          await fs.readTextFile(snippetsFilePath, { dir: BaseDirectory.Data })
        )
      : {}

    // Merge old and new snippets
    for (const name in snippets) {
      const snippet = snippets[name]
      if (snippet.__folderName === folderName) {
        delete snippets[name]
      }
    }
    Object.assign(snippets, newSnippets)

    // Write to file
    console.log("writing", snippetsFilePath)
    await fs.createDir(codeSnippetsDir, {
      recursive: true,
      dir: BaseDirectory.Data,
    })
    await fs.writeTextFile(
      snippetsFilePath,
      JSON.stringify(snippets, null, 2),
      { dir: BaseDirectory.Data }
    )
  },

  toggleSidebar: (isSidebarCollapsed: boolean) => {
    setState("isSidebarCollapsed", !isSidebarCollapsed)
  },
}

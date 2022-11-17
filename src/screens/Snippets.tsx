import { Link, useNavigate, useSearchParams } from "@solidjs/router"
import {
  createEffect,
  createMemo,
  createSignal,
  For,
  on,
  onCleanup,
  Show,
} from "solid-js"
import { confirm } from "@tauri-apps/api/dialog"
import { Editor } from "../components/Editor"
import {
  FolderHistoryModal,
  LanguageModal,
  VSCodeSnippetSettingsModal,
} from "../components/Modal"
import { getLanguageName, languages } from "../lib/languages"
import { debounce } from "../lib/utils"
import { actions, state } from "../store"
import { Button } from "../components/Button"
import { timeago } from "../lib/date"
import { tooltip } from "../lib/tooltip"
import { path } from "@tauri-apps/api"
import { useFormControl } from "../lib/use-form-control"

export const Snippets = () => {
  const goto = useNavigate()
  const [searchParams] = useSearchParams<{ folder: string; id?: string }>()
  const [content, setContent] = createSignal("")
  const [getOpenLanguageModal, setOpenLanguageModal] = createSignal(false)
  const [getOpenFolderHistoryModal, setOpenFolderHistoryModal] =
    createSignal(false)
  const [getSearchType, setSearchType] = createSignal<
    null | "non-trash" | "trash"
  >(null)
  const [getSearchKeyword, setSearchKeyword] = createSignal<string>("")
  const [getSelectedSnippetIds, setSelectedSnippetIds] = createSignal<string[]>(
    []
  )
  const [getOpenVSCodeSnippetSettingsModal, setOpenVSCodeSnippetSettingsModal] =
    createSignal<string | undefined>()

  let searchInputEl: HTMLInputElement | undefined
  const nameInputControl = useFormControl({
    defaultValue: "",
    async save(value) {
      await actions.updateSnippet(snippet()!.id, "name", value)
    },
  })

  const snippets = createMemo(() => {
    const keyword = getSearchKeyword().toLowerCase()

    return state.snippets
      .filter((snippet) => {
        const conditions: (string | boolean | undefined | null)[] = []

        conditions.push(
          getSearchType() === "trash" ? snippet.deletedAt : !snippet.deletedAt
        )

        if (keyword) {
          conditions.push(snippet.name.toLowerCase().includes(keyword))
        }

        return conditions.every((v) => v)
      })
      .sort((a, b) => {
        if (a.deletedAt && b.deletedAt) {
          return a.deletedAt > b.deletedAt ? -1 : 1
        }
        return a.createdAt > b.createdAt ? -1 : 1
      })
  })

  const actualSelectedSnippetIds = createMemo(() => {
    const ids = [...getSelectedSnippetIds()]
    if (searchParams.id && snippets().some((s) => s.id === searchParams.id)) {
      ids.push(searchParams.id)
    }
    return ids
  })

  const snippet = createMemo(() =>
    state.snippets.find((snippet) => snippet.id === searchParams.id)
  )

  const isSidebarSnippetActive = (id: string) => {
    return id === snippet()?.id || getSelectedSnippetIds().includes(id)
  }

  const languageExtension = createMemo(() => {
    const lang = languages.find((lang) => lang.id === snippet()?.language)
    return lang && lang.extension
  })

  const newSnippet = async () => {
    const d = new Date()
    const id = actions.getRandomId()
    await actions.createSnippet(
      {
        id,
        name: "Untitled",
        createdAt: d.toISOString(),
        updatedAt: d.toISOString(),
        language: "plaintext",
      },
      ""
    )
    setSearchType(null)
    goto(`/snippets?${new URLSearchParams({ ...searchParams, id }).toString()}`)
  }

  const handleEditorChange = debounce((value: string) => {
    if (value === content()) return
    console.log("saving content..")
    actions.updateSnippetContent(snippet()!.id, value)
    setContent(value)
  }, 250)

  const moveSnippetToTrashOrRestore = async (id: string) => {
    const snippet = state.snippets.find((snippet) => snippet.id === id)
    if (!snippet) {
      console.error("snippet not found")
      return
    }
    if (snippet.deletedAt) {
      if (
        await confirm(
          `Are you sure you want to restore this snippet from Trash?`
        )
      ) {
        console.log(`restoring ${id}:${snippet.name} from trash`)
        await actions.moveSnippetsToTrash([id], true)
      }
    } else {
      if (await confirm(`Are you sure you want to move it to Trash?`)) {
        console.log(`moving ${id}:${snippet.name} to trash`)
        await actions.moveSnippetsToTrash([id])
      }
    }
  }

  const moveSelectedSnippetsToTrashOrRestore = async () => {
    const restore = getSearchType() === "trash"
    if (
      await confirm(
        restore
          ? `Are you sure you want to restore selected snippets from Trash`
          : `Are you sure you want to move selected snippets to Trash?`
      )
    ) {
      await actions.moveSnippetsToTrash(actualSelectedSnippetIds(), restore)
      setSelectedSnippetIds([])
    }
  }

  const deleteForever = async (id: string) => {
    if (
      await confirm(`Are you sure you want to delete this snippet forever?`)
    ) {
      await actions.deleteSnippetForever(id)
    }
  }

  const emptyTrash = async () => {
    if (
      await confirm(
        `Are you sure you want to permanently erase the items in the Trash?`
      )
    ) {
      await actions.emptyTrash()
    }
  }

  const toggleSidebar = () => {
    actions.toggleSidebar(state.isSidebarCollapsed);
  }

  createEffect(() => {
    if (getSearchType()) {
      searchInputEl?.focus()
    }
  })

  createEffect(
    on(getSearchType, () => {
      setSearchKeyword("")
    })
  )

  createEffect(() => {
    actions.setFolder(searchParams.folder || null)
  })

  // load snippets from folder
  createEffect(
    on(
      () => [searchParams.folder],
      () => {
        if (!searchParams.folder) return

        actions.loadFolder(searchParams.folder)

        // reload snippets from folder every 2 seconds
        const watchFolder = window.setInterval(() => {
          actions.loadFolder(searchParams.folder)
        }, 2000)

        onCleanup(() => {
          window.clearInterval(watchFolder)
        })
      }
    )
  )

  // update nameInputEl value
  createEffect(() => {
    const s = snippet()
    if (s) {
      nameInputControl.setValue(s.name)
    }
  })

  const loadContent = async () => {
    if (!searchParams.id) return

    const content = await actions.readSnippetContent(searchParams.id)
    setContent(content)
  }

  // load snippet content
  createEffect(
    on(
      () => [searchParams.id],
      () => {
        loadContent()

        // reload snippet content every 2 seconds
        const watchFile = window.setInterval(async () => {
          loadContent()
        }, 2000)

        onCleanup(() => {
          window.clearInterval(watchFile)
        })
      }
    )
  )

  // unselect snippets
  createEffect(
    on([() => searchParams.id, getSearchType], () => {
      setSelectedSnippetIds([])
    })
  )

  return (
    <div class="h-screen" classList={{ "is-mac": state.isMac }}>
      <div class="h-main flex">
        <div
          class="shrink-0 h-full flex flex-col h-full"
          classList={{ "show-search": getSearchType() !== null, "w-10": state.isSidebarCollapsed, "w-64": !state.isSidebarCollapsed}}>
            <div class="sidebar-header text-zinc-500 dark:text-zinc-300 text-xs" classList={{"invisible": state.isSidebarCollapsed}}>
            <Show when={state.isMac}>
              <div class="h-6" data-tauri-drag-region></div>
            </Show>
            <div
              data-tauri-drag-region
              class="flex items-center justify-between px-2 h-10 shrink-0"
            >
              <Button
                type="button"
                onClick={() => setOpenFolderHistoryModal(true)}
                tooltip={{ content: "Select folder" }}
                icon="i-bi:folder"
                class="-ml-[1px] max-w-[50%]"
              >
                {state.folder?.split(path.sep).pop()}
              </Button>
              <div class="flex items-center">
                <Button
                  type="button"
                  icon="i-ic:outline-add"
                  onClick={newSnippet}
                  tooltip={{ content: "New snippet" }}
                ></Button>
                <Button
                  type="button"
                  icon="i-material-symbols:search"
                  onClick={() => {
                    if (getSearchType() === "non-trash") {
                      setSearchType(null)
                      return
                    }
                    setSearchType("non-trash")
                  }}
                  tooltip={{ content: "Search" }}
                  isActive={getSearchType() === "non-trash"}
                ></Button>
                <Button
                  type="button"
                  icon="i-iconoir:bin"
                  onClick={() => {
                    if (getSearchType() === "trash") {
                      setSearchType(null)
                      return
                    }
                    setSearchType("trash")
                  }}
                  tooltip={{ content: "Show snippets in trash" }}
                  isActive={getSearchType() === "trash"}
                ></Button>
              </div>
            </div>
            <Show when={getSearchType()}>
              <div class="px-3 pb-2">
                <div class="flex justify-between pb-1 text-xs">
                  <span class="text-zinc-500 dark:text-zinc-300">
                    {getSearchType() === "trash" ? "Trash" : "Search"}
                  </span>
                  <Show when={getSearchType() === "trash"}>
                    <button
                      type="button"
                      disabled={snippets().length === 0}
                      class="cursor whitespace-nowrap border-zinc-400 dark:border-zinc-600 border h-5/6 rounded-md px-2 flex items-center"
                      classList={{
                        "active:bg-zinc-200 dark:active:bg-zinc-700":
                          snippets().length !== 0,
                        "disabled:opacity-50": true,
                      }}
                      onClick={emptyTrash}
                    >
                      Empty
                    </button>
                  </Show>
                </div>
                <div class="h-2/5">
                  <input
                    ref={searchInputEl}
                    spellcheck={false}
                    class="h-7 w-full flex items-center px-2 border rounded-lg bg-transparent focus:ring focus:border-blue-500 ring-blue-500 focus:outline-none"
                    value={getSearchKeyword()!}
                    onInput={(e) => setSearchKeyword(e.currentTarget.value)}
                    onKeyPress={(e) => {
                      if (e.key === "Escape") {
                        e.preventDefault()
                        setSearchType(null)
                      }
                    }}
                  />
                </div>
              </div>
            </Show>
          </div>
          <div class="sidebar-body group/sidebar-body flex-1 overflow-y-auto custom-scrollbar scrollbar-group p-2 pt-0 space-y-1" classList={{"invisible": state.isSidebarCollapsed}}>
            <For each={snippets()}>
              {(snippet) => {
                return (
                  <Link
                    href={`/snippets?${new URLSearchParams({
                      ...searchParams,
                      id: snippet.id,
                    }).toString()}`}
                    classList={{
                      "group text-sm px-2 block select-none rounded-lg py-1 cursor":
                        true,
                      "bg-blue-500": isSidebarSnippetActive(snippet.id),
                      "hover:bg-zinc-100 dark:hover:bg-zinc-600":
                        !isSidebarSnippetActive(snippet.id),
                      "text-white": isSidebarSnippetActive(snippet.id),
                    }}
                    onClick={(e) => {
                      if (e.shiftKey) {
                        e.preventDefault()
                        setSelectedSnippetIds((ids) => {
                          if (ids.includes(snippet.id)) {
                            return ids.filter((_id) => _id !== snippet.id)
                          }
                          return [...ids, snippet.id]
                        })
                      }
                    }}
                  >
                    <div class="truncate">{snippet.name}</div>
                    <div
                      class="text-xs grid grid-cols-2 gap-1 mt-[1px]"
                      classList={{
                        "text-zinc-400 dark:text-zinc-500 group-hover:text-zinc-400":
                          !isSidebarSnippetActive(snippet.id),
                        "text-blue-100": isSidebarSnippetActive(snippet.id),
                      }}
                    >
                      <span class="truncate">{timeago(snippet.createdAt)}</span>
                      <div class="flex justify-end items-center opacity-0 group-hover/sidebar-body:opacity-100">
                        <button
                          type="button"
                          use:tooltip={{
                            content: snippet.vscodeSnippet?.prefix?.trim()
                              ? snippet.vscodeSnippet.prefix
                              : "Set Snippet Prefix",
                            placement: "top-end",
                          }}
                          class="cursor flex justify-end items-center max-w-full"
                          classList={{
                            "hover:text-white": isSidebarSnippetActive(
                              snippet.id
                            ),
                            "hover:text-zinc-500": !isSidebarSnippetActive(
                              snippet.id
                            ),
                          }}
                          onClick={(e) => {
                            setOpenVSCodeSnippetSettingsModal(snippet.id)
                          }}
                        >
                          <Show
                            when={snippet.vscodeSnippet?.prefix?.trim()}
                            fallback={
                              <span class="i-fluent:key-command-16-filled text-inherit"></span>
                            }
                          >
                            <span class="truncate">
                              {snippet.vscodeSnippet!.prefix}
                            </span>
                          </Show>
                        </button>
                      </div>
                    </div>
                  </Link>
                )
              }}
            </For>
          </div>
          {snippet() && <div class="sidebar-footer text-zinc-500 dark:text-zinc-300 text-xs border-t">
            <div
              data-tauri-drag-region
              class="flex items-center justify-end px-2 h-10 shrink-0"
            >
              <div class="flex items-center">
                <Button
                  type="button"
                  icon={state.isSidebarCollapsed ? "i-mdi:arrow-collapse-right" : "i-mdi:arrow-collapse-left"}
                  tooltip={{content:  "Toggle sidebar"}}
                  onClick={() => toggleSidebar()}
                ></Button>
              </div>
            </div>
          </div>}
        </div>
        <Show
          when={snippet()}
          fallback={
            <div
              data-tauri-drag-region
              class="h-full w-full flex items-center justify-center px-20 text-center text-zinc-400 text-xl border-l"
            >
              <span class="select-none">
                Select or create a snippet from sidebar
              </span>
            </div>
          }
        >
          <div data-tauri-drag-region class="w-full h-full pt-6">
            <div
              class="border-l border-b border-t flex h-mainHeader items-center px-3 justify-between space-x-3"
            >
              <input
                value={nameInputControl.value}
                spellcheck={false}
                class="w-full h-full focus:outline-none bg-transparent"
                onInput={nameInputControl.onInput}
              />
              <div class="flex items-center text-xs text-zinc-500 dark:text-zinc-300 space-x-1">
                <Button
                  type="button"
                  icon="i-majesticons:curly-braces"
                  onClick={() => setOpenLanguageModal(true)}
                  tooltip={{ content: "Select language mode" }}
                >
                  {getLanguageName(snippet()!.language || "plaintext")}
                </Button>
                <div class="group relative">
                  <Button icon="i-ic:baseline-more-horiz"></Button>
                  <div
                    aria-label="Dropdown"
                    class="hidden absolute bg-white dark:bg-zinc-700 z-10 py-1 right-0 min-w-[100px] border rounded-lg shadow group-hover:block"
                  >
                    <button
                      type="button"
                      class="cursor w-full px-3 h-6 flex items-center whitespace-nowrap hover:bg-zinc-100 dark:hover:text-white dark:hover:bg-zinc-500"
                      onClick={() =>
                        setOpenVSCodeSnippetSettingsModal(snippet()!.id)
                      }
                    >
                      VSCode snippet
                    </button>
                    <button
                      type="button"
                      class="cursor w-full px-3 h-6 flex items-center whitespace-nowrap hover:bg-zinc-100 dark:hover:text-white dark:hover:bg-zinc-500"
                      onClick={() => moveSnippetToTrashOrRestore(snippet()!.id)}
                    >
                      {snippet()!.deletedAt
                        ? "Restore from Trash"
                        : "Move to Trash"}
                    </button>
                    <Show when={snippet()!.deletedAt}>
                      <button
                        type="button"
                        class="cursor w-full px-3 h-6 flex items-center whitespace-nowrap hover:bg-zinc-100 dark:hover:text-white dark:hover:bg-zinc-500"
                        onClick={() => deleteForever(snippet()!.id)}
                      >
                        Delete forever
                      </button>
                    </Show>
                  </div>
                </div>
              </div>
            </div>
            <div class="h-mainBody overflow-y-auto">
              <Editor
                value={content()}
                onChange={handleEditorChange}
                extensions={languageExtension() ? [languageExtension()!()] : []}
              />
            </div>
          </div>
        </Show>
      </div>
      <footer class="h-footer"></footer>
      <LanguageModal
        open={getOpenLanguageModal()}
        setOpen={setOpenLanguageModal}
        setLanguage={(language) =>
          actions.updateSnippet(snippet()!.id, "language", language)
        }
      />
      <FolderHistoryModal
        open={getOpenFolderHistoryModal()}
        setOpen={setOpenFolderHistoryModal}
      />
      <VSCodeSnippetSettingsModal
        snippetId={getOpenVSCodeSnippetSettingsModal()}
        close={() => setOpenVSCodeSnippetSettingsModal(undefined)}
      />
      <div
        classList={{
          "-bottom-10": getSelectedSnippetIds().length === 0,
          "bottom-10": getSelectedSnippetIds().length > 0,
        }}
        class="fixed left-1/2 transform -translate-x-1/2"
        style="transition: bottom .3s ease-in-out"
      >
        <button
          type="button"
          class="cursor inline-flex items-center bg-white dark:bg-zinc-700 rounded-lg shadow border px-3 h-9 hover:bg-zinc-100"
          onClick={moveSelectedSnippetsToTrashOrRestore}
        >
          {getSearchType() === "trash"
            ? `Restore ${actualSelectedSnippetIds().length} snippets from Trash`
            : `Move ${actualSelectedSnippetIds().length} snippets to Trash`}
        </button>
      </div>
    </div>
  )
}

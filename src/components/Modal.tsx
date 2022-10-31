import { useNavigate } from "solid-app-router"
import {
  type Accessor,
  createEffect,
  createMemo,
  createSignal,
  For,
  onCleanup,
  onMount,
  Show,
} from "solid-js"
import { Portal } from "solid-js/web"
import { languages } from "../lib/languages"
import { useOpenFolderDialog } from "../lib/open-folder"
import { state } from "../store"

interface Item {
  icon?: string
  text: string
  onClick: () => void
}

const Modal = (props: {
  placeholder?: string
  items: Item[]
  selectedItemIndex?: number
  close: () => void
  keyword: string
  setKeyword: (keyword: string) => void
}) => {
  let input: HTMLInputElement | undefined
  let modal: HTMLDivElement | undefined

  const [getSelectedIndex, setSelectedIndex] = createSignal(
    props.selectedItemIndex || 0
  )

  const closeModal = () => {
    props.close()
    props.setKeyword("")
  }

  onMount(() => {
    input?.focus()

    const handleClick = (e: MouseEvent) => {
      if (!modal) return

      if (modal.contains(e.target as Element)) {
        return
      }

      // click outside
      closeModal()
    }
    document.addEventListener("click", handleClick)

    onCleanup(() => {
      document.removeEventListener("click", handleClick)
    })
  })

  const scrollItemIntoView = (index: number) => {
    ;(document.getElementById(`item-${index}`) as any)?.scrollIntoViewIfNeeded()
  }

  createEffect(() => {
    scrollItemIntoView(getSelectedIndex())
  })

  return (
    <Portal mount={document.getElementById("modal-container") || undefined}>
      <div class="modal" ref={modal}>
        <label class="block px-2 py-2">
          <input
            ref={input}
            placeholder={props.placeholder}
            spellcheck={false}
            class="w-full bg-zinc-100 px-1 h-6 flex items-center"
            value={props.keyword}
            onInput={(e) => props.setKeyword(e.currentTarget.value)}
            onKeyDown={(e) => {
              if (e.key === "Escape") {
                e.preventDefault()
                closeModal()
              } else if (e.key === "ArrowDown") {
                setSelectedIndex((index) =>
                  index === props.items.length - 1 ? 0 : index + 1
                )
              } else if (e.key === "ArrowUp") {
                setSelectedIndex((index) =>
                  index === 0 ? props.items.length - 1 : index - 1
                )
              } else if (e.key === "Enter") {
                e.preventDefault()
                const item = props.items.find(
                  (_, index) => index === getSelectedIndex()
                )
                if (item) {
                  item.onClick()
                }
              }
            }}
          />
        </label>
        <div class="modal-content">
          <For each={props.items}>
            {(item, index) => (
              <div
                id={`item-${index()}`}
                class="px-2 py-1 cursor flex items-center text-center space-x-1"
                classList={{
                  "bg-zinc-200": getSelectedIndex() === index(),
                  "hover:bg-zinc-100": getSelectedIndex() !== index(),
                }}
                onClick={item.onClick}
              >
                <Show when={item.icon}>
                  <span classList={{ [item.icon!]: true }}></span>
                </Show>
                <span class="truncate">{item.text}</span>
              </div>
            )}
          </For>
        </div>
      </div>
    </Portal>
  )
}

export const LanguageModal = (props: {
  setLanguage: (language: string) => void
  open: boolean
  setOpen: (open: boolean) => void
}) => {
  const [getKeyword, setKeyword] = createSignal("")

  const items: Accessor<Item[]> = createMemo(() => {
    const keyword = getKeyword()

    return languages
      .filter((lang) =>
        keyword ? lang.name.toLowerCase().includes(keyword) : true
      )
      .map((lang) => {
        return {
          text: `${lang.name} (${lang.id})`,
          onClick() {
            props.setLanguage(lang.id)
            props.setOpen(false)
            setKeyword("")
          },
        }
      })
  })

  return (
    <Show when={props.open}>
      <Modal
        keyword={getKeyword()}
        setKeyword={setKeyword}
        placeholder="Select language mode"
        items={items()}
        close={() => props.setOpen(false)}
      ></Modal>
    </Show>
  )
}

export const FolderHistoryModal = (props: {
  open: boolean
  setOpen: (open: boolean) => void
}) => {
  const [getKeyword, setKeyword] = createSignal("")
  const goto = useNavigate()
  const openAnotherFolder = useOpenFolderDialog()

  const items = createMemo<Item[]>(() =>
    state.app.folders
      .filter((folder) => {
        const keyword = getKeyword()
        if (!keyword) return true
        return folder.toLowerCase().includes(keyword)
      })
      .map<Item>((folder) => {
        return {
          icon: "i-bi:folder",
          text: folder,
          onClick() {
            goto(
              `/snippets?${new URLSearchParams({ folder: folder }).toString()}`
            )
            props.setOpen(false)
          },
        }
      })
      .concat([
        {
          icon: "i-bi:folder-plus",
          text: "Open another folder",
          onClick() {
            openAnotherFolder()
            props.setOpen(false)
          },
        },
      ])
  )

  return (
    <Show when={props.open}>
      <Modal
        placeholder="Filter previously opened folders"
        keyword={getKeyword()}
        setKeyword={setKeyword}
        items={items()}
        close={() => props.setOpen(false)}
      ></Modal>
    </Show>
  )
}

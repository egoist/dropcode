import { useNavigate } from "@solidjs/router"
import { onMount } from "solid-js"
import { useOpenFolderDialog } from "../lib/open-folder"
import { state } from "../store"

export const Home = () => {
  const goto = useNavigate()

  const openFolder = useOpenFolderDialog()

  onMount(() => {
    const firstFolder = state.app.folders[0]
    if (firstFolder) {
      goto(
        `/snippets?${new URLSearchParams({ folder: firstFolder }).toString()}`
      )
    }
  })

  return (
    <div class="h-screen flex items-center justify-center">
      <button
        onClick={openFolder}
        class="cursor border rounded-lg shadow-sm h-10 px-3 active:bg-zinc-100 dark:active:bg-zinc-700"
      >
        Open Folder
      </button>
    </div>
  )
}

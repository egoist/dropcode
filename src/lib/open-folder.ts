import { dialog } from "@tauri-apps/api"
import { useNavigate } from "solid-app-router"

export const useOpenFolderDialog = () => {
  const goto = useNavigate()

  const openFolder = async () => {
    const folder = await dialog.open({
      directory: true,
      multiple: false,
    })

    if (typeof folder === "string") {
      goto(`/snippets?${new URLSearchParams({ folder }).toString()}`)
    }
  }

  return openFolder
}

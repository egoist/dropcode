import { createSignal, onCleanup, onMount } from "solid-js"

export const useDarkMode = () => {
  const [getDarkMode, setDarkMode] = createSignal(false)

  const onChange = (e: MediaQueryListEvent | MediaQueryList) => {
    setDarkMode(e.matches)
  }

  onMount(() => {
    const mql = window.matchMedia("(prefers-color-scheme: dark)")
    onChange(mql)
    mql.addEventListener("change", onChange)

    onCleanup(() => {
      mql.removeEventListener("change", onChange)
    })
  })

  return getDarkMode
}

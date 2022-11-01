import { basicSetup, EditorView } from "codemirror"
import { EditorState, type Extension } from "@codemirror/state"
import { createEffect, createSignal, onCleanup, onMount } from "solid-js"
import { githubDark, githubLight } from "@uiw/codemirror-theme-github"
import { useDarkMode } from "../lib/darkmode"

export const Editor = (props: {
  value: string
  onChange: (newValue: string) => void
  extensions?: Extension[]
}) => {
  let el: HTMLDivElement | undefined
  const [getView, setView] = createSignal<EditorView | undefined>()
  const isDarkMode = useDarkMode()

  onMount(() => {
    const handleUpdate = EditorView.updateListener.of((update) => {
      const value = update.state.doc.toString()
      props.onChange(value)
    })

    const createView = () => {
      return new EditorView({
        parent: el,
        state: EditorState.create({
          doc: "",
          extensions: [
            isDarkMode() ? githubDark : githubLight,
            basicSetup,
            handleUpdate,
            EditorView.lineWrapping,
            ...(props.extensions || []),
          ],
        }),
      })
    }

    createEffect(() => {
      const view = createView()
      setView(view)

      onCleanup(() => {
        view.destroy()
      })
    })

    createEffect(() => {
      const view = getView()
      if (!view) return
      const oldValue = view.state.doc.toString()
      if (props.value !== oldValue) {
        view.dispatch({
          changes: { from: 0, to: oldValue.length, insert: props.value },
        })
      }
    })
  })

  return <div class="h-full" ref={el}></div>
}

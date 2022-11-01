import { Route, Routes } from "@solidjs/router"
import { invoke } from "@tauri-apps/api"
import { onMount, Show } from "solid-js"
import { Home } from "../screens/Home"
import { Snippets } from "../screens/Snippets"
import { actions, state } from "../store"

export const App = () => {
  onMount(() => {
    invoke("show_main_window")

    actions.init()
  })

  return (
    <Show when={state.ready}>
      <Routes>
        <Route path="/" component={Home} />
        <Route path="/snippets" component={Snippets} />
      </Routes>
    </Show>
  )
}

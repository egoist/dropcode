import "tippy.js/dist/tippy.css"
import "uno.css"
import "./css/tailwind.css"
import "./css/main.css"
import { render } from "solid-js/web"
import { Router } from "@solidjs/router"

import { App } from "./components/App"

render(
  () => (
    <Router>
      <App />
    </Router>
  ),
  document.getElementById("root") as HTMLElement
)

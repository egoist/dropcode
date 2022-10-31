import { Props } from "tippy.js"
declare module "solid-js" {
  namespace JSX {
    interface Directives {
      tooltip?: Partial<Props>
    }
  }
}

import { type Accessor, onCleanup } from "solid-js"
import tippy, { Props } from "tippy.js"

export type TooltipOptions = Partial<Props>

export const tooltip = (
  el: HTMLElement,
  accessor: Accessor<TooltipOptions>
) => {
  const props = accessor()
  if (!props) return
  const instance = tippy(el, {
    animation: false,
    arrow: false,
    offset: [5, 5],
    ...props,
  })

  onCleanup(() => {
    instance.destroy()
  })
}

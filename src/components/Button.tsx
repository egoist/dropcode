import { type JSX, Show } from "solid-js"
import { tooltip, type TooltipOptions } from "../lib/tooltip"

export const Button = (props: {
  type?: "button" | "submit"
  isFull?: boolean
  onClick?: (e: MouseEvent) => void
  children?: JSX.Element
  tooltip?: TooltipOptions
  isActive?: boolean
  icon?: string
  class?: string
}) => {
  return (
    <>
      <button
        type={props.type}
        class={props.class}
        use:tooltip={props.tooltip}
        classList={{
          "inline-flex whitespace-nowrap items-center justify-center h-6 rounded-lg cursor active:ring-2 ring-blue-500 space-x-1":
            true,
          "px-2": Boolean(props.children),
          "w-6": !props.children,
          "w-full": props.isFull,
          "bg-blue-500 text-white": props.isActive,
          "hover:bg-zinc-200": !props.isActive,
          "hint--bottom hint--rounded hint--no-animate": Boolean(props.tooltip),
        }}
        onClick={props.onClick}
      >
        <Show when={props.icon}>
          <span
            class="w-4 h-4 shrink-0"
            classList={{ [props.icon!]: true }}
          ></span>
        </Show>
        <Show when={props.children}>
          <span class="truncate">{props.children}</span>
        </Show>
      </button>
    </>
  )
}

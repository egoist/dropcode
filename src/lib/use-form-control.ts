import { createSignal } from "solid-js"
import { debounce } from "./utils"

export const useFormControl = ({
  defaultValue,
  save,
}: {
  defaultValue: string
  save: (value: string) => Promise<void>
}) => {
  const [getValue, setValue] = createSignal(defaultValue)
  const debouncedSave = debounce(save, 250)

  return {
    get value() {
      return getValue()
    },
    setValue(value: string) {
      if (value === getValue()) return

      setValue(value)
    },
    async onInput(e: InputEvent & { currentTarget: HTMLInputElement }) {
      await debouncedSave(e.currentTarget.value)
    },
  }
}

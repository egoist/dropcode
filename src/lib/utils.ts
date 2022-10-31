export function debounce<T extends Function>(fn: T, timeout = 100) {
  let handle: any
  return ((...args: any[]) => {
    if (handle) clearTimeout(handle)
    handle = setTimeout(() => {
      fn(...args)
    }, timeout)
  }) as unknown as T
}

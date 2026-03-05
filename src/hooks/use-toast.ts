import * as React from "react"

type ToastProps = {
  id: string
  title?: React.ReactNode
  description?: React.ReactNode
  action?: React.ReactNode
  open?: boolean
  onOpenChange?: (open: boolean) => void
}

const TOAST_LIMIT = 5
const TOAST_REMOVE_DELAY = 5000

type ActionType = {
  ADD_TOAST: "ADD_TOAST"
  UPDATE_TOAST: "UPDATE_TOAST"
  DISMISS_TOAST: "DISMISS_TOAST"
  REMOVE_TOAST: "REMOVE_TOAST"
}

let count = 0
function genId() { return (++count).toString() }

type State = { toasts: ToastProps[] }

const toastTimeouts = new Map<string, ReturnType<typeof setTimeout>>()
const listeners: Array<(state: State) => void> = []
let memoryState: State = { toasts: [] }

function dispatch(action: { type: keyof ActionType; toast?: ToastProps; toastId?: string }) {
  memoryState = reducer(memoryState, action)
  listeners.forEach((l) => l(memoryState))
}

function reducer(state: State, action: { type: keyof ActionType; toast?: ToastProps; toastId?: string }): State {
  switch (action.type) {
    case "ADD_TOAST":
      return { ...state, toasts: [action.toast!, ...state.toasts].slice(0, TOAST_LIMIT) }
    case "UPDATE_TOAST":
      return { ...state, toasts: state.toasts.map((t) => t.id === action.toast!.id ? { ...t, ...action.toast } : t) }
    case "DISMISS_TOAST": {
      const { toastId } = action
      if (toastId) {
        if (!toastTimeouts.has(toastId)) {
          toastTimeouts.set(toastId, setTimeout(() => {
            toastTimeouts.delete(toastId)
            dispatch({ type: "REMOVE_TOAST", toastId })
          }, TOAST_REMOVE_DELAY))
        }
      } else {
        state.toasts.forEach((t) => dispatch({ type: "DISMISS_TOAST", toastId: t.id }))
      }
      return { ...state, toasts: state.toasts.map((t) => (!toastId || t.id === toastId) ? { ...t, open: false } : t) }
    }
    case "REMOVE_TOAST":
      return { ...state, toasts: action.toastId ? state.toasts.filter((t) => t.id !== action.toastId) : [] }
  }
}

function toast(props: Omit<ToastProps, "id">) {
  const id = genId()
  const update = (p: ToastProps) => dispatch({ type: "UPDATE_TOAST", toast: { ...p, id } })
  const dismiss = () => dispatch({ type: "DISMISS_TOAST", toastId: id })
  dispatch({ type: "ADD_TOAST", toast: { ...props, id, open: true, onOpenChange: (open) => { if (!open) dismiss() } } })
  return { id, dismiss, update }
}

export function useToast() {
  const [state, setState] = React.useState<State>(memoryState)
  React.useEffect(() => {
    listeners.push(setState)
    return () => { const i = listeners.indexOf(setState); if (i > -1) listeners.splice(i, 1) }
  }, [])
  return { ...state, toast, dismiss: (id?: string) => dispatch({ type: "DISMISS_TOAST", toastId: id }) }
}

export { toast }

interface ToastProps {
  message: string
  visible: boolean
}

export function Toast({ message, visible }: ToastProps) {
  return (
    <div id="global-toast" className={`toast${visible ? ' active' : ''}`}>
      {message}
    </div>
  )
}

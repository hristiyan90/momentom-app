type ToastProps = {
  title: string
  description?: string
  duration?: number
  variant?: "default" | "destructive"
}

type Toast = ToastProps & {
  id: string
}

let toastCount = 0

export function toast({ title, description, duration = 3000, variant = "default" }: ToastProps) {
  // Simple toast implementation - in a real app you'd use a proper toast library
  const toastId = `toast-${++toastCount}`

  // Create toast element
  const toastElement = document.createElement("div")
  toastElement.id = toastId
  toastElement.className = `fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg border max-w-sm transform transition-all duration-300 translate-x-full ${
    variant === "destructive"
      ? "bg-red-900 border-red-800 text-red-100"
      : "bg-[#0F151D] border-[#1E293B] text-slate-200"
  }`

  toastElement.innerHTML = `
    <div class="flex items-start gap-3">
      <div class="flex-1">
        <div class="font-medium">${title}</div>
        ${description ? `<div class="text-sm opacity-80 mt-1">${description}</div>` : ""}
      </div>
      <button class="text-slate-400 hover:text-slate-200 ml-2" onclick="document.getElementById('${toastId}').remove()">
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
        </svg>
      </button>
    </div>
  `

  document.body.appendChild(toastElement)

  // Animate in
  setTimeout(() => {
    toastElement.style.transform = "translateX(0)"
  }, 100)

  // Auto remove
  setTimeout(() => {
    toastElement.style.transform = "translateX(full)"
    setTimeout(() => {
      if (document.getElementById(toastId)) {
        document.getElementById(toastId)?.remove()
      }
    }, 300)
  }, duration)
}

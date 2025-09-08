import { cn } from "@/lib/utils"

interface FuelingBlockProps {
  title?: string
  keyLine: string
  chips: string[]
  footnote?: string
  className?: string
}

export function FuelingBlock({ title = "Fueling Guidelines", keyLine, chips, footnote, className }: FuelingBlockProps) {
  return (
    <div className={cn("space-y-3", className)}>
      <h3 className="text-text-1 font-medium">{title}</h3>

      <p className="text-text-2 text-sm leading-relaxed">{keyLine}</p>

      <div className="flex flex-wrap gap-2">
        {chips.map((chip, index) => (
          <span key={index} className="chip">
            {chip}
          </span>
        ))}
      </div>

      {footnote && <p className="text-text-3 text-xs">{footnote}</p>}
    </div>
  )
}

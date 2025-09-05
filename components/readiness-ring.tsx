interface CapacityRingProps {
  value: number // 0-100
  size?: "sm" | "md" | "lg" | "xl" // Added xl size option
}

const sizeConfig = {
  sm: { ring: "w-16 h-16", stroke: "stroke-[3]", text: "text-xs" },
  md: { ring: "w-24 h-24", stroke: "stroke-[4]", text: "text-sm" },
  lg: { ring: "w-32 h-32", stroke: "stroke-[5]", text: "text-base" },
  xl: { ring: "w-40 h-40", stroke: "stroke-[6]", text: "text-lg" }, // Added xl size configuration
}

function getCapacityLabel(value: number): { label: string; color: string } {
  if (value < 40) return { label: "Go easy", color: "text-warn" }
  if (value < 80) return { label: "On plan", color: "text-success" }
  return { label: "Smash it", color: "text-info" }
}

export function CapacityRing({ value, size = "md" }: CapacityRingProps) {
  const validSize = size && sizeConfig[size] ? size : "md"
  const config = sizeConfig[validSize]
  const { label, color } = getCapacityLabel(value)
  const circumference = 2 * Math.PI * 45 // radius of 45
  const strokeDasharray = circumference
  const strokeDashoffset = circumference - (value / 100) * circumference

  return (
    <div className="flex flex-col items-center gap-3">
      <div className={`relative ${config.ring}`}>
        <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
          {/* Background ring */}
          <circle
            cx="50"
            cy="50"
            r="45"
            fill="none"
            stroke="currentColor"
            className={`text-border-mid ${config.stroke}`}
          />
          {/* Progress ring */}
          <circle
            cx="50"
            cy="50"
            r="45"
            fill="none"
            stroke="currentColor"
            className={`text-swim ${config.stroke} transition-all duration-500 ease-out`}
            strokeLinecap="round"
            strokeDasharray={strokeDasharray}
            strokeDashoffset={strokeDashoffset}
          />
        </svg>

        {/* Center value */}
        <div className="absolute inset-0 flex items-center justify-center">
          <span className={`font-semibold text-text-1 ${config.text}`}>{value}</span>
        </div>
      </div>

      <div className="text-center">
        <p className={`font-medium ${config.text} ${color}`}>{label}</p>
      </div>
    </div>
  )
}

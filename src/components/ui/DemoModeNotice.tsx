import { FlaskConical } from "lucide-react"

interface DemoModeNoticeProps {
  compact?: boolean
  className?: string
}

/** Prevents design fixtures from being mistaken for verified school records. */
export function DemoModeNotice({
  compact = false,
  className = "",
}: DemoModeNoticeProps) {
  return (
    <div
      role="status"
      className={`flex items-start gap-2 border border-amber-300 bg-amber-50 text-amber-950 ${
        compact ? "px-3 py-2 text-xs" : "px-4 py-3 text-sm"
      } ${className}`}
      style={{ borderRadius: 12 }}
    >
      <FlaskConical
        className="mt-0.5 h-4 w-4 flex-shrink-0"
        aria-hidden="true"
      />
      <span>
        <strong>Design preview.</strong> This screen uses sample data and is not
        connected to school accounts or results.
      </span>
    </div>
  )
}

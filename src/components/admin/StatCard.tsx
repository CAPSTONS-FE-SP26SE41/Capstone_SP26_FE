import React from "react"
import { ArrowUpRight, AlertCircle } from "lucide-react"

interface StatCardProps {
  title: string
  value: string
  icon?: React.ReactNode
  gradient?: string
  shadowColor?: string
  description?: string
  trend?: "up" | "down" | "neutral" | "warning"
}

export default function StatCard({
  title,
  value,
  icon,
  gradient = "from-slate-50 to-slate-100",
  shadowColor = "shadow-slate-200/50",
  description,
  trend,
}: StatCardProps) {
  const isCustomGradient = gradient && gradient !== "from-slate-50 to-slate-100"

  return (
    <div
      className={`relative overflow-hidden rounded-2xl bg-gradient-to-br ${gradient} p-5 shadow-lg ${shadowColor} transition-all hover:scale-[1.02] hover:shadow-xl cursor-default group`}
    >
      <div className="absolute -top-6 -right-6 w-24 h-24 rounded-full bg-white/10 group-hover:scale-110 transition-transform" />
      <div className="absolute -bottom-4 -left-4 w-16 h-16 rounded-full bg-white/5" />
      <div className="relative flex items-start justify-between gap-3">
        <div>
          <p className={`text-sm font-medium ${isCustomGradient ? "text-white/80" : "text-slate-500"}`}>
            {title}
          </p>
          <p className={`text-2xl font-bold mt-2 tracking-tight ${isCustomGradient ? "text-white" : "text-slate-800"}`}>
            {value}
          </p>
          {(description || trend) && (
            <div className="flex items-center gap-1 mt-2">
              {trend === "up" && (
                <ArrowUpRight size={13} className={isCustomGradient ? "text-white/70" : "text-emerald-500"} />
              )}
              {trend === "warning" && (
                <AlertCircle size={13} className={isCustomGradient ? "text-white/70" : "text-amber-500"} />
              )}
              <span className={`text-xs font-medium ${isCustomGradient ? "text-white/60" : "text-slate-400"}`}>
                {description}
              </span>
            </div>
          )}
        </div>
        {icon && (
          <div
            className={`w-11 h-11 rounded-2xl backdrop-blur-sm flex items-center justify-center shrink-0 ${
              isCustomGradient
                ? "bg-white/20 text-white"
                : "bg-slate-200/60 text-slate-600 border border-slate-300/30"
            }`}
          >
            {icon}
          </div>
        )}
      </div>
    </div>
  )
}

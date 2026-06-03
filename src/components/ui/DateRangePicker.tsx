import { useState, useRef, useEffect } from 'react'
import { Calendar, ChevronLeft, ChevronRight, CornerDownLeft, RotateCcw } from 'lucide-react'

export interface DateRange {
  start: string // YYYY-MM-DD
  end: string   // YYYY-MM-DD
}

interface DateRangePickerProps {
  value: DateRange
  onChange: (range: DateRange) => void
  theme?: 'emerald' | 'blue' | 'orange'
  align?: 'left' | 'right'
}

// Helper date parsing and formatting
const parseLocalDate = (dateStr: string) => {
  if (!dateStr) return new Date()
  const [year, month, day] = dateStr.split('-').map(Number)
  return new Date(year, month - 1, day)
}

const formatLocalDate = (date: Date) => {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

const formatDisplayDate = (dateStr: string) => {
  if (!dateStr) return ''
  const [year, month, day] = dateStr.split('-')
  return `${day}/${month}/${year}`
}

const getDaysInMonth = (year: number, month: number) => {
  return new Date(year, month + 1, 0).getDate()
}

export function DateRangePicker({ value, onChange, theme = 'emerald', align = 'right' }: DateRangePickerProps) {
  const [isOpen, setIsOpen] = useState(false)
  const wrapperRef = useRef<HTMLDivElement>(null)

  // Current calendar view (month: 0-11, year)
  const initialDate = value.start ? parseLocalDate(value.start) : new Date()
  const [currentMonth, setCurrentMonth] = useState(initialDate.getMonth())
  const [currentYear, setCurrentYear] = useState(initialDate.getFullYear())

  // Selection states
  const [tempStart, setTempStart] = useState<string | null>(null)
  const [hoverDate, setHoverDate] = useState<string | null>(null)

  // Click outside handler
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false)
        setTempStart(null)
        setHoverDate(null)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Sync calendar view when date selection external changes
  useEffect(() => {
    if (value.start) {
      const activeDate = parseLocalDate(value.start)
      setCurrentMonth(activeDate.getMonth())
      setCurrentYear(activeDate.getFullYear())
    }
  }, [value.start])

  // Theme styling configurations
  const themeStyles = {
    emerald: {
      text: 'text-emerald-700',
      bgLight: 'bg-emerald-50',
      bgLightHover: 'hover:bg-emerald-100/70',
      borderFocus: 'focus:border-emerald-500 focus:ring-emerald-500/20 border-slate-200 hover:border-emerald-400',
      accentBg: 'bg-emerald-600',
      accentText: 'text-white',
      rangeBg: 'bg-emerald-50 text-emerald-950 font-medium',
      rangeHoverBg: 'bg-emerald-50/70',
    },
    blue: {
      text: 'text-blue-700',
      bgLight: 'bg-blue-50',
      bgLightHover: 'hover:bg-blue-100/70',
      borderFocus: 'focus:border-blue-500 focus:ring-blue-500/20 border-slate-200 hover:border-blue-400',
      accentBg: 'bg-blue-600',
      accentText: 'text-white',
      rangeBg: 'bg-blue-50 text-blue-950 font-medium',
      rangeHoverBg: 'bg-blue-50/70',
    },
    orange: {
      text: 'text-[#e28743]',
      bgLight: 'bg-[#e28743]/10',
      bgLightHover: 'hover:bg-[#e28743]/20',
      borderFocus: 'focus:border-[#e28743] focus:ring-[#e28743]/20 border-slate-200 hover:border-[#e28743]',
      accentBg: 'bg-[#e28743]',
      accentText: 'text-white',
      rangeBg: 'bg-[#e28743]/10 text-[#7c3f15] font-medium',
      rangeHoverBg: 'bg-[#e28743]/5',
    }
  }[theme]

  // Month navigation
  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11)
      setCurrentYear(prev => prev - 1)
    } else {
      setCurrentMonth(prev => prev - 1)
    }
  }

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0)
      setCurrentYear(prev => prev + 1)
    } else {
      setCurrentMonth(prev => prev + 1)
    }
  }

  // Pre-calculated calendar days (42 grid elements)
  const calendarDays = (() => {
    const daysInMonth = getDaysInMonth(currentYear, currentMonth)
    // getDay() gives 0 = Sunday, 1 = Monday...
    const firstDayIndex = new Date(currentYear, currentMonth, 1).getDay()

    const days: { dateStr: string; dayNum: number; isCurrentMonth: boolean }[] = []

    // Padding from previous month
    const prevMonth = currentMonth === 0 ? 11 : currentMonth - 1
    const prevYear = currentMonth === 0 ? currentYear - 1 : currentYear
    const daysInPrevMonth = getDaysInMonth(prevYear, prevMonth)

    for (let i = firstDayIndex - 1; i >= 0; i--) {
      const d = daysInPrevMonth - i
      const mStr = String(prevMonth + 1).padStart(2, '0')
      const dStr = String(d).padStart(2, '0')
      days.push({
        dateStr: `${prevYear}-${mStr}-${dStr}`,
        dayNum: d,
        isCurrentMonth: false
      })
    }

    // Days in current month
    for (let d = 1; d <= daysInMonth; d++) {
      const mStr = String(currentMonth + 1).padStart(2, '0')
      const dStr = String(d).padStart(2, '0')
      days.push({
        dateStr: `${currentYear}-${mStr}-${dStr}`,
        dayNum: d,
        isCurrentMonth: true
      })
    }

    // Padding for next month
    const remaining = 42 - days.length
    const nextMonth = currentMonth === 11 ? 0 : currentMonth + 1
    const nextYear = currentMonth === 11 ? currentYear + 1 : currentYear
    for (let d = 1; d <= remaining; d++) {
      const mStr = String(nextMonth + 1).padStart(2, '0')
      const dStr = String(d).padStart(2, '0')
      days.push({
        dateStr: `${nextYear}-${mStr}-${dStr}`,
        dayNum: d,
        isCurrentMonth: false
      })
    }

    return days
  })()

  // Selection handlers
  const handleDayClick = (dateStr: string) => {
    if (!tempStart) {
      // First click: set start date
      setTempStart(dateStr)
      setHoverDate(dateStr)
    } else {
      // Second click
      if (dateStr < tempStart) {
        // If clicked date is before start date, set it as the new start date
        setTempStart(dateStr)
        setHoverDate(dateStr)
      } else {
        // Complete the range
        onChange({ start: tempStart, end: dateStr })
        setTempStart(null)
        setHoverDate(null)
        setIsOpen(false)
      }
    }
  }

  const handleClear = () => {
    onChange({ start: '', end: '' })
    setTempStart(null)
    setHoverDate(null)
    setIsOpen(false)
  }

  const handleSelectToday = () => {
    const todayStr = formatLocalDate(new Date())
    onChange({ start: todayStr, end: todayStr })
    setTempStart(null)
    setHoverDate(null)
    setIsOpen(false)
  }

  // Determine if a date is within selected or hover range
  const getDayState = (dateStr: string) => {
    const todayStr = formatLocalDate(new Date())
    const isToday = dateStr === todayStr

    if (tempStart) {
      if (dateStr === tempStart) return { isStart: true, isEnd: false, inRange: true, isToday }
      
      const hover = hoverDate || tempStart
      if (dateStr === hover) return { isStart: false, isEnd: true, inRange: true, isToday }
      
      if (dateStr > tempStart && dateStr < hover) {
        return { isStart: false, isEnd: false, inRange: true, isToday }
      }
    } else {
      const { start, end } = value
      if (start && dateStr === start) {
        return { isStart: true, isEnd: dateStr === end, inRange: true, isToday }
      }
      if (end && dateStr === end) {
        return { isStart: dateStr === start, isEnd: true, inRange: true, isToday }
      }
      if (start && end && dateStr > start && dateStr < end) {
        return { isStart: false, isEnd: false, inRange: true, isToday }
      }
    }

    return { isStart: false, isEnd: false, inRange: false, isToday }
  }

  const monthNamesVi = [
    'Tháng 1', 'Tháng 2', 'Tháng 3', 'Tháng 4', 'Tháng 5', 'Tháng 6',
    'Tháng 7', 'Tháng 8', 'Tháng 9', 'Tháng 10', 'Tháng 11', 'Tháng 12'
  ]

  const weekDaysVi = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7']

  return (
    <div ref={wrapperRef} className="relative select-none text-slate-700">
      {/* Date Trigger Input Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center gap-3 bg-white border px-4 py-2.5 rounded-xl text-sm font-medium shadow-sm transition-all outline-none ${themeStyles.borderFocus}`}
      >
        <Calendar size={16} className={themeStyles.text} />
        <div className="flex items-center gap-2">
          {value.start ? (
            <span className="text-slate-800">{formatDisplayDate(value.start)}</span>
          ) : (
            <span className="text-slate-400">Chọn ngày bắt đầu</span>
          )}
          <span className="text-slate-300 font-light">→</span>
          {value.end ? (
            <span className="text-slate-800">{formatDisplayDate(value.end)}</span>
          ) : (
            <span className="text-slate-400">Chọn ngày kết thúc</span>
          )}
        </div>
      </button>

      {/* Dropdown Popover */}
      {isOpen && (
        <div
          className={`absolute ${align === 'right' ? 'right-0' : 'left-0'} top-full mt-2.5 bg-white border border-slate-200 rounded-2xl shadow-2xl z-[100] overflow-hidden w-[310px] animate-in fade-in slide-in-from-top-2 duration-200`}
        >
          {/* Calendar Body */}
          <div className="p-4 flex flex-col min-w-0">
            {/* Calendar Month/Year Selector */}
            <div className="flex items-center justify-between mb-4">
              <button
                type="button"
                onClick={handlePrevMonth}
                className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500 hover:text-slate-700 transition-colors"
              >
                <ChevronLeft size={16} />
              </button>

              <div className="flex items-center gap-1.5">
                <span className="font-bold text-slate-800 text-sm">
                  {monthNamesVi[currentMonth]}, {currentYear}
                </span>
              </div>

              <button
                type="button"
                onClick={handleNextMonth}
                className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500 hover:text-slate-700 transition-colors"
              >
                <ChevronRight size={16} />
              </button>
            </div>

            {/* Days of Week Header */}
            <div className="grid grid-cols-7 text-center mb-1">
              {weekDaysVi.map((day, idx) => (
                <span
                  key={idx}
                  className={`text-[10px] font-bold py-1 select-none tracking-wider ${
                    idx === 0 ? 'text-rose-500' : 'text-slate-400'
                  }`}
                >
                  {day}
                </span>
              ))}
            </div>

            {/* Calendar Month Grid */}
            <div className="grid grid-cols-7 gap-y-0.5 gap-x-0">
              {calendarDays.map((day, idx) => {
                const { isStart, isEnd, inRange, isToday } = getDayState(day.dateStr)
                const isCurrentMonth = day.isCurrentMonth

                return (
                  <div
                    key={idx}
                    onMouseEnter={() => tempStart && setHoverDate(day.dateStr)}
                    onClick={() => handleDayClick(day.dateStr)}
                    className={`relative py-1.5 text-xs text-center cursor-pointer flex items-center justify-center h-8 transition-colors ${
                      inRange && isCurrentMonth ? (isStart || isEnd ? '' : themeStyles.rangeBg) : ''
                    } ${
                      inRange && !isCurrentMonth ? themeStyles.rangeHoverBg : ''
                    } ${
                      isStart ? 'rounded-l-lg' : ''
                    } ${
                      isEnd ? 'rounded-r-lg' : ''
                    }`}
                  >
                    {/* Circle Indicator Background for selected endpoints */}
                    {(isStart || isEnd) && (
                      <span className={`absolute inset-0.5 rounded-lg ${themeStyles.accentBg} z-0`} />
                    )}

                    <span
                      className={`relative z-10 font-medium ${
                        isStart || isEnd
                          ? 'text-white font-bold'
                          : isToday && !inRange
                          ? 'text-slate-900 border-b-2 border-slate-800'
                          : ''
                      } ${!isCurrentMonth && !(isStart || isEnd) ? 'opacity-40' : ''}`}
                    >
                      {day.dayNum}
                    </span>
                  </div>
                )
              })}
            </div>

            {/* Bottom Actions Bar */}
            <div className="flex items-center justify-between border-t border-slate-100 mt-4 pt-3 text-xs">
              <button
                type="button"
                onClick={handleClear}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-all font-medium cursor-pointer"
              >
                <RotateCcw size={13} />
                <span>Xóa</span>
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleSelectToday}
                  className="px-2.5 py-1.5 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-all font-medium cursor-pointer"
                >
                  Hôm nay
                </button>
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className={`flex items-center gap-1 px-3.5 py-1.5 rounded-lg text-white font-semibold transition-all shadow-sm cursor-pointer ${themeStyles.accentBg} hover:opacity-90 active:scale-95`}
                >
                  <span>Xong</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

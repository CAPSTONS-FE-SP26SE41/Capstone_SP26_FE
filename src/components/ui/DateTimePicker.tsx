import { useState, useRef, useEffect } from 'react'
import { Calendar as CalendarIcon, Clock, ChevronLeft, ChevronRight, CornerDownLeft, RotateCcw } from 'lucide-react'

interface DateTimePickerProps {
  value: string // YYYY-MM-DDTHH:MM
  onChange: (value: string) => void
  theme?: 'orange' | 'emerald' | 'blue'
  placeholder?: string
  align?: 'left' | 'right'
}

// Helpers
const parseDateTime = (val: string) => {
  if (!val) {
    const now = new Date()
    return {
      date: now,
      hour: now.getHours(),
      minute: Math.floor(now.getMinutes() / 5) * 5 // Round to nearest 5 minutes
    }
  }
  
  try {
    const [datePart, timePart] = val.split('T')
    const [year, month, day] = datePart.split('-').map(Number)
    const [hour, minute] = (timePart || '00:00').split(':').map(Number)
    return {
      date: new Date(year, month - 1, day),
      hour: isNaN(hour) ? 0 : hour,
      minute: isNaN(minute) ? 0 : minute
    }
  } catch (e) {
    const now = new Date()
    return { date: now, hour: now.getHours(), minute: now.getMinutes() }
  }
}

const formatDateTimeStr = (date: Date, hour: number, minute: number) => {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  const hh = String(hour).padStart(2, '0')
  const mm = String(minute).padStart(2, '0')
  return `${y}-${m}-${d}T${hh}:${mm}`
}

const formatDisplayDateTime = (val: string) => {
  if (!val) return ''
  try {
    const [datePart, timePart] = val.split('T')
    const [year, month, day] = datePart.split('-')
    const [hour, minute] = timePart.split(':')
    return `${day}/${month}/${year} ${hour}:${minute}`
  } catch (e) {
    return val
  }
}

const getDaysInMonth = (year: number, month: number) => {
  return new Date(year, month + 1, 0).getDate()
}

export function DateTimePicker({ value, onChange, theme = 'orange', placeholder = 'Chọn ngày và giờ', align = 'left' }: DateTimePickerProps) {
  const [isOpen, setIsOpen] = useState(false)
  const wrapperRef = useRef<HTMLDivElement>(null)
  
  // Refs for scroll columns
  const hourScrollRef = useRef<HTMLDivElement>(null)
  const minuteScrollRef = useRef<HTMLDivElement>(null)

  const { date: activeDate, hour: activeHour, minute: activeMinute } = parseDateTime(value)

  // Calendar navigation states
  const [currentMonth, setCurrentMonth] = useState(activeDate.getMonth())
  const [currentYear, setCurrentYear] = useState(activeDate.getFullYear())

  // Scroll active elements into view when calendar opens
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        const selectedHourEl = hourScrollRef.current?.querySelector('[data-selected="true"]')
        if (selectedHourEl) {
          selectedHourEl.scrollIntoView({ block: 'center', behavior: 'instant' as any })
        }
        
        const selectedMinuteEl = minuteScrollRef.current?.querySelector('[data-selected="true"]')
        if (selectedMinuteEl) {
          selectedMinuteEl.scrollIntoView({ block: 'center', behavior: 'instant' as any })
        }
      }, 50)
    }
  }, [isOpen, activeHour, activeMinute])

  // Click outside to close
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Sync state if input value changes externally
  useEffect(() => {
    if (value) {
      const parsed = parseDateTime(value)
      setCurrentMonth(parsed.date.getMonth())
      setCurrentYear(parsed.date.getFullYear())
    }
  }, [value])

  const themeStyles = {
    orange: {
      text: 'text-[#e28743]',
      bgLight: 'bg-[#e28743]/10',
      borderFocus: 'focus:border-[#e28743] focus:ring-[#e28743]/20 border-slate-200 hover:border-[#e28743]',
      accentBg: 'bg-[#e28743]',
      selectedDayBg: 'bg-[#e28743] text-white rounded-lg shadow-sm',
      selectedTimeBg: 'bg-[#e28743] text-white font-bold shadow-sm scale-105',
    },
    emerald: {
      text: 'text-emerald-700',
      bgLight: 'bg-emerald-50',
      borderFocus: 'focus:border-emerald-500 focus:ring-emerald-500/20 border-slate-200 hover:border-emerald-400',
      accentBg: 'bg-emerald-600',
      selectedDayBg: 'bg-emerald-600 text-white rounded-lg shadow-sm',
      selectedTimeBg: 'bg-emerald-600 text-white font-bold shadow-sm scale-105',
    },
    blue: {
      text: 'text-blue-700',
      bgLight: 'bg-blue-50',
      borderFocus: 'focus:border-blue-500 focus:ring-blue-500/20 border-slate-200 hover:border-blue-400',
      accentBg: 'bg-blue-600',
      selectedDayBg: 'bg-blue-600 text-white rounded-lg shadow-sm',
      selectedTimeBg: 'bg-blue-600 text-white font-bold shadow-sm scale-105',
    }
  }[theme]

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

  // Pre-calculated days grid (42 days)
  const calendarDays = (() => {
    const daysInMonth = getDaysInMonth(currentYear, currentMonth)
    const firstDayIndex = new Date(currentYear, currentMonth, 1).getDay()

    const days: { dateStr: string; dayNum: number; isCurrentMonth: boolean }[] = []

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

    for (let d = 1; d <= daysInMonth; d++) {
      const mStr = String(currentMonth + 1).padStart(2, '0')
      const dStr = String(d).padStart(2, '0')
      days.push({
        dateStr: `${currentYear}-${mStr}-${dStr}`,
        dayNum: d,
        isCurrentMonth: true
      })
    }

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
  const handleDaySelect = (dateStr: string) => {
    const [y, m, d] = dateStr.split('-').map(Number)
    const newDate = new Date(y, m - 1, d)
    const updated = formatDateTimeStr(newDate, activeHour, activeMinute)
    onChange(updated)
  }

  const handleHourSelect = (h: number) => {
    const updated = formatDateTimeStr(activeDate, h, activeMinute)
    onChange(updated)
  }

  const handleMinuteSelect = (m: number) => {
    const updated = formatDateTimeStr(activeDate, activeHour, m)
    onChange(updated)
  }

  const handleClear = () => {
    onChange('')
    setIsOpen(false)
  }

  const handleSetNow = () => {
    const now = new Date()
    const hh = now.getHours()
    const mm = Math.floor(now.getMinutes() / 5) * 5
    const updated = formatDateTimeStr(now, hh, mm)
    onChange(updated)
    setIsOpen(false)
  }

  // Helper arrays for times
  const hours = Array.from({ length: 24 }, (_, i) => i)
  const minutes = Array.from({ length: 12 }, (_, i) => i * 5) // Step of 5 minutes for easy interface

  const formattedValue = value ? formatDisplayDateTime(value) : ''
  const selectedDateStr = activeDate ? formatDateTimeStr(activeDate, 0, 0).split('T')[0] : ''
  const todayStr = formatDateTimeStr(new Date(), 0, 0).split('T')[0]

  const monthNamesVi = [
    'Tháng 1', 'Tháng 2', 'Tháng 3', 'Tháng 4', 'Tháng 5', 'Tháng 6',
    'Tháng 7', 'Tháng 8', 'Tháng 9', 'Tháng 10', 'Tháng 11', 'Tháng 12'
  ]
  const weekDaysVi = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7']

  return (
    <div ref={wrapperRef} className="relative select-none text-slate-700 w-full">
      {/* Trigger Button */}
      <div className="relative">
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className={`w-full flex items-center justify-between bg-slate-50 border px-4 py-2.5 rounded-xl text-sm font-medium shadow-sm transition-all outline-none ${themeStyles.borderFocus}`}
        >
          <div className="flex items-center gap-2">
            <CalendarIcon size={16} className={themeStyles.text} />
            {formattedValue ? (
              <span className="text-slate-800 font-medium">{formattedValue}</span>
            ) : (
              <span className="text-slate-400 font-normal">{placeholder}</span>
            )}
          </div>
          <Clock size={15} className="text-slate-400" />
        </button>
      </div>

      {/* Popover */}
      {isOpen && (
        <div
          className={`absolute ${align === 'right' ? 'right-0' : 'left-0'} top-full mt-2.5 bg-white border border-slate-200 rounded-2xl shadow-2xl z-[100] flex flex-col sm:flex-row overflow-hidden w-[310px] sm:w-[450px] animate-in fade-in slide-in-from-top-2 duration-200`}
        >
          {/* Left Block: Calendar */}
          <div className="p-4 flex-1 border-b sm:border-b-0 sm:border-r border-slate-100 min-w-0">
            {/* Header Month / Year */}
            <div className="flex items-center justify-between mb-4">
              <button
                type="button"
                onClick={handlePrevMonth}
                className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500 transition-colors"
              >
                <ChevronLeft size={16} />
              </button>
              <span className="font-bold text-slate-800 text-sm">
                {monthNamesVi[currentMonth]}, {currentYear}
              </span>
              <button
                type="button"
                onClick={handleNextMonth}
                className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500 transition-colors"
              >
                <ChevronRight size={16} />
              </button>
            </div>

            {/* Week days */}
            <div className="grid grid-cols-7 text-center mb-1 text-[10px] font-bold text-slate-400">
              {weekDaysVi.map((d, idx) => (
                <span key={idx} className={idx === 0 ? 'text-rose-500' : ''}>{d}</span>
              ))}
            </div>

            {/* Days grid */}
            <div className="grid grid-cols-7 gap-y-0.5">
              {calendarDays.map((day, idx) => {
                const isSelected = day.dateStr === selectedDateStr
                const isToday = day.dateStr === todayStr
                const isCurrentMonth = day.isCurrentMonth

                return (
                  <div
                    key={idx}
                    onClick={() => handleDaySelect(day.dateStr)}
                    className={`relative h-8 flex items-center justify-center text-xs font-semibold cursor-pointer rounded-lg hover:bg-slate-100/70 transition-colors ${
                      isSelected ? themeStyles.selectedDayBg : ''
                    } ${!isCurrentMonth && !isSelected ? 'opacity-30' : ''}`}
                  >
                    <span className={isToday && !isSelected ? 'border-b-2 border-slate-800 text-slate-900 pb-0.5' : ''}>
                      {day.dayNum}
                    </span>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Right Block: Redesigned time selection wheel */}
          <div className="w-full sm:w-[150px] p-4 flex flex-col bg-slate-50/50 shrink-0 select-none">
            {/* Header Titles */}
            <div className="grid grid-cols-2 text-center text-[11px] font-bold text-slate-400 pb-2 border-b border-slate-200/50">
              <span>Giờ</span>
              <span>Phút</span>
            </div>
            
            {/* Scroll Columns Wrapper */}
            <div className="relative flex flex-row gap-3 w-full h-[180px] mt-2 overflow-hidden bg-white/40 rounded-xl border border-slate-200/40">
              
              {/* Fade overlays at top and bottom */}
              <div className="absolute top-0 left-0 right-0 h-5 bg-gradient-to-b from-slate-100/90 to-transparent pointer-events-none z-10" />
              <div className="absolute bottom-0 left-0 right-0 h-5 bg-gradient-to-t from-slate-100/90 to-transparent pointer-events-none z-10" />

              {/* Hours Column */}
              <div 
                ref={hourScrollRef}
                className="flex-1 overflow-y-auto scrollbar-none space-y-1 py-4 px-1"
              >
                {hours.map(h => {
                  const isHourSelected = h === activeHour
                  const label = String(h).padStart(2, '0')
                  return (
                    <button
                      key={h}
                      type="button"
                      data-selected={isHourSelected}
                      onClick={() => handleHourSelect(h)}
                      className={`w-full py-1.5 text-xs rounded-lg block text-center font-bold transition-all cursor-pointer ${
                        isHourSelected 
                          ? themeStyles.selectedTimeBg 
                          : 'text-slate-500 hover:bg-slate-200/40 hover:text-slate-800'
                      }`}
                    >
                      {label}
                    </button>
                  )
                })}
              </div>

              {/* Colon separator */}
              <div className="self-center text-slate-300 font-bold text-xs shrink-0 select-none">:</div>

              {/* Minutes Column */}
              <div 
                ref={minuteScrollRef}
                className="flex-1 overflow-y-auto scrollbar-none space-y-1 py-4 px-1"
              >
                {minutes.map(m => {
                  const isMinuteSelected = m === activeMinute
                  const label = String(m).padStart(2, '0')
                  return (
                    <button
                      key={m}
                      type="button"
                      data-selected={isMinuteSelected}
                      onClick={() => handleMinuteSelect(m)}
                      className={`w-full py-1.5 text-xs rounded-lg block text-center font-bold transition-all cursor-pointer ${
                        isMinuteSelected 
                          ? themeStyles.selectedTimeBg 
                          : 'text-slate-500 hover:bg-slate-200/40 hover:text-slate-800'
                      }`}
                    >
                      {label}
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Presets Action Buttons */}
            <div className="grid grid-cols-2 gap-2 mt-3 text-[10px] font-bold">
              <button
                type="button"
                onClick={handleSetNow}
                className="py-1.5 bg-white hover:bg-slate-100 border border-slate-200 rounded-lg transition-all text-slate-600 shadow-xs cursor-pointer text-center"
              >
                Bây giờ
              </button>
              <button
                type="button"
                onClick={handleClear}
                className="py-1.5 bg-white hover:bg-red-50 border border-red-100 text-rose-500 rounded-lg transition-all shadow-xs cursor-pointer text-center"
              >
                Xóa
              </button>
            </div>
          </div>

          {/* Apply bar at bottom (mobile only) */}
          <div className="w-full border-t border-slate-100 p-2 bg-white flex justify-end gap-2 text-xs sm:hidden">
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className={`px-4 py-1.5 rounded-lg text-white font-bold ${themeStyles.accentBg}`}
            >
              Xong
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

import { useState, useRef, useEffect } from 'react'
import { ChevronDown } from 'lucide-react'

export interface DropdownOption {
  value: string
  label: string
}

interface CustomSelectProps {
  value: string
  onChange: (value: string) => void
  options: DropdownOption[]
  placeholder?: string
  disabled?: boolean
  error?: boolean
}

export function CustomSelect({ value, onChange, options, placeholder = '-- Chọn --', disabled = false, error = false }: CustomSelectProps) {
  const [isOpen, setIsOpen] = useState(false)
  const wrapperRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const selectedOption = options.find(o => o.value === value)

  return (
    <div ref={wrapperRef} className="relative w-full text-slate-700">
      <div
        className={`w-full px-4 py-2.5 bg-slate-50 border rounded-xl flex items-center justify-between transition-all cursor-pointer ${
          error ? 'border-red-400' : 'border-slate-200 hover:border-[#e28743] hover:ring-2 hover:ring-[#e28743]/20'
        } ${disabled ? 'opacity-60 cursor-not-allowed pointer-events-none' : ''}`}
        onClick={() => !disabled && setIsOpen(!isOpen)}
      >
        <span className={selectedOption ? 'text-slate-800' : 'text-slate-500'}>
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <ChevronDown size={16} className={`text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </div>

      {isOpen && !disabled && (
        <div className="absolute left-0 right-0 top-full mt-1 bg-white border border-slate-200 rounded-xl shadow-lg z-50 max-h-60 overflow-y-auto">
          {options.length === 0 ? (
            <div className="px-4 py-3 text-sm text-slate-500 text-center">Không có dữ liệu</div>
          ) : (
            <ul className="py-1">
              {options.map((option) => (
                <li
                  key={option.value}
                  className={`px-4 py-2.5 text-sm cursor-pointer hover:bg-slate-50 transition-colors ${
                    value === option.value ? 'bg-[#e28743]/10 text-[#e28743] font-medium' : 'text-slate-700'
                  }`}
                  onClick={() => {
                    onChange(option.value)
                    setIsOpen(false)
                  }}
                >
                  {option.label}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  )
}

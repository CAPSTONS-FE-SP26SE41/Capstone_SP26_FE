import { useState, useRef, useEffect } from 'react'
import { ChevronDown, Search } from 'lucide-react'

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
  const [searchTerm, setSearchTerm] = useState('')
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

  // Reset search term when opening/closing
  useEffect(() => {
    if (!isOpen) setSearchTerm('')
  }, [isOpen])

  const selectedOption = options.find(o => o.value === value)
  
  const filteredOptions = options.filter(o => 
    o.label.toLowerCase().includes(searchTerm.toLowerCase())
  )

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
        <div className="absolute left-0 right-0 top-full mt-1 bg-white border border-slate-200 rounded-xl shadow-lg z-50 flex flex-col overflow-hidden max-h-72">
          {/* Search Box */}
          <div className="p-2 border-b border-slate-100 bg-white sticky top-0 z-10">
            <div className="relative">
              <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                autoFocus
                placeholder="Tìm kiếm nhanh..."
                className="w-full pl-8 pr-3 py-1.5 text-sm bg-slate-50 border border-slate-100 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#e28743]/50 focus:border-[#e28743]"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onClick={(e) => e.stopPropagation()}
              />
            </div>
          </div>

          <div className="overflow-y-auto flex-1">
            {filteredOptions.length === 0 ? (
              <div className="px-4 py-3 text-sm text-slate-500 text-center">Không tìm thấy kết quả</div>
            ) : (
              <ul className="py-1">
                {filteredOptions.map((option) => (
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
        </div>
      )}
    </div>
  )
}

import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Check, X } from 'lucide-react';

interface ToggleSwitchProps {
  initialState?: boolean;
  onChange?: (state: boolean) => void;
}

export default function ToggleSwitch({ initialState = false, onChange }: ToggleSwitchProps) {
  const [isOn, setIsOn] = useState(initialState);

  useEffect(() => {
    setIsOn(initialState);
  }, [initialState]);

  const handleToggle = () => {
    const newState = !isOn;
    setIsOn(newState);
    if (onChange) {
      onChange(newState);
    }
  };

  return (
    <div
      className={`w-14 h-7 flex items-center rounded-full p-1 cursor-pointer transition-colors duration-300 shadow-inner ${
        isOn ? 'bg-green-500 justify-end' : 'bg-red-500 justify-start'
      }`}
      onClick={handleToggle}
      role="switch"
      aria-checked={isOn}
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleToggle();
        }
      }}
    >
      <motion.div
        className="bg-white w-5 h-5 rounded-full shadow-md flex items-center justify-center"
        layout
        transition={{ type: 'spring', stiffness: 700, damping: 30 }}
      >
        <motion.div
          initial={false}
          animate={{ rotate: isOn ? 360 : 0 }}
          transition={{ duration: 0.3 }}
        >
          {isOn ? (
            <Check className="w-3 h-3 text-green-500" strokeWidth={3} />
          ) : (
            <X className="w-3 h-3 text-red-500" strokeWidth={3} />
          )}
        </motion.div>
      </motion.div>
    </div>
  );
}

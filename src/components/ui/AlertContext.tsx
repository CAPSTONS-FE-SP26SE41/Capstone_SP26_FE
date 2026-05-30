import React, { createContext, useContext, useState, useCallback } from 'react';
import { AlertModal, AlertType } from './AlertModal';

interface AlertOptions {
  title?: string;
  message: React.ReactNode;
  type?: AlertType;
  okLabel?: string;
  onClose?: () => void;
}

interface AlertContextType {
  showAlert: (options: AlertOptions | string) => void;
  // Also provide semantic helper functions for convenience
  showSuccess: (message: React.ReactNode, title?: string, onClose?: () => void) => void;
  showError: (message: React.ReactNode, title?: string, onClose?: () => void) => void;
  showWarning: (message: React.ReactNode, title?: string, onClose?: () => void) => void;
  showInfo: (message: React.ReactNode, title?: string, onClose?: () => void) => void;
}

const AlertContext = createContext<AlertContextType | undefined>(undefined);

export function AlertProvider({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [options, setOptions] = useState<AlertOptions | null>(null);

  const showAlert = useCallback((opt: AlertOptions | string) => {
    if (typeof opt === 'string') {
      setOptions({ message: opt, type: 'info' });
    } else {
      setOptions(opt);
    }
    setIsOpen(true);
  }, []);

  const showSuccess = useCallback((message: React.ReactNode, title?: string, onClose?: () => void) => {
    showAlert({ message, title, type: 'success', onClose });
  }, [showAlert]);

  const showError = useCallback((message: React.ReactNode, title?: string, onClose?: () => void) => {
    showAlert({ message, title, type: 'error', onClose });
  }, [showAlert]);

  const showWarning = useCallback((message: React.ReactNode, title?: string, onClose?: () => void) => {
    showAlert({ message, title, type: 'warning', onClose });
  }, [showAlert]);

  const showInfo = useCallback((message: React.ReactNode, title?: string, onClose?: () => void) => {
    showAlert({ message, title, type: 'info', onClose });
  }, [showAlert]);

  const handleClose = useCallback(() => {
    setIsOpen(false);
    if (options?.onClose) {
      options.onClose();
    }
  }, [options]);

  return (
    <AlertContext.Provider value={{ showAlert, showSuccess, showError, showWarning, showInfo }}>
      {children}
      {options && (
        <AlertModal
          isOpen={isOpen}
          onClose={handleClose}
          title={options.title}
          message={options.message}
          type={options.type}
          okLabel={options.okLabel}
        />
      )}
    </AlertContext.Provider>
  );
}

export function useAlert() {
  const context = useContext(AlertContext);
  if (!context) {
    throw new Error('useAlert must be used within an AlertProvider');
  }
  return context;
}

import React, { useEffect, useState } from 'react';
import { CheckCircle, XCircle, Info, X } from 'lucide-react';

interface ToastProps {
  message: string;
  type: 'success' | 'error' | 'info';
  duration?: number;
}

const Toast: React.FC<ToastProps> = ({ message, type, duration = 3000 }) => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
    }, duration - 300);

    return () => clearTimeout(timer);
  }, [duration]);

  if (!isVisible) return null;

  const styles = {
    success: {
      bg: 'bg-[#7ED9C1]',
      icon: <CheckCircle className="w-5 h-5 text-surface" />,
    },
    error: {
      bg: 'bg-red-500',
      icon: <XCircle className="w-5 h-5 text-surface" />,
    },
    info: {
      bg: 'bg-primary',
      icon: <Info className="w-5 h-5 text-surface" />,
    },
  };

  return (
    <div className="fixed top-4 right-4 z-50 animate-fade-in">
      <div className={`${styles[type].bg} text-surface px-5 py-3 rounded-xl shadow-lg shadow-black/10 flex items-center gap-3 min-w-[300px]`}>
        {styles[type].icon}
        <span className="font-medium flex-1">{message}</span>
        <button
          onClick={() => setIsVisible(false)}
          className="p-1 hover:bg-white/20 rounded-lg transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export default Toast;

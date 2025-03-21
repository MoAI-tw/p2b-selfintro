import React, { useEffect, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheckCircle, faExclamationCircle, faInfoCircle, faTimes } from '@fortawesome/free-solid-svg-icons';

export type ToastType = 'success' | 'error' | 'info';

interface ToastProps {
  message: string;
  type: ToastType;
  duration?: number;
  onClose: () => void;
}

const Toast: React.FC<ToastProps> = ({ 
  message, 
  type = 'info', 
  duration = 3000, 
  onClose 
}) => {
  const [isVisible, setIsVisible] = useState(false);
  
  // First render the component, then trigger the entrance animation
  useEffect(() => {
    const entranceTimer = setTimeout(() => {
      setIsVisible(true);
    }, 10);
    
    return () => clearTimeout(entranceTimer);
  }, []);
  
  // Set a timer to remove the toast after duration
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      // Wait for exit animation to complete before removing from DOM
      setTimeout(onClose, 500);
    }, duration);
    
    return () => clearTimeout(timer);
  }, [duration, onClose]);
  
  const getIcon = () => {
    switch(type) {
      case 'success':
        return faCheckCircle;
      case 'error':
        return faExclamationCircle;
      case 'info':
      default:
        return faInfoCircle;
    }
  };
  
  const getBackgroundColor = () => {
    switch(type) {
      case 'success':
        return 'bg-green-50 border-green-500 text-green-800';
      case 'error':
        return 'bg-red-50 border-red-500 text-red-800';
      case 'info':
      default:
        return 'bg-blue-50 border-blue-500 text-blue-800';
    }
  };
  
  const getIconColor = () => {
    switch(type) {
      case 'success':
        return 'text-green-500';
      case 'error':
        return 'text-red-500';
      case 'info':
      default:
        return 'text-blue-500';
    }
  };

  return (
    <div 
      className={`shadow-lg rounded-lg border-l-4 px-4 py-3 pointer-events-auto
                 transition-all duration-500 transform ${getBackgroundColor()} 
                 ${isVisible ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-4 scale-95'}`}
      role="alert"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <div className={`flex-shrink-0 ${getIconColor()}`}>
            <FontAwesomeIcon icon={getIcon()} />
          </div>
          <div className="ml-3">
            <p className="text-sm">{message}</p>
          </div>
        </div>
        <button 
          onClick={() => {
            setIsVisible(false);
            setTimeout(onClose, 500);
          }}
          className="flex-shrink-0 ml-4 text-sm text-gray-500 hover:text-gray-700 focus:outline-none"
        >
          <FontAwesomeIcon icon={faTimes} />
        </button>
      </div>
    </div>
  );
};

export default Toast; 
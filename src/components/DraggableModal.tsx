import React, { useState, useEffect, useRef, MouseEvent } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes } from '@fortawesome/free-solid-svg-icons';

interface DraggableModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  maxWidth?: string;
  initialPosition?: { x: number; y: number };
}

const DraggableModal: React.FC<DraggableModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  maxWidth = '600px',
  initialPosition
}) => {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const modalRef = useRef<HTMLDivElement>(null);

  // Calculate initial position (center of viewport)
  useEffect(() => {
    if (isOpen && modalRef.current) {
      const modalWidth = modalRef.current.offsetWidth;
      const modalHeight = modalRef.current.offsetHeight;
      
      if (initialPosition) {
        setPosition(initialPosition);
      } else {
        setPosition({
          x: Math.max(0, (window.innerWidth - modalWidth) / 2),
          y: Math.max(0, (window.innerHeight - modalHeight) / 3)
        });
      }
    }
  }, [isOpen, initialPosition]);

  // Handle escape key to close modal
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, onClose]);

  // Dragging functionality
  const handleMouseDown = (e: MouseEvent) => {
    // Only allow dragging when clicking on the handle
    const target = e.target as HTMLElement;
    const dragHandle = document.getElementById('modal-drag-handle');
    
    if (dragHandle && (dragHandle.contains(target) || target.id === 'modal-drag-handle' || 
        target.closest('#modal-drag-handle'))) {
      setIsDragging(true);
      if (modalRef.current) {
        setDragOffset({
          x: e.clientX - position.x,
          y: e.clientY - position.y
        });
      }
    }
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (isDragging) {
      // Calculate new position
      let newX = e.clientX - dragOffset.x;
      let newY = e.clientY - dragOffset.y;
      
      // Prevent dragging outside viewport
      const modalWidth = modalRef.current?.offsetWidth || 0;
      const modalHeight = modalRef.current?.offsetHeight || 0;
      
      newX = Math.max(0, Math.min(newX, window.innerWidth - modalWidth));
      newY = Math.max(0, Math.min(newY, window.innerHeight - modalHeight));
      
      setPosition({ x: newX, y: newY });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Add global mouse event listeners when dragging
  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove as any);
      document.addEventListener('mouseup', handleMouseUp);
    } else {
      document.removeEventListener('mousemove', handleMouseMove as any);
      document.removeEventListener('mouseup', handleMouseUp);
    }
    
    return () => {
      document.removeEventListener('mousemove', handleMouseMove as any);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="fixed inset-0 bg-black bg-opacity-50" onClick={onClose}></div>
      
      <div
        ref={modalRef}
        className="absolute bg-white rounded-lg shadow-xl overflow-hidden"
        style={{
          maxWidth,
          left: `${position.x}px`,
          top: `${position.y}px`,
          cursor: isDragging ? 'grabbing' : 'default',
          zIndex: 60
        }}
        onMouseDown={handleMouseDown}
      >
        {children}
      </div>
    </div>
  );
};

export default DraggableModal; 
import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

export function SOSButton() {
  const navigate = useNavigate();
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const isDragging = useRef(false);
  const dragStart = useRef({ x: 0, y: 0, startX: 0, startY: 0 });
  const hasMoved = useRef(false);

  const handlePointerDown = (e) => {
    isDragging.current = true;
    hasMoved.current = false;
    dragStart.current = {
      x: e.clientX - position.x,
      y: e.clientY - position.y,
      startX: e.clientX,
      startY: e.clientY,
    };
    e.currentTarget.setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e) => {
    if (!isDragging.current) return;
    
    const moveX = e.clientX - dragStart.current.startX;
    const moveY = e.clientY - dragStart.current.startY;
    
    // Threshold to differentiate click from drag
    if (Math.abs(moveX) > 5 || Math.abs(moveY) > 5) {
      hasMoved.current = true;
    }

    setPosition({
      x: e.clientX - dragStart.current.x,
      y: e.clientY - dragStart.current.y,
    });
  };

  const handlePointerUp = (e) => {
    isDragging.current = false;
    e.currentTarget.releasePointerCapture(e.pointerId);
  };

  const handleClick = (e) => {
    if (hasMoved.current) {
      e.preventDefault();
      e.stopPropagation();
    } else {
      navigate('/emergency');
    }
  };

  return (
    <button
      className="floating-sos-btn"
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
      onClick={handleClick}
      aria-label="Instant Emergency Assistance SOS"
      title="Tap for Immediate Emergency Help"
      style={{
        transform: `translate(${position.x}px, ${position.y}px)`,
        touchAction: 'none',
        cursor: 'grab',
        userSelect: 'none'
      }}
    >
      <span style={{ fontSize: '1rem', pointerEvents: 'none' }}>🚨</span>
      <span style={{ pointerEvents: 'none' }}>SOS</span>
    </button>
  );
}

export default SOSButton;

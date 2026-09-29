import React, { useRef, useState, useEffect, useCallback } from 'react';

interface CircularJoystickProps {
  onMoveDirection: (dir: 'up' | 'down' | 'left' | 'right' | null) => void;
  onVectorChange?: (vector: { x: number; y: number } | null) => void;
  size?: number;
}

export const CircularJoystick: React.FC<CircularJoystickProps> = ({
  onMoveDirection,
  onVectorChange,
  size = 126
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [knobPos, setKnobPos] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const activePointerId = useRef<number | null>(null);

  const maxRadius = (size / 2) - 18; // Maximum travel distance for the knob center

  const handlePointerStart = (e: React.PointerEvent) => {
    if (activePointerId.current !== null) return;
    activePointerId.current = e.pointerId;
    setIsDragging(true);
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
    processPointerEvent(e.clientX, e.clientY);
  };

  const processPointerEvent = useCallback(
    (clientX: number, clientY: number) => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;

      const rawDx = clientX - centerX;
      const rawDy = clientY - centerY;
      const distance = Math.hypot(rawDx, rawDy);

      if (distance < 7) {
        // Deadzone
        setKnobPos({ x: 0, y: 0 });
        onMoveDirection(null);
        if (onVectorChange) onVectorChange(null);
        return;
      }

      const clampedDist = Math.min(distance, maxRadius);
      const angle = Math.atan2(rawDy, rawDx);
      const knobX = Math.cos(angle) * clampedDist;
      const knobY = Math.sin(angle) * clampedDist;

      setKnobPos({ x: knobX, y: knobY });

      // Normalized vector between -1 and 1
      const normX = knobX / maxRadius;
      const normY = knobY / maxRadius;

      if (onVectorChange) {
        onVectorChange({ x: normX, y: normY });
      }

      // Discrete 4-way direction
      if (Math.abs(normX) > Math.abs(normY)) {
        onMoveDirection(normX > 0 ? 'right' : 'left');
      } else {
        onMoveDirection(normY > 0 ? 'down' : 'up');
      }
    },
    [maxRadius, onMoveDirection, onVectorChange]
  );

  const handlePointerMove = (e: React.PointerEvent) => {
    if (activePointerId.current !== e.pointerId || !isDragging) return;
    processPointerEvent(e.clientX, e.clientY);
  };

  const handlePointerEnd = (e: React.PointerEvent) => {
    if (activePointerId.current !== e.pointerId) return;
    try {
      (e.target as HTMLElement).releasePointerCapture(e.pointerId);
    } catch {
      // Ignored if capture already lost
    }
    activePointerId.current = null;
    setIsDragging(false);
    setKnobPos({ x: 0, y: 0 });
    onMoveDirection(null);
    if (onVectorChange) onVectorChange(null);
  };

  useEffect(() => {
    return () => {
      activePointerId.current = null;
    };
  }, []);

  return (
    <div
      ref={containerRef}
      onPointerDown={handlePointerStart}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerEnd}
      onPointerCancel={handlePointerEnd}
      style={{ width: size, height: size }}
      className="relative rounded-full bg-stone-950/70 backdrop-blur-md border-2 border-stone-600/60 shadow-[0_8px_24px_rgba(0,0,0,0.45)] flex items-center justify-center select-none touch-none pointer-events-auto cursor-grab active:cursor-grabbing group"
      title="Joystick circular de movimiento"
    >
      {/* Outer concentric decorative rings */}
      <div className="absolute inset-2 rounded-full border border-amber-500/20 pointer-events-none" />
      <div className="absolute inset-5 rounded-full border border-dashed border-stone-500/30 pointer-events-none" />

      {/* Directional ticks / compass marks */}
      <span className="absolute top-1 text-[9px] font-black text-amber-400/80 pointer-events-none">
        ▲
      </span>
      <span className="absolute bottom-1 text-[9px] font-black text-amber-400/80 pointer-events-none">
        ▼
      </span>
      <span className="absolute left-1.5 text-[9px] font-black text-amber-400/80 pointer-events-none">
        ◀
      </span>
      <span className="absolute right-1.5 text-[9px] font-black text-amber-400/80 pointer-events-none">
        ▶
      </span>

      {/* Center crosshair dot */}
      <div className="w-2 h-2 rounded-full bg-stone-600/50 pointer-events-none" />

      {/* Dynamic Thumbstick / Knob */}
      <div
        style={{
          transform: `translate(${knobPos.x}px, ${knobPos.y}px)`,
          transition: isDragging ? 'none' : 'transform 0.16s cubic-bezier(0.2, 0.9, 0.3, 1.2)'
        }}
        className="absolute w-12 h-12 rounded-full bg-gradient-to-b from-amber-400 via-amber-500 to-amber-600 shadow-[0_4px_12px_rgba(0,0,0,0.5),inset_0_2px_4px_rgba(255,255,255,0.4)] border-2 border-amber-200 flex items-center justify-center pointer-events-none"
      >
        {/* Grip texture inside the knob */}
        <div className="w-6 h-6 rounded-full border-2 border-amber-700/40 bg-amber-600/40 flex items-center justify-center">
          <div className="w-2 h-2 rounded-full bg-amber-200 shadow-xs" />
        </div>
      </div>
    </div>
  );
};

import React, { useRef, useState, useCallback, useEffect } from 'react';

export interface VirtualJoystickProps {
  onChange: (x: number, y: number, active: boolean) => void;
  size?: number; // Base diameter in px
  knobSize?: number; // Knob diameter in px
  className?: string;
}

export const VirtualJoystick: React.FC<VirtualJoystickProps> = ({
  onChange,
  size = 148,
  knobSize = 62,
  className = '',
}) => {
  const baseRef = useRef<HTMLDivElement>(null);
  const [knobPos, setKnobPos] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const activePointerIdRef = useRef<number | null>(null);

  const maxRadius = (size - knobSize) / 2 + 6; // Allows slight overlap onto rim like in Image 2

  const handlePointerDown = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      e.preventDefault();
      e.stopPropagation();

      const base = baseRef.current;
      if (!base) return;

      activePointerIdRef.current = e.pointerId;
      try {
        base.setPointerCapture(e.pointerId);
      } catch {
        // Fallback for browsers that don't support pointer capture
      }

      const rect = base.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;

      let dx = e.clientX - centerX;
      let dy = e.clientY - centerY;
      const dist = Math.hypot(dx, dy);

      if (dist > maxRadius) {
        dx = (dx / dist) * maxRadius;
        dy = (dy / dist) * maxRadius;
      }

      setKnobPos({ x: dx, y: dy });
      setIsDragging(true);

      const normX = dx / maxRadius;
      const normY = dy / maxRadius;
      onChange(normX, normY, true);
    },
    [maxRadius, onChange]
  );

  const handlePointerMove = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      if (!isDragging || activePointerIdRef.current !== e.pointerId) return;
      e.preventDefault();

      const base = baseRef.current;
      if (!base) return;

      const rect = base.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;

      let dx = e.clientX - centerX;
      let dy = e.clientY - centerY;
      const dist = Math.hypot(dx, dy);

      if (dist > maxRadius) {
        dx = (dx / dist) * maxRadius;
        dy = (dy / dist) * maxRadius;
      }

      setKnobPos({ x: dx, y: dy });

      const normX = dx / maxRadius;
      const normY = dy / maxRadius;
      onChange(normX, normY, true);
    },
    [isDragging, maxRadius, onChange]
  );

  const handlePointerUp = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      if (activePointerIdRef.current !== e.pointerId && activePointerIdRef.current !== null) return;
      e.preventDefault();

      const base = baseRef.current;
      if (base && activePointerIdRef.current !== null) {
        try {
          base.releasePointerCapture(activePointerIdRef.current);
        } catch {
          // Ignore
        }
      }

      activePointerIdRef.current = null;
      setIsDragging(false);
      setKnobPos({ x: 0, y: 0 });
      onChange(0, 0, false);
    },
    [onChange]
  );

  useEffect(() => {
    // Safety cleanup if pointerup fired outside window
    const handleGlobalPointerUp = () => {
      if (isDragging) {
        setIsDragging(false);
        setKnobPos({ x: 0, y: 0 });
        activePointerIdRef.current = null;
        onChange(0, 0, false);
      }
    };
    window.addEventListener('pointerup', handleGlobalPointerUp);
    window.addEventListener('pointercancel', handleGlobalPointerUp);
    return () => {
      window.removeEventListener('pointerup', handleGlobalPointerUp);
      window.removeEventListener('pointercancel', handleGlobalPointerUp);
    };
  }, [isDragging, onChange]);

  return (
    <div
      ref={baseRef}
      role="region"
      aria-label="Virtual Joystick"
      data-testid="virtual-joystick"
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
      style={{
        width: `${size}px`,
        height: `${size}px`,
        touchAction: 'none',
        userSelect: 'none',
      }}
      className={`relative rounded-full select-none cursor-grab active:cursor-grabbing p-1.5 flex items-center justify-center filter drop-shadow-[0_6px_14px_rgba(0,0,0,0.65)] ${className}`}
    >
      {/* Outer Wooden Ring with Golden Inner Bezel */}
      <div
        className="absolute inset-0 rounded-full pointer-events-none"
        style={{
          border: '6px solid #78471e',
          boxShadow:
            'inset 0 3px 8px rgba(0,0,0,0.7), 0 4px 12px rgba(0,0,0,0.5)',
        }}
      />
      <div
        className="absolute inset-[5px] rounded-full pointer-events-none"
        style={{
          border: '2.5px solid #cca347',
        }}
      />

      {/* Dark Oceanic Translucent Glass Base Background */}
      <div
        className="absolute inset-[7.5px] rounded-full overflow-hidden pointer-events-none"
        style={{
          background:
            'radial-gradient(circle, rgba(14, 46, 75, 0.65) 0%, rgba(8, 28, 48, 0.8) 100%)',
          boxShadow: 'inset 0 4px 12px rgba(0,0,0,0.7)',
        }}
      >
        {/* Concentric Dashed Guide Ring matching Image 2 */}
        <svg className="w-full h-full" viewBox="0 0 100 100">
          <circle
            cx="50"
            cy="50"
            r="33"
            fill="none"
            stroke="#a5c4dc"
            strokeWidth="2.2"
            strokeDasharray="5, 5"
            strokeOpacity="0.65"
          />
        </svg>
      </div>

      {/* Draggable Knob (Thumb Puck) matching Image 2 */}
      <div
        data-testid="joystick-knob"
        style={{
          width: `${knobSize}px`,
          height: `${knobSize}px`,
          transform: `translate(${knobPos.x}px, ${knobPos.y}px)`,
          transition: isDragging
            ? 'none'
            : 'transform 0.22s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
        }}
        className="relative z-10 rounded-full flex items-center justify-center pointer-events-none filter drop-shadow-[0_4px_10px_rgba(0,0,0,0.75)]"
      >
        <img
          src={
            isDragging
              ? '/assets/png/retina/ui/controls/button_round_pressed.png'
              : '/assets/png/retina/ui/controls/button_round_normal.png'
          }
          alt=""
          aria-hidden="true"
          className="w-full h-full object-contain pointer-events-none"
        />
      </div>
    </div>
  );
};

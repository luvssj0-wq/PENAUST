import React, { useState, useEffect, useRef, useCallback } from 'react';
import { sound } from '../utils/audio';
import { X, Sparkles, Wind, Users, Music, Trophy } from 'lucide-react';

interface SkatingModalProps {
  isOpen: boolean;
  onClose: () => void;
  timeOfDay?: string;
}

interface SkateTrail {
  x: number;
  y: number;
  angle: number;
  alpha: number;
}

interface IceNPC {
  id: string;
  name: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  angle: number;
  color: string;
  radius: number;
  speed: number;
  spinProgress: number;
}

interface IceNote {
  x: number;
  y: number;
  text: string;
  color: string;
  life: number;
}

export const SkatingModal: React.FC<SkatingModalProps> = ({
  isOpen,
  onClose
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Ari's skating physics state
  const ariPosRef = useRef<{ x: number; y: number; vx: number; vy: number; angle: number }>({
    x: 420,
    y: 280,
    vx: 0,
    vy: 0,
    angle: 0
  });

  const isSpinningRef = useRef<boolean>(false);
  const spinAngleRef = useRef<number>(0);
  const isJumpingRef = useRef<boolean>(false);
  const jumpHeightRef = useRef<number>(0);
  const syncFormationRef = useRef<boolean>(false);

  // Skate tracks left on the ice
  const trailsRef = useRef<SkateTrail[]>([]);
  const snowParticlesRef = useRef<Array<{ x: number; y: number; vx: number; vy: number; r: number; alpha: number }>>([]);
  const iceSprayRef = useRef<Array<{ x: number; y: number; vx: number; vy: number; life: number }>>([]);
  const musicalNotesRef = useRef<IceNote[]>([]);

  // NPCs on the ice
  const npcsRef = useRef<IceNPC[]>([
    { id: 'snoopy', name: 'Snoopy', x: 260, y: 180, vx: 1.8, vy: 0.8, angle: 0.4, color: '#FFFFFF', radius: 14, speed: 2.2, spinProgress: 0 },
    { id: 'peppermint_patty', name: 'Peppermint Patty', x: 580, y: 340, vx: -2.4, vy: -1.2, angle: -2.2, color: '#10B981', radius: 16, speed: 2.8, spinProgress: 0 },
    { id: 'linus', name: 'Linus', x: 480, y: 160, vx: 1.2, vy: 1.5, angle: 1.1, color: '#EF4444', radius: 15, speed: 1.6, spinProgress: 0 },
    { id: 'woodstock', name: 'Woodstock', x: 280, y: 160, vx: 1.8, vy: 0.8, angle: 0.4, color: '#FACC15', radius: 8, speed: 2.2, spinProgress: 0 }
  ]);

  // Keys tracking
  const keysPressed = useRef<{ [key: string]: boolean }>({});
  const [spinCount, setSpinCount] = useState<number>(0);
  const [score, setScore] = useState<number>(0);
  const [combo, setCombo] = useState<number>(1);
  const [lastMoveText, setLastMoveText] = useState<string>('¡Deslízate por el hielo!');
  const [isFormationActive, setIsFormationActive] = useState<boolean>(false);

  const addMoveFeedback = (title: string, points: number, notes: string[]) => {
    setLastMoveText(`${title} (+${points * combo} pts)`);
    setScore((s) => s + points * combo);
    setCombo((c) => Math.min(5, c + 1));

    const ari = ariPosRef.current;
    notes.forEach((nt, idx) => {
      musicalNotesRef.current.push({
        x: ari.x + (Math.random() - 0.5) * 40,
        y: ari.y - 20 - idx * 15,
        text: nt,
        color: idx % 2 === 0 ? '#38BDF8' : '#FDE047',
        life: 1.0
      });
    });
  };

  // Trigger spin pirouette
  const handleSpin = useCallback(() => {
    if (isSpinningRef.current) return;
    isSpinningRef.current = true;
    spinAngleRef.current = 0;
    sound.playInspireChime();
    setSpinCount((c) => c + 1);

    addMoveFeedback('¡Pirueta 360° Estelar!', 150, ['🎵', '✨', '🎶']);

    // Snoopy spins too if near!
    const ari = ariPosRef.current;
    const snoopy = npcsRef.current.find((n) => n.id === 'snoopy');
    if (snoopy && Math.hypot(ari.x - snoopy.x, ari.y - snoopy.y) < 140) {
      snoopy.spinProgress = Math.PI * 4;
    }

    // Add ice spray
    for (let i = 0; i < 32; i++) {
      const a = Math.random() * Math.PI * 2;
      const spd = 2 + Math.random() * 5;
      iceSprayRef.current.push({
        x: ari.x,
        y: ari.y,
        vx: Math.cos(a) * spd,
        vy: Math.sin(a) * spd,
        life: 1
      });
    }
  }, [combo]);

  // Trigger axel jump
  const handleJump = useCallback(() => {
    if (isJumpingRef.current) return;
    isJumpingRef.current = true;
    jumpHeightRef.current = 0;
    sound.playFootstep('ice');

    addMoveFeedback('¡Salto Axel Acrobático!', 200, ['⭐', '❄️']);
  }, [combo]);

  // Toggle synchronized formation
  const handleToggleFormation = useCallback(() => {
    syncFormationRef.current = !syncFormationRef.current;
    setIsFormationActive(syncFormationRef.current);
    if (syncFormationRef.current) {
      sound.playPeanutsJingle();
      addMoveFeedback('¡Coreografía en Cadena con el Grupo!', 300, ['🎵', '💃', '✨']);
    } else {
      sound.playFootstep('ice');
      setLastMoveText('Patinaje libre relajado');
    }
  }, [combo]);

  // Keyboard listener
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      keysPressed.current[e.code] = true;

      if (e.code === 'KeyB' || e.code === 'ShiftLeft' || e.code === 'ShiftRight') {
        e.preventDefault();
        handleSpin();
      } else if (e.code === 'Space') {
        e.preventDefault();
        handleJump();
      } else if (e.code === 'KeyF') {
        e.preventDefault();
        handleToggleFormation();
      } else if (e.code === 'Escape') {
        e.preventDefault();
        onClose();
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      keysPressed.current[e.code] = false;
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [isOpen, handleSpin, handleJump, handleToggleFormation, onClose]);

  // Main canvas render & skating physics loop
  useEffect(() => {
    if (!isOpen) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Seed snow particles
    snowParticlesRef.current = [];
    for (let i = 0; i < 75; i++) {
      snowParticlesRef.current.push({
        x: Math.random() * 850,
        y: Math.random() * 520,
        vx: (Math.random() - 0.5) * 0.8,
        vy: 0.6 + Math.random() * 1.2,
        r: 1.2 + Math.random() * 2,
        alpha: 0.4 + Math.random() * 0.5
      });
    }

    let localTime = 0;
    let animId: number;

    const render = () => {
      localTime += 0.03;
      const w = canvas.width;
      const h = canvas.height;

      // 1. UPDATE ARI PHYSICS (SMOOTH LOW-FRICTION ICE GLIDE)
      const ari = ariPosRef.current;
      const accel = 0.28;
      const friction = 0.97;

      let inputX = 0;
      let inputY = 0;
      if (keysPressed.current['ArrowUp'] || keysPressed.current['KeyW']) inputY -= 1;
      if (keysPressed.current['ArrowDown'] || keysPressed.current['KeyS']) inputY += 1;
      if (keysPressed.current['ArrowLeft'] || keysPressed.current['KeyA']) inputX -= 1;
      if (keysPressed.current['ArrowRight'] || keysPressed.current['KeyD']) inputX += 1;

      if (inputX !== 0 && inputY !== 0) {
        inputX *= 0.7071;
        inputY *= 0.7071;
      }

      ari.vx += inputX * accel;
      ari.vy += inputY * accel;
      ari.vx *= friction;
      ari.vy *= friction;

      const currentSpeed = Math.hypot(ari.vx, ari.vy);
      const maxSpeed = 5.2;
      if (currentSpeed > maxSpeed) {
        ari.vx = (ari.vx / currentSpeed) * maxSpeed;
        ari.vy = (ari.vy / currentSpeed) * maxSpeed;
      }

      ari.x += ari.vx;
      ari.y += ari.vy;

      if (currentSpeed > 0.2 && !isSpinningRef.current) {
        ari.angle = Math.atan2(ari.vy, ari.vx);
      }

      // Railings padding
      const padding = 55;
      if (ari.x < padding) { ari.x = padding; ari.vx *= -0.5; sound.playFootstep('ice'); }
      if (ari.x > w - padding) { ari.x = w - padding; ari.vx *= -0.5; sound.playFootstep('ice'); }
      if (ari.y < padding + 30) { ari.y = padding + 30; ari.vy *= -0.5; sound.playFootstep('ice'); }
      if (ari.y > h - padding) { ari.y = h - padding; ari.vy *= -0.5; sound.playFootstep('ice'); }

      // Spin pirouette update
      if (isSpinningRef.current) {
        spinAngleRef.current += 0.28;
        if (spinAngleRef.current >= Math.PI * 6) {
          isSpinningRef.current = false;
          spinAngleRef.current = 0;
        }
      }

      // Jump update
      if (isJumpingRef.current) {
        jumpHeightRef.current += 1.8;
        if (jumpHeightRef.current > 32) {
          isJumpingRef.current = false;
          jumpHeightRef.current = 0;
          for (let i = 0; i < 16; i++) {
            const a = Math.random() * Math.PI * 2;
            iceSprayRef.current.push({
              x: ari.x,
              y: ari.y,
              vx: Math.cos(a) * 3,
              vy: Math.sin(a) * 3,
              life: 0.8
            });
          }
        }
      }

      // Record skate trails
      if (currentSpeed > 0.6 || isSpinningRef.current) {
        trailsRef.current.push({
          x: ari.x,
          y: ari.y,
          angle: isSpinningRef.current ? spinAngleRef.current : ari.angle,
          alpha: 0.75
        });
        if (trailsRef.current.length > 220) trailsRef.current.shift();
      }

      // 2. UPDATE NPCS ON ICE
      npcsRef.current.forEach((npc) => {
        if (npc.spinProgress > 0) {
          npc.spinProgress -= 0.2;
          if (npc.spinProgress <= 0) npc.spinProgress = 0;
        }

        if (syncFormationRef.current) {
          // Formation orbit around Ari
          let targetOffsetX = 0;
          let targetOffsetY = 0;
          if (npc.id === 'snoopy') { targetOffsetX = 45; targetOffsetY = 15; }
          if (npc.id === 'woodstock') { targetOffsetX = 55; targetOffsetY = -25; }
          if (npc.id === 'linus') { targetOffsetX = -50; targetOffsetY = 15; }
          if (npc.id === 'peppermint_patty') { targetOffsetX = -70; targetOffsetY = -20; }

          const targetX = ari.x + targetOffsetX;
          const targetY = ari.y + targetOffsetY;
          npc.vx += (targetX - npc.x) * 0.05;
          npc.vy += (targetY - npc.y) * 0.05;
          npc.vx *= 0.92;
          npc.vy *= 0.92;
        } else {
          // Free rhythmic skating glide
          npc.x += npc.vx;
          npc.y += npc.vy;

          if (npc.x < padding + 20 || npc.x > w - padding - 20) npc.vx *= -1;
          if (npc.y < padding + 40 || npc.y > h - padding - 20) npc.vy *= -1;

          if (Math.hypot(npc.vx, npc.vy) > 0.1) {
            npc.angle = Math.atan2(npc.vy, npc.vx);
          }
        }
      });

      // 3. DRAW CLEAR POND ICE BACKGROUND
      ctx.fillStyle = '#BAE6FD';
      ctx.fillRect(0, 0, w, h);

      // Deep frozen pond gradient with crystalline sheen
      const iceGrad = ctx.createLinearGradient(0, 0, w, h);
      iceGrad.addColorStop(0, '#E0F2FE');
      iceGrad.addColorStop(0.3, '#BAE6FD');
      iceGrad.addColorStop(0.7, '#7DD3FC');
      iceGrad.addColorStop(1, '#38BDF8');
      ctx.fillStyle = iceGrad;
      ctx.fillRect(0, 0, w, h);

      // Distant snowbanks and pine trees along outer boundary
      ctx.fillStyle = '#F8FAFC';
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(w, 0);
      ctx.lineTo(w, 50);
      ctx.bezierCurveTo(w * 0.7, 40, w * 0.3, 60, 0, 45);
      ctx.closePath();
      ctx.fill();

      // Winter pines
      drawWinterPine(ctx, 80, 40, 24);
      drawWinterPine(ctx, 160, 35, 20);
      drawWinterPine(ctx, 300, 38, 22);
      drawWinterPine(ctx, 600, 36, 22);
      drawWinterPine(ctx, 720, 42, 26);

      // Wooden pond fence perimeter
      ctx.strokeStyle = '#78350F';
      ctx.lineWidth = 4;
      ctx.strokeRect(padding, padding + 20, w - padding * 2, h - padding * 2 - 20);

      // 4. DRAW SKATE TRAILS WITH FROST SHINE
      ctx.strokeStyle = '#FFFFFF';
      ctx.lineWidth = 1.4;
      ctx.beginPath();
      trailsRef.current.forEach((t, idx) => {
        t.alpha -= 0.0015;
        if (idx === 0) ctx.moveTo(t.x, t.y);
        else ctx.lineTo(t.x, t.y);
      });
      ctx.stroke();

      // 5. DRAW NPCS ON THE ICE
      npcsRef.current.forEach((npc) => {
        drawIceNPC(ctx, npc, localTime);
      });

      // 6. DRAW FIGURE SKATING ARI
      drawFigureSkatingAri(
        ctx,
        ari.x,
        ari.y - jumpHeightRef.current,
        ari.angle,
        isSpinningRef.current,
        spinAngleRef.current,
        currentSpeed,
        localTime
      );

      // 7. ICE SPRAY PARTICLES
      for (let i = iceSprayRef.current.length - 1; i >= 0; i--) {
        const p = iceSprayRef.current[i];
        p.x += p.vx;
        p.y += p.vy;
        p.life -= 0.04;
        if (p.life <= 0) {
          iceSprayRef.current.splice(i, 1);
        } else {
          ctx.fillStyle = `rgba(255, 255, 255, ${p.life * 0.8})`;
          ctx.beginPath();
          ctx.arc(p.x, p.y, 2 * p.life, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      // 8. MUSICAL NOTES FLOATING
      for (let i = musicalNotesRef.current.length - 1; i >= 0; i--) {
        const n = musicalNotesRef.current[i];
        n.y -= 0.8;
        n.life -= 0.02;
        if (n.life <= 0) {
          musicalNotesRef.current.splice(i, 1);
        } else {
          ctx.save();
          ctx.globalAlpha = Math.min(1, n.life * 1.5);
          ctx.fillStyle = n.color;
          ctx.font = 'bold 16px sans-serif';
          ctx.textAlign = 'center';
          ctx.fillText(n.text, n.x, n.y);
          ctx.restore();
        }
      }

      // 9. GENTLE DRIFTING SNOWFLAKES
      snowParticlesRef.current.forEach((s) => {
        s.x += s.vx;
        s.y += s.vy;
        if (s.y > h) s.y = 0;
        if (s.x > w) s.x = 0;
        if (s.x < 0) s.x = w;

        ctx.fillStyle = `rgba(255, 255, 255, ${s.alpha})`;
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        ctx.fill();
      });

      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);
    return () => cancelAnimationFrame(animId);
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div
      id="skating-modal-overlay"
      className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/80 backdrop-blur-md animate-fade-in"
    >
      <div
        id="skating-modal-card"
        className="w-full max-w-4xl bg-stone-900 border-3 border-sky-500/80 rounded-3xl shadow-2xl overflow-hidden flex flex-col text-stone-100"
      >
        {/* Top Header */}
        <div className="bg-sky-950 px-3 py-2.5 sm:px-5 sm:py-3 flex items-center justify-between border-b-2 border-sky-700/50 text-sky-100 gap-2 shrink-0">
          <div className="flex items-center gap-2.5">
            <span className="text-2xl">⛸️</span>
            <div>
              <h2 className="text-sm sm:text-base font-black tracking-wide font-['Lora',serif]">
                Pista de Hielo y Nieve con Snoopy
              </h2>
              <p className="text-[11px] text-sky-300/80 hidden sm:block">
                Deslízate al ritmo del jazz invernal de Vince Guaraldi
              </p>
            </div>
          </div>

          {/* Quick Scoreboard */}
          <div className="flex items-center gap-3 bg-stone-900/90 px-3 py-1 rounded-xl border border-sky-700/50 text-xs shrink-0">
            <div className="text-center">
              <span className="text-[8px] uppercase text-stone-400 font-bold block">Puntos</span>
              <span className="font-black text-sky-400 text-xs sm:text-sm">{score}</span>
            </div>
            <div className="text-center">
              <span className="text-[8px] uppercase text-stone-400 font-bold block">Piruetas</span>
              <span className="font-black text-rose-400 text-xs sm:text-sm">{spinCount}</span>
            </div>
            {combo > 1 && (
              <div className="text-center px-1.5 py-0.5 bg-yellow-500/20 text-yellow-300 font-black rounded-lg border border-yellow-400 text-[10px] animate-pulse">
                Combo x{combo}
              </div>
            )}
          </div>

          <button
            onClick={onClose}
            className="px-3 py-1.5 bg-rose-600 hover:bg-rose-500 active:bg-rose-700 text-white rounded-xl shadow-lg border border-rose-400/50 font-bold text-xs flex items-center gap-1.5 transition active:scale-95"
            title="Salir al Barrio"
          >
            <X className="w-4 h-4" />
            <span>Salir</span>
          </button>
        </div>

        {/* 2D HIGH-GRAPHICS ICE CANVAS */}
        <div className="relative w-full h-[380px] sm:h-[460px] bg-sky-200 overflow-hidden">
          <canvas
            ref={canvasRef}
            width={850}
            height={500}
            className="w-full h-full block cursor-crosshair"
            onPointerDown={(e) => {
              const rect = e.currentTarget.getBoundingClientRect();
              const scaleX = 850 / rect.width;
              const scaleY = 500 / rect.height;
              const clickX = (e.clientX - rect.left) * scaleX;
              const clickY = (e.clientY - rect.top) * scaleY;
              const ari = ariPosRef.current;
              const dx = clickX - ari.x;
              const dy = clickY - ari.y;
              const dist = Math.hypot(dx, dy);
              if (dist > 5) {
                ari.vx = (dx / dist) * 4.6;
                ari.vy = (dy / dist) * 4.6;
                ari.angle = Math.atan2(dy, dx);
              }
            }}
          />

          {/* Feedback banner */}
          <div className="absolute top-3 left-1/2 -translate-x-1/2 bg-stone-900/90 backdrop-blur-md px-4 py-1.5 rounded-full border border-sky-400/60 text-sky-200 text-xs font-bold shadow-lg pointer-events-none flex items-center gap-2">
            <Sparkles className="w-3.5 h-3.5 text-yellow-400" />
            <span>{lastMoveText}</span>
          </div>

          {/* Action touch controls */}
          <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between pointer-events-none">
            <div className="bg-stone-900/90 backdrop-blur-md px-3.5 py-1.5 rounded-xl border border-sky-700 text-sky-200 text-xs font-semibold flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-sky-400 animate-ping" />
              <span>Toca en el hielo o usa flechas para deslizarte</span>
            </div>

            <div className="pointer-events-auto flex items-center gap-2">
              <button
                onClick={handleJump}
                className="px-4 py-2 bg-gradient-to-r from-sky-500 to-sky-600 hover:from-sky-400 hover:to-sky-500 active:scale-95 text-white font-bold text-xs rounded-xl shadow-lg border border-sky-300 flex items-center gap-1.5 transition"
              >
                <Wind className="w-3.5 h-3.5" />
                <span>Salto Axel</span>
              </button>

              <button
                onClick={handleSpin}
                className="px-4 py-2 bg-gradient-to-r from-rose-500 to-rose-600 hover:from-rose-400 hover:to-rose-500 active:scale-95 text-white font-extrabold text-xs rounded-xl shadow-lg border border-rose-300 flex items-center gap-1.5 transition"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Pirueta 360°</span>
              </button>

              <button
                onClick={handleToggleFormation}
                className={`px-4 py-2 font-bold text-xs rounded-xl shadow-lg border transition flex items-center gap-1.5 active:scale-95 ${
                  isFormationActive
                    ? 'bg-amber-500 text-stone-950 border-amber-300'
                    : 'bg-stone-800 text-stone-200 border-stone-600 hover:bg-stone-700'
                }`}
              >
                <Users className="w-3.5 h-3.5" />
                <span>{isFormationActive ? '¡En Cadena!' : 'Formación'}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-stone-950 px-4 py-2 text-stone-400 text-xs flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <span>Usa</span>
            <kbd className="px-1.5 py-0.5 bg-stone-800 text-sky-300 font-bold rounded border border-stone-700 text-[10px]">ESPACIO</kbd>
            <span>para salto •</span>
            <kbd className="px-1.5 py-0.5 bg-stone-800 text-sky-300 font-bold rounded border border-stone-700 text-[10px]">SHIFT</kbd>
            <span>para pirueta</span>
          </div>
          <div className="text-[11px] text-sky-300/80 italic hidden sm:block">
            "El hielo es una partitura donde cada curva es una nota musical" — Schroeder
          </div>
        </div>
      </div>
    </div>
  );
};

// --- DRAWING HELPERS FOR ICE SKATING ---

function drawWinterPine(ctx: CanvasRenderingContext2D, x: number, y: number, r: number) {
  // Trunk
  ctx.fillStyle = '#451A03';
  ctx.fillRect(x - 3, y, 6, 25);

  // Pine tiered cones
  ctx.fillStyle = '#166534';
  ctx.beginPath();
  ctx.moveTo(x, y - 24);
  ctx.lineTo(x + r * 0.7, y);
  ctx.lineTo(x - r * 0.7, y);
  ctx.closePath();
  ctx.fill();

  // Snow cap on pine branch
  ctx.fillStyle = '#FFFFFF';
  ctx.beginPath();
  ctx.moveTo(x, y - 24);
  ctx.lineTo(x + r * 0.4, y - 10);
  ctx.lineTo(x - r * 0.4, y - 10);
  ctx.closePath();
  ctx.fill();
}

function drawIceNPC(ctx: CanvasRenderingContext2D, npc: IceNPC, time: number) {
  ctx.save();
  ctx.translate(npc.x, npc.y);

  const skinTone = '#FED7AA';

  // Apply spin rotation if spinning
  if (npc.spinProgress > 0) {
    ctx.rotate(npc.spinProgress * 3);
  }

  // Soft shadow on ice
  ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
  ctx.beginPath();
  ctx.ellipse(0, 16, npc.radius, 4, 0, 0, Math.PI * 2);
  ctx.fill();

  if (npc.id === 'snoopy') {
    // SNOOPY FIGURE SKATING ON TWO HIND PAWS
    ctx.fillStyle = '#FFFFFF';
    ctx.strokeStyle = '#18181B';
    ctx.lineWidth = 1.4;

    // Body tilted elegantly
    ctx.beginPath();
    ctx.roundRect(-7, -4, 14, 18, 4);
    ctx.fill();
    ctx.stroke();

    // Snoopy head & snout
    ctx.beginPath();
    ctx.ellipse(0, -14, 9, 7, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    ctx.beginPath();
    ctx.ellipse(7, -13, 5, 4, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Black button nose
    ctx.fillStyle = '#18181B';
    ctx.beginPath();
    ctx.arc(11, -14, 2.2, 0, Math.PI * 2);
    ctx.fill();

    // Black floppy ear trailing in wind
    ctx.beginPath();
    ctx.ellipse(-6, -12, 4, 9, 0.5 + Math.sin(time * 6) * 0.2, 0, Math.PI * 2);
    ctx.fill();

    // Red festive scarf trailing in the wind
    ctx.fillStyle = '#EF4444';
    ctx.fillRect(4, -6, 6, 4);
    ctx.beginPath();
    ctx.moveTo(4, -4);
    ctx.quadraticCurveTo(-6, -2, -12, -4 + Math.sin(time * 8) * 3);
    ctx.lineTo(-12, 1 + Math.sin(time * 8) * 3);
    ctx.lineTo(4, -1);
    ctx.closePath();
    ctx.fill();

    // Silver figure skates on Snoopy's paws!
    ctx.strokeStyle = '#94A3B8';
    ctx.lineWidth = 1.8;
    ctx.beginPath();
    ctx.moveTo(-4, 14);
    ctx.lineTo(8, 14);
    ctx.stroke();
  } else if (npc.id === 'woodstock') {
    // WOODSTOCK WITH TINY SKATES
    const flap = Math.sin(time * 12) * 2;
    ctx.fillStyle = '#FACC15';
    ctx.beginPath();
    ctx.arc(0, flap - 4, 5, 0, Math.PI * 2);
    ctx.fill();

    // Orange beak
    ctx.fillStyle = '#EA580C';
    ctx.fillRect(4, flap - 5, 4, 2);

    // Tiny earmuffs
    ctx.fillStyle = '#EF4444';
    ctx.beginPath();
    ctx.arc(0, flap - 8, 2.5, 0, Math.PI * 2);
    ctx.fill();

    // Tiny silver skate blade
    ctx.strokeStyle = '#CBD5E1';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(-3, flap + 4);
    ctx.lineTo(4, flap + 4);
    ctx.stroke();
  } else if (npc.id === 'linus') {
    // LINUS SKATING HOLDING HIS BLUE BLANKET
    ctx.fillStyle = '#18181B';
    ctx.fillRect(-5, 12, 10, 5);
    ctx.strokeStyle = '#E2E8F0';
    ctx.lineWidth = 1.8;
    ctx.beginPath();
    ctx.moveTo(-8, 18);
    ctx.lineTo(8, 18);
    ctx.stroke();

    // Red striped polo
    ctx.fillStyle = '#EF4444';
    ctx.beginPath();
    ctx.roundRect(-8, -2, 16, 15, [2, 2, 1, 1]);
    ctx.fill();

    // Head
    ctx.fillStyle = skinTone;
    ctx.beginPath();
    ctx.ellipse(0, -10, 7.5, 8.5, 0, 0, Math.PI * 2);
    ctx.fill();

    // Linus cozy blue blanket held like a sail!
    ctx.fillStyle = '#38BDF8';
    ctx.beginPath();
    ctx.moveTo(4, -4);
    ctx.quadraticCurveTo(18, 0, 22 + Math.sin(time * 6) * 4, 14);
    ctx.quadraticCurveTo(12, 16, 2, 4);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = '#0284C7';
    ctx.lineWidth = 1;
    ctx.stroke();
  } else {
    // PEPPERMINT PATTY SPEED SKATING
    ctx.fillStyle = '#10B981';
    ctx.beginPath();
    ctx.roundRect(-9, -2, 18, 16, [3, 3, 1, 1]);
    ctx.fill();

    // Head
    ctx.fillStyle = skinTone;
    ctx.beginPath();
    ctx.ellipse(0, -10, 7.5, 8.5, 0, 0, Math.PI * 2);
    ctx.fill();

    // Auburn hair
    ctx.fillStyle = '#9A3412';
    ctx.beginPath();
    ctx.arc(0, -12, 8.5, Math.PI, Math.PI * 2);
    ctx.fill();

    // Hockey stick
    ctx.strokeStyle = '#78350F';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(-6, 2);
    ctx.lineTo(14, 16);
    ctx.lineTo(20, 16);
    ctx.stroke();

    // Ice skate blades
    ctx.strokeStyle = '#E2E8F0';
    ctx.lineWidth = 1.8;
    ctx.beginPath();
    ctx.moveTo(-8, 18);
    ctx.lineTo(8, 18);
    ctx.stroke();
  }

  ctx.restore();
}

function drawFigureSkatingAri(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  angle: number,
  isSpinning: boolean,
  spinAngle: number,
  speed: number,
  time: number
) {
  ctx.save();
  ctx.translate(x, y);

  const rot = isSpinning ? spinAngle : angle;
  ctx.rotate(rot);

  const skinTone = '#FED7AA';
  const skinShadow = '#FDBA74';
  const hairColor = '#18181B';

  // Soft contact shadow on ice
  ctx.fillStyle = 'rgba(0, 0, 0, 0.22)';
  ctx.beginPath();
  ctx.ellipse(0, 24, 14, 5, 0, 0, Math.PI * 2);
  ctx.fill();

  // White figure skates with polished steel blades
  ctx.strokeStyle = '#E2E8F0';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(-7, 24);
  ctx.lineTo(7, 24);
  ctx.stroke();

  // Legs in dynamic figure skating pose
  ctx.fillStyle = '#18181B';
  ctx.fillRect(-6, 10, 5, 14);
  ctx.fillRect(1, 10, 5, 14);

  // Black jacket / skater dress with warm peach collar
  ctx.fillStyle = '#18181B';
  ctx.beginPath();
  ctx.roundRect(-9, -8, 18, 20, [3, 3, 2, 2]);
  ctx.fill();
  ctx.strokeStyle = '#27272A';
  ctx.lineWidth = 1.2;
  ctx.stroke();

  // Cozy scarf trailing behind during motion
  ctx.fillStyle = '#F59E0B';
  ctx.beginPath();
  ctx.moveTo(3, -6);
  ctx.quadraticCurveTo(-8, -4, -14 - Math.min(speed * 3, 14), -6 + Math.sin(time * 8) * 3);
  ctx.lineTo(-14 - Math.min(speed * 3, 14), -2 + Math.sin(time * 8) * 3);
  ctx.lineTo(3, -3);
  ctx.closePath();
  ctx.fill();

  // Head
  ctx.fillStyle = skinTone;
  ctx.beginPath();
  ctx.arc(0, -18, 11, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#18181B';
  ctx.lineWidth = 1.5;
  ctx.stroke();

  // Long flowing dark hair swaying with the spin & movement
  ctx.fillStyle = hairColor;
  ctx.beginPath();
  ctx.arc(0, -22, 12, Math.PI, Math.PI * 2);
  ctx.fill();
  const hairFlap = Math.sin(time * 10) * 3;
  ctx.fillRect(-12, -22, 5, 16 + hairFlap);
  ctx.fillRect(7, -22, 5, 16 - hairFlap);

  // Eyes and smile
  ctx.fillStyle = '#18181B';
  ctx.beginPath();
  ctx.arc(3, -18, 1.5, 0, Math.PI * 2);
  ctx.fill();

  ctx.strokeStyle = '#18181B';
  ctx.lineWidth = 1.2;
  ctx.beginPath();
  ctx.arc(1, -13, 3, 0.2, Math.PI - 0.2);
  ctx.stroke();

  ctx.restore();
}

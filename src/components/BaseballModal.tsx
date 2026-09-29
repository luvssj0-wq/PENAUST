import React, { useState, useEffect, useRef, useCallback } from 'react';
import { sound } from '../utils/audio';
import { X, Award, Flame, RefreshCw, Zap, Sparkles } from 'lucide-react';

interface BaseballModalProps {
  isOpen: boolean;
  onClose: () => void;
  timeOfDay?: string;
}

type PitchType = 'recta' | 'curva' | 'cambio' | 'fuego' | 'truco';
type PitcherId = 'charlie' | 'patty' | 'snoopy';

interface HitResult {
  type: 'homerun' | 'triplete' | 'doble' | 'sencillo' | 'strike' | 'foul';
  distance: number;
  speed: number;
  message: string;
}

interface ComicBurst {
  text: string;
  subtext: string;
  color: string;
  life: number;
}

export const BaseballModal: React.FC<BaseballModalProps> = ({
  isOpen,
  onClose
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Pitcher choice
  const [pitcher, setPitcher] = useState<PitcherId>('charlie');

  // Game state
  const [gameState, setGameState] = useState<'ready' | 'pitching' | 'hit' | 'missed'>('ready');
  const [pitchCount, setPitchCount] = useState<number>(0);
  const [combo, setCombo] = useState<number>(0);
  const [score, setScore] = useState<{ runs: number; hits: number; homeruns: number }>({
    runs: 0,
    hits: 0,
    homeruns: 0
  });
  const [lastResult, setLastResult] = useState<HitResult | null>(null);
  const [bestDistance, setBestDistance] = useState<number>(0);

  // Physics animation variables
  const pitchProgressRef = useRef<number>(0);
  const pitchSpeedRef = useRef<number>(0.018);
  const pitchTypeRef = useRef<PitchType>('recta');
  const ballPosRef = useRef<{ x: number; y: number; z: number; vx: number; vy: number; vz: number }>({
    x: 0,
    y: 0,
    z: 0,
    vx: 0,
    vy: 0,
    vz: 0
  });
  const batAngleRef = useRef<number>(-0.4);
  const swingStateRef = useRef<'idle' | 'swinging' | 'recoil'>('idle');
  const swingTimeRef = useRef<number>(0);
  const particlesRef = useRef<Array<{ x: number; y: number; vx: number; vy: number; life: number; color: string }>>([]);
  const comicBurstRef = useRef<ComicBurst | null>(null);
  const charlieCapFlewRef = useRef<boolean>(false);

  // Start a new pitch
  const throwPitch = useCallback(() => {
    if (gameState === 'pitching') return;

    let pType: PitchType = 'recta';
    let speed = 0.020;

    if (pitcher === 'charlie') {
      const types: PitchType[] = ['recta', 'curva', 'cambio'];
      pType = types[Math.floor(Math.random() * types.length)];
      speed = pType === 'recta' ? 0.022 : pType === 'cambio' ? 0.014 : 0.018;
    } else if (pitcher === 'patty') {
      // Peppermint Patty throws faster and aggressive balls
      const types: PitchType[] = ['recta', 'fuego', 'curva'];
      pType = types[Math.floor(Math.random() * types.length)];
      speed = pType === 'fuego' ? 0.028 : 0.024;
    } else {
      // Snoopy throws tricky curveballs and knuckleballs
      const types: PitchType[] = ['truco', 'curva', 'cambio'];
      pType = types[Math.floor(Math.random() * types.length)];
      speed = pType === 'truco' ? 0.019 : 0.016;
    }

    pitchTypeRef.current = pType;
    pitchSpeedRef.current = speed;
    pitchProgressRef.current = 0;
    charlieCapFlewRef.current = false;
    swingStateRef.current = 'idle';
    batAngleRef.current = -0.4;
    comicBurstRef.current = null;
    setGameState('pitching');
    setLastResult(null);

    sound.playInspireChime();
  }, [gameState, pitcher]);

  // Swing the bat
  const handleSwing = useCallback(() => {
    if (swingStateRef.current === 'swinging') return;
    swingStateRef.current = 'swinging';
    swingTimeRef.current = 0;

    if (gameState !== 'pitching') return;

    // Ball reaches home plate at progress ~0.90
    const progress = pitchProgressRef.current;
    const diff = Math.abs(progress - 0.90);

    if (diff < 0.125) {
      // HIT!
      sound.playBatHit();

      let hitType: HitResult['type'] = 'sencillo';
      let distance = 160 + Math.floor(Math.random() * 60);
      let exitSpeed = 75 + Math.floor(Math.random() * 15);
      let msg = '¡Hit limpio al jardín central!';
      let burstText = '¡¡POW!!';
      let burstColor = '#FB923C';

      if (diff < 0.035) {
        hitType = 'homerun';
        distance = 360 + Math.floor(Math.random() * 85);
        exitSpeed = 104 + Math.floor(Math.random() * 12);
        msg = '¡¡CUADRANGULAR FUERA DEL PARQUE!!';
        burstText = '¡¡HOMERUN!!';
        burstColor = '#FACC15';
        charlieCapFlewRef.current = true;
        sound.playPeanutsJingle();
      } else if (diff < 0.065) {
        hitType = 'triplete';
        distance = 290 + Math.floor(Math.random() * 50);
        exitSpeed = 94 + Math.floor(Math.random() * 10);
        msg = '¡Lanzamiento potente contra la valla! ¡Triplete!';
        burstText = '¡¡CRACK!!';
        burstColor = '#38BDF8';
      } else if (diff < 0.09) {
        hitType = 'doble';
        distance = 230 + Math.floor(Math.random() * 40);
        exitSpeed = 85 + Math.floor(Math.random() * 8);
        msg = '¡Doblete entre el jardín izquierdo y central!';
        burstText = '¡¡WHAM!!';
        burstColor = '#4ADE80';
      }

      comicBurstRef.current = {
        text: burstText,
        subtext: `${distance} FT • ${exitSpeed} MPH`,
        color: burstColor,
        life: 1.0
      };

      setCombo((c) => c + 1);
      setLastResult({ type: hitType, distance, speed: exitSpeed, message: msg });
      setBestDistance((prev) => Math.max(prev, distance));
      setScore((prev) => ({
        runs: prev.runs + (hitType === 'homerun' ? 1 : 0),
        hits: prev.hits + 1,
        homeruns: prev.homeruns + (hitType === 'homerun' ? 1 : 0)
      }));
      setPitchCount((c) => c + 1);
      setGameState('hit');

      // Add hit spark confetti & dust
      for (let i = 0; i < 35; i++) {
        const angle = Math.random() * Math.PI * 2;
        const spd = 2 + Math.random() * 7;
        particlesRef.current.push({
          x: 440,
          y: 410,
          vx: Math.cos(angle) * spd,
          vy: Math.sin(angle) * spd - 3.5,
          life: 1,
          color: i % 3 === 0 ? '#FDE047' : i % 3 === 1 ? '#EF4444' : '#38BDF8'
        });
      }

      // Outfield trajectory
      ballPosRef.current = {
        x: 440,
        y: 410,
        z: 10,
        vx: (Math.random() - 0.4) * 5.5,
        vy: -7 - (distance / 380) * 5.5,
        vz: 12 + (distance / 380) * 8.5
      };
    } else {
      // Miss / Strike
      sound.playFootstep('wood');
      setCombo(0);
      comicBurstRef.current = {
        text: '¡¡STRIKE!!',
        subtext: progress < 0.82 ? '¡Swing adelantado!' : '¡Llegaste tarde!',
        color: '#EF4444',
        life: 0.9
      };
      setLastResult({
        type: 'strike',
        distance: 0,
        speed: 0,
        message: progress < 0.82 ? '¡Demasiado pronto! Swing en falso.' : '¡Llegaste tarde! ¡Strike cantado!'
      });
      setPitchCount((c) => c + 1);
      setGameState('missed');
    }
  }, [gameState]);

  // Keyboard shortcut listener
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space' || e.code === 'Enter') {
        e.preventDefault();
        if (gameState === 'ready' || gameState === 'hit' || gameState === 'missed') {
          throwPitch();
        } else if (gameState === 'pitching') {
          handleSwing();
        }
      } else if (e.key === 'a' || e.key === 'A') {
        e.preventDefault();
        if (gameState === 'pitching') {
          handleSwing();
        } else {
          onClose();
        }
      } else if (e.code === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, gameState, handleSwing, throwPitch, onClose]);

  // Main canvas render loop
  useEffect(() => {
    if (!isOpen) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let localTime = 0;
    let animId: number;

    const render = () => {
      localTime += 0.03;
      const w = canvas.width;
      const h = canvas.height;

      ctx.clearRect(0, 0, w, h);

      // 1. SKY GRADIENT (Rich sunny baseball afternoon)
      const skyGrad = ctx.createLinearGradient(0, 0, 0, h * 0.55);
      skyGrad.addColorStop(0, '#38BDF8');
      skyGrad.addColorStop(0.7, '#7DD3FC');
      skyGrad.addColorStop(1, '#BAE6FD');
      ctx.fillStyle = skyGrad;
      ctx.fillRect(0, 0, w, h * 0.55);

      // Fluffy Schulz clouds
      ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
      drawCloud(ctx, 120 + Math.sin(localTime * 0.2) * 10, 45, 26);
      drawCloud(ctx, 420 + Math.cos(localTime * 0.15) * 15, 60, 32);
      drawCloud(ctx, 720 + Math.sin(localTime * 0.18) * 12, 38, 28);

      // Distant wooden outfield fence with advertising signs
      const fenceY = h * 0.44;
      ctx.fillStyle = '#78350F';
      ctx.fillRect(0, fenceY, w, 24);
      // Fence slats
      ctx.strokeStyle = '#451A03';
      ctx.lineWidth = 1.2;
      for (let fx = 0; fx < w; fx += 16) {
        ctx.beginPath();
        ctx.moveTo(fx, fenceY);
        ctx.lineTo(fx, fenceY + 24);
        ctx.stroke();
      }
      // Top rail
      ctx.fillStyle = '#92400E';
      ctx.fillRect(0, fenceY - 3, w, 5);

      // Snoopy leaning on the outfield fence watching
      drawOutfieldSnoopy(ctx, 220, fenceY + 4, localTime, gameState === 'hit');

      // 2. GREEN OUTFIELD GRASS
      const grassGrad = ctx.createLinearGradient(0, fenceY + 20, 0, h);
      grassGrad.addColorStop(0, '#15803D');
      grassGrad.addColorStop(0.3, '#16A34A');
      grassGrad.addColorStop(1, '#22C55E');
      ctx.fillStyle = grassGrad;
      ctx.fillRect(0, fenceY + 20, w, h - (fenceY + 20));

      // 3. BASEBALL DIRT INFIELD (Warm clay brown)
      ctx.fillStyle = '#D97706';
      ctx.beginPath();
      ctx.moveTo(425, 210); // Pitcher mound
      ctx.lineTo(680, 340); // 1st base
      ctx.lineTo(440, 445); // Home plate
      ctx.lineTo(170, 340); // 3rd base
      ctx.closePath();
      ctx.fill();

      // Chalk foul lines
      ctx.strokeStyle = '#FFFFFF';
      ctx.lineWidth = 2.2;
      ctx.beginPath();
      ctx.moveTo(440, 445);
      ctx.lineTo(760, 260); // 1st base foul line
      ctx.moveTo(440, 445);
      ctx.lineTo(100, 260); // 3rd base foul line
      ctx.stroke();

      // Pitcher's mound circle
      ctx.fillStyle = '#B45309';
      ctx.beginPath();
      ctx.ellipse(425, 215, 34, 18, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#78350F';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // Pitcher's rubber slab
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(417, 212, 16, 4);

      // Home plate slab
      ctx.fillStyle = '#FFFFFF';
      ctx.beginPath();
      ctx.moveTo(434, 436);
      ctx.lineTo(446, 436);
      ctx.lineTo(448, 444);
      ctx.lineTo(440, 450);
      ctx.lineTo(432, 444);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = '#18181B';
      ctx.lineWidth = 1;
      ctx.stroke();

      // Batter's box chalk lines
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.7)';
      ctx.lineWidth = 1.5;
      ctx.strokeRect(395, 415, 26, 40); // Right batter box (Ari)
      ctx.strokeRect(455, 415, 26, 40); // Left batter box

      // 4. DRAW CURRENT PITCHER ON MOUND
      if (pitcher === 'charlie') {
        drawPitcherCharlieBrown(ctx, 425, 205, localTime, gameState === 'pitching', pitchProgressRef.current, charlieCapFlewRef.current);
      } else if (pitcher === 'patty') {
        drawPitcherPatty(ctx, 425, 205, localTime, gameState === 'pitching', pitchProgressRef.current);
      } else {
        drawPitcherSnoopyMound(ctx, 425, 205, localTime, gameState === 'pitching', pitchProgressRef.current);
      }

      // 5. UPDATE AND DRAW PITCHED BALL OR HIT BALL
      if (gameState === 'pitching') {
        pitchProgressRef.current += pitchSpeedRef.current;
        const progress = pitchProgressRef.current;

        // Ball travel from mound (425, 205) to home plate (440, 425)
        const startX = 425;
        const startY = 205;
        const targetX = 438;
        const targetY = 420;

        // Curve trajectory depending on pitch type
        let wobbleX = 0;
        let wobbleY = 0;
        if (pitchTypeRef.current === 'curva') {
          wobbleX = Math.sin(progress * Math.PI) * 22;
        } else if (pitchTypeRef.current === 'truco') {
          wobbleX = Math.sin(progress * Math.PI * 3) * 14;
        } else if (pitchTypeRef.current === 'fuego') {
          // Flame speed trail
          wobbleY = (Math.random() - 0.5) * 2;
        }

        const ballX = startX + (targetX - startX) * progress + wobbleX;
        const ballY = startY + (targetY - startY) * progress + wobbleY;
        const ballRadius = 2.5 + progress * 7.5; // Ball scales up as it approaches camera!

        // Flame or wind trail behind pitch
        if (pitchTypeRef.current === 'fuego') {
          ctx.fillStyle = 'rgba(239, 68, 68, 0.4)';
          ctx.beginPath();
          ctx.arc(ballX - 4, ballY - 4, ballRadius * 1.3, 0, Math.PI * 2);
          ctx.fill();
        }

        // Ball drop shadow
        ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
        ctx.beginPath();
        ctx.ellipse(ballX, ballY + ballRadius * 1.4, ballRadius, ballRadius * 0.4, 0, 0, Math.PI * 2);
        ctx.fill();

        // White baseball with red seams
        ctx.fillStyle = '#FFFFFF';
        ctx.beginPath();
        ctx.arc(ballX, ballY, ballRadius, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#EF4444';
        ctx.lineWidth = 1;
        ctx.stroke();

        // Red seams
        ctx.beginPath();
        ctx.arc(ballX - ballRadius * 0.25, ballY, ballRadius * 0.7, -0.6, 0.6);
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(ballX + ballRadius * 0.25, ballY, ballRadius * 0.7, Math.PI - 0.6, Math.PI + 0.6);
        ctx.stroke();

        // Pitch arrived without swinging -> miss
        if (progress >= 1.05) {
          setGameState('missed');
          sound.playFootstep('wood');
          setCombo(0);
          comicBurstRef.current = {
            text: '¡¡STRIKE CANTADO!!',
            subtext: '¡No hiciste swing!',
            color: '#EF4444',
            life: 0.9
          };
          setLastResult({
            type: 'strike',
            distance: 0,
            speed: 0,
            message: '¡Strike cantado! La bola cruzó el plato.'
          });
          setPitchCount((c) => c + 1);
        }
      } else if (gameState === 'hit') {
        // Draw ball flying high into the outfield
        const ball = ballPosRef.current;
        ball.x += ball.vx;
        ball.y += ball.vy;
        ball.z += ball.vz;
        ball.vz -= 0.38; // gravity

        if (ball.z > 0) {
          const perspectiveScale = Math.max(0.4, 1 - (410 - ball.y) / 600);
          const r = Math.max(2, 6 * perspectiveScale);

          // Ball shadow
          ctx.fillStyle = 'rgba(0, 0, 0, 0.25)';
          ctx.beginPath();
          ctx.ellipse(ball.x, ball.y, r * 1.5, r * 0.6, 0, 0, Math.PI * 2);
          ctx.fill();

          // Ball in air
          const screenY = ball.y - ball.z * 1.2;
          ctx.fillStyle = '#FFFFFF';
          ctx.beginPath();
          ctx.arc(ball.x, screenY, r, 0, Math.PI * 2);
          ctx.fill();
          ctx.strokeStyle = '#EF4444';
          ctx.lineWidth = 1;
          ctx.stroke();
        }
      }

      // 6. DRAW BATTER (ARI) AT HOME PLATE
      drawBatterAri(
        ctx,
        408,
        425,
        swingStateRef.current,
        batAngleRef.current,
        localTime
      );

      // Swing animation update
      if (swingStateRef.current === 'swinging') {
        swingTimeRef.current += 0.12;
        batAngleRef.current = -0.4 + Math.sin(swingTimeRef.current * Math.PI) * 2.2;
        if (swingTimeRef.current >= 1.0) {
          swingStateRef.current = 'idle';
          batAngleRef.current = -0.4;
        }
      }

      // 7. PARTICLES UPDATE & DRAW
      for (let i = particlesRef.current.length - 1; i >= 0; i--) {
        const p = particlesRef.current[i];
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.15; // gravity
        p.life -= 0.025;
        if (p.life <= 0) {
          particlesRef.current.splice(i, 1);
        } else {
          ctx.fillStyle = p.color;
          ctx.globalAlpha = p.life;
          ctx.beginPath();
          ctx.arc(p.x, p.y, 2.5 * p.life, 0, Math.PI * 2);
          ctx.fill();
          ctx.globalAlpha = 1;
        }
      }

      // 8. COMIC ACTION BURST BANNER (Schulz pop art style)
      if (comicBurstRef.current && comicBurstRef.current.life > 0) {
        const b = comicBurstRef.current;
        b.life -= 0.02;

        ctx.save();
        ctx.translate(440, 290);
        const scale = 1 + (1 - b.life) * 0.2;
        ctx.scale(scale, scale);
        ctx.globalAlpha = Math.min(1, b.life * 2);

        // Comic burst star polygon
        ctx.fillStyle = b.color;
        ctx.strokeStyle = '#18181B';
        ctx.lineWidth = 3.5;
        ctx.beginPath();
        const spikes = 12;
        const outerR = 90;
        const innerR = 60;
        for (let s = 0; s < spikes * 2; s++) {
          const r = s % 2 === 0 ? outerR : innerR;
          const a = (s * Math.PI) / spikes;
          const px = Math.cos(a) * r;
          const py = Math.sin(a) * r * 0.6;
          if (s === 0) ctx.moveTo(px, py);
          else ctx.lineTo(px, py);
        }
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        // Main action text
        ctx.fillStyle = '#18181B';
        ctx.font = '900 24px "Caveat", "Arial Black", sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(b.text, 0, -8);

        // Subtitle
        ctx.fillStyle = '#FFFFFF';
        ctx.strokeStyle = '#18181B';
        ctx.lineWidth = 2.5;
        ctx.font = '800 12px sans-serif';
        ctx.strokeText(b.subtext, 0, 16);
        ctx.fillText(b.subtext, 0, 16);

        ctx.restore();
      }

      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);
    return () => cancelAnimationFrame(animId);
  }, [isOpen, gameState, pitcher]);

  if (!isOpen) return null;

  return (
    <div
      id="baseball-modal-overlay"
      className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/80 backdrop-blur-md animate-fade-in"
    >
      <div
        id="baseball-modal-card"
        className="w-full max-w-4xl bg-stone-900 border-3 border-amber-600/80 rounded-3xl shadow-2xl overflow-hidden flex flex-col text-stone-100"
      >
        {/* Top Header */}
        <div className="bg-amber-950 px-3 py-2.5 sm:px-5 sm:py-3 flex items-center justify-between border-b-2 border-amber-800/40 text-amber-100 gap-2 shrink-0">
          <div className="flex items-center gap-2.5">
            <span className="text-2xl">⚾</span>
            <div>
              <h2 className="text-sm sm:text-base font-black tracking-wide font-['Lora',serif]">
                Diamante de Béisbol del Barrio
              </h2>
              <p className="text-[11px] text-amber-300/80 hidden sm:block">
                Ari al bate • Entrena tu swing y conecta cuadrangulares legendarios
              </p>
            </div>
          </div>

          {/* Quick Scoreboard */}
          <div className="flex items-center gap-2 sm:gap-3 bg-stone-900/90 px-3 py-1 rounded-xl border border-amber-700/50 text-xs shrink-0">
            <div className="text-center">
              <span className="text-[8px] uppercase text-stone-400 font-bold block">Hits</span>
              <span className="font-black text-emerald-400 text-xs sm:text-sm">{score.hits}</span>
            </div>
            <div className="text-center">
              <span className="text-[8px] uppercase text-stone-400 font-bold block">HR</span>
              <span className="font-black text-rose-400 text-xs sm:text-sm">{score.homeruns}</span>
            </div>
            {combo > 1 && (
              <div className="text-center px-1.5 py-0.5 bg-amber-500/20 text-yellow-300 font-black rounded-lg border border-yellow-400 text-[10px] animate-pulse">
                🔥 Racha x{combo}
              </div>
            )}
            {bestDistance > 0 && (
              <div className="text-center pl-2 border-l border-stone-700 hidden xs:block">
                <span className="text-[8px] uppercase text-amber-300 font-bold block">Récord</span>
                <span className="font-black text-amber-300 text-xs sm:text-sm">{bestDistance}ft</span>
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

        {/* Pitcher Selection Strip */}
        <div className="px-4 py-2 bg-stone-950 border-b border-stone-800 flex items-center justify-between text-xs shrink-0">
          <div className="flex items-center gap-2">
            <span className="text-stone-400 font-semibold text-[11px]">Lanzador en el montículo:</span>
            <div className="flex bg-stone-900 rounded-xl p-0.5 border border-stone-700">
              <button
                onClick={() => setPitcher('charlie')}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition flex items-center gap-1 ${
                  pitcher === 'charlie'
                    ? 'bg-amber-500 text-stone-950 shadow'
                    : 'text-stone-300 hover:text-white'
                }`}
              >
                🧢 Charlie Brown
              </button>
              <button
                onClick={() => setPitcher('patty')}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition flex items-center gap-1 ${
                  pitcher === 'patty'
                    ? 'bg-emerald-600 text-white shadow'
                    : 'text-stone-300 hover:text-white'
                }`}
              >
                ⚾ Peppermint Patty
              </button>
              <button
                onClick={() => setPitcher('snoopy')}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition flex items-center gap-1 ${
                  pitcher === 'snoopy'
                    ? 'bg-sky-600 text-white shadow'
                    : 'text-stone-300 hover:text-white'
                }`}
              >
                🕶️ Snoopy Joe Cool
              </button>
            </div>
          </div>

          <div className="text-[11px] text-amber-300/80 hidden md:block">
            {pitcher === 'charlie' && 'Bola flotante y nudillos impredecibles'}
            {pitcher === 'patty' && 'Lanzamientos de fuego ultrarrápidos'}
            {pitcher === 'snoopy' && 'Curva acrobática con gafas oscuras'}
          </div>
        </div>

        {/* 2D HIGH-GRAPHICS BASEBALL CANVAS */}
        <div className="relative w-full h-[380px] sm:h-[460px] bg-sky-300 overflow-hidden">
          <canvas
            ref={canvasRef}
            width={850}
            height={500}
            className="w-full h-full block cursor-pointer"
            onClick={() => {
              if (gameState === 'pitching') handleSwing();
              else throwPitch();
            }}
          />

          {/* Result Banner Overlay */}
          {lastResult && (
            <div className="absolute top-3 left-1/2 -translate-x-1/2 max-w-[90%] bg-stone-900/95 backdrop-blur-md border-2 border-amber-500 text-white px-5 py-2 rounded-2xl shadow-2xl text-center pointer-events-none animate-in zoom-in-95 duration-150">
              <div className="text-sm sm:text-base font-black tracking-wide text-amber-300 flex items-center justify-center gap-1.5">
                {lastResult.type === 'homerun' && <Flame className="w-4 h-4 text-rose-500 animate-bounce" />}
                {lastResult.message}
              </div>
              {lastResult.distance > 0 && (
                <div className="text-[11px] sm:text-xs text-stone-300 font-semibold mt-0.5">
                  Distancia: <span className="text-amber-400 font-bold">{lastResult.distance} ft</span> | Velocidad: <span className="text-emerald-400 font-bold">{lastResult.speed} mph</span>
                </div>
              )}
            </div>
          )}

          {/* Action touch controls */}
          <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between pointer-events-none">
            <div className="bg-stone-900/90 backdrop-blur-md px-3.5 py-1.5 rounded-xl border border-stone-700 text-stone-300 text-xs font-semibold flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
              <span>
                {gameState === 'pitching'
                  ? '¡Toca BATEAR en el momento preciso!'
                  : 'Toca Pedir Lanzamiento o toca la pantalla'}
              </span>
            </div>

            <div className="pointer-events-auto flex items-center gap-2">
              {gameState === 'pitching' ? (
                <button
                  onClick={handleSwing}
                  className="px-7 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 active:scale-95 text-stone-950 font-black text-sm rounded-2xl shadow-xl border-2 border-amber-300 flex items-center gap-2 transition"
                >
                  <span>⚾ ¡¡BATEAR!!</span>
                </button>
              ) : (
                <button
                  onClick={throwPitch}
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white font-extrabold text-xs sm:text-sm rounded-2xl shadow-xl border-2 border-emerald-400 flex items-center gap-1.5 transition"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Pedir Lanzamiento</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-stone-950 px-4 py-2 text-stone-400 text-xs flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <span>Toca la pantalla o usa</span>
            <kbd className="px-1.5 py-0.5 bg-stone-800 text-amber-300 font-bold rounded border border-stone-700 text-[10px]">ESPACIO</kbd>
            <span>para batear</span>
          </div>
          <div className="text-[11px] text-amber-300/80 italic hidden sm:block">
            "El béisbol se juega con el corazón... ¡y un buen batazo al jardín central!" — Charlie Brown
          </div>
        </div>
      </div>
    </div>
  );
};

// --- DRAWING HELPERS FOR BASEBALL ---

function drawCloud(ctx: CanvasRenderingContext2D, cx: number, cy: number, r: number) {
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.arc(cx + r * 0.7, cy - r * 0.2, r * 0.8, 0, Math.PI * 2);
  ctx.arc(cx - r * 0.7, cy - r * 0.1, r * 0.7, 0, Math.PI * 2);
  ctx.arc(cx + r * 1.3, cy + r * 0.2, r * 0.6, 0, Math.PI * 2);
  ctx.closePath();
  ctx.fill();
}

function drawOutfieldSnoopy(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  time: number,
  isCelebration: boolean
) {
  ctx.save();
  ctx.translate(x, y);

  const bob = isCelebration ? Math.sin(time * 12) * 5 : 0;

  // Snoopy body
  ctx.fillStyle = '#FFFFFF';
  ctx.strokeStyle = '#18181B';
  ctx.lineWidth = 1.2;

  // Head
  ctx.beginPath();
  ctx.ellipse(0, -18 + bob, 9, 6.5, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // Snout
  ctx.beginPath();
  ctx.ellipse(7, -18 + bob, 5, 4, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // Black nose
  ctx.fillStyle = '#18181B';
  ctx.beginPath();
  ctx.arc(11, -19 + bob, 2.2, 0, Math.PI * 2);
  ctx.fill();

  // Drooping black ear
  ctx.beginPath();
  ctx.ellipse(-4, -15 + bob, 4, 8, isCelebration ? Math.sin(time * 10) * 0.5 : 0.3, 0, Math.PI * 2);
  ctx.fill();

  // Red baseball cap
  ctx.fillStyle = '#EF4444';
  ctx.beginPath();
  ctx.arc(0, -22 + bob, 7.5, Math.PI, Math.PI * 2);
  ctx.fill();
  ctx.fillRect(-8, -22 + bob, 6, 2.5);

  // Body leaning on fence
  ctx.fillStyle = '#FFFFFF';
  ctx.beginPath();
  ctx.ellipse(0, -6 + bob, 7, 8, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // Paws
  ctx.fillStyle = '#FFFFFF';
  ctx.beginPath();
  ctx.arc(-5, 0, 3, 0, Math.PI * 2);
  ctx.arc(5, 0, 3, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  ctx.restore();
}

function drawPitcherCharlieBrown(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  time: number,
  isPitching: boolean,
  progress: number,
  capFlew: boolean
) {
  ctx.save();
  ctx.translate(x, y);

  const skinTone = '#FED7AA';

  let armAngle = 0.6;
  let bodyDip = 0;
  if (isPitching) {
    if (progress < 0.25) {
      armAngle = -1.2 + progress * 2;
      bodyDip = progress * 4;
    } else if (progress < 0.45) {
      armAngle = 1.4 - (progress - 0.25) * 3;
      bodyDip = 3;
    } else {
      armAngle = -0.3;
      bodyDip = 1;
    }
  }

  // Legs
  ctx.fillStyle = '#18181B';
  ctx.fillRect(-5, 12, 4, 12);
  ctx.fillRect(1, 12, 4, 12);

  // Yellow shirt with black zigzag
  ctx.fillStyle = '#FACC15';
  ctx.beginPath();
  ctx.roundRect(-8, -4 + bodyDip, 16, 16, [2, 2, 1, 1]);
  ctx.fill();
  ctx.strokeStyle = '#18181B';
  ctx.lineWidth = 1.5;
  ctx.stroke();

  // Zigzag stripe
  ctx.strokeStyle = '#18181B';
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.moveTo(-6, 4 + bodyDip);
  ctx.lineTo(-2, 8 + bodyDip);
  ctx.lineTo(2, 4 + bodyDip);
  ctx.lineTo(6, 8 + bodyDip);
  ctx.stroke();

  // Pitching Arm with Baseball Glove
  ctx.save();
  ctx.translate(-7, 2 + bodyDip);
  ctx.rotate(armAngle);
  ctx.fillStyle = '#FACC15';
  ctx.fillRect(-2, 0, 4, 12);
  // Brown leather glove
  ctx.fillStyle = '#78350F';
  ctx.beginPath();
  ctx.arc(0, 14, 5, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  // Head
  ctx.fillStyle = skinTone;
  ctx.beginPath();
  ctx.arc(0, -14 + bodyDip, 11, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#18181B';
  ctx.lineWidth = 1.5;
  ctx.stroke();

  // Eyes
  ctx.fillStyle = '#18181B';
  ctx.beginPath();
  ctx.arc(-3, -14 + bodyDip, 1.3, 0, Math.PI * 2);
  ctx.arc(3, -14 + bodyDip, 1.3, 0, Math.PI * 2);
  ctx.fill();

  // Smile
  ctx.strokeStyle = '#18181B';
  ctx.lineWidth = 1.2;
  ctx.beginPath();
  ctx.arc(0, -9 + bodyDip, 3.5, 0.2, Math.PI - 0.2);
  ctx.stroke();

  // Baseball Cap (may fly off if Charlie got smashed with a homerun!)
  if (!capFlew) {
    ctx.fillStyle = '#FACC15';
    ctx.beginPath();
    ctx.arc(0, -18 + bodyDip, 10, Math.PI, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#18181B';
    ctx.lineWidth = 1.2;
    ctx.stroke();
    // Cap bill
    ctx.fillRect(-12, -18 + bodyDip, 10, 3);
  } else {
    // Cap flying in air
    ctx.save();
    ctx.translate(-25, -40);
    ctx.rotate(-0.8);
    ctx.fillStyle = '#FACC15';
    ctx.beginPath();
    ctx.arc(0, 0, 10, Math.PI, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.restore();
  }

  ctx.restore();
}

function drawPitcherPatty(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  time: number,
  isPitching: boolean,
  progress: number
) {
  ctx.save();
  ctx.translate(x, y);

  const skinTone = '#FED7AA';

  // Athletic stride
  ctx.fillStyle = skinTone;
  ctx.fillRect(-6, 12, 4, 12);
  ctx.fillRect(2, 12, 4, 12);

  // Green striped polo
  ctx.fillStyle = '#16A34A';
  ctx.beginPath();
  ctx.roundRect(-8, -4, 16, 16, [2, 2, 1, 1]);
  ctx.fill();
  ctx.strokeStyle = '#18181B';
  ctx.lineWidth = 1.5;
  ctx.stroke();

  // White pinstripes
  ctx.strokeStyle = '#FFFFFF';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(-3, -4); ctx.lineTo(-3, 12);
  ctx.moveTo(3, -4); ctx.lineTo(3, 12);
  ctx.stroke();

  // Head
  ctx.fillStyle = skinTone;
  ctx.beginPath();
  ctx.arc(0, -14, 11, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#18181B';
  ctx.lineWidth = 1.5;
  ctx.stroke();

  // Auburn hair
  ctx.fillStyle = '#9A3412';
  ctx.beginPath();
  ctx.arc(0, -17, 12, Math.PI, Math.PI * 2);
  ctx.fill();
  ctx.fillRect(-12, -17, 4, 12);
  ctx.fillRect(8, -17, 4, 12);

  // Freckles
  ctx.fillStyle = '#9A3412';
  ctx.fillRect(-4, -12, 1.2, 1.2);
  ctx.fillRect(3, -12, 1.2, 1.2);

  // Determined grin
  ctx.strokeStyle = '#18181B';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.arc(0, -10, 4, 0.2, Math.PI - 0.2);
  ctx.stroke();

  ctx.restore();
}

function drawPitcherSnoopyMound(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  time: number,
  isPitching: boolean,
  progress: number
) {
  ctx.save();
  ctx.translate(x, y);

  // White beagle body standing upright
  ctx.fillStyle = '#FFFFFF';
  ctx.strokeStyle = '#18181B';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.roundRect(-6, 2, 12, 16, 4);
  ctx.fill();
  ctx.stroke();

  // Head
  ctx.beginPath();
  ctx.ellipse(0, -10, 10, 8, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // Floppy black ear
  ctx.fillStyle = '#18181B';
  ctx.beginPath();
  ctx.ellipse(-8, -7, 4, 9, 0.4, 0, Math.PI * 2);
  ctx.fill();

  // Black button nose
  ctx.beginPath();
  ctx.arc(9, -9, 2.8, 0, Math.PI * 2);
  ctx.fill();

  // Joe Cool Sunglasses!
  ctx.fillStyle = '#18181B';
  ctx.fillRect(0, -13, 10, 5);
  ctx.fillRect(-6, -13, 6, 5);

  ctx.restore();
}

function drawBatterAri(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  swingState: 'idle' | 'swinging' | 'recoil',
  batAngle: number,
  time: number
) {
  ctx.save();
  ctx.translate(x, y);

  const skinTone = '#FED7AA';

  // Legs in athletic batting stance
  ctx.fillStyle = '#18181B';
  ctx.fillRect(-8, 14, 5, 14);
  ctx.fillRect(3, 14, 5, 14);

  // Black hoodie
  ctx.fillStyle = '#18181B';
  ctx.beginPath();
  ctx.roundRect(-10, -4, 20, 18, [3, 3, 1, 1]);
  ctx.fill();
  ctx.strokeStyle = '#27272A';
  ctx.lineWidth = 1.2;
  ctx.stroke();

  // Zipper
  ctx.strokeStyle = '#E4E4E7';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(0, -4);
  ctx.lineTo(0, 14);
  ctx.stroke();

  // Head
  ctx.fillStyle = skinTone;
  ctx.beginPath();
  ctx.arc(0, -16, 12, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#18181B';
  ctx.lineWidth = 1.5;
  ctx.stroke();

  // Long wavy dark hair
  ctx.fillStyle = '#18181B';
  ctx.beginPath();
  ctx.arc(0, -20, 13, Math.PI, Math.PI * 2);
  ctx.fill();
  ctx.fillRect(-13, -20, 5, 16);
  ctx.fillRect(8, -20, 5, 16);

  // Eye focused on pitcher
  ctx.fillStyle = '#18181B';
  ctx.beginPath();
  ctx.arc(3, -16, 1.8, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#FFFFFF';
  ctx.beginPath();
  ctx.arc(3.5, -16.5, 0.6, 0, Math.PI * 2);
  ctx.fill();

  // BAT AND ARMS
  ctx.save();
  ctx.translate(6, 2);
  ctx.rotate(batAngle);

  // Wooden baseball bat
  const batGrad = ctx.createLinearGradient(0, 0, 0, -42);
  batGrad.addColorStop(0, '#78350F');
  batGrad.addColorStop(0.3, '#B45309');
  batGrad.addColorStop(1, '#D97706');
  ctx.fillStyle = batGrad;
  ctx.strokeStyle = '#451A03';
  ctx.lineWidth = 1.2;

  ctx.beginPath();
  ctx.moveTo(-1.5, 4);
  ctx.lineTo(1.5, 4);
  ctx.lineTo(3.2, -38);
  ctx.arc(0, -38, 3.2, 0, Math.PI, true);
  ctx.lineTo(-1.5, 4);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Bat grip tape
  ctx.strokeStyle = '#F1F5F9';
  ctx.lineWidth = 1.5;
  for (let gy = 0; gy > -12; gy -= 3) {
    ctx.beginPath();
    ctx.moveTo(-1.5, gy);
    ctx.lineTo(1.5, gy);
    ctx.stroke();
  }

  // Hands gripping bat
  ctx.fillStyle = skinTone;
  ctx.beginPath();
  ctx.arc(0, 0, 3.5, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(0, -4, 3.5, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();

  ctx.restore();
}

import React, { useRef, useEffect } from 'react';
import { LocationData, Position, TimeOfDay, InteractiveTrigger, CharacterNpc } from '../types';
import { getActiveCharactersForTime } from '../data/charactersData';
import { sound } from '../utils/audio';
import {
  drawRealisticLawn,
  drawGrassCurbOverhang,
  drawDappledCanopyShadow,
  drawAirborneDandelionSeeds,
  drawRealisticAsphalt,
  drawRealisticConcreteSidewalk,
} from '../utils/realisticGrass';
import {
  drawHouseAri,
  drawHouseCharlieBrown,
  drawDoghouseInterior,
  drawHouseVanPelt,
  drawHouseSchroeder,
  drawHousePeppermintPatty,
  drawHouseMarcie,
  drawHouseFranklin,
  drawHousePigpen,
  drawSchoolInterior,
  drawInteriorLightCone,
  YSortItem,
} from './InteriorRenderer';
import { drawRealisticBeachScene } from '../utils/beachRenderer';
import { drawRealisticBaseballFieldScene } from '../utils/baseballFieldRenderer';
import { drawDetailedSummerCampScene } from '../utils/summerCampRenderer';

interface GameCanvasProps {
  location: LocationData;
  playerPos: Position;
  playerDir: 'down' | 'up' | 'left' | 'right';
  isMoving: boolean;
  timeOfDay: TimeOfDay;
  activeTrigger: InteractiveTrigger | null;
  onInteractA: () => void;
  characters?: CharacterNpc[];
}

export const GameCanvas: React.FC<GameCanvasProps> = ({
  location,
  playerPos,
  playerDir,
  isMoving,
  timeOfDay,
  activeTrigger,
  characters: externalCharacters
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animFrameRef = useRef<number>(0);
  const walkStepRef = useRef<number>(0);

  // Synchronous ref for all dynamic props so the rendering loop never tears down
  // or freezes when Ari walks, and NPCs never jump or teleport
  const propsRef = useRef({
    location,
    playerPos,
    playerDir,
    isMoving,
    timeOfDay,
    activeTrigger,
    characters: externalCharacters
  });
  propsRef.current = {
    location,
    playerPos,
    playerDir,
    isMoving,
    timeOfDay,
    activeTrigger,
    characters: externalCharacters
  };

  const timeRef = useRef<number>(0);
  const lastTimestampRef = useRef<number>(performance.now());

  // Sound loop for footsteps when moving
  useEffect(() => {
    if (!isMoving) return;
    const interval = setInterval(() => {
      const surface =
        location.id === 'ice_rink'
          ? 'ice'
          : location.category === 'interior'
          ? 'wood'
          : 'grass';
      sound.playFootstep(surface);
    }, 280);
    return () => clearInterval(interval);
  }, [isMoving, location.id, location.category]);

  // Main rendering loop (persistent continuous requestAnimationFrame loop)
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    lastTimestampRef.current = performance.now();

    const render = (now: number) => {
      // Calculate real delta time in seconds
      const dt = Math.min((now - lastTimestampRef.current) / 1000, 0.1);
      lastTimestampRef.current = now;

      // Real continuous time that NEVER resets to 0 when Ari walks!
      timeRef.current += dt * 1.5;
      const time = timeRef.current;

      const {
        location: curLoc,
        playerPos: curPlayerPos,
        playerDir: curPlayerDir,
        isMoving: curIsMoving,
        timeOfDay: curTimeOfDay,
        activeTrigger: curActiveTrigger,
        characters: curCharacters
      } = propsRef.current;

      if (curIsMoving) {
        walkStepRef.current = (walkStepRef.current + dt * 10) % (Math.PI * 2);
      } else {
        walkStepRef.current = 0;
      }

      // Responsive canvas size matching container
      const parent = canvas.parentElement;
      const width = parent?.clientWidth || 800;
      const height = parent?.clientHeight || 600;
      if (canvas.width !== width || canvas.height !== height) {
        canvas.width = width;
        canvas.height = height;
      }

      // Camera centered on player, clamped to location bounds
      const halfW = width / 2;
      const halfH = height / 2;
      let camX = curPlayerPos.x - halfW;
      let camY = curPlayerPos.y - halfH;

      camX = Math.max(0, Math.min(curLoc.width - width, camX));
      camY = Math.max(0, Math.min(curLoc.height - height, camY));

      ctx.save();
      ctx.clearRect(0, 0, width, height);

      // Translate camera
      ctx.translate(-camX, -camY);

      // 1. DRAW SCENERY BACKGROUND (Flat ground, floorboards, paths, lake, rugs, wall architecture)
      drawEnvironment(ctx, curLoc, time, curTimeOfDay, curPlayerPos);

      // 2. COLLECT SORTABLE OBJECTS & DRAW IMMOBILE BACKGROUND TILES
      const sortableItems: YSortItem[] = [];
      drawCollidersAndDecor(ctx, curLoc, time, curTimeOfDay, sortableItems);

      // 3. DRAW TRIGGERS / INTERACTIVE PROMPTS
      drawTriggers(ctx, curLoc, curActiveTrigger, time);

      // 4. UNIFIED Y-SORTED DEPTH RENDERING:
      // Objects, NPCs, and Player Ari are sorted by their contact base Y coordinate!
      // When Ari is behind an object (Ari's Y < object's baseY), Ari is drawn FIRST and the object is drawn OVER Ari (occluding/covering Ari)!
      // When Ari is in front of an object (Ari's Y >= object's baseY), the object is drawn FIRST and Ari is drawn OVER the object!
      interface DepthEntity {
        baseY: number;
        draw: () => void;
      }
      const depthEntities: DepthEntity[] = [];

      // Add all furniture / trees / obstacles from sortableItems
      for (let i = 0; i < sortableItems.length; i++) {
        const item = sortableItems[i];
        depthEntities.push({
          baseY: item.baseY,
          draw: () => item.draw(ctx)
        });
      }

      // Add all NPCs active in this location
      const npcs = curCharacters || getActiveCharactersForTime(curTimeOfDay);
      for (let i = 0; i < npcs.length; i++) {
        const npc = npcs[i];
        if (npc.locationId !== curLoc.id) continue;
        const npcBaseY = npc.y + (npc.id === 'woodstock' ? 24 : 38);
        depthEntities.push({
          baseY: npcBaseY,
          draw: () => {
            ctx.save();
            ctx.translate(npc.x, npc.y);
            if (npc.id === 'snoopy') {
              drawSnoopy(ctx, npc, time, curTimeOfDay);
            } else if (npc.id === 'woodstock') {
              drawWoodstock(ctx, npc, time, curTimeOfDay);
            } else {
              drawPeanutsChild(ctx, npc, time, curTimeOfDay);
            }
            ctx.restore();
          }
        });
      }

      // Add Player Ari
      const playerBaseY = curPlayerPos.y + 38;
      depthEntities.push({
        baseY: playerBaseY,
        draw: () => {
          drawPlayerAri(ctx, curPlayerPos, curPlayerDir, walkStepRef.current, time, curTimeOfDay);
        }
      });

      // 5. SORT BY BASE Y ASCENDING (Top to Bottom)
      depthEntities.sort((a, b) => a.baseY - b.baseY);

      // 6. RENDER ALL DEPTH ENTITIES
      for (let i = 0; i < depthEntities.length; i++) {
        depthEntities[i].draw();
      }

      // 7. RENDER SOCIAL COMIC SPEECH BALLOONS & EMOTES (Over heads)
      for (let i = 0; i < npcs.length; i++) {
        const npc = npcs[i];
        if (npc.locationId !== curLoc.id) continue;
        if (npc.socialState) {
          drawSocialBubble(ctx, npc.x, npc.y, npc.socialState, time);
        } else {
          drawAmbientCharacterEmotes(ctx, npc.x, npc.y, npc.id, time);
        }
      }

      // 8. DRAW FOREGROUND / AMBIENT PARTICLES
      drawAtmosphericParticles(ctx, curLoc, time, curTimeOfDay);

      // 9. DRAW DAY / NIGHT LIGHTING SHADER
      ctx.restore();
      drawLightingShader(ctx, width, height, curTimeOfDay, curPlayerPos, camX, camY, curLoc);

      animFrameRef.current = requestAnimationFrame(render);
    };

    animFrameRef.current = requestAnimationFrame(render);

    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, []); // Run continuously! NEVER teardown when props change!

  return (
    <div className="w-full h-full relative overflow-hidden bg-stone-900 select-none">
      <canvas ref={canvasRef} className="w-full h-full block cursor-default" />
    </div>
  );
};

// --- DRAWING FUNCTIONS ---

function drawSchulzGrassTufts(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  density: number = 18,
  time: number = 0,
  timeOfDay: TimeOfDay = 'day'
) {
  drawRealisticLawn(ctx, x, y, w, h, time, {
    timeOfDay,
    density: density * 1.8,
    flowerDensity: 1.2,
    cloverDensity: 1.3,
  });
}

function drawMailbox(ctx: CanvasRenderingContext2D, x: number, y: number, flagUp: boolean = true) {
  ctx.save();
  ctx.fillStyle = '#78350F';
  ctx.fillRect(x, y - 20, 4, 20);
  ctx.strokeStyle = '#451A03';
  ctx.lineWidth = 0.8;
  ctx.strokeRect(x, y - 20, 4, 20);

  ctx.fillStyle = '#E2E8F0';
  ctx.beginPath();
  ctx.roundRect(x - 3, y - 28, 14, 9, [4, 4, 0, 0]);
  ctx.fill();
  ctx.strokeStyle = '#475569';
  ctx.lineWidth = 1;
  ctx.stroke();

  ctx.fillStyle = '#18181B';
  ctx.fillRect(x + 8, y - 24, 2, 3);

  if (flagUp) {
    ctx.fillStyle = '#EF4444';
    ctx.fillRect(x - 2, y - 34, 2, 8);
    ctx.fillRect(x - 6, y - 34, 4, 4);
  } else {
    ctx.fillStyle = '#EF4444';
    ctx.fillRect(x - 6, y - 25, 5, 2);
  }
  ctx.restore();
}

function drawFireHydrant(ctx: CanvasRenderingContext2D, x: number, y: number) {
  ctx.save();
  ctx.fillStyle = 'rgba(0,0,0,0.2)';
  ctx.beginPath();
  ctx.ellipse(x, y + 2, 7, 3, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = '#DC2626';
  ctx.fillRect(x - 4, y - 14, 8, 15);
  ctx.strokeStyle = '#18181B';
  ctx.lineWidth = 1.2;
  ctx.strokeRect(x - 4, y - 14, 8, 15);

  ctx.beginPath();
  ctx.arc(x, y - 14, 5, Math.PI, Math.PI * 2);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = '#FEF08A';
  ctx.fillRect(x - 1.5, y - 21, 3, 3);

  ctx.fillStyle = '#B91C1C';
  ctx.fillRect(x - 7, y - 9, 3, 4);
  ctx.fillRect(x + 4, y - 9, 3, 4);
  ctx.strokeStyle = '#18181B';
  ctx.strokeRect(x - 7, y - 9, 3, 4);
  ctx.strokeRect(x + 4, y - 9, 3, 4);
  ctx.restore();
}

function drawStormDrain(ctx: CanvasRenderingContext2D, x: number, y: number) {
  ctx.save();
  ctx.fillStyle = '#1E293B';
  ctx.fillRect(x, y, 16, 7);
  ctx.strokeStyle = '#64748B';
  ctx.lineWidth = 1;
  ctx.strokeRect(x, y, 16, 7);
  for (let sx = x + 3; sx < x + 14; sx += 3) {
    ctx.beginPath();
    ctx.moveTo(sx, y + 1);
    ctx.lineTo(sx, y + 6);
    ctx.stroke();
  }
  ctx.restore();
}

function drawFlowerBed(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number) {
  ctx.save();
  ctx.fillStyle = '#451A03';
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, 3);
  ctx.fill();

  ctx.fillStyle = '#94A3B8';
  for (let sx = x + 3; sx < x + w - 3; sx += 6) {
    ctx.beginPath();
    ctx.arc(sx, y + h, 2.5, Math.PI, Math.PI * 2);
    ctx.fill();
  }

  const colors = ['#F43F5E', '#FBBF24', '#38BDF8', '#C084FC', '#FFFFFF', '#FB923C'];
  const count = Math.floor(w / 7);
  for (let i = 0; i < count; i++) {
    const fx = x + 4 + i * 7;
    const fy = y + 3 + (i % 2) * 2;
    ctx.fillStyle = '#22C55E';
    ctx.beginPath();
    ctx.arc(fx, fy + 2, 2.2, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = colors[i % colors.length];
    ctx.beginPath();
    ctx.arc(fx, fy, 2.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#FDE047';
    ctx.beginPath();
    ctx.arc(fx, fy, 0.9, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
}

function drawRealisticLakeScene(
  ctx: CanvasRenderingContext2D,
  loc: LocationData,
  time: number,
  timeOfDay: TimeOfDay = 'day'
) {
  // 1. Lush lakeshore meadow bank with mower striping & wildflowers
  drawRealisticLawn(ctx, 0, 0, loc.width, loc.height, time, {
    timeOfDay,
    density: 34,
    flowerDensity: 1.6,
    cloverDensity: 1.5,
    stripeWidth: 48
  });

  // 2. Organic curved lake shoreline contour
  const drawLakeContour = (targetCtx: CanvasRenderingContext2D) => {
    targetCtx.beginPath();
    targetCtx.moveTo(210, 160);
    targetCtx.bezierCurveTo(240, 105, 420, 85, 540, 105);
    targetCtx.bezierCurveTo(630, 120, 715, 180, 705, 270);
    targetCtx.bezierCurveTo(695, 360, 615, 440, 490, 445);
    targetCtx.bezierCurveTo(360, 450, 250, 435, 185, 365);
    targetCtx.bezierCurveTo(145, 305, 170, 210, 210, 160);
    targetCtx.closePath();
  };

  // 3. Shoreline edge transition: soft pebble & sand strand
  ctx.save();
  ctx.strokeStyle = '#D4A373';
  ctx.lineWidth = 26;
  ctx.lineJoin = 'round';
  drawLakeContour(ctx);
  ctx.stroke();

  // Wet mud & gravel rim
  ctx.strokeStyle = '#92400E';
  ctx.lineWidth = 14;
  drawLakeContour(ctx);
  ctx.stroke();

  // Smooth river stones along the shoreline
  const shorelineStones = [
    [192, 148, 6, 4.5, '#78716C'], [245, 104, 7, 5, '#57534E'], [320, 92, 8, 5.5, '#64748B'],
    [410, 88, 9, 6, '#78716C'], [490, 96, 7, 5, '#57534E'], [570, 114, 8, 6, '#64748B'],
    [640, 138, 7.5, 5, '#78716C'], [698, 195, 9, 6.5, '#57534E'], [710, 260, 8, 5.5, '#64748B'],
    [688, 335, 7.5, 5, '#78716C'], [640, 395, 8.5, 6, '#57534E'], [560, 435, 8, 5.5, '#64748B'],
    [470, 448, 9, 6, '#78716C'], [370, 448, 7.5, 5, '#57534E'], [280, 430, 8, 5.5, '#64748B'],
    [210, 395, 9, 6, '#78716C'], [165, 330, 7.5, 5, '#57534E'], [155, 250, 8, 5.5, '#64748B'],
    [175, 195, 7, 5, '#78716C']
  ];
  shorelineStones.forEach(([sx, sy, srX, srY, col]) => {
    ctx.fillStyle = col as string;
    ctx.beginPath();
    ctx.ellipse(sx as number, sy as number, srX as number, srY as number, 0.2, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#292524';
    ctx.lineWidth = 1;
    ctx.stroke();
    // Green moss patch on stone
    ctx.fillStyle = '#15803D';
    ctx.beginPath();
    ctx.arc((sx as number) - 1, (sy as number) - 1.5, (srX as number) * 0.45, 0, Math.PI * 2);
    ctx.fill();
  });

  // Clumps of wild cattails (Typha) & reeds along the shoreline
  const reedClumps = [
    { rx: 250, ry: 95 }, { rx: 370, ry: 82 }, { rx: 590, ry: 108 },
    { rx: 670, ry: 155 }, { rx: 685, ry: 350 }, { rx: 580, ry: 430 },
    { rx: 330, ry: 442 }, { rx: 230, ry: 415 }
  ];
  reedClumps.forEach(({ rx, ry }) => {
    const sway = Math.sin(time * 2.5 + rx) * 3;
    for (let b = -4; b <= 4; b += 2.5) {
      ctx.strokeStyle = '#15803D';
      ctx.lineWidth = 1.6;
      ctx.beginPath();
      ctx.moveTo(rx + b, ry);
      ctx.quadraticCurveTo(rx + b * 1.5 + sway * 0.5, ry - 14, rx + b * 2 + sway, ry - 28);
      ctx.stroke();
    }
    // Brown velvet cattail cigar spike
    ctx.fillStyle = '#5A2609';
    ctx.beginPath();
    ctx.roundRect(rx + sway - 2, ry - 26, 4, 11, 2);
    ctx.fill();
    ctx.strokeStyle = '#3E1906';
    ctx.lineWidth = 0.8;
    ctx.stroke();
  });

  // 4. MULTI-LAYERED DEEP WATER (Crystal-clear shallows to serene deep sapphire)
  const waterGrad = ctx.createRadialGradient(
    450,
    270,
    40,
    450,
    270,
    280
  );
  waterGrad.addColorStop(0, '#0C4A6E');
  waterGrad.addColorStop(0.45, '#0284C7');
  waterGrad.addColorStop(0.8, '#0EA5E9');
  waterGrad.addColorStop(1, '#38BDF8');
  ctx.fillStyle = waterGrad;
  drawLakeContour(ctx);
  ctx.fill();

  // Subtle aquatic edge border
  ctx.strokeStyle = '#0284C7';
  ctx.lineWidth = 2.5;
  drawLakeContour(ctx);
  ctx.stroke();

  // Submerged pebbles & sand ripples visible in shallow water
  ctx.fillStyle = 'rgba(255, 255, 255, 0.18)';
  const submergedPebbles = [
    [230, 145, 4], [280, 125, 5], [450, 110, 4.5], [520, 120, 5],
    [650, 200, 4], [660, 290, 4.5], [590, 410, 5], [440, 425, 4],
    [320, 420, 4.5], [200, 340, 5]
  ];
  submergedPebbles.forEach(([px, py, pr]) => {
    ctx.beginPath();
    ctx.arc(px, py, pr, 0, Math.PI * 2);
    ctx.fill();
  });

  // Animated caustic sunlight ripples dancing on the water
  ctx.strokeStyle = 'rgba(224, 242, 254, 0.45)';
  ctx.lineWidth = 1.4;
  for (let i = 0; i < 9; i++) {
    const cy = 140 + i * 32;
    const waveShift = Math.sin(time * 1.8 + i * 0.8) * 16;
    ctx.beginPath();
    ctx.moveTo(260 + waveShift, cy);
    ctx.quadraticCurveTo(380, cy - 8 + Math.cos(time + i) * 6, 500 - waveShift, cy);
    ctx.quadraticCurveTo(580, cy + 8 + Math.sin(time + i) * 6, 640 + waveShift, cy);
    ctx.stroke();
  }

  // Sparkling diamond glints of sunlight
  const numSparkles = 6;
  for (let s = 0; s < numSparkles; s++) {
    const spX = 300 + ((s * 73 + Math.floor(time * 20)) % 320);
    const spY = 170 + ((s * 53 + Math.floor(time * 15)) % 220);
    const spAlpha = 0.3 + 0.6 * Math.abs(Math.sin(time * 3 + s * 1.5));
    ctx.fillStyle = `rgba(255, 255, 255, ${spAlpha})`;
    ctx.beginPath();
    ctx.arc(spX, spY, 1.8, 0, Math.PI * 2);
    ctx.fill();
  }

  // Floating water lily pads with blooming lotus flowers
  const lilyPads = [
    { lx: 290, ly: 190, r: 12, flower: '#F472B6' },
    { lx: 310, ly: 205, r: 10, flower: '#FFFFFF' },
    { lx: 580, ly: 340, r: 13, flower: '#F472B6' },
    { lx: 605, ly: 355, r: 11, flower: '#FDE047' },
    { lx: 520, ly: 390, r: 11, flower: null }
  ];
  lilyPads.forEach((lp) => {
    ctx.fillStyle = '#15803D';
    ctx.beginPath();
    ctx.arc(lp.lx, lp.ly, lp.r, 0.4, Math.PI * 1.9);
    ctx.lineTo(lp.lx, lp.ly);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = '#14532D';
    ctx.lineWidth = 1;
    ctx.stroke();

    if (lp.flower) {
      ctx.fillStyle = lp.flower;
      ctx.beginPath();
      ctx.arc(lp.lx + 2, lp.ly - 2, 4, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#F59E0B';
      ctx.beginPath();
      ctx.arc(lp.lx + 2, lp.ly - 2, 1.5, 0, Math.PI * 2);
      ctx.fill();
    }
  });

  // 5. RUSTIC WOODEN DOCK / PIER EXTENDING INTO LAKE
  const pierX = 165;
  const pierY = 240;
  const pierW = 100;
  const pierH = 32;

  // Contact shadow in water
  ctx.fillStyle = 'rgba(2, 44, 34, 0.45)';
  ctx.fillRect(pierX + 4, pierY + pierH - 2, pierW - 8, 8);

  // Heavy timber pilings with algae waterline
  const pilings = [pierX + 10, pierX + 45, pierX + 80, pierX + pierW - 4];
  pilings.forEach((px) => {
    ctx.fillStyle = '#451A03';
    ctx.fillRect(px - 3, pierY + pierH - 4, 6, 16);
    ctx.strokeStyle = '#292524';
    ctx.lineWidth = 1;
    ctx.strokeRect(px - 3, pierY + pierH - 4, 6, 16);
    ctx.fillStyle = '#166534';
    ctx.fillRect(px - 3, pierY + pierH + 6, 6, 5);
  });

  // Wooden plank deck
  ctx.fillStyle = '#78350F';
  ctx.fillRect(pierX, pierY, pierW, pierH);
  ctx.strokeStyle = '#451A03';
  ctx.lineWidth = 1.5;
  ctx.strokeRect(pierX, pierY, pierW, pierH);

  // Individual wood planks with nail heads
  ctx.strokeStyle = '#92400E';
  ctx.lineWidth = 1;
  for (let px = pierX + 10; px < pierX + pierW; px += 10) {
    ctx.beginPath();
    ctx.moveTo(px, pierY);
    ctx.lineTo(px, pierY + pierH);
    ctx.stroke();
    ctx.fillStyle = '#CBD5E1';
    ctx.fillRect(px - 5, pierY + 3, 1.5, 1.5);
    ctx.fillRect(px - 5, pierY + pierH - 5, 1.5, 1.5);
  }

  // Timber edge bumper trim
  ctx.fillStyle = '#5A2609';
  ctx.fillRect(pierX, pierY, pierW, 3);
  ctx.fillRect(pierX, pierY + pierH - 3, pierW, 3);

  // Mooring bollards & coiled nautical rope
  ctx.fillStyle = '#1F2937';
  ctx.fillRect(pierX + pierW - 12, pierY + 4, 6, 8);
  ctx.fillRect(pierX + pierW - 14, pierY + 2, 10, 3);
  ctx.strokeStyle = '#D97706';
  ctx.lineWidth = 1.2;
  ctx.beginPath();
  ctx.ellipse(pierX + pierW - 16, pierY + 22, 6, 4, 0, 0, Math.PI * 2);
  ctx.stroke();

  // Red and white life preserver ring on pier post
  const ringX = pierX + 28;
  const ringY = pierY - 8;
  ctx.fillStyle = '#FFFFFF';
  ctx.beginPath();
  ctx.arc(ringX, ringY, 7, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#EF4444';
  ctx.beginPath();
  ctx.arc(ringX, ringY, 7, -0.4, 0.4);
  ctx.lineTo(ringX, ringY);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(ringX, ringY, 7, Math.PI - 0.4, Math.PI + 0.4);
  ctx.lineTo(ringX, ringY);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(ringX, ringY, 7, Math.PI / 2 - 0.4, Math.PI / 2 + 0.4);
  ctx.lineTo(ringX, ringY);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(ringX, ringY, 7, -Math.PI / 2 - 0.4, -Math.PI / 2 + 0.4);
  ctx.lineTo(ringX, ringY);
  ctx.fill();
  ctx.fillStyle = '#0284C7';
  ctx.beginPath();
  ctx.arc(ringX, ringY, 3, 0, Math.PI * 2);
  ctx.fill();

  // 6. MOORED WOODEN ROWBOAT ("S.S. Beagle")
  const boatBob = Math.sin(time * 2.2) * 2;
  const boatX = pierX + 38;
  const boatY = pierY + pierH + 6 + boatBob;
  ctx.save();
  ctx.translate(boatX, boatY);
  ctx.rotate(Math.sin(time * 1.5) * 0.04);

  // Boat shadow in water
  ctx.fillStyle = 'rgba(2, 44, 34, 0.4)';
  ctx.beginPath();
  ctx.ellipse(24, 10, 28, 9, 0, 0, Math.PI * 2);
  ctx.fill();

  // Hull
  ctx.fillStyle = '#991B1B';
  ctx.beginPath();
  ctx.moveTo(-4, 0);
  ctx.quadraticCurveTo(24, -8, 52, 0);
  ctx.quadraticCurveTo(56, 12, 48, 14);
  ctx.quadraticCurveTo(24, 20, 0, 14);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = '#18181B';
  ctx.lineWidth = 1.5;
  ctx.stroke();

  // Interior cavity
  ctx.fillStyle = '#B45309';
  ctx.beginPath();
  ctx.ellipse(24, 6, 22, 6, 0, 0, Math.PI * 2);
  ctx.fill();

  // Rowing bench seat & wooden oars
  ctx.fillStyle = '#78350F';
  ctx.fillRect(18, 1, 12, 9);
  ctx.strokeStyle = '#D97706';
  ctx.lineWidth = 1.4;
  ctx.beginPath();
  ctx.moveTo(14, 0);
  ctx.lineTo(34, 18);
  ctx.stroke();

  // Name plaque "BEAGLE"
  ctx.fillStyle = '#FEF08A';
  ctx.font = 'bold 5px sans-serif';
  ctx.fillText('BEAGLE', 12, 12);

  ctx.restore();

  // Mooring rope from boat to pier
  ctx.strokeStyle = '#D97706';
  ctx.lineWidth = 1.2;
  ctx.beginPath();
  ctx.moveTo(boatX, boatY + 6);
  ctx.quadraticCurveTo(pierX + 44, pierY + pierH + 2, pierX + 48, pierY + pierH - 2);
  ctx.stroke();

  // 7. ARI'S LAKESIDE WRITING SANCTUARY (Trigger at 180, 380)
  const stoneX = 180;
  const stoneY = 380;
  ctx.fillStyle = 'rgba(0, 0, 0, 0.22)';
  ctx.beginPath();
  ctx.ellipse(stoneX + 24, stoneY + 24, 32, 14, 0, 0, Math.PI * 2);
  ctx.fill();

  // Granite boulder body
  const stoneGrad = ctx.createLinearGradient(stoneX, stoneY, stoneX + 48, stoneY + 36);
  stoneGrad.addColorStop(0, '#94A3B8');
  stoneGrad.addColorStop(0.5, '#64748B');
  stoneGrad.addColorStop(1, '#475569');
  ctx.fillStyle = stoneGrad;
  ctx.beginPath();
  ctx.ellipse(stoneX + 24, stoneY + 16, 28, 18, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#334155';
  ctx.lineWidth = 1.5;
  ctx.stroke();

  // Flat top table surface
  ctx.fillStyle = '#CBD5E1';
  ctx.beginPath();
  ctx.ellipse(stoneX + 24, stoneY + 12, 22, 11, 0, 0, Math.PI * 2);
  ctx.fill();

  // Cozy red-and-gold tartan picnic blanket spread on stone
  ctx.fillStyle = '#B91C1C';
  ctx.fillRect(stoneX + 10, stoneY + 6, 26, 14);
  ctx.strokeStyle = '#FBBF24';
  ctx.lineWidth = 1;
  ctx.strokeRect(stoneX + 10, stoneY + 6, 26, 14);

  // Ari's open leatherbound notebook
  ctx.fillStyle = '#FFFBEB';
  ctx.fillRect(stoneX + 16, stoneY + 8, 14, 10);
  ctx.strokeStyle = '#78350F';
  ctx.lineWidth = 0.8;
  ctx.strokeRect(stoneX + 16, stoneY + 8, 14, 10);
  ctx.beginPath();
  ctx.moveTo(stoneX + 23, stoneY + 8);
  ctx.lineTo(stoneX + 23, stoneY + 18);
  ctx.stroke();

  // Little inkpot and quill pen
  ctx.fillStyle = '#1E293B';
  ctx.fillRect(stoneX + 32, stoneY + 9, 3, 4);
  ctx.strokeStyle = '#FFFFFF';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(stoneX + 33, stoneY + 10);
  ctx.lineTo(stoneX + 37, stoneY + 4);
  ctx.stroke();

  // Forget-me-not flowers growing around boulder
  const forgetMeNots = ['#38BDF8', '#60A5FA', '#93C5FD'];
  for (let f = 0; f < 5; f++) {
    const fx = stoneX + 2 + f * 9;
    const fy = stoneY + 28 + Math.sin(f) * 4;
    ctx.fillStyle = forgetMeNots[f % forgetMeNots.length];
    ctx.beginPath();
    ctx.arc(fx, fy, 2.2, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#FEF08A';
    ctx.beginPath();
    ctx.arc(fx, fy, 0.8, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.restore();
}

function drawEnvironment(
  ctx: CanvasRenderingContext2D,
  loc: LocationData,
  time: number,
  timeOfDay: TimeOfDay = 'day',
  playerPos?: Position
) {
  // Base background
  ctx.fillStyle = loc.backgroundTheme;
  ctx.fillRect(0, 0, loc.width, loc.height);

  if (loc.id === 'neighborhood') {
    // 0. REALISTIC MULTI-LAYERED LAWNS WITH MOWER STRIPING & SWAYING BLADES
    drawRealisticLawn(ctx, 0, 0, loc.width, 310, time, {
      timeOfDay,
      density: 32,
      flowerDensity: 1.2,
      cloverDensity: 1.3,
      stripeWidth: 46,
    });
    drawRealisticLawn(ctx, 0, 405, 460, 245, time, {
      timeOfDay,
      density: 30,
      flowerDensity: 1.0,
      cloverDensity: 1.1,
      stripeWidth: 42,
    });
    drawRealisticLawn(ctx, 528, 380, loc.width - 528, loc.height - 380, time, {
      timeOfDay,
      density: 36,
      flowerDensity: 1.6,
      cloverDensity: 1.5,
      stripeWidth: 50,
    });
    drawRealisticLawn(ctx, 0, 745, 528, loc.height - 745, time, {
      timeOfDay,
      density: 30,
      flowerDensity: 0.9,
      cloverDensity: 1.0,
      stripeWidth: 44,
    });

    // 1. REALISTIC ASPHALT ROADWAYS (with aggregate texture & tire wear channels)
    drawRealisticAsphalt(ctx, 0, 335, loc.width, 45, 'horizontal');
    drawRealisticAsphalt(ctx, 480, 380, 48, 295, 'vertical');
    drawRealisticAsphalt(ctx, 0, 675, 528, 45, 'horizontal');

    // Cul-de-sac rounded end
    ctx.fillStyle = '#334155';
    ctx.beginPath();
    ctx.arc(528, 697.5, 22.5, -Math.PI / 2, Math.PI / 2);
    ctx.fill();

    // Yellow dashed centerlines
    ctx.strokeStyle = '#FACC15';
    ctx.lineWidth = 2;
    ctx.setLineDash([12, 10]);
    ctx.beginPath();
    ctx.moveTo(0, 357);
    ctx.lineTo(loc.width, 357);
    ctx.moveTo(0, 697);
    ctx.lineTo(520, 697);
    ctx.moveTo(504, 380);
    ctx.lineTo(504, 675);
    ctx.stroke();
    ctx.setLineDash([]);

    // Storm drain grates along curbs
    drawStormDrain(ctx, 280, 335);
    drawStormDrain(ctx, 600, 335);
    drawStormDrain(ctx, 900, 335);
    drawStormDrain(ctx, 480, 672);

    // White painted pedestrian crosswalks
    ctx.fillStyle = '#F8FAFC';
    for (let c = 338; c < 378; c += 8) {
      ctx.fillRect(535, c, 16, 4.5);
      ctx.fillRect(458, c, 16, 4.5);
    }
    for (let c = 484; c < 524; c += 8) {
      ctx.fillRect(c, 313, 4.5, 18);
      ctx.fillRect(c, 384, 4.5, 18);
    }

    // 2. REALISTIC CONCRETE SIDEWALKS WITH EXPANSION JOINTS & CURBS
    drawRealisticConcreteSidewalk(ctx, 0, 310, loc.width, 25);
    drawRealisticConcreteSidewalk(ctx, 0, 380, loc.width, 25);
    drawRealisticConcreteSidewalk(ctx, 458, 405, 22, 245);
    drawRealisticConcreteSidewalk(ctx, 528, 405, 22, 270);
    drawRealisticConcreteSidewalk(ctx, 0, 650, 458, 25);
    drawRealisticConcreteSidewalk(ctx, 0, 720, 528, 25);

    // Granite curbs
    ctx.fillStyle = '#94A3B8';
    ctx.fillRect(0, 333, loc.width, 2.5);
    ctx.fillRect(0, 380, loc.width, 2.5);
    ctx.fillRect(480, 380, 2.5, 295);
    ctx.fillRect(526, 380, 2.5, 295);
    ctx.fillRect(0, 673, 458, 2.5);
    ctx.fillRect(0, 720, 528, 2.5);

    // Expansion joint score lines
    ctx.strokeStyle = '#CBD5E1';
    ctx.lineWidth = 1;
    for (let sx = 0; sx < loc.width; sx += 42) {
      ctx.beginPath();
      ctx.moveTo(sx, 310);
      ctx.lineTo(sx, 333);
      ctx.moveTo(sx, 382);
      ctx.lineTo(sx, 405);
      if (sx < 458) {
        ctx.moveTo(sx, 650);
        ctx.lineTo(sx, 673);
      }
      if (sx < 528) {
        ctx.moveTo(sx, 722);
        ctx.lineTo(sx, 745);
      }
      ctx.stroke();
    }

    // Organic grass blades overhanging sidewalk borders (softens rigid boundaries)
    drawGrassCurbOverhang(ctx, 0, 310, loc.width, 'horizontal', 'positive', time);
    drawGrassCurbOverhang(ctx, 0, 405, 458, 'horizontal', 'negative', time);
    drawGrassCurbOverhang(ctx, 528, 405, loc.width - 528, 'horizontal', 'negative', time);
    drawGrassCurbOverhang(ctx, 0, 650, 458, 'horizontal', 'positive', time);
    drawGrassCurbOverhang(ctx, 0, 745, 528, 'horizontal', 'negative', time);
    drawGrassCurbOverhang(ctx, 458, 405, 245, 'vertical', 'negative', time);
    drawGrassCurbOverhang(ctx, 550, 405, 270, 'vertical', 'positive', time);

    // 3. FLAGSTONE WALKWAYS DIRECTLY TO HOUSES
    const housePaths = [
      { x: 180, startY: 260, endY: 310 },
      { x: 470, startY: 260, endY: 310 },
      { x: 765, startY: 260, endY: 310 },
      { x: 995, startY: 260, endY: 310 },
      { x: 180, startY: 600, endY: 650 },
      { x: 175, startY: 720, endY: 760 },
      { x: 375, startY: 720, endY: 760 }
    ];

    housePaths.forEach((path) => {
      ctx.fillStyle = '#CBD5E1';
      ctx.fillRect(path.x - 12, path.startY, 24, path.endY - path.startY);
      ctx.strokeStyle = '#94A3B8';
      ctx.lineWidth = 1;
      ctx.strokeRect(path.x - 12, path.startY, 24, path.endY - path.startY);

      ctx.strokeStyle = '#64748B';
      for (let py = path.startY + 6; py < path.endY; py += 8) {
        ctx.beginPath();
        ctx.moveTo(path.x - 12, py);
        ctx.lineTo(path.x + 12, py);
        ctx.stroke();
      }
    });

    // Stepping stone trail to Snoopy's Doghouse in backyard
    ctx.fillStyle = '#E2E8F0';
    ctx.strokeStyle = '#94A3B8';
    ctx.lineWidth = 1.2;
    const doghouseTrail = [
      { x: 440, y: 265 }, { x: 420, y: 250 }, { x: 395, y: 240 },
      { x: 375, y: 235 }, { x: 355, y: 235 }
    ];
    doghouseTrail.forEach((stone) => {
      ctx.beginPath();
      ctx.ellipse(stone.x, stone.y, 8, 5, 0.2, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
    });

    // 4. DIRECTIONAL WOODEN SIGNPOST
    const postX = 538;
    const postY = 300;
    ctx.fillStyle = '#78350F';
    ctx.fillRect(postX, postY, 5, 26);
    ctx.fillStyle = '#FEF3C7';
    ctx.fillRect(postX - 2, postY - 14, 52, 11);
    ctx.strokeStyle = '#92400E';
    ctx.lineWidth = 1;
    ctx.strokeRect(postX - 2, postY - 14, 52, 11);
    ctx.fillStyle = '#78350F';
    ctx.font = 'bold 7.5px sans-serif';
    ctx.fillText('⬆ SNOOPY', postX + 2, postY - 5);

    ctx.fillStyle = '#FEF3C7';
    ctx.fillRect(postX - 44, postY - 2, 46, 11);
    ctx.strokeStyle = '#92400E';
    ctx.strokeRect(postX - 44, postY - 2, 46, 11);
    ctx.fillStyle = '#78350F';
    ctx.fillText('⬅ ESCUELA', postX - 41, postY + 7);

    // 5. MAILBOXES AT HOUSE CURBS
    drawMailbox(ctx, 196, 332, true);
    drawMailbox(ctx, 486, 332, true);
    drawMailbox(ctx, 781, 332, false);
    drawMailbox(ctx, 1011, 332, true);
    drawMailbox(ctx, 191, 722, true);
    drawMailbox(ctx, 391, 722, false);

    // 6. RED FIRE HYDRANT AT INTERSECTION
    drawFireHydrant(ctx, 468, 388);

    // 7. FLOWER BEDS ALONG FENCES
    drawFlowerBed(ctx, 60, 288, 200, 7);
    drawFlowerBed(ctx, 330, 288, 130, 7);
    drawFlowerBed(ctx, 670, 288, 230, 7);
    drawFlowerBed(ctx, 920, 288, 200, 7);

    // 8. WHITE PICKET FENCES
    drawPicketFence(ctx, 60, 295, 200);
    drawPicketFence(ctx, 330, 295, 130);
    drawPicketFence(ctx, 670, 295, 230);
    drawPicketFence(ctx, 920, 295, 200);
    drawPicketFence(ctx, 300, 160, 250);
  } else if (loc.id === 'pumpkin_patch') {
    // Realistic weed and grass turf base around garden
    drawRealisticLawn(ctx, 0, 0, loc.width, loc.height, time, {
      timeOfDay,
      density: 25,
      flowerDensity: 0.8,
      baseColor: '#2b4d22',
    });

    // Rich dark garden earth rows with vine tendrils
    ctx.fillStyle = '#27201D';
    for (let y = 130; y < loc.height - 80; y += 75) {
      ctx.fillRect(50, y, loc.width - 100, 42);
      ctx.strokeStyle = '#451A03';
      ctx.lineWidth = 1.5;
      ctx.strokeRect(50, y, loc.width - 100, 42);

      // Curving green vine tendrils connecting pumpkin hills
      ctx.strokeStyle = '#15803D';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(60, y + 20);
      for (let vx = 60; vx < loc.width - 70; vx += 40) {
        ctx.quadraticCurveTo(vx + 20, y + 5, vx + 40, y + 20);
      }
      ctx.stroke();
    }
  } else if (loc.id === 'lake') {
    // Magnificent organic natural Peanuts lakeshore scene
    drawRealisticLakeScene(ctx, loc, time, timeOfDay);
  } else if (loc.id === 'beach') {
    // Magnificent hand-crafted Schulz natural beach scene
    drawRealisticBeachScene(ctx, loc, time, timeOfDay, playerPos);
  } else if (loc.id === 'baseball_field') {
    // Sandlot baseball field with diamond, dugouts, scoreboard, shed & benches
    drawRealisticBaseballFieldScene(ctx, loc, time, timeOfDay, playerPos);
  } else if (loc.id === 'summer_camp') {
    // Authentic summer camp with cabins, lake, pier, waterfall, overlook & campfire
    drawDetailedSummerCampScene(ctx, loc, time, timeOfDay, playerPos);
  } else if (loc.id === 'daisy_hill') {
    // Vast, idyllic rolling wildflower meadow with dense daisies and swaying tall grass
    drawRealisticLawn(ctx, 0, 0, loc.width, loc.height, time, {
      timeOfDay,
      density: 38,
      flowerDensity: 2.8,
      cloverDensity: 2.2,
      stripeWidth: 60,
    });
  } else if (loc.id === 'ice_rink') {
    // Grand winter ice rink arena with snowy lawn & rustic dasher boards
    drawRealisticLawn(ctx, 0, 0, loc.width, loc.height, time, {
      timeOfDay,
      density: 12,
      baseColor: '#E2E8F0',
    });
    drawIceRinkPerimeter(ctx, 50, 50, loc.width - 100, loc.height - 100, time);
  } else if (loc.category === 'exterior') {
    // Any other outdoor environment
    drawRealisticLawn(ctx, 0, 0, loc.width, loc.height, time, {
      timeOfDay,
      density: 30,
      flowerDensity: 1.2,
      cloverDensity: 1.2,
    });
  } else if (loc.category === 'interior') {
    // Base foundational flooring - custom stylized parquet & tiles are drawn per house in InteriorRenderer
    ctx.fillStyle = loc.backgroundTheme || '#F5EBE0';
    ctx.fillRect(0, 0, loc.width, loc.height);
  }
}

function drawCollidersAndDecor(
  ctx: CanvasRenderingContext2D,
  loc: LocationData,
  time: number,
  timeOfDay: TimeOfDay = 'day',
  sortableItems?: YSortItem[]
) {
  if (loc.id === 'neighborhood') {
    if (sortableItems) {
      // Depth-sorted suburban houses
      sortableItems.push({
        baseY: 260,
        draw: (c) => drawSuburbanHouse(c, 100, 120, 160, 140, '#FDE68A', '#B45309', 'CASA DE ARI', timeOfDay, time)
      });
      sortableItems.push({
        baseY: 260,
        draw: (c) => drawSuburbanHouse(c, 380, 120, 180, 140, '#FEF08A', '#991B1B', 'CHARLIE BROWN', timeOfDay, time)
      });
      sortableItems.push({
        baseY: 235,
        draw: (c) => drawDoghouseExterior(c, 330, 190, 50, 45, time)
      });
      sortableItems.push({
        baseY: 260,
        draw: (c) => drawSuburbanHouse(c, 680, 120, 170, 140, '#BFDBFE', '#1E40AF', 'VAN PELT', timeOfDay, time)
      });
      sortableItems.push({
        baseY: 260,
        draw: (c) => drawSuburbanHouse(c, 920, 120, 150, 140, '#FED7AA', '#7C2D12', 'SCHROEDER', timeOfDay, time)
      });
      sortableItems.push({
        baseY: 900,
        draw: (c) => drawSuburbanHouse(c, 100, 760, 150, 140, '#86EFAC', '#15803D', 'P. PATTY', timeOfDay, time)
      });
      sortableItems.push({
        baseY: 900,
        draw: (c) => drawSuburbanHouse(c, 300, 760, 150, 140, '#DDD6FE', '#6D28D9', 'MARCIE', timeOfDay, time)
      });
      sortableItems.push({
        baseY: 900,
        draw: (c) => drawSuburbanHouse(c, 520, 760, 150, 140, '#DBEAFE', '#1D4ED8', 'FRANKLIN', timeOfDay, time)
      });
      sortableItems.push({
        baseY: 900,
        draw: (c) => drawSuburbanHouse(c, 1150, 760, 150, 140, '#E7E5E4', '#78716C', 'PIG-PEN', timeOfDay, time)
      });
      sortableItems.push({
        baseY: 600,
        draw: (c) => drawSchoolBuilding(c, 80, 440, 200, 160, timeOfDay)
      });

      // The Thinking Wall
      sortableItems.push({
        baseY: 442,
        draw: (c) => drawThinkingWall(c, 720, 420, 140, 22)
      });

      // Lucy's 5¢ Booth
      sortableItems.push({
        baseY: 340,
        draw: (c) => drawLucyBooth(c, 1040, 300, 55, 40)
      });

      // Kite-Eating Tree
      sortableItems.push({
        baseY: 520,
        draw: (c) => drawKiteTree(c, 580, 440, time)
      });

      // Peanuts Trees with ground contact baseY
      const neighborhoodTrees = [
        { x: 60, y: 180, r: 40 },
        { x: 280, y: 250, r: 35 },
        { x: 620, y: 220, r: 38 },
        { x: 880, y: 240, r: 36 },
        { x: 890, y: 450, r: 45 },
        { x: 60, y: 570, r: 38 },
        { x: 570, y: 850, r: 42 },
        { x: 1080, y: 740, r: 44 },
        { x: 1180, y: 840, r: 40 },
      ];
      neighborhoodTrees.forEach((t) => {
        sortableItems.push({
          baseY: t.y + t.r * 1.6,
          draw: (c) => drawPeanutsTree(c, t.x, t.y, t.r, time)
        });
      });

      // Street Lamps
      const neighborhoodLamps = [
        { x: 220, y: 310 },
        { x: 520, y: 310 },
        { x: 840, y: 310 },
        { x: 1120, y: 310 },
        { x: 460, y: 650 },
        { x: 220, y: 735 },
        { x: 420, y: 735 },
      ];
      neighborhoodLamps.forEach((l) => {
        sortableItems.push({
          baseY: l.y + 20,
          draw: (c) => drawStreetLamp(c, l.x, l.y, timeOfDay)
        });
      });

      // Flat ground items
      drawBaseballDiamond(ctx, 680, 760);
      drawIceRinkPerimeter(ctx, 940, 440, 220, 165, time);
    } else {
      // Fallback
      drawSuburbanHouse(ctx, 100, 120, 160, 140, '#FDE68A', '#B45309', 'CASA DE ARI', timeOfDay, time);
      drawSuburbanHouse(ctx, 380, 120, 180, 140, '#FEF08A', '#991B1B', 'CHARLIE BROWN', timeOfDay, time);
      drawDoghouseExterior(ctx, 330, 190, 50, 45, time);
      drawSuburbanHouse(ctx, 680, 120, 170, 140, '#BFDBFE', '#1E40AF', 'VAN PELT', timeOfDay, time);
      drawSuburbanHouse(ctx, 920, 120, 150, 140, '#FED7AA', '#7C2D12', 'SCHROEDER', timeOfDay, time);
      drawSuburbanHouse(ctx, 100, 760, 150, 140, '#86EFAC', '#15803D', 'P. PATTY', timeOfDay, time);
      drawSuburbanHouse(ctx, 300, 760, 150, 140, '#DDD6FE', '#6D28D9', 'MARCIE', timeOfDay, time);
      drawSuburbanHouse(ctx, 520, 760, 150, 140, '#DBEAFE', '#1D4ED8', 'FRANKLIN', timeOfDay, time);
      drawSuburbanHouse(ctx, 1150, 760, 150, 140, '#E7E5E4', '#78716C', 'PIG-PEN', timeOfDay, time);
      drawSchoolBuilding(ctx, 80, 440, 200, 160, timeOfDay);
      drawThinkingWall(ctx, 720, 420, 140, 22);
      drawKiteTree(ctx, 580, 440, time);
      drawBaseballDiamond(ctx, 680, 760);
      drawIceRinkPerimeter(ctx, 940, 440, 220, 165, time);
      drawLucyBooth(ctx, 1040, 300, 55, 40);
      drawPeanutsTree(ctx, 60, 180, 40, time);
      drawPeanutsTree(ctx, 280, 250, 35, time);
      drawPeanutsTree(ctx, 620, 220, 38, time);
      drawPeanutsTree(ctx, 880, 240, 36, time);
      drawPeanutsTree(ctx, 890, 450, 45, time);
      drawPeanutsTree(ctx, 60, 570, 38, time);
      drawPeanutsTree(ctx, 570, 850, 42, time);
      drawPeanutsTree(ctx, 1080, 740, 44, time);
      drawPeanutsTree(ctx, 1180, 840, 40, time);
      drawStreetLamp(ctx, 220, 310, timeOfDay);
      drawStreetLamp(ctx, 520, 310, timeOfDay);
      drawStreetLamp(ctx, 840, 310, timeOfDay);
      drawStreetLamp(ctx, 1120, 310, timeOfDay);
      drawStreetLamp(ctx, 460, 650, timeOfDay);
      drawStreetLamp(ctx, 220, 735, timeOfDay);
      drawStreetLamp(ctx, 420, 735, timeOfDay);
    }
  } else if (loc.id === 'house_ari') {
    drawHouseAri(ctx, loc, time, timeOfDay, sortableItems);
  } else if (loc.id === 'house_charlie_brown') {
    drawHouseCharlieBrown(ctx, loc, time, timeOfDay, sortableItems);
  } else if (loc.id === 'doghouse_interior') {
    drawDoghouseInterior(ctx, loc, time, timeOfDay, sortableItems);
  } else if (loc.id === 'house_van_pelt') {
    drawHouseVanPelt(ctx, loc, time, timeOfDay, sortableItems);
  } else if (loc.id === 'house_schroeder') {
    drawHouseSchroeder(ctx, loc, time, timeOfDay, sortableItems);
  } else if (loc.id === 'house_peppermint_patty') {
    drawHousePeppermintPatty(ctx, loc, time, timeOfDay, sortableItems);
  } else if (loc.id === 'house_marcie') {
    drawHouseMarcie(ctx, loc, time, timeOfDay, sortableItems);
  } else if (loc.id === 'house_franklin') {
    drawHouseFranklin(ctx, loc, time, timeOfDay, sortableItems);
  } else if (loc.id === 'house_pigpen') {
    drawHousePigpen(ctx, loc, time, timeOfDay, sortableItems);
  } else if (loc.id === 'school') {
    drawSchoolInterior(ctx, loc, time, timeOfDay, sortableItems);
  } else if (loc.id === 'pumpkin_patch') {
    drawPumpkinPatchField(ctx, loc.width, loc.height, time);
  } else if (loc.id === 'daisy_hill') {
    if (sortableItems) {
      sortableItems.push({
        baseY: 280,
        draw: (c) => drawRedBarn(c, 320, 120, 240, 160)
      });
      sortableItems.push({
        baseY: 320,
        draw: (c) => drawHayBales(c, 380, 280, 80, 40)
      });
    } else {
      drawRedBarn(ctx, 320, 120, 240, 160);
      drawHayBales(ctx, 380, 280, 80, 40);
    }
  }
}

function drawTriggers(
  ctx: CanvasRenderingContext2D,
  loc: LocationData,
  activeTrigger: InteractiveTrigger | null,
  time: number
) {
  loc.triggers.forEach((trig) => {
    const isActive = activeTrigger?.id === trig.id;

    // 1. VISIBLE EXIT DOORS ("puerta visible para salir de los lugares")
    if (trig.actionType === 'door_exit') {
      ctx.save();

      // Floor threshold light spill (outdoor light casting inward)
      const doorLight = ctx.createLinearGradient(trig.x, trig.y - 10, trig.x, trig.y + trig.h + 15);
      doorLight.addColorStop(0, 'rgba(254, 240, 138, 0.55)');
      doorLight.addColorStop(0.5, 'rgba(251, 191, 36, 0.3)');
      doorLight.addColorStop(1, 'rgba(251, 191, 36, 0)');
      ctx.fillStyle = doorLight;
      ctx.beginPath();
      ctx.moveTo(trig.x - 6, trig.y + trig.h);
      ctx.lineTo(trig.x + trig.w + 6, trig.y + trig.h);
      ctx.lineTo(trig.x + trig.w + 16, trig.y + trig.h + 20);
      ctx.lineTo(trig.x - 16, trig.y + trig.h + 20);
      ctx.closePath();
      ctx.fill();

      // Outer wooden door frame & casing
      ctx.fillStyle = '#451A03'; // deep mahogany
      ctx.fillRect(trig.x - 5, trig.y - 28, trig.w + 10, trig.h + 28);
      ctx.strokeStyle = '#292524';
      ctx.lineWidth = 1.5;
      ctx.strokeRect(trig.x - 5, trig.y - 28, trig.w + 10, trig.h + 28);

      // Door recess
      ctx.fillStyle = '#1C1917';
      ctx.fillRect(trig.x, trig.y - 24, trig.w, trig.h + 24);

      // The Door itself (rich wood panels)
      ctx.fillStyle = '#78350F';
      ctx.fillRect(trig.x + 2, trig.y - 22, trig.w - 4, trig.h + 22);
      ctx.strokeStyle = '#57534E';
      ctx.lineWidth = 1;
      ctx.strokeRect(trig.x + 2, trig.y - 22, trig.w - 4, trig.h + 22);

      // Upper window transom on the door showing outdoor light
      ctx.fillStyle = '#FEF08A';
      ctx.fillRect(trig.x + 6, trig.y - 18, trig.w - 12, 14);
      ctx.strokeStyle = '#78350F';
      ctx.lineWidth = 1;
      ctx.strokeRect(trig.x + 6, trig.y - 18, trig.w - 12, 14);
      // Window panes
      ctx.beginPath();
      ctx.moveTo(trig.x + trig.w / 2, trig.y - 18);
      ctx.lineTo(trig.x + trig.w / 2, trig.y - 4);
      ctx.stroke();

      // Lower door panel
      ctx.fillStyle = '#5A2609';
      ctx.fillRect(trig.x + 6, trig.y, trig.w - 12, trig.h - 4);
      ctx.strokeStyle = '#451A03';
      ctx.strokeRect(trig.x + 6, trig.y, trig.w - 12, trig.h - 4);

      // Polished brass doorknob
      ctx.fillStyle = '#FBBF24';
      ctx.beginPath();
      ctx.arc(trig.x + trig.w - 8, trig.y + trig.h / 2 - 2, 3, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#B45309';
      ctx.lineWidth = 0.8;
      ctx.stroke();

      // Brass kickplate at door base
      ctx.fillStyle = '#D97706';
      ctx.fillRect(trig.x + 3, trig.y + trig.h - 5, trig.w - 6, 5);

      // ILLUMINATED OVERHEAD EXIT SIGN ("SALIR ⬇")
      const signW = Math.max(trig.w + 14, 58);
      const signX = trig.x + trig.w / 2 - signW / 2;
      const signY = trig.y - 44;

      // Glowing border & sign body
      ctx.fillStyle = '#166534'; // emergency/exit green
      ctx.beginPath();
      ctx.roundRect(signX, signY, signW, 15, 3);
      ctx.fill();
      ctx.strokeStyle = '#4ADE80';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // Sign text with subtle pulse
      ctx.fillStyle = '#FFFFFF';
      ctx.font = 'bold 9px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('🚪 [A] SALIR ⬇', signX + signW / 2, signY + 11);
      ctx.textAlign = 'start';

      // WOVEN FLOOR WELCOME / EXIT MAT
      const matW = trig.w + 10;
      const matH = 14;
      const matX = trig.x - 5;
      const matY = trig.y + trig.h + 2;

      ctx.fillStyle = '#44403C';
      ctx.beginPath();
      ctx.roundRect(matX, matY, matW, matH, 3);
      ctx.fill();
      ctx.strokeStyle = '#D97706';
      ctx.lineWidth = 1.2;
      ctx.stroke();

      // Mat text: "A - SALIR"
      ctx.fillStyle = '#FEF08A';
      ctx.font = 'bold 8px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('A - SALIR', matX + matW / 2, matY + 10);
      ctx.textAlign = 'start';

      ctx.restore();
    } else if (trig.actionType === 'path_transition' || trig.id.startsWith('trail_') || trig.id.includes('_trail')) {
      // VISIBLE PATH TRANSITION SIGNPOST & STEPPING STONES
      ctx.save();
      // Stepping stones on ground
      ctx.fillStyle = '#CBD5E1';
      ctx.strokeStyle = '#94A3B8';
      ctx.lineWidth = 1;
      for (let i = 0; i < 3; i++) {
        const sx = trig.x + 8 + i * 16;
        const sy = trig.y + 6;
        ctx.beginPath();
        ctx.ellipse(sx, sy, 7, 5, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
      }

      // Wooden rustic arrow signpost beside path
      const postX = trig.x - 4;
      const postY = trig.y - 20;
      ctx.fillStyle = '#78350F';
      ctx.fillRect(postX + 4, postY, 4, 30); // post
      // Signboard
      const signLabel = trig.name.includes('Lago')
        ? 'LAGO ➔'
        : trig.name.includes('Playa')
        ? 'PLAYA ➔'
        : trig.name.includes('Daisy') || trig.name.includes('Granja')
        ? '⬅ GRANJA'
        : trig.name.includes('Campamento')
        ? 'CAMP ⬆'
        : trig.name.includes('Béisbol')
        ? 'BÉISBOL ⬇'
        : 'SENDERO ➔';
      ctx.fillStyle = '#FEF3C7';
      ctx.beginPath();
      ctx.roundRect(postX - 14, postY - 2, 54, 14, 2);
      ctx.fill();
      ctx.strokeStyle = '#92400E';
      ctx.lineWidth = 1;
      ctx.stroke();
      ctx.fillStyle = '#78350F';
      ctx.font = 'bold 7.5px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(signLabel, postX + 13, postY + 8);
      ctx.textAlign = 'start';
      ctx.restore();
    } else if (trig.actionType === 'door_enter') {
      // VISIBLE ENTRANCE THRESHOLD & WELCOME MAT
      ctx.save();
      // Woven welcome mat
      ctx.fillStyle = '#44403C';
      ctx.beginPath();
      ctx.roundRect(trig.x, trig.y + trig.h - 10, trig.w, 10, 2);
      ctx.fill();
      ctx.strokeStyle = '#FBBF24';
      ctx.lineWidth = 1;
      ctx.stroke();

      ctx.fillStyle = '#FEF08A';
      ctx.font = 'bold 8px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('ENTRAR ⬆', trig.x + trig.w / 2, trig.y + trig.h - 2);
      ctx.textAlign = 'start';
      ctx.restore();
    }

    // 2. ACTIVE INTERACTION PULSE & ACTION BUBBLE
    if (isActive) {
      // Golden animated pulsing ring around trigger
      ctx.save();
      ctx.strokeStyle = '#F59E0B';
      ctx.lineWidth = 2.5;
      const pulse = Math.sin(time * 6) * 3.5;
      ctx.strokeRect(trig.x - pulse, trig.y - pulse, trig.w + pulse * 2, trig.h + pulse * 2);

      // Floating action bubble above trigger
      ctx.fillStyle = '#18181B';
      const prompt = trig.promptA || trig.promptB || 'Interactuar';
      ctx.font = 'bold 11px sans-serif';
      const textW = ctx.measureText(prompt).width;

      const bubbleX = trig.x + trig.w / 2 - textW / 2 - 10;
      const bubbleY = trig.y - 32;
      const bubbleW = textW + 20;
      const bubbleH = 22;

      ctx.beginPath();
      ctx.roundRect(bubbleX, bubbleY, bubbleW, bubbleH, 7);
      ctx.fill();
      ctx.strokeStyle = '#FBBF24';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // Speech bubble pointer triangle
      ctx.beginPath();
      ctx.moveTo(trig.x + trig.w / 2 - 4, bubbleY + bubbleH);
      ctx.lineTo(trig.x + trig.w / 2 + 4, bubbleY + bubbleH);
      ctx.lineTo(trig.x + trig.w / 2, bubbleY + bubbleH + 4);
      ctx.closePath();
      ctx.fillStyle = '#18181B';
      ctx.fill();

      // Text inside bubble
      ctx.fillStyle = '#FEF08A';
      ctx.fillText(prompt, bubbleX + 10, bubbleY + 15);
      ctx.restore();
    }
  });
}

function drawSocialBubble(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  socialState: NonNullable<CharacterNpc['socialState']>,
  time: number
) {
  ctx.save();
  const floatY = Math.sin(time * 3) * 2;
  const bubbleY = y - 36 + floatY;

  if (socialState.isSpeaker && socialState.text) {
    // Comic speech balloon with dialogue text
    ctx.font = 'bold 10px sans-serif';
    const padding = 10;
    const textMetrics = ctx.measureText(socialState.text);
    const bubbleW = Math.min(Math.max(textMetrics.width + padding * 2, 80), 170);
    const bubbleH = 24;
    const bubbleX = x - bubbleW / 2 + 12;

    // Drop shadow
    ctx.fillStyle = 'rgba(0, 0, 0, 0.22)';
    ctx.beginPath();
    ctx.roundRect(bubbleX + 2, bubbleY + 2, bubbleW, bubbleH, 7);
    ctx.fill();

    // Warm comic parchment balloon
    ctx.fillStyle = '#FFFBEB';
    ctx.beginPath();
    ctx.roundRect(bubbleX, bubbleY, bubbleW, bubbleH, 7);
    ctx.fill();
    ctx.strokeStyle = '#78350F';
    ctx.lineWidth = 1.6;
    ctx.stroke();

    // Speech triangle pointer pointing to character's head
    ctx.beginPath();
    ctx.moveTo(x + 8, bubbleY + bubbleH);
    ctx.lineTo(x + 12, bubbleY + bubbleH + 6);
    ctx.lineTo(x + 16, bubbleY + bubbleH);
    ctx.closePath();
    ctx.fillStyle = '#FFFBEB';
    ctx.fill();
    ctx.stroke();

    // Fill triangle interior over seam
    ctx.beginPath();
    ctx.moveTo(x + 9, bubbleY + bubbleH - 1);
    ctx.lineTo(x + 12, bubbleY + bubbleH + 5);
    ctx.lineTo(x + 15, bubbleY + bubbleH - 1);
    ctx.fillStyle = '#FFFBEB';
    ctx.fill();

    // Text inside balloon
    ctx.fillStyle = '#451A03';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    let displayText = socialState.text;
    if (textMetrics.width > 145) {
      displayText = displayText.slice(0, 27) + '...';
    }
    ctx.fillText(displayText, bubbleX + bubbleW / 2, bubbleY + bubbleH / 2);

    // Emote badge on corner
    if (socialState.emote) {
      ctx.font = '12px sans-serif';
      ctx.fillText(socialState.emote, bubbleX + bubbleW - 4, bubbleY - 2);
    }
  } else if (socialState.emote) {
    // Listener reaction bubble: rounded reaction cloud
    const bubbleR = 12;
    const bubbleX = x + 12;
    const bubbleCenterY = bubbleY + 12;

    ctx.fillStyle = 'rgba(0, 0, 0, 0.18)';
    ctx.beginPath();
    ctx.arc(bubbleX + 1.5, bubbleCenterY + 1.5, bubbleR, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#FEF08A';
    ctx.beginPath();
    ctx.arc(bubbleX, bubbleCenterY, bubbleR, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#CA8A04';
    ctx.lineWidth = 1.4;
    ctx.stroke();

    // Mini trailing reaction dots
    ctx.beginPath();
    ctx.arc(bubbleX - 3, bubbleCenterY + bubbleR + 3, 2.5, 0, Math.PI * 2);
    ctx.arc(bubbleX - 6, bubbleCenterY + bubbleR + 7, 1.5, 0, Math.PI * 2);
    ctx.fillStyle = '#FEF08A';
    ctx.fill();
    ctx.stroke();

    // Emote inside
    ctx.font = '13px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(socialState.emote, bubbleX, bubbleCenterY + 1);
  }
  ctx.restore();
}

function drawAmbientCharacterEmotes(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  charId: string,
  time: number
) {
  if (charId === 'schroeder') {
    // Floating musical notes while composing/walking
    const notePhase = (time * 1.5) % 4;
    if (notePhase < 3) {
      const noteY = y - 24 - notePhase * 8;
      const noteX = x + 16 + Math.sin(time * 3) * 5;
      const alpha = Math.max(0, 1 - notePhase / 3);
      ctx.save();
      ctx.globalAlpha = alpha;
      ctx.fillStyle = '#6366F1';
      ctx.font = 'bold 13px sans-serif';
      ctx.fillText(notePhase > 1.5 ? '♫' : '♪', noteX, noteY);
      ctx.restore();
    }
  } else if (charId === 'woodstock') {
    // Woodstock happy yellow chirps
    const chirpPhase = (time * 2) % 3;
    if (chirpPhase < 2) {
      const cy = y - 18 - chirpPhase * 6;
      const cx = x + 10 + Math.sin(time * 4) * 4;
      const alpha = Math.max(0, 1 - chirpPhase / 2);
      ctx.save();
      ctx.globalAlpha = alpha;
      ctx.fillStyle = '#D97706';
      ctx.font = 'bold 11px sans-serif';
      ctx.fillText('♪', cx, cy);
      ctx.restore();
    }
  } else if (charId === 'linus') {
    // Subtle comforting blanket sparkle
    const sparkleTime = (time * 1.2) % 5;
    if (sparkleTime < 1.5) {
      ctx.save();
      ctx.globalAlpha = Math.sin((sparkleTime / 1.5) * Math.PI) * 0.8;
      ctx.fillStyle = '#38BDF8';
      ctx.font = '10px sans-serif';
      ctx.fillText('✨', x + 20, y + 16);
      ctx.restore();
    }
  }
}

function drawNPCs(
  ctx: CanvasRenderingContext2D,
  currentLocId: string,
  time: number,
  timeOfDay: TimeOfDay = 'day',
  charactersList?: CharacterNpc[]
) {
  const characters = charactersList || getActiveCharactersForTime(timeOfDay);

  // Pass 1: Render character bodies with dynamic biomechanical walking
  characters.forEach((npc) => {
    if (npc.locationId !== currentLocId) return;

    ctx.save();
    ctx.translate(npc.x, npc.y);

    if (npc.id === 'snoopy') {
      // Snoopy walking & interacting on ground
      drawSnoopy(ctx, npc, time, timeOfDay);
    } else if (npc.id === 'woodstock') {
      // Woodstock hopping & fluttering on ground
      drawWoodstock(ctx, npc, time, timeOfDay);
    } else {
      // Standard Peanuts child character
      drawPeanutsChild(ctx, npc, time, timeOfDay);
    }

    ctx.restore();
  });

  // Pass 2: Render social comic speech balloons, dialogue bubbles, and ambient character emotes
  characters.forEach((npc) => {
    if (npc.locationId !== currentLocId) return;

    if (npc.socialState) {
      drawSocialBubble(ctx, npc.x, npc.y, npc.socialState, time);
    } else {
      drawAmbientCharacterEmotes(ctx, npc.x, npc.y, npc.id, time);
    }
  });
}

function drawPlayerAri(
  ctx: CanvasRenderingContext2D,
  pos: Position,
  dir: 'down' | 'up' | 'left' | 'right',
  walkStep: number,
  time: number,
  timeOfDay: TimeOfDay = 'day'
) {
  ctx.save();
  ctx.translate(pos.x, pos.y);

  // Soft ambient contact shadow on ground
  ctx.fillStyle = 'rgba(0, 0, 0, 0.25)';
  ctx.beginPath();
  ctx.ellipse(12, 38, 10, 4, 0, 0, Math.PI * 2);
  ctx.fill();

  // Biomechanical human gait cycles
  const isMoving = Math.abs(Math.sin(walkStep)) > 0.05;
  const legSwing = Math.sin(walkStep) * 4;
  const armSwing = -legSwing * 0.9;
  const verticalBob = isMoving ? Math.abs(Math.sin(walkStep * 2)) * 1.5 : Math.sin(time * 2) * 0.4;
  const hairSway = Math.sin(walkStep * 1.5 + time * 2) * 1.4;

  // Human color palette
  const skinTone = '#FED7AA'; // Warm natural peach
  const skinShadow = '#FDBA74';
  const skinBlush = 'rgba(251, 113, 133, 0.4)';
  const hairBody = '#18181B';
  const hairHighlight = '#3F3F46';
  const jacketBlack = '#18181B';
  const jacketHighlight = '#27272A';
  const jacketSeam = '#09090B';
  const zipperSilver = '#E4E4E7';
  const khakiBase = '#D4B489';
  const khakiShadow = '#B8966C';
  const khakiHighlight = '#E8CBA3';
  const shoeCanvas = '#18181B';
  const shoeRubber = '#FFFFFF';
  const shoeAccent = '#E4E4E7';

  // 1. LOWER BODY: HUMAN LEGS, BAGGY KHAKIS & SNEAKERS
  if (dir === 'left' || dir === 'right') {
    const isRight = dir === 'right';
    const strideFront = legSwing * 1.1;
    const strideBack = -legSwing * 1.1;

    // Back leg (Khaki pants with natural drape)
    ctx.fillStyle = khakiShadow;
    ctx.beginPath();
    ctx.roundRect(isRight ? 8 + strideBack : 11 - strideBack, 23 - verticalBob * 0.3, 6.5, 12.5, [2, 2, 4, 4]);
    ctx.fill();

    // Back shoe (Skate sneaker with white vulcanized sole & toe cap)
    ctx.fillStyle = shoeCanvas;
    ctx.fillRect(isRight ? 7 + strideBack : 10 - strideBack, 34, 8.5, 3.8);
    // White rubber sole
    ctx.fillStyle = shoeRubber;
    ctx.fillRect(isRight ? 6.5 + strideBack : 9.5 - strideBack, 36.8, 9.5, 1.4);
    // White toe bumper
    ctx.beginPath();
    ctx.arc(isRight ? 14.5 + strideBack : 10.5 - strideBack, 35.5, 2.2, 0, Math.PI * 2);
    ctx.fill();

    // Front leg (Khaki pants with fabric folds)
    ctx.fillStyle = khakiBase;
    ctx.beginPath();
    ctx.roundRect(isRight ? 10 + strideFront : 9 - strideFront, 22.5 - verticalBob * 0.3, 7, 13, [3, 3, 5, 5]);
    ctx.fill();

    // Fabric crease highlights
    ctx.strokeStyle = khakiHighlight;
    ctx.lineWidth = 0.8;
    ctx.beginPath();
    ctx.moveTo(isRight ? 11 + strideFront : 14 - strideFront, 26);
    ctx.lineTo(isRight ? 15 + strideFront : 10 - strideFront, 28);
    ctx.stroke();

    // Front shoe
    ctx.fillStyle = shoeCanvas;
    ctx.fillRect(isRight ? 9 + strideFront : 7.5 - strideFront, 34.2, 9, 3.8);
    ctx.fillStyle = shoeRubber;
    ctx.fillRect(isRight ? 8.5 + strideFront : 7 - strideFront, 37, 10, 1.4);
    // White toe bumper
    ctx.beginPath();
    ctx.arc(isRight ? 16.5 + strideFront : 8.5 - strideFront, 35.8, 2.3, 0, Math.PI * 2);
    ctx.fill();
    // Subtle white laces
    ctx.strokeStyle = shoeAccent;
    ctx.lineWidth = 0.9;
    ctx.beginPath();
    ctx.moveTo(isRight ? 12 + strideFront : 12.5 - strideFront, 34.6);
    ctx.lineTo(isRight ? 14 + strideFront : 10.5 - strideFront, 34.6);
    ctx.stroke();
  } else {
    // Facing DOWN or UP: Human two-legged stance with natural hip separation
    const leftLegOffset = dir === 'down' ? legSwing * 0.8 : -legSwing * 0.8;
    const rightLegOffset = -leftLegOffset;

    // Left pant leg (baggy khaki)
    ctx.fillStyle = khakiBase;
    ctx.beginPath();
    ctx.roundRect(6, 23.5 + leftLegOffset * 0.5 - verticalBob * 0.3, 5.5, 12, [3, 3, 4, 4]);
    ctx.fill();

    // Right pant leg (baggy khaki)
    ctx.beginPath();
    ctx.roundRect(12.5, 23.5 + rightLegOffset * 0.5 - verticalBob * 0.3, 5.5, 12, [3, 3, 4, 4]);
    ctx.fill();

    // Inseam & trouser fold shadow
    ctx.strokeStyle = khakiShadow;
    ctx.lineWidth = 0.9;
    ctx.beginPath();
    ctx.moveTo(12, 24);
    ctx.lineTo(12, 33);
    ctx.stroke();

    // Left sneaker
    ctx.fillStyle = shoeCanvas;
    ctx.beginPath();
    ctx.roundRect(5.5, 34.5 + leftLegOffset * 0.5, 6, 4, [2, 2, 2, 2]);
    ctx.fill();
    ctx.fillStyle = shoeRubber;
    ctx.fillRect(5.2, 37.2 + leftLegOffset * 0.5, 6.6, 1.3);
    if (dir === 'down') {
      // White toe cap on front view
      ctx.beginPath();
      ctx.ellipse(8.5, 36.5 + leftLegOffset * 0.5, 2.5, 1.4, 0, 0, Math.PI * 2);
      ctx.fill();
    }

    // Right sneaker
    ctx.fillStyle = shoeCanvas;
    ctx.beginPath();
    ctx.roundRect(12.5, 34.5 + rightLegOffset * 0.5, 6, 4, [2, 2, 2, 2]);
    ctx.fill();
    ctx.fillStyle = shoeRubber;
    ctx.fillRect(12.2, 37.2 + rightLegOffset * 0.5, 6.6, 1.3);
    if (dir === 'down') {
      ctx.beginPath();
      ctx.ellipse(15.5, 36.5 + rightLegOffset * 0.5, 2.5, 1.4, 0, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // 2. TORSO & BLACK HOODIE (Natural sloped shoulders & zipper details)
  ctx.save();
  ctx.translate(0, -verticalBob);

  // Black hoodie body
  ctx.fillStyle = jacketBlack;
  ctx.beginPath();
  // Natural human shoulder slope and waist taper
  ctx.moveTo(4.5, 18.5);
  ctx.quadraticCurveTo(12, 16.5, 19.5, 18.5); // Shoulders
  ctx.lineTo(18.5, 25.5); // Right waist
  ctx.lineTo(5.5, 25.5);  // Left waist
  ctx.closePath();
  ctx.fill();

  // Hoodie waistband ribbing
  ctx.fillStyle = jacketHighlight;
  ctx.fillRect(5.5, 24.5, 13, 1.5);

  if (dir === 'down') {
    // Silver zipper track
    ctx.strokeStyle = zipperSilver;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(12, 17.5);
    ctx.lineTo(12, 24.5);
    ctx.stroke();

    // Metal zipper slider pull
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(11.2, 19, 1.6, 2.2);

    // Subtle pocket seams
    ctx.strokeStyle = jacketSeam;
    ctx.lineWidth = 0.8;
    ctx.beginPath();
    ctx.moveTo(7.5, 22);
    ctx.lineTo(9.5, 24.5);
    ctx.moveTo(16.5, 22);
    ctx.lineTo(14.5, 24.5);
    ctx.stroke();

    // Hoodie collar folds at neck
    ctx.fillStyle = jacketHighlight;
    ctx.beginPath();
    ctx.moveTo(9, 17);
    ctx.quadraticCurveTo(12, 18.5, 15, 17);
    ctx.lineTo(14, 18);
    ctx.quadraticCurveTo(12, 19.2, 10, 18);
    ctx.closePath();
    ctx.fill();
  } else if (dir === 'up') {
    // Back of hoodie with draped hood fabric
    ctx.fillStyle = jacketHighlight;
    ctx.beginPath();
    ctx.moveTo(7, 17);
    ctx.quadraticCurveTo(12, 22, 17, 17);
    ctx.quadraticCurveTo(12, 19.5, 7, 17);
    ctx.fill();
    ctx.strokeStyle = jacketSeam;
    ctx.lineWidth = 0.8;
    ctx.stroke();
  } else {
    // Side profile hoodie
    const isRight = dir === 'right';
    ctx.fillStyle = jacketHighlight;
    ctx.beginPath();
    ctx.arc(isRight ? 10 : 14, 18.5, 2.5, 0, Math.PI * 2);
    ctx.fill();
  }

  // 3. HUMAN ARMS & HANDS (Anatomical arm segments + articulated hands)
  if (dir === 'down') {
    // Left arm
    const lSwing = armSwing;
    ctx.fillStyle = jacketBlack;
    ctx.beginPath();
    ctx.roundRect(2.5, 18 + lSwing * 0.4, 3.6, 7, [2, 2, 2, 2]);
    ctx.fill();
    // Left hand (natural peach skin with thumb & fingers gesture)
    ctx.fillStyle = skinTone;
    ctx.beginPath();
    ctx.ellipse(4.2, 25.5 + lSwing * 0.4, 1.8, 2.2, 0.1, 0, Math.PI * 2);
    ctx.fill();

    // Right arm
    const rSwing = -armSwing;
    ctx.fillStyle = jacketBlack;
    ctx.beginPath();
    ctx.roundRect(17.9, 18 + rSwing * 0.4, 3.6, 7, [2, 2, 2, 2]);
    ctx.fill();
    // Right hand
    ctx.fillStyle = skinTone;
    ctx.beginPath();
    ctx.ellipse(19.8, 25.5 + rSwing * 0.4, 1.8, 2.2, -0.1, 0, Math.PI * 2);
    ctx.fill();
  } else if (dir === 'up') {
    // Rear view arms
    ctx.fillStyle = jacketBlack;
    ctx.beginPath();
    ctx.roundRect(2.5, 18 - armSwing * 0.4, 3.5, 7, [2, 2, 2, 2]);
    ctx.fill();
    ctx.beginPath();
    ctx.roundRect(18, 18 + armSwing * 0.4, 3.5, 7, [2, 2, 2, 2]);
    ctx.fill();
  } else {
    // Side view swinging arm
    const isRight = dir === 'right';
    const sArmSwing = isRight ? -legSwing * 1.1 : legSwing * 1.1;

    ctx.fillStyle = jacketBlack;
    ctx.beginPath();
    ctx.roundRect(isRight ? 9 + sArmSwing * 0.6 : 11 - sArmSwing * 0.6, 18, 4, 7.5, [2, 2, 2, 2]);
    ctx.fill();

    // Hand with human thumb
    ctx.fillStyle = skinTone;
    ctx.beginPath();
    ctx.ellipse(isRight ? 11 + sArmSwing * 0.6 : 13 - sArmSwing * 0.6, 26, 1.8, 2.2, 0, 0, Math.PI * 2);
    ctx.fill();
  }

  // 4. HUMAN NECK & HEAD
  // Neck
  ctx.fillStyle = skinShadow;
  ctx.fillRect(10.5, 14, 3, 2.5);

  // Realistic oval human head with soft jawline
  ctx.fillStyle = skinTone;
  ctx.beginPath();
  if (dir === 'down' || dir === 'up') {
    ctx.ellipse(12, 9, 6.2, 7.2, 0, 0, Math.PI * 2);
  } else {
    const isRight = dir === 'right';
    ctx.ellipse(isRight ? 11.5 : 12.5, 9, 6.0, 7.0, 0, 0, Math.PI * 2);
  }
  ctx.fill();

  // Subtle natural cheek blush
  if (dir === 'down') {
    ctx.fillStyle = skinBlush;
    ctx.beginPath();
    ctx.arc(8.5, 11, 1.4, 0, Math.PI * 2);
    ctx.arc(15.5, 11, 1.4, 0, Math.PI * 2);
    ctx.fill();
  }

  // Human ears with earlobe contour
  if (dir === 'down' || dir === 'up') {
    ctx.fillStyle = skinTone;
    ctx.beginPath();
    ctx.arc(5.6, 9.5, 1.6, 0, Math.PI * 2);
    ctx.arc(18.4, 9.5, 1.6, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = skinShadow;
    ctx.lineWidth = 0.5;
    ctx.beginPath();
    ctx.arc(5.6, 9.5, 1, 0, Math.PI);
    ctx.arc(18.4, 9.5, 1, 0, Math.PI);
    ctx.stroke();
  } else {
    const isRight = dir === 'right';
    ctx.fillStyle = skinTone;
    ctx.beginPath();
    ctx.arc(isRight ? 9.2 : 14.8, 9.5, 1.6, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = skinShadow;
    ctx.lineWidth = 0.5;
    ctx.beginPath();
    ctx.arc(isRight ? 9.2 : 14.8, 9.5, 1, 0, Math.PI);
    ctx.stroke();
  }

  // 5. CHARMING, NATURAL EXPRESSIVE FACIAL FEATURES (Classic Schulz charm + anime warmth, perfectly non-creepy)
  if (dir === 'down') {
    // Friendly arched eyebrows
    ctx.strokeStyle = hairBody;
    ctx.lineWidth = 0.95;
    ctx.beginPath();
    ctx.moveTo(7.6, 6.4);
    ctx.quadraticCurveTo(9.4, 5.8, 11.2, 6.4);
    ctx.moveTo(12.8, 6.4);
    ctx.quadraticCurveTo(14.6, 5.8, 16.4, 6.4);
    ctx.stroke();

    // Natural expressive blinking rhythm
    const isBlinking = (Math.sin(time * 1.5) > 0.94);
    if (isBlinking) {
      ctx.strokeStyle = '#18181B';
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.arc(9.2, 8.8, 1.4, 0.1, Math.PI - 0.1);
      ctx.arc(14.8, 8.8, 1.4, 0.1, Math.PI - 0.1);
      ctx.stroke();
    } else {
      // Warm, deep expressive velvety ink eyes with sweet sparkle
      ctx.fillStyle = '#18181B';
      ctx.beginPath();
      ctx.ellipse(9.2, 8.5, 1.25, 1.6, 0, 0, Math.PI * 2);
      ctx.ellipse(14.8, 8.5, 1.25, 1.6, 0, 0, Math.PI * 2);
      ctx.fill();

      // Delicate catchlight reflection
      ctx.fillStyle = '#FFFFFF';
      ctx.beginPath();
      ctx.arc(8.8, 7.9, 0.5, 0, Math.PI * 2);
      ctx.arc(14.4, 7.9, 0.5, 0, Math.PI * 2);
      ctx.fill();

      // Soft upper lid curvature
      ctx.strokeStyle = '#18181B';
      ctx.lineWidth = 0.85;
      ctx.beginPath();
      ctx.arc(9.2, 8.2, 1.5, Math.PI * 1.15, Math.PI * 1.85);
      ctx.arc(14.8, 8.2, 1.5, Math.PI * 1.15, Math.PI * 1.85);
      ctx.stroke();
    }

    // Soft cute natural button nose
    ctx.fillStyle = 'rgba(234, 88, 12, 0.35)';
    ctx.beginPath();
    ctx.arc(12, 9.8, 0.75, 0, Math.PI * 2);
    ctx.fill();

    // Sweet, warm natural smile
    ctx.strokeStyle = '#831843';
    ctx.lineWidth = 0.9;
    ctx.beginPath();
    ctx.arc(12, 11.2, 1.8, 0.15, Math.PI - 0.15);
    ctx.stroke();
  } else if (dir === 'left' || dir === 'right') {
    const isRight = dir === 'right';
    const eyeX = isRight ? 14.2 : 9.8;
    const isBlinkingSide = (Math.sin(time * 1.5) > 0.94);

    // Eyebrow
    ctx.strokeStyle = hairBody;
    ctx.lineWidth = 0.95;
    ctx.beginPath();
    ctx.moveTo(isRight ? 12.6 : 11.4, 6.4);
    ctx.lineTo(isRight ? 15.6 : 8.4, 6.7);
    ctx.stroke();

    if (isBlinkingSide) {
      ctx.strokeStyle = '#18181B';
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.arc(eyeX, 8.8, 1.3, 0.1, Math.PI - 0.1);
      ctx.stroke();
    } else {
      // Profile Eye: Expressive velvety ink eye with sparkle
      ctx.fillStyle = '#18181B';
      ctx.beginPath();
      ctx.ellipse(eyeX, 8.5, 1.2, 1.5, 0, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#FFFFFF';
      ctx.beginPath();
      ctx.arc(eyeX + (isRight ? 0.2 : -0.2), 7.9, 0.45, 0, Math.PI * 2);
      ctx.fill();
    }

    // Profile nose tip
    ctx.fillStyle = 'rgba(234, 88, 12, 0.35)';
    ctx.beginPath();
    ctx.arc(isRight ? 16.2 : 7.8, 9.8, 0.7, 0, Math.PI * 2);
    ctx.fill();

    // Profile smile
    ctx.strokeStyle = '#831843';
    ctx.lineWidth = 0.9;
    ctx.beginPath();
    ctx.arc(isRight ? 14.2 : 9.8, 11.4, 1.3, 0.2, Math.PI * 0.8);
    ctx.stroke();
  }

  // 6. LAYERED WAVY BLACK HAIR (Crown volume, parted fringe bangs & cascading locks over shoulders)
  if (dir === 'down') {
    // Hair Crown with volume
    ctx.fillStyle = hairBody;
    ctx.beginPath();
    ctx.moveTo(5.5, 8);
    ctx.quadraticCurveTo(12, 1.5, 18.5, 8);
    ctx.quadraticCurveTo(19, 4, 16, 2.5);
    ctx.quadraticCurveTo(12, 1.2, 8, 2.5);
    ctx.quadraticCurveTo(5, 4, 5.5, 8);
    ctx.fill();

    // Parted human fringe / bangs framing forehead
    ctx.beginPath();
    ctx.moveTo(6, 6);
    ctx.quadraticCurveTo(9, 6.2, 10.5, 5);
    ctx.quadraticCurveTo(12, 6.5, 14, 4.8);
    ctx.quadraticCurveTo(16.5, 6.5, 18, 6.2);
    ctx.quadraticCurveTo(17.5, 3.5, 12, 2.5);
    ctx.closePath();
    ctx.fill();

    // Left cascading wavy lock over shoulder
    ctx.beginPath();
    ctx.moveTo(5.5, 7.5);
    ctx.quadraticCurveTo(4 - hairSway * 0.5, 12, 4.8 - hairSway * 0.6, 17);
    ctx.quadraticCurveTo(5.8, 19, 6.8, 18);
    ctx.quadraticCurveTo(6.2, 13, 7.2, 9);
    ctx.closePath();
    ctx.fill();

    // Right cascading wavy lock over shoulder
    ctx.beginPath();
    ctx.moveTo(18.5, 7.5);
    ctx.quadraticCurveTo(20 + hairSway * 0.5, 12, 19.2 + hairSway * 0.6, 17);
    ctx.quadraticCurveTo(18.2, 19, 17.2, 18);
    ctx.quadraticCurveTo(17.8, 13, 16.8, 9);
    ctx.closePath();
    ctx.fill();

    // Specular hair highlights (glossy wavy sheen)
    ctx.strokeStyle = hairHighlight;
    ctx.lineWidth = 0.9;
    ctx.beginPath();
    ctx.moveTo(7.5, 3.5);
    ctx.quadraticCurveTo(12, 2.5, 16.5, 3.5);
    ctx.stroke();
    // Lock sheen lines
    ctx.beginPath();
    ctx.moveTo(5.2, 10);
    ctx.quadraticCurveTo(4.8, 13, 5.6, 16);
    ctx.moveTo(18.8, 10);
    ctx.quadraticCurveTo(19.2, 13, 18.4, 16);
    ctx.stroke();
  } else if (dir === 'up') {
    // Back view: Full luxurious cascading wavy hair down to shoulder blades
    ctx.fillStyle = hairBody;
    ctx.beginPath();
    ctx.moveTo(5, 8);
    ctx.quadraticCurveTo(12, 1.2, 19, 8);
    ctx.quadraticCurveTo(20.5 + hairSway * 0.8, 15, 18.5 + hairSway * 0.6, 22);
    ctx.quadraticCurveTo(15, 23.5, 12, 23);
    ctx.quadraticCurveTo(9, 23.5, 5.5 - hairSway * 0.6, 22);
    ctx.quadraticCurveTo(3.5 - hairSway * 0.8, 15, 5, 8);
    ctx.fill();

    // Individual wave lock layers
    ctx.strokeStyle = hairHighlight;
    ctx.lineWidth = 0.9;
    ctx.beginPath();
    ctx.moveTo(7.5, 7);
    ctx.quadraticCurveTo(8.5 - hairSway * 0.4, 14, 8, 20);
    ctx.moveTo(12, 6);
    ctx.quadraticCurveTo(12, 13, 12 + hairSway * 0.3, 21);
    ctx.moveTo(16.5, 7);
    ctx.quadraticCurveTo(15.5 + hairSway * 0.4, 14, 16, 20);
    ctx.stroke();
  } else {
    // Profile view: Beautiful wavy hair streaming behind with wind inertia
    const isRight = dir === 'right';
    const stream = isRight ? -hairSway * 1.2 : hairSway * 1.2;
    const originX = isRight ? 11 : 13;

    // Crown
    ctx.fillStyle = hairBody;
    ctx.beginPath();
    ctx.arc(originX, 8, 6.8, 0, Math.PI * 2);
    ctx.fill();

    // Bangs over brow
    ctx.beginPath();
    ctx.moveTo(isRight ? 10 : 14, 3);
    ctx.quadraticCurveTo(isRight ? 15 : 9, 4, isRight ? 16 : 8, 6.5);
    ctx.lineTo(isRight ? 14 : 10, 6.5);
    ctx.closePath();
    ctx.fill();

    // Cascading waves down back of neck and shoulder
    const backX = isRight ? originX - 4.5 : originX + 4.5;
    ctx.beginPath();
    ctx.moveTo(backX, 6);
    ctx.quadraticCurveTo(
      backX + (isRight ? -4 : 4) + stream,
      13,
      backX + (isRight ? -3 : 3) + stream,
      21
    );
    ctx.quadraticCurveTo(
      backX + (isRight ? 1 : -1),
      22.5,
      backX + (isRight ? 3 : -3),
      17
    );
    ctx.quadraticCurveTo(backX + (isRight ? 2 : -2), 11, backX, 6);
    ctx.closePath();
    ctx.fill();

    // Wavy highlight strand
    ctx.strokeStyle = hairHighlight;
    ctx.lineWidth = 0.8;
    ctx.beginPath();
    ctx.moveTo(backX, 7);
    ctx.quadraticCurveTo(
      backX + (isRight ? -2.5 : 2.5) + stream,
      14,
      backX + (isRight ? -1.5 : 1.5) + stream,
      19
    );
    ctx.stroke();
  }

  ctx.restore();
  ctx.restore();
}

// Subcomponents & props rendering

function drawSuburbanHouse(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  wallColor: string,
  roofColor: string,
  label: string,
  timeOfDay: TimeOfDay = 'day',
  time: number = 0
) {
  const isNight = timeOfDay === 'night';
  const isSunset = timeOfDay === 'sunset';
  const isDawn = timeOfDay === 'dawn';

  // 1. BRICK CHIMNEY WITH SMOKE
  const chimX = x + w - 34;
  const chimY = y - 10;
  const chimW = 20;
  const chimH = 45;

  // Brick body
  ctx.fillStyle = '#991B1B';
  ctx.fillRect(chimX, chimY, chimW, chimH);
  ctx.strokeStyle = '#7F1D1D';
  ctx.lineWidth = 1;
  // Brick mortar courses
  for (let by = chimY + 4; by < chimY + chimH; by += 5) {
    ctx.beginPath();
    ctx.moveTo(chimX, by);
    ctx.lineTo(chimX + chimW, by);
    ctx.stroke();
  }
  // Chimney cap
  ctx.fillStyle = '#4B5563';
  ctx.fillRect(chimX - 3, chimY - 4, chimW + 6, 5);

  // Animated gentle translucent smoke puffs wafting
  for (let i = 0; i < 3; i++) {
    const smokeAge = ((time * 0.8 + i * 1.2) % 3.6);
    const smokeY = chimY - 8 - smokeAge * 14;
    const smokeX = chimX + chimW / 2 + Math.sin(time + i + smokeAge) * 8 + smokeAge * 4;
    const smokeR = 4 + smokeAge * 3.5;
    const smokeAlpha = Math.max(0, 0.35 - smokeAge * 0.09);
    ctx.fillStyle = `rgba(226, 232, 240, ${smokeAlpha})`;
    ctx.beginPath();
    ctx.arc(smokeX, smokeY, smokeR, 0, Math.PI * 2);
    ctx.fill();
  }

  // 2. FOUNDATION MASONRY
  ctx.fillStyle = '#78716C';
  ctx.fillRect(x, y + h - 8, w, 8);
  ctx.strokeStyle = '#57534E';
  ctx.lineWidth = 1;
  ctx.strokeRect(x, y + h - 8, w, 8);

  // 3. HOUSE WALLS WITH REALISTIC CLAPBOARD SIDING
  ctx.fillStyle = wallColor;
  ctx.fillRect(x, y + 38, w, h - 46);

  // Horizontal siding plank shadow lines
  ctx.strokeStyle = 'rgba(0, 0, 0, 0.12)';
  ctx.lineWidth = 1;
  for (let sy = y + 44; sy < y + h - 10; sy += 6) {
    ctx.beginPath();
    ctx.moveTo(x, sy);
    ctx.lineTo(x + w, sy);
    ctx.stroke();
  }

  // Corner trim boards
  ctx.fillStyle = '#F5F5F4';
  ctx.fillRect(x, y + 38, 5, h - 46);
  ctx.fillRect(x + w - 5, y + 38, 5, h - 46);
  ctx.strokeStyle = '#D6D3D1';
  ctx.strokeRect(x, y + 38, 5, h - 46);
  ctx.strokeRect(x + w - 5, y + 38, 5, h - 46);

  // 4. ARCHITECTURAL GABLE ROOF WITH SHINGLE ROWS
  ctx.fillStyle = roofColor;
  ctx.beginPath();
  ctx.moveTo(x - 12, y + 40);
  ctx.lineTo(x + w / 2, y);
  ctx.lineTo(x + w + 12, y + 40);
  ctx.closePath();
  ctx.fill();

  // Roof shingle horizontal tiers
  ctx.strokeStyle = 'rgba(0, 0, 0, 0.2)';
  ctx.lineWidth = 1.2;
  for (let ry = y + 8; ry < y + 38; ry += 6) {
    const progress = (ry - y) / 40;
    const halfSpan = (w / 2 + 10) * progress;
    ctx.beginPath();
    ctx.moveTo(x + w / 2 - halfSpan, ry);
    ctx.lineTo(x + w / 2 + halfSpan, ry);
    ctx.stroke();
  }

  // Roof eaves fascia board & drop shadow
  ctx.strokeStyle = '#1F2937';
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.moveTo(x - 12, y + 40);
  ctx.lineTo(x + w / 2, y);
  ctx.lineTo(x + w + 12, y + 40);
  ctx.stroke();

  // Eaves drop shadow onto wall
  ctx.fillStyle = 'rgba(0, 0, 0, 0.16)';
  ctx.fillRect(x, y + 38, w, 5);

  // 5. ATTIC WINDOW (Round or arched with warm golden light)
  const atticX = x + w / 2;
  const atticY = y + 22;
  // Attic window warm light
  ctx.fillStyle = '#FDE047';
  ctx.beginPath();
  ctx.arc(atticX, atticY, 8, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#FFFFFF';
  ctx.lineWidth = 1.5;
  ctx.stroke();
  ctx.strokeStyle = '#1F2937';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(atticX - 7, atticY);
  ctx.lineTo(atticX + 7, atticY);
  ctx.moveTo(atticX, atticY - 7);
  ctx.lineTo(atticX, atticY + 7);
  ctx.stroke();

  // 6. MAIN WINDOWS WITH RADIANT LIGHT & CURTAINS
  const winW = 32;
  const winH = 34;
  drawWindow(ctx, x + 18, y + 54, winW, winH, isNight, isSunset, isDawn);
  drawWindow(ctx, x + w - 50, y + 54, winW, winH, isNight, isSunset, isDawn);

  // 7. FRONT PORCH WITH COLUMNS & AWNING
  const porchW = 46;
  const porchH = 50;
  const porchX = x + w / 2 - porchW / 2;
  const porchY = y + h - porchH - 8;

  // Porch roof awning
  ctx.fillStyle = roofColor;
  ctx.beginPath();
  ctx.moveTo(porchX - 4, porchY + 6);
  ctx.lineTo(porchX + porchW / 2, porchY);
  ctx.lineTo(porchX + porchW + 4, porchY + 6);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = '#1F2937';
  ctx.lineWidth = 1.5;
  ctx.stroke();

  // White turned porch columns
  ctx.fillStyle = '#FFFFFF';
  ctx.fillRect(porchX + 2, porchY + 6, 4, porchH - 6);
  ctx.fillRect(porchX + porchW - 6, porchY + 6, 4, porchH - 6);
  ctx.strokeStyle = '#D1D5DB';
  ctx.lineWidth = 1;
  ctx.strokeRect(porchX + 2, porchY + 6, 4, porchH - 6);
  ctx.strokeRect(porchX + porchW - 6, porchY + 6, 4, porchH - 6);

  // Porch wooden deck & steps
  ctx.fillStyle = '#78350F';
  ctx.fillRect(porchX - 2, y + h - 12, porchW + 4, 6);
  ctx.fillStyle = '#92400E';
  ctx.fillRect(porchX - 4, y + h - 6, porchW + 8, 6);

  // 8. FRONT DOOR (Panelled wood with brass hardware)
  const doorW = 28;
  const doorH = 42;
  const doorX = x + w / 2 - doorW / 2;
  const doorY = y + h - doorH - 12;

  ctx.fillStyle = '#451A03';
  ctx.fillRect(doorX, doorY, doorW, doorH);
  ctx.strokeStyle = '#292524';
  ctx.lineWidth = 1.5;
  ctx.strokeRect(doorX, doorY, doorW, doorH);

  // Raised door panels
  ctx.fillStyle = '#78350F';
  ctx.fillRect(doorX + 3, doorY + 4, 9, 14);
  ctx.fillRect(doorX + 16, doorY + 4, 9, 14);
  ctx.fillRect(doorX + 3, doorY + 22, 9, 14);
  ctx.fillRect(doorX + 16, doorY + 22, 9, 14);

  // Brass doorknob
  ctx.fillStyle = '#FBBF24';
  ctx.beginPath();
  ctx.arc(doorX + doorW - 5, doorY + 24, 2.5, 0, Math.PI * 2);
  ctx.fill();

  // Brass mail slot
  ctx.fillStyle = '#D97706';
  ctx.fillRect(doorX + 8, doorY + 32, 12, 2.5);

  // Woven welcome mat
  ctx.fillStyle = '#44403C';
  ctx.fillRect(doorX + 2, y + h - 4, doorW - 4, 4);
  ctx.strokeStyle = '#D97706';
  ctx.lineWidth = 0.8;
  ctx.strokeRect(doorX + 2, y + h - 4, doorW - 4, 4);

  // 9. COACH LANTERN WITH RADIANT GLOW (Light in the houses!)
  const lanternX = doorX - 7;
  const lanternY = doorY + 14;

  // Cast iron bracket & cage
  ctx.strokeStyle = '#18181B';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(doorX - 2, lanternY + 3);
  ctx.lineTo(lanternX, lanternY + 3);
  ctx.lineTo(lanternX, lanternY - 4);
  ctx.stroke();

  // Warm glowing incandescent bulb & radial halo
  ctx.save();
  const lanternGlow = ctx.createRadialGradient(
    lanternX,
    lanternY,
    1,
    lanternX,
    lanternY,
    isNight ? 35 : 20
  );
  lanternGlow.addColorStop(0, '#FFFFFF');
  lanternGlow.addColorStop(0.2, '#FEF08A');
  lanternGlow.addColorStop(0.6, 'rgba(251, 191, 36, 0.45)');
  lanternGlow.addColorStop(1, 'rgba(251, 191, 36, 0)');
  ctx.fillStyle = lanternGlow;
  ctx.beginPath();
  ctx.arc(lanternX, lanternY, isNight ? 35 : 20, 0, Math.PI * 2);
  ctx.fill();

  // Glass lantern housing
  ctx.fillStyle = '#FEF08A';
  ctx.fillRect(lanternX - 3, lanternY - 3, 6, 7);
  ctx.strokeStyle = '#18181B';
  ctx.lineWidth = 1;
  ctx.strokeRect(lanternX - 3, lanternY - 3, 6, 7);
  ctx.restore();
}

function drawWindow(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  isNight: boolean = false,
  isSunset: boolean = false,
  isDawn: boolean = false
) {
  ctx.save();

  // Window light spill / projected beam onto ground
  const lightSpill = ctx.createRadialGradient(
    x + w / 2,
    y + h / 2,
    5,
    x + w / 2,
    y + h + 15,
    w + (isNight ? 24 : 14)
  );
  lightSpill.addColorStop(0, 'rgba(254, 240, 138, 0.6)');
  lightSpill.addColorStop(0.5, 'rgba(251, 191, 36, 0.25)');
  lightSpill.addColorStop(1, 'rgba(251, 191, 36, 0)');
  ctx.fillStyle = lightSpill;
  ctx.beginPath();
  ctx.arc(x + w / 2, y + h / 2, w + (isNight ? 24 : 14), 0, Math.PI * 2);
  ctx.fill();

  // Window frame casing (white wood)
  ctx.fillStyle = '#F5F5F4';
  ctx.fillRect(x - 3, y - 3, w + 6, h + 8);
  ctx.strokeStyle = '#D6D3D1';
  ctx.lineWidth = 1;
  ctx.strokeRect(x - 3, y - 3, w + 6, h + 8);

  // Window pane glowing glass (always has warm inviting interior light)
  const glassGrad = ctx.createLinearGradient(x, y, x, y + h);
  if (isNight) {
    glassGrad.addColorStop(0, '#FFFBEB');
    glassGrad.addColorStop(0.3, '#FEF08A');
    glassGrad.addColorStop(1, '#F59E0B');
  } else if (isSunset) {
    glassGrad.addColorStop(0, '#FEF08A');
    glassGrad.addColorStop(0.7, '#FBBF24');
    glassGrad.addColorStop(1, '#EA580C');
  } else {
    // Daytime warm amber interior glow through clear glass
    glassGrad.addColorStop(0, '#FEF08A');
    glassGrad.addColorStop(0.4, '#FDE047');
    glassGrad.addColorStop(1, '#FBBF24');
  }

  ctx.fillStyle = glassGrad;
  ctx.fillRect(x, y, w, h);

  // Cozy ruffled lace curtains parted on sides
  ctx.fillStyle = '#FFFFFF';
  // Left curtain
  ctx.beginPath();
  ctx.moveTo(x, y);
  ctx.lineTo(x + 7, y);
  ctx.quadraticCurveTo(x + 2, y + h / 2, x + 8, y + h);
  ctx.lineTo(x, y + h);
  ctx.closePath();
  ctx.fill();
  // Right curtain
  ctx.beginPath();
  ctx.moveTo(x + w, y);
  ctx.lineTo(x + w - 7, y);
  ctx.quadraticCurveTo(x + w - 2, y + h / 2, x + w - 8, y + h);
  ctx.lineTo(x + w, y + h);
  ctx.closePath();
  ctx.fill();

  // Dark cross mutton window panes
  ctx.strokeStyle = '#1F2937';
  ctx.lineWidth = 1.5;
  ctx.strokeRect(x, y, w, h);
  ctx.beginPath();
  ctx.moveTo(x + w / 2, y);
  ctx.lineTo(x + w / 2, y + h);
  ctx.moveTo(x, y + h / 2);
  ctx.lineTo(x + w, y + h / 2);
  ctx.stroke();

  // Flower planter box underneath window
  ctx.fillStyle = '#78350F';
  ctx.fillRect(x - 2, y + h, w + 4, 6);
  ctx.strokeStyle = '#451A03';
  ctx.lineWidth = 1;
  ctx.strokeRect(x - 2, y + h, w + 4, 6);

  // Colorful blooming petunias/flowers in the box
  const flowerColors = ['#F472B6', '#FBBF24', '#EF4444', '#FFFFFF', '#A855F7'];
  for (let i = 0; i < 4; i++) {
    const fx = x + 3 + i * (w / 4);
    // Green leaves
    ctx.fillStyle = '#22C55E';
    ctx.beginPath();
    ctx.arc(fx, y + h - 1, 3, 0, Math.PI * 2);
    ctx.fill();
    // Flower petal
    ctx.fillStyle = flowerColors[i % flowerColors.length];
    ctx.beginPath();
    ctx.arc(fx, y + h - 2, 2.2, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.restore();
}

function drawDoghouseExterior(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  time: number
) {
  ctx.save();
  // Soft cast shadow on lawn
  ctx.fillStyle = 'rgba(0, 0, 0, 0.22)';
  ctx.beginPath();
  ctx.ellipse(x + w / 2, y + h + 2, w / 2 + 8, 6, 0, 0, Math.PI * 2);
  ctx.fill();

  // Little grass patch and flowers around base
  ctx.fillStyle = '#15803D';
  for (let i = 0; i < 5; i++) {
    const gx = x - 4 + i * (w / 4);
    ctx.beginPath();
    ctx.moveTo(gx, y + h);
    ctx.lineTo(gx - 2, y + h - 5);
    ctx.lineTo(gx + 2, y + h);
    ctx.fill();
  }

  // Red clapboard walls
  ctx.fillStyle = '#DC2626';
  ctx.fillRect(x, y + 16, w, h - 16);
  ctx.strokeStyle = '#18181B';
  ctx.lineWidth = 1.8;
  ctx.strokeRect(x, y + 16, w, h - 16);

  // Horizontal siding plank grooves
  ctx.strokeStyle = '#991B1B';
  ctx.lineWidth = 1;
  for (let py = y + 23; py < y + h - 2; py += 7) {
    ctx.beginPath();
    ctx.moveTo(x + 1, py);
    ctx.lineTo(x + w - 1, py);
    ctx.stroke();
  }

  // Steep gabled red roof with overhang
  ctx.beginPath();
  ctx.moveTo(x - 8, y + 16);
  ctx.lineTo(x + w / 2, y - 2);
  ctx.lineTo(x + w + 8, y + 16);
  ctx.closePath();
  ctx.fillStyle = '#B91C1C';
  ctx.fill();
  ctx.strokeStyle = '#18181B';
  ctx.lineWidth = 2;
  ctx.stroke();

  // Roof ridge highlight
  ctx.strokeStyle = '#EF4444';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(x - 5, y + 15);
  ctx.lineTo(x + w / 2, y);
  ctx.lineTo(x + w + 5, y + 15);
  ctx.stroke();

  // Eaves shadow under roof apex
  ctx.fillStyle = 'rgba(0, 0, 0, 0.18)';
  ctx.fillRect(x, y + 16, w, 4);

  // Arched black doorway (leads to the secret mansion interior!)
  ctx.fillStyle = '#111827';
  ctx.beginPath();
  ctx.roundRect(x + 12, y + 24, w - 24, h - 24, [10, 10, 0, 0]);
  ctx.fill();
  ctx.strokeStyle = '#18181B';
  ctx.lineWidth = 1.5;
  ctx.stroke();

  // Snoopy's iconic yellow food dish on the lawn beside the house
  const bowlX = x + w + 8;
  const bowlY = y + h - 3;
  ctx.fillStyle = '#FBBF24';
  ctx.beginPath();
  ctx.ellipse(bowlX, bowlY, 8, 4.5, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#B45309';
  ctx.lineWidth = 1;
  ctx.stroke();

  // Dish rim & letters
  ctx.fillStyle = '#78350F';
  ctx.font = 'bold 5px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('DOG', bowlX, bowlY + 2);
  ctx.textAlign = 'start';

  // Little dog bone in dish
  ctx.fillStyle = '#FFFFFF';
  ctx.fillRect(bowlX - 4, bowlY - 1, 8, 2);
  ctx.beginPath();
  ctx.arc(bowlX - 4, bowlY, 1.3, 0, Math.PI * 2);
  ctx.arc(bowlX + 4, bowlY, 1.3, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
}

function drawSnoopy(
  ctx: CanvasRenderingContext2D,
  npc: any,
  time: number,
  timeOfDay: TimeOfDay = 'day'
) {
  const isMoving = Boolean(npc.isMoving);
  const walkStep = npc.walkStep ?? (isMoving ? time * 6.5 : 0);
  const dir = npc.direction || 'down';
  const isRight = dir === 'right';
  const isLeft = dir === 'left';
  const isUp = dir === 'up';

  // Walking & idle bounce physics
  const stepBob = isMoving ? Math.abs(Math.sin(walkStep * 2)) * 1.8 : Math.abs(Math.sin(time * 2.2)) * 0.5;
  const legSwing = isMoving ? Math.sin(walkStep) * 4.5 : 0;
  const tailWag = Math.sin(time * 8) * 0.4;
  const earFlap = isMoving ? Math.sin(walkStep) * 0.3 : Math.sin(time * 2.5) * 0.1;

  // Ground contact shadow
  ctx.fillStyle = 'rgba(0, 0, 0, 0.25)';
  ctx.beginPath();
  ctx.ellipse(12, 38, 9, 3.5, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.save();
  ctx.translate(0, -stepBob);

  // 1. WAGGING TAIL
  ctx.fillStyle = '#FFFFFF';
  ctx.strokeStyle = '#18181B';
  ctx.lineWidth = 1.0;
  ctx.save();
  const tailBaseX = isRight ? 6 : (isLeft ? 18 : 6);
  ctx.translate(tailBaseX, 26);
  ctx.rotate(tailWag + (isLeft ? 0.3 : -0.3));
  ctx.beginPath();
  ctx.ellipse(0, -6, 2.2, 5, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
  ctx.restore();

  // 2. HIND FEET / LEGS (Walking beagle paws)
  ctx.fillStyle = '#FFFFFF';
  ctx.strokeStyle = '#18181B';
  ctx.lineWidth = 1.0;
  // Left foot
  ctx.beginPath();
  ctx.ellipse(8, 36 + (isUp ? 0 : legSwing * 0.5), 3.5, 2.2, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
  // Right foot
  ctx.beginPath();
  ctx.ellipse(16, 36 - (isUp ? 0 : legSwing * 0.5), 3.5, 2.2, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // 3. TORSO / BEAGLE BODY
  ctx.fillStyle = '#FFFFFF';
  ctx.strokeStyle = '#18181B';
  ctx.lineWidth = 1.2;
  ctx.beginPath();
  ctx.ellipse(12, 25, 7.5, 9, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // Black spot on Snoopy's back
  ctx.fillStyle = '#18181B';
  ctx.beginPath();
  if (isRight) {
    ctx.ellipse(8, 24, 3, 4.5, 0.2, 0, Math.PI * 2);
  } else if (isLeft) {
    ctx.ellipse(16, 24, 3, 4.5, -0.2, 0, Math.PI * 2);
  } else if (isUp) {
    ctx.ellipse(12, 23, 4, 5, 0, 0, Math.PI * 2);
  } else {
    ctx.ellipse(8, 25, 2.5, 4, 0.1, 0, Math.PI * 2);
  }
  ctx.fill();

  // 4. RED COLLAR
  ctx.fillStyle = '#DC2626';
  ctx.strokeStyle = '#991B1B';
  ctx.lineWidth = 0.8;
  ctx.beginPath();
  ctx.roundRect(7.5, 16.5, 9, 2.8, 1.2);
  ctx.fill();
  ctx.stroke();

  // Shiny gold collar bell / tag
  ctx.fillStyle = '#F59E0B';
  ctx.beginPath();
  ctx.arc(12, 19.5, 1.2, 0, Math.PI * 2);
  ctx.fill();

  // 5. WALKING PAWS / ARMS
  ctx.fillStyle = '#FFFFFF';
  ctx.strokeStyle = '#18181B';
  ctx.lineWidth = 1.0;
  // Left arm swing
  ctx.beginPath();
  ctx.ellipse(5, 23 - legSwing * 0.4, 2.5, 4, -0.2, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
  // Right arm swing
  ctx.beginPath();
  ctx.ellipse(19, 23 + legSwing * 0.4, 2.5, 4, 0.2, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // 6. SNOOPY'S ICONIC HEAD
  ctx.fillStyle = '#FFFFFF';
  ctx.strokeStyle = '#18181B';
  ctx.lineWidth = 1.2;

  if (isRight) {
    // Facing right profile
    ctx.beginPath();
    ctx.ellipse(11, 10, 6.5, 6, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    // Snout
    ctx.beginPath();
    ctx.ellipse(16, 12, 5.5, 3.8, 0.1, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    // Black nose tip
    ctx.fillStyle = '#18181B';
    ctx.beginPath();
    ctx.ellipse(20.5, 11, 2, 2.4, 0, 0, Math.PI * 2);
    ctx.fill();
    // Nose highlight
    ctx.fillStyle = '#FFFFFF';
    ctx.beginPath();
    ctx.arc(20, 10.2, 0.6, 0, Math.PI * 2);
    ctx.fill();
    // Smiling mouth
    ctx.strokeStyle = '#18181B';
    ctx.lineWidth = 1.0;
    ctx.beginPath();
    ctx.arc(16, 13.5, 2, 0.2, Math.PI * 0.8);
    ctx.stroke();
    // Black drooping floppy ear
    ctx.save();
    ctx.translate(8, 8);
    ctx.rotate(earFlap);
    ctx.fillStyle = '#18181B';
    ctx.beginPath();
    ctx.ellipse(0, 4.5, 3.2, 6.5, -0.2, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  } else if (isLeft) {
    // Facing left profile
    ctx.beginPath();
    ctx.ellipse(13, 10, 6.5, 6, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    // Snout
    ctx.beginPath();
    ctx.ellipse(8, 12, 5.5, 3.8, -0.1, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    // Black nose tip
    ctx.fillStyle = '#18181B';
    ctx.beginPath();
    ctx.ellipse(3.5, 11, 2, 2.4, 0, 0, Math.PI * 2);
    ctx.fill();
    // Nose highlight
    ctx.fillStyle = '#FFFFFF';
    ctx.beginPath();
    ctx.arc(4, 10.2, 0.6, 0, Math.PI * 2);
    ctx.fill();
    // Smiling mouth
    ctx.strokeStyle = '#18181B';
    ctx.lineWidth = 1.0;
    ctx.beginPath();
    ctx.arc(8, 13.5, 2, 0.2, Math.PI * 0.8);
    ctx.stroke();
    // Black drooping floppy ear
    ctx.save();
    ctx.translate(16, 8);
    ctx.rotate(-earFlap);
    ctx.fillStyle = '#18181B';
    ctx.beginPath();
    ctx.ellipse(0, 4.5, 3.2, 6.5, 0.2, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  } else if (isUp) {
    // Facing up (back of head with two floppy ears)
    ctx.beginPath();
    ctx.ellipse(12, 10, 7.5, 7, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    // Left ear
    ctx.fillStyle = '#18181B';
    ctx.beginPath();
    ctx.ellipse(6, 12, 2.8, 6, -0.2, 0, Math.PI * 2);
    ctx.fill();
    // Right ear
    ctx.beginPath();
    ctx.ellipse(18, 12, 2.8, 6, 0.2, 0, Math.PI * 2);
    ctx.fill();
  } else {
    // Facing down / front
    ctx.beginPath();
    ctx.ellipse(12, 9, 7.5, 6.5, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    // Snout
    ctx.beginPath();
    ctx.ellipse(12, 13, 5, 4.2, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    // Black nose tip
    ctx.fillStyle = '#18181B';
    ctx.beginPath();
    ctx.ellipse(12, 12.5, 2.4, 2, 0, 0, Math.PI * 2);
    ctx.fill();
    // Nose highlight
    ctx.fillStyle = '#FFFFFF';
    ctx.beginPath();
    ctx.arc(11.5, 11.8, 0.6, 0, Math.PI * 2);
    ctx.fill();
    // Cute smile
    ctx.strokeStyle = '#18181B';
    ctx.lineWidth = 1.0;
    ctx.beginPath();
    ctx.arc(12, 14.5, 2.2, 0.2, Math.PI - 0.2);
    ctx.stroke();
    // Two drooping black ears
    ctx.fillStyle = '#18181B';
    ctx.beginPath();
    ctx.ellipse(5, 11, 2.8, 6.5, -0.2 + earFlap, 0, Math.PI * 2);
    ctx.ellipse(19, 11, 2.8, 6.5, 0.2 - earFlap, 0, Math.PI * 2);
    ctx.fill();
  }

  // 7. TIME-OF-DAY SNOOPY ACCESSORIES
  if (timeOfDay === 'day') {
    // Joe Cool Sunglasses!
    ctx.fillStyle = '#18181B';
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 0.8;
    if (isRight) {
      ctx.beginPath();
      ctx.roundRect(11, 6.5, 6, 4, 1);
      ctx.fill();
      ctx.stroke();
    } else if (isLeft) {
      ctx.beginPath();
      ctx.roundRect(7, 6.5, 6, 4, 1);
      ctx.fill();
      ctx.stroke();
    } else if (!isUp) {
      ctx.beginPath();
      ctx.roundRect(7, 6.5, 4.5, 3.8, 1);
      ctx.roundRect(12.5, 6.5, 4.5, 3.8, 1);
      ctx.fill();
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(11.5, 7.5);
      ctx.lineTo(12.5, 7.5);
      ctx.stroke();
    }
  } else if (timeOfDay === 'sunset') {
    // Flying Ace aviator cap & goggles + red scarf fluttering
    ctx.strokeStyle = '#B45309';
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.ellipse(12, 6, 6.5, 3.5, 0, 0, Math.PI * 2);
    ctx.stroke();
    // Fluttering red aviator scarf
    ctx.fillStyle = '#EF4444';
    const scarfWave = Math.sin(time * 6) * 3;
    ctx.beginPath();
    ctx.moveTo(12, 18);
    ctx.lineTo(isRight ? 2 : 22, 19 + scarfWave);
    ctx.lineTo(isRight ? 0 : 24, 23 + scarfWave);
    ctx.lineTo(12, 20);
    ctx.fill();
  } else if (timeOfDay === 'dawn' || timeOfDay === 'night') {
    // Classic Snoopy happy face with eyes
    if (!isUp) {
      ctx.strokeStyle = '#18181B';
      ctx.lineWidth = 1.0;
      if (isRight) {
        ctx.beginPath();
        ctx.arc(13, 7.5, 1.2, 0, Math.PI * 2);
        ctx.stroke();
      } else if (isLeft) {
        ctx.beginPath();
        ctx.arc(11, 7.5, 1.2, 0, Math.PI * 2);
        ctx.stroke();
      } else {
        ctx.beginPath();
        ctx.arc(9.5, 7.5, 1.1, 0, Math.PI * 2);
        ctx.arc(14.5, 7.5, 1.1, 0, Math.PI * 2);
        ctx.stroke();
      }
    }
  }

  ctx.restore();
}

function drawWoodstock(ctx: CanvasRenderingContext2D, npc: any, time: number, timeOfDay: TimeOfDay = 'day') {
  const dir = npc.direction || 'left';
  const isRight = dir === 'right';
  const isMoving = Boolean(npc.isMoving);
  const walkStep = npc.walkStep ?? (isMoving ? time * 8 : 0);

  // Hopping and fluttering rhythm
  const hopCycle = isMoving ? Math.sin(walkStep) : Math.sin(time * 3);
  const hopY = isMoving ? Math.abs(hopCycle) * -6 : Math.abs(hopCycle) * -2;
  const wingFlap = isMoving ? Math.sin(walkStep * 2) * 4 : Math.sin(time * 6) * 1.5;

  // Ground shadow
  ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
  ctx.beginPath();
  ctx.ellipse(8, 38, 5, 2, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.save();
  ctx.translate(0, hopY);

  // Tiny orange bird legs
  ctx.strokeStyle = '#D97706';
  ctx.lineWidth = 1.0;
  ctx.beginPath();
  ctx.moveTo(6, 33);
  ctx.lineTo(6, 37);
  ctx.moveTo(10, 33);
  ctx.lineTo(10, 37);
  // Bird toes
  ctx.moveTo(4, 37);
  ctx.lineTo(7, 37);
  ctx.moveTo(8, 37);
  ctx.lineTo(11, 37);
  ctx.stroke();

  // Plump yellow bird body
  ctx.fillStyle = '#FBBF24';
  ctx.strokeStyle = '#D97706';
  ctx.lineWidth = 0.8;
  ctx.beginPath();
  ctx.ellipse(8, 29, 4.5, 5, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // Fluttering yellow wings
  ctx.fillStyle = '#F59E0B';
  ctx.beginPath();
  ctx.ellipse(isRight ? 5 : 11, 28, 2.5, 3.5 + Math.abs(wingFlap * 0.3), wingFlap * 0.1, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // Round yellow bird head
  ctx.fillStyle = '#FBBF24';
  ctx.beginPath();
  ctx.arc(8, 22, 4.2, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // Woodstock's iconic spiky yellow crest feathers
  ctx.strokeStyle = '#D97706';
  ctx.lineWidth = 1.1;
  ctx.beginPath();
  ctx.moveTo(7, 18);
  ctx.lineTo(6, 14);
  ctx.moveTo(8.5, 18);
  ctx.lineTo(9, 13);
  ctx.moveTo(10, 18.5);
  ctx.lineTo(12, 15);
  ctx.stroke();

  // Orange beak
  ctx.fillStyle = '#D97706';
  ctx.beginPath();
  if (isRight) {
    ctx.moveTo(12, 21);
    ctx.lineTo(16, 22.5);
    ctx.lineTo(12, 24);
  } else {
    ctx.moveTo(4, 21);
    ctx.lineTo(0, 22.5);
    ctx.lineTo(4, 24);
  }
  ctx.closePath();
  ctx.fill();

  // Cute bird eye with lively sparkle
  ctx.fillStyle = '#18181B';
  ctx.beginPath();
  ctx.arc(isRight ? 10 : 6, 21, 0.9, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#FFFFFF';
  ctx.beginPath();
  ctx.arc(isRight ? 9.8 : 5.8, 20.7, 0.35, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
}

function drawPeanutsChild(
  ctx: CanvasRenderingContext2D,
  npc: any,
  time: number,
  timeOfDay: TimeOfDay = 'day'
) {
  const isMoving = Boolean(npc.isMoving);
  const walkStep = npc.walkStep ?? (isMoving ? time * 6.5 : 0);
  const dir = npc.direction || 'down';
  const isUp = dir === 'up';
  const isLeft = dir === 'left';
  const isRight = dir === 'right';
  const isSide = isLeft || isRight;

  const legSwing = isMoving ? Math.sin(walkStep) * 4.2 : 0;
  const legLift = isMoving ? Math.abs(Math.sin(walkStep)) * 1.6 : 0;
  const armSwing = isMoving ? -legSwing * 0.9 : 0;
  const verticalBob = isMoving ? Math.abs(Math.sin(walkStep * 2)) * 1.4 : Math.sin(time * 2.2) * 0.8;
  const idleBob = verticalBob;
  const breath = Math.sin(time * 1.8) * 0.5;

  // Stride offsets based on direction
  const leftLegOffset = isSide ? (isRight ? -legSwing : legSwing) : (dir === 'down' ? legSwing * 0.8 : -legSwing * 0.8);
  const rightLegOffset = -leftLegOffset;

  // Soft ambient contact shadow on ground with gradient depth
  ctx.save();
  const shadowGrad = ctx.createRadialGradient(12, 38, 2, 12, 38, 11);
  shadowGrad.addColorStop(0, 'rgba(0, 0, 0, 0.35)');
  shadowGrad.addColorStop(0.7, 'rgba(0, 0, 0, 0.15)');
  shadowGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
  ctx.fillStyle = shadowGrad;
  ctx.beginPath();
  ctx.ellipse(12, 38, 11, 4.2, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  // Natural warm human skin palette
  const skinTone = npc.id === 'franklin' ? '#A16207' : '#FED7AA';      // Warm tone (Franklin rich brown / classic peach)
  const skinShadow = npc.id === 'franklin' ? '#78350F' : '#FDBA74';    // Soft warm shading under chin/neck/creases
  const skinBlush = npc.id === 'franklin' ? 'rgba(136, 19, 55, 0.22)' : 'rgba(251, 113, 133, 0.32)'; // Cheek blush
  const skinHighlight = npc.id === 'franklin' ? '#CA8A04' : '#FFF7ED'; // Subtle specular highlight

  // 1. LOWER BODY: REALISTIC HUMAN LEGS, SOCKS & SHOES WITH DYNAMIC WALKING STRIDE
  if (npc.id === 'peppermint_patty') {
    const leftY = leftLegOffset * 0.3 - (leftLegOffset > 0 ? legLift : 0);
    const rightY = rightLegOffset * 0.3 - (rightLegOffset > 0 ? legLift : 0);

    // Bare athletic legs with knee kneecap shading + leather strap sandals
    ctx.fillStyle = skinTone;
    ctx.beginPath();
    ctx.roundRect(7.2, 24 + leftY, 4.0, 10, [1, 1, 2, 2]); // Left leg
    ctx.roundRect(13.2, 24 + rightY, 4.0, 10, [1, 1, 2, 2]); // Right leg
    ctx.fill();

    // Knee kneecap definition and anatomical shadows
    ctx.strokeStyle = skinShadow;
    ctx.lineWidth = 0.9;
    ctx.beginPath();
    ctx.arc(9.2, 28 + leftY, 1.4, 0, Math.PI);
    ctx.arc(15.2, 28 + rightY, 1.4, 0, Math.PI);
    ctx.stroke();

    // Brown leather strapped sandals with textured sole & buckle
    const leftSandalX = 6.8 + (isSide ? (isRight ? 1.5 : -1.5) : 0);
    const rightSandalX = 12.8 + (isSide ? (isRight ? 1.5 : -1.5) : 0);
    const leftSandalY = 34 + leftY;
    const rightSandalY = 34 + rightY;

    ctx.fillStyle = '#78350F';
    ctx.beginPath();
    ctx.roundRect(leftSandalX, leftSandalY, 5.2, 3.2, 1);
    ctx.roundRect(rightSandalX, rightSandalY, 5.2, 3.2, 1);
    ctx.fill();
    // Sandal cross-straps
    ctx.fillStyle = '#451A03';
    ctx.fillRect(leftSandalX + 0.4, leftSandalY + 0.2, 4.4, 1.2);
    ctx.fillRect(rightSandalX + 0.4, rightSandalY + 0.2, 4.4, 1.2);
    // Brass buckle glint
    ctx.fillStyle = '#FBBF24';
    ctx.fillRect(leftSandalX + 3.8, leftSandalY + 0.4, 0.8, 0.8);
    ctx.fillRect(rightSandalX + 3.8, rightSandalY + 0.4, 0.8, 0.8);
  } else if (npc.id === 'lucy' || npc.id === 'sally') {
    const leftY = leftLegOffset * 0.3 - (leftLegOffset > 0 ? legLift : 0);
    const rightY = rightLegOffset * 0.3 - (rightLegOffset > 0 ? legLift : 0);

    // Bare leg calves
    ctx.fillStyle = skinTone;
    ctx.fillRect(8, 23.5 + leftY, 3.6, 4.0);
    ctx.fillRect(14, 23.5 + rightY, 3.6, 4.0);

    // Folded white bobby socks with fabric ribbing
    ctx.fillStyle = '#FFFFFF';
    ctx.beginPath();
    ctx.roundRect(7.4, 27.2 + leftY, 4.4, 5.8, [1, 1, 2, 2]);
    ctx.roundRect(13.4, 27.2 + rightY, 4.4, 5.8, [1, 1, 2, 2]);
    ctx.fill();
    // Sock cuff shadow & ribs
    ctx.strokeStyle = '#CBD5E1';
    ctx.lineWidth = 0.8;
    ctx.beginPath();
    ctx.moveTo(7.4, 28.5 + leftY);
    ctx.lineTo(11.8, 28.5 + leftY);
    ctx.moveTo(13.4, 28.5 + rightY);
    ctx.lineTo(17.8, 28.5 + rightY);
    ctx.stroke();

    // Polished Mary Jane shoes with strap & buckle
    const shoeColor = npc.id === 'lucy' ? '#18181B' : '#F8FAFC';
    const shoeTrim = npc.id === 'lucy' ? '#3F3F46' : '#E2E8F0';
    const leftShoeX = 6.8 + (isSide ? (isRight ? 1.5 : -1.5) : 0);
    const rightShoeX = 13.0 + (isSide ? (isRight ? 1.5 : -1.5) : 0);

    ctx.fillStyle = shoeColor;
    ctx.beginPath();
    ctx.roundRect(leftShoeX, 33 + leftY, 5.4, 4.2, [2, 2, 2, 2]);
    ctx.roundRect(rightShoeX, 33 + rightY, 5.4, 4.2, [2, 2, 2, 2]);
    ctx.fill();
    // Shoe strap across instep
    ctx.strokeStyle = shoeTrim;
    ctx.lineWidth = 0.8;
    ctx.beginPath();
    ctx.moveTo(leftShoeX + 0.4, 34.2 + leftY);
    ctx.lineTo(leftShoeX + 5.0, 34.2 + leftY);
    ctx.moveTo(rightShoeX + 0.4, 34.2 + rightY);
    ctx.lineTo(rightShoeX + 5.0, 34.2 + rightY);
    ctx.stroke();
    // Dark rubber soles
    ctx.fillStyle = '#09090B';
    ctx.fillRect(leftShoeX, 36.4 + leftY, 5.4, 1.1);
    ctx.fillRect(rightShoeX, 36.4 + rightY, 5.4, 1.1);
  } else {
    const leftY = leftLegOffset * 0.3 - (leftLegOffset > 0 ? legLift : 0);
    const rightY = rightLegOffset * 0.3 - (rightLegOffset > 0 ? legLift : 0);

    // Boys: Tailored shorts, ribbed socks, and polished leather oxfords
    // Dark tailored shorts with inseam
    ctx.fillStyle = '#18181B';
    ctx.beginPath();
    ctx.roundRect(6.2, 23 + idleBob * 0.3, 5.2, 5.2, [2, 2, 1, 1]);
    ctx.roundRect(12.8, 23 + idleBob * 0.3, 5.2, 5.2, [2, 2, 1, 1]);
    ctx.fill();

    // Human legs
    ctx.fillStyle = skinTone;
    ctx.fillRect(7.4, 27.8 + leftY, 3.4, 4.8);
    ctx.fillRect(13.8, 27.8 + rightY, 3.4, 4.8);

    // Ribbed white socks
    ctx.fillStyle = '#F8FAFC';
    ctx.fillRect(7.4, 30.2 + leftY, 3.4, 3.2);
    ctx.fillRect(13.8, 30.2 + rightY, 3.4, 3.2);
    ctx.strokeStyle = '#E2E8F0';
    ctx.lineWidth = 0.6;
    ctx.beginPath();
    ctx.moveTo(7.4, 31 + leftY);
    ctx.lineTo(10.8, 31 + leftY);
    ctx.moveTo(13.8, 31 + rightY);
    ctx.lineTo(17.2, 31 + rightY);
    ctx.stroke();

    // Polished oxfords with laces
    const leftOxfordX = 6.8 + (isSide ? (isRight ? 1.5 : -1.5) : 0);
    const rightOxfordX = 13.0 + (isSide ? (isRight ? 1.5 : -1.5) : 0);

    ctx.fillStyle = '#78350F';
    ctx.beginPath();
    ctx.roundRect(leftOxfordX, 33.4 + leftY, 5.2, 4.0, [2, 2, 2, 2]);
    ctx.roundRect(rightOxfordX, 33.4 + rightY, 5.2, 4.0, [2, 2, 2, 2]);
    ctx.fill();
    // Laces highlight
    ctx.fillStyle = '#B45309';
    ctx.fillRect(leftOxfordX + 1.4, 33.8 + leftY, 2.2, 1);
    ctx.fillRect(rightOxfordX + 1.4, 33.8 + rightY, 2.2, 1);
    // Dark stacked soles
    ctx.fillStyle = '#451A03';
    ctx.fillRect(leftOxfordX, 36.6 + leftY, 5.2, 1);
    ctx.fillRect(rightOxfordX, 36.6 + rightY, 5.2, 1);
  }

  // 2. TORSO & CLOTHING (Human anatomy with natural shoulders, waist contour and folds)
  ctx.save();
  ctx.translate(0, -idleBob * 0.5);

  if (npc.id === 'charlie_brown') {
    // Iconic Yellow Polo Shirt: Rich amber/yellow shading, tailored cut
    const shirtGrad = ctx.createLinearGradient(6, 17, 18, 25);
    shirtGrad.addColorStop(0, '#FEF08A');
    shirtGrad.addColorStop(0.5, '#FACC15');
    shirtGrad.addColorStop(1, '#EAB308');
    ctx.fillStyle = shirtGrad;
    ctx.beginPath();
    ctx.moveTo(5.2, 17);
    ctx.quadraticCurveTo(12, 15.2, 18.8, 17); // Sloped human shoulders
    ctx.lineTo(18.2, 25.2);
    ctx.lineTo(5.8, 25.2);
    ctx.closePath();
    ctx.fill();

    // Crisp Folded Polo Collar
    ctx.fillStyle = '#CA8A04';
    ctx.beginPath();
    ctx.moveTo(8.5, 16);
    ctx.lineTo(12, 19.2);
    ctx.lineTo(15.5, 16);
    ctx.lineTo(14, 15.5);
    ctx.lineTo(12, 17.5);
    ctx.lineTo(10, 15.5);
    ctx.closePath();
    ctx.fill();

    // Signature Black Chevron Zig-Zag Stripe with bold comic weight
    ctx.strokeStyle = '#18181B';
    ctx.lineWidth = 2.6;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.beginPath();
    ctx.moveTo(5.8, 21.2);
    ctx.lineTo(9, 23.6);
    ctx.lineTo(12, 21.2);
    ctx.lineTo(15, 23.6);
    ctx.lineTo(18.2, 21.2);
    ctx.stroke();

    // Short sleeves with natural arm drape & hands
    ctx.fillStyle = '#FACC15';
    ctx.fillRect(3.2, 17, 3.2, 4.2);
    ctx.fillRect(17.8, 17, 3.2, 4.2);
    ctx.fillStyle = skinTone; // Forearms and articulated hands
    ctx.beginPath();
    ctx.ellipse(4.4, 22.8, 1.5, 2.2, 0.05, 0, Math.PI * 2);
    ctx.ellipse(19.6, 22.8, 1.5, 2.2, -0.05, 0, Math.PI * 2);
    ctx.fill();
  } else if (npc.id === 'lucy') {
    // Royal blue dress with flared pleated skirt & gradient shading
    const dressGrad = ctx.createLinearGradient(7, 16, 17, 26);
    dressGrad.addColorStop(0, '#3B82F6');
    dressGrad.addColorStop(1, '#1D4ED8');
    ctx.fillStyle = dressGrad;
    ctx.beginPath();
    ctx.moveTo(6.8, 16.5);
    ctx.lineTo(17.2, 16.5);
    ctx.lineTo(20.0, 26);
    ctx.lineTo(4.0, 26);
    ctx.closePath();
    ctx.fill();

    // Pleat shadow lines giving deep fabric volume
    ctx.strokeStyle = '#1E40AF';
    ctx.lineWidth = 0.9;
    ctx.beginPath();
    ctx.moveTo(8.2, 20);
    ctx.lineTo(7.2, 26);
    ctx.moveTo(12, 19.2);
    ctx.lineTo(12, 26);
    ctx.moveTo(15.8, 20);
    ctx.lineTo(16.8, 26);
    ctx.stroke();

    // White rounded Peter Pan collar
    ctx.fillStyle = '#FFFFFF';
    ctx.beginPath();
    ctx.arc(12, 16.5, 3.0, 0, Math.PI);
    ctx.fill();
    ctx.strokeStyle = '#E2E8F0';
    ctx.lineWidth = 0.5;
    ctx.stroke();

    // Blue puffed sleeves & hands on hips (classic assertive Lucy posture)
    ctx.fillStyle = '#2563EB';
    ctx.beginPath();
    ctx.arc(4.8, 18, 2.4, 0, Math.PI * 2);
    ctx.arc(19.2, 18, 2.4, 0, Math.PI * 2);
    ctx.fill();
    // Forearms bent toward hips
    ctx.fillStyle = skinTone;
    ctx.beginPath();
    ctx.ellipse(4.4, 22, 1.6, 2.2, 0.35, 0, Math.PI * 2);
    ctx.ellipse(19.6, 22, 1.6, 2.2, -0.35, 0, Math.PI * 2);
    ctx.fill();
  } else if (npc.id === 'linus') {
    // Red crewneck t-shirt with thin black stripes
    ctx.fillStyle = '#DC2626';
    ctx.beginPath();
    ctx.moveTo(5.2, 17);
    ctx.quadraticCurveTo(12, 15.2, 18.8, 17);
    ctx.lineTo(18.2, 24.8);
    ctx.lineTo(5.8, 24.8);
    ctx.closePath();
    ctx.fill();

    // Black horizontal stripes
    ctx.strokeStyle = '#18181B';
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.moveTo(5.8, 19.5);
    ctx.lineTo(18.2, 19.5);
    ctx.moveTo(5.8, 22.5);
    ctx.lineTo(18.2, 22.5);
    ctx.stroke();

    // Red sleeves
    ctx.fillStyle = '#DC2626';
    ctx.fillRect(3.2, 17, 3.2, 3.6);
    ctx.fillRect(17.6, 17, 3.2, 3.6);

    // Left hand holding his sky-blue security blanket
    ctx.fillStyle = skinTone;
    ctx.beginPath();
    ctx.arc(4.4, 22.2, 1.6, 0, Math.PI * 2);
    ctx.arc(18.6, 21.6, 1.6, 0, Math.PI * 2);
    ctx.fill();

    // Linus's soft sky-blue security blanket draped naturally with velvet folds
    ctx.fillStyle = '#7DD3FC';
    ctx.beginPath();
    ctx.roundRect(16.5, 15.5, 8.5, 16, 3.5);
    ctx.fill();
    ctx.strokeStyle = '#38BDF8';
    ctx.lineWidth = 0.9;
    ctx.stroke();
    // Blanket corner folds
    ctx.strokeStyle = '#0284C7';
    ctx.beginPath();
    ctx.moveTo(18, 19);
    ctx.lineTo(21, 28);
    ctx.stroke();
  } else if (npc.id === 'sally') {
    // Light pink dress with black polka dots
    ctx.fillStyle = '#F472B6';
    ctx.beginPath();
    ctx.moveTo(6.8, 16.5);
    ctx.lineTo(17.2, 16.5);
    ctx.lineTo(19.8, 25.8);
    ctx.lineTo(4.2, 25.8);
    ctx.closePath();
    ctx.fill();

    // White Peter Pan collar
    ctx.fillStyle = '#FFFFFF';
    ctx.beginPath();
    ctx.arc(12, 16.5, 2.8, 0, Math.PI);
    ctx.fill();

    // Polka dots
    ctx.fillStyle = '#18181B';
    const dots = [[8, 19], [13.5, 18.5], [10, 22], [16, 22.5], [7.5, 24.5], [13, 24.8]];
    dots.forEach(([dx, dy]) => {
      ctx.beginPath();
      ctx.arc(dx, dy, 0.9, 0, Math.PI * 2);
      ctx.fill();
    });

    // Pink puffed sleeves & hands
    ctx.fillStyle = '#F472B6';
    ctx.beginPath();
    ctx.arc(4.8, 18, 2.2, 0, Math.PI * 2);
    ctx.arc(19.2, 18, 2.2, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = skinTone;
    ctx.beginPath();
    ctx.arc(4.6, 22.2, 1.5, 0, Math.PI * 2);
    ctx.arc(19.4, 22.2, 1.5, 0, Math.PI * 2);
    ctx.fill();
  } else if (npc.id === 'schroeder') {
    // Blue & purple striped knit sweater
    ctx.fillStyle = '#6366F1';
    ctx.beginPath();
    ctx.moveTo(5.2, 17);
    ctx.quadraticCurveTo(12, 15.2, 18.8, 17);
    ctx.lineTo(18.2, 24.8);
    ctx.lineTo(5.8, 24.8);
    ctx.closePath();
    ctx.fill();

    // Ribbed dark knit stripes
    ctx.strokeStyle = '#312E81';
    ctx.lineWidth = 1.4;
    ctx.beginPath();
    ctx.moveTo(5.8, 19.5);
    ctx.lineTo(18.2, 19.5);
    ctx.moveTo(5.8, 22.5);
    ctx.lineTo(18.2, 22.5);
    ctx.stroke();

    // Arms
    ctx.fillStyle = '#6366F1';
    ctx.fillRect(3.2, 17, 3.2, 5.2);
    ctx.fillRect(17.6, 17, 3.2, 5.2);
    ctx.fillStyle = skinTone;
    ctx.beginPath();
    ctx.ellipse(4.4, 23.6, 1.5, 2, 0, 0, Math.PI * 2);
    ctx.ellipse(19.6, 23.6, 1.5, 2, 0, 0, Math.PI * 2);
    ctx.fill();
  } else if (npc.id === 'peppermint_patty') {
    // Green polo jersey with white vertical pin-stripes
    ctx.fillStyle = '#16A34A';
    ctx.beginPath();
    ctx.moveTo(5.2, 17);
    ctx.quadraticCurveTo(12, 15.2, 18.8, 17);
    ctx.lineTo(18.2, 24.2);
    ctx.lineTo(5.8, 24.2);
    ctx.closePath();
    ctx.fill();

    // White pin-stripes
    ctx.strokeStyle = '#DCFCE7';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(9, 17);
    ctx.lineTo(9, 24);
    ctx.moveTo(12, 17);
    ctx.lineTo(12, 24);
    ctx.moveTo(15, 17);
    ctx.lineTo(15, 24);
    ctx.stroke();

    // Blue athletic shorts
    ctx.fillStyle = '#1E3A8A';
    ctx.fillRect(5.8, 23.6, 12.4, 2.6);

    // Bare athletic arms
    ctx.fillStyle = skinTone;
    ctx.beginPath();
    ctx.roundRect(3.0, 17.5, 3.0, 6.8, [1, 1, 2, 2]);
    ctx.roundRect(18.0, 17.5, 3.0, 6.8, [1, 1, 2, 2]);
    ctx.fill();
  } else if (npc.id === 'marcie') {
    // Burnt orange sweater & pleated brown skirt
    ctx.fillStyle = '#EA580C';
    ctx.beginPath();
    ctx.moveTo(5.2, 17);
    ctx.quadraticCurveTo(12, 15.2, 18.8, 17);
    ctx.lineTo(18.2, 23.8);
    ctx.lineTo(5.8, 23.8);
    ctx.closePath();
    ctx.fill();

    // Rolled turtleneck collar
    ctx.fillStyle = '#C2410C';
    ctx.beginPath();
    ctx.roundRect(9.2, 15.2, 5.6, 2.4, 1.2);
    ctx.fill();

    // Dark pleated skirt
    ctx.fillStyle = '#1E293B';
    ctx.beginPath();
    ctx.moveTo(5.8, 23.8);
    ctx.lineTo(18.2, 23.8);
    ctx.lineTo(19.2, 26.8);
    ctx.lineTo(4.8, 26.8);
    ctx.closePath();
    ctx.fill();

    // Arms
    ctx.fillStyle = '#EA580C';
    ctx.fillRect(3.2, 17, 3.2, 5.2);
    ctx.fillRect(17.6, 17, 3.2, 5.2);
    ctx.fillStyle = skinTone;
    ctx.beginPath();
    ctx.arc(4.4, 23.6, 1.5, 0, Math.PI * 2);
    ctx.arc(19.6, 23.6, 1.5, 0, Math.PI * 2);
    ctx.fill();
  } else {
    // Default child clothing
    ctx.fillStyle = npc.outfitColor || '#FBBF24';
    ctx.beginPath();
    ctx.roundRect(5.2, 16.5, 13.6, 8.8, [2, 2, 1, 1]);
    ctx.fill();
  }

  // 3. HUMAN NECK & HEAD
  // Anatomical Neck
  ctx.fillStyle = skinShadow;
  ctx.fillRect(10.5, 13.5, 3.0, 2.5);

  // Sculpted human child head with soft jaw & 3D gradient lighting
  const headGrad = ctx.createRadialGradient(10.5, 7.5, 2, 12, 8.8, 7.5);
  headGrad.addColorStop(0, skinHighlight);
  headGrad.addColorStop(0.5, skinTone);
  headGrad.addColorStop(1, skinShadow);
  ctx.fillStyle = headGrad;
  ctx.beginPath();
  ctx.ellipse(12, 8.8, 6.2, 6.8, 0, 0, Math.PI * 2);
  ctx.fill();

  // Natural healthy cheek & nose blush
  ctx.fillStyle = skinBlush;
  ctx.beginPath();
  ctx.ellipse(8.5, 10.6, 1.6, 1.1, 0, 0, Math.PI * 2);
  ctx.ellipse(15.5, 10.6, 1.6, 1.1, 0, 0, Math.PI * 2);
  ctx.fill();

  // Peppermint Patty cute freckles!
  if (npc.id === 'peppermint_patty') {
    ctx.fillStyle = '#C2410C';
    ctx.beginPath();
    ctx.arc(10.5, 10.2, 0.35, 0, Math.PI * 2);
    ctx.arc(11.2, 10.8, 0.35, 0, Math.PI * 2);
    ctx.arc(12.8, 10.8, 0.35, 0, Math.PI * 2);
    ctx.arc(13.5, 10.2, 0.35, 0, Math.PI * 2);
    ctx.fill();
  }

  // Human ears with lobe contour and inner helix
  ctx.fillStyle = skinTone;
  ctx.beginPath();
  ctx.arc(5.5, 9.2, 1.6, 0, Math.PI * 2);
  ctx.arc(18.5, 9.2, 1.6, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = skinShadow;
  ctx.lineWidth = 0.6;
  ctx.beginPath();
  ctx.arc(5.5, 9.2, 1.0, 0, Math.PI);
  ctx.arc(18.5, 9.2, 1.0, 0, Math.PI);
  ctx.stroke();

  // 4. EXPRESSIVE HUMAN EYES, NOSE & SMILE (DIRECTION-AWARE)
  if (isUp) {
    // Back of head neckline & nape shading when walking away
    ctx.fillStyle = skinShadow;
    ctx.beginPath();
    ctx.ellipse(12, 12.8, 3.4, 1.8, 0, 0, Math.PI * 2);
    ctx.fill();
  } else {
    const faceOffset = isSide ? (isRight ? 1.6 : -1.6) : 0;

    // Character-specific iris color
    let irisColor = '#78350F'; // Default warm hazel-brown
    if (npc.id === 'lucy') irisColor = '#1C1917'; // Rich espresso black
    else if (npc.id === 'linus') irisColor = '#9A3412'; // Warm amber-hazel
    else if (npc.id === 'sally') irisColor = '#2563EB'; // Bright sky sapphire
    else if (npc.id === 'schroeder') irisColor = '#1E293B'; // Deep navy slate
    else if (npc.id === 'peppermint_patty') irisColor = '#15803D'; // Warm hazel green

    if (npc.id === 'marcie') {
      // Marcie's stylish round wire glasses with glare and realistic human eyes behind
      ctx.fillStyle = 'rgba(255, 255, 255, 0.5)'; // Glass lens reflection
      ctx.beginPath();
      ctx.arc(9.2 + faceOffset, 8.8, 2.8, 0, Math.PI * 2);
      ctx.arc(14.8 + faceOffset, 8.8, 2.8, 0, Math.PI * 2);
      ctx.fill();

      // Sclera behind lens
      ctx.fillStyle = '#FFFFFF';
      ctx.beginPath();
      ctx.ellipse(9.2 + faceOffset, 8.8, 1.5, 1.3, 0, 0, Math.PI * 2);
      ctx.ellipse(14.8 + faceOffset, 8.8, 1.5, 1.3, 0, 0, Math.PI * 2);
      ctx.fill();

      // Warm dark eyes visible through spectacles
      ctx.fillStyle = '#27272A';
      ctx.beginPath();
      ctx.arc(9.3 + faceOffset, 8.8, 1.0, 0, Math.PI * 2);
      ctx.arc(14.7 + faceOffset, 8.8, 1.0, 0, Math.PI * 2);
      ctx.fill();

      // Specular catchlight sparkle
      ctx.fillStyle = '#FFFFFF';
      ctx.beginPath();
      ctx.arc(9.0 + faceOffset, 8.5, 0.4, 0, Math.PI * 2);
      ctx.arc(14.4 + faceOffset, 8.5, 0.4, 0, Math.PI * 2);
      ctx.fill();

      // Gold spectacle frames & nose bridge
      ctx.strokeStyle = '#FACC15';
      ctx.lineWidth = 1.3;
      ctx.beginPath();
      ctx.arc(9.2 + faceOffset, 8.8, 2.8, 0, Math.PI * 2);
      ctx.arc(14.8 + faceOffset, 8.8, 2.8, 0, Math.PI * 2);
      ctx.moveTo(11.9 + faceOffset, 8.8);
      ctx.lineTo(12.1 + faceOffset, 8.8);
      ctx.stroke();

      // Glass glare diagonal reflection streak
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.85)';
      ctx.lineWidth = 0.9;
      ctx.beginPath();
      ctx.moveTo(7.7 + faceOffset, 7.4);
      ctx.lineTo(9.6 + faceOffset, 9.6);
      ctx.moveTo(13.3 + faceOffset, 7.4);
      ctx.lineTo(15.2 + faceOffset, 9.6);
      ctx.stroke();
    } else {
      // Soft, expressive arched Peanuts eyebrows
      ctx.strokeStyle = npc.id === 'sally' ? '#CA8A04' : (npc.id === 'peppermint_patty' ? '#7C2D12' : '#3B1D11');
      ctx.lineWidth = 1.0;
      ctx.beginPath();
      ctx.moveTo(7.6 + faceOffset, 6.4);
      ctx.quadraticCurveTo(9.2 + faceOffset, 5.8, 10.8 + faceOffset, 6.4);
      ctx.moveTo(13.2 + faceOffset, 6.4);
      ctx.quadraticCurveTo(14.8 + faceOffset, 5.8, 16.4 + faceOffset, 6.4);
      ctx.stroke();

      // Natural animated blinking cycle (alive and breathing, zero creepy doll stare)
      const isCharBlinking = (Math.sin(time * 1.5 + (npc.id?.length || 0)) > 0.94);

      if (isCharBlinking) {
        ctx.strokeStyle = '#18181B';
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.arc(9.2 + faceOffset, 8.8, 1.3, 0.1, Math.PI - 0.1);
        ctx.arc(14.8 + faceOffset, 8.8, 1.3, 0.1, Math.PI - 0.1);
        ctx.stroke();
      } else if (npc.id === 'charlie_brown') {
        // Charlie Brown's iconic sweet ink dot eyes
        ctx.fillStyle = '#18181B';
        ctx.beginPath();
        ctx.arc(9.2 + faceOffset, 8.5, 1.2, 0, Math.PI * 2);
        ctx.arc(14.8 + faceOffset, 8.5, 1.2, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#FFFFFF';
        ctx.beginPath();
        ctx.arc(8.9 + faceOffset, 8.1, 0.4, 0, Math.PI * 2);
        ctx.arc(14.5 + faceOffset, 8.1, 0.4, 0, Math.PI * 2);
        ctx.fill();
      } else {
        // Expressive velvety ink eyes with warm spark of life
        ctx.fillStyle = '#18181B';
        ctx.beginPath();
        ctx.ellipse(9.2 + faceOffset, 8.5, 1.2, 1.55, 0, 0, Math.PI * 2);
        ctx.ellipse(14.8 + faceOffset, 8.5, 1.2, 1.55, 0, 0, Math.PI * 2);
        ctx.fill();

        // Subtle specular highlight sparkle
        ctx.fillStyle = '#FFFFFF';
        ctx.beginPath();
        ctx.arc(8.9 + faceOffset, 8.0, 0.45, 0, Math.PI * 2);
        ctx.arc(14.5 + faceOffset, 8.0, 0.45, 0, Math.PI * 2);
        ctx.fill();

        // Delicate upper lash line with classic Schulz curvature
        ctx.strokeStyle = '#18181B';
        ctx.lineWidth = 0.85;
        ctx.beginPath();
        ctx.arc(9.2 + faceOffset, 8.2, 1.5, Math.PI * 1.15, Math.PI * 1.85);
        ctx.arc(14.8 + faceOffset, 8.2, 1.5, Math.PI * 1.15, Math.PI * 1.85);
        ctx.stroke();

        // Lucy & Sally distinctive feminine upper corner lashes
        if (npc.id === 'lucy' || npc.id === 'sally') {
          ctx.lineWidth = 1.0;
          ctx.beginPath();
          ctx.moveTo(7.4 + faceOffset, 7.6);
          ctx.lineTo(8.2 + faceOffset, 8.2);
          ctx.moveTo(16.6 + faceOffset, 7.6);
          ctx.lineTo(15.8 + faceOffset, 8.2);
          ctx.stroke();
        }
      }
    }

    // Cute natural human button nose with gentle shadow
    ctx.fillStyle = 'rgba(234, 88, 12, 0.4)';
    ctx.beginPath();
    ctx.ellipse(12 + faceOffset, 9.8, 0.85, 0.6, 0, 0, Math.PI * 2);
    ctx.fill();

    // Sweet, warm natural smile
    ctx.strokeStyle = '#831843';
    ctx.lineWidth = 1.0;
    ctx.beginPath();
    ctx.arc(12 + faceOffset, 11.2, 1.9, 0.15, Math.PI - 0.15);
    ctx.stroke();
  }

  // 5. CHARACTER-SPECIFIC HAIRSTYLES (Human volume, flowing strands, specular highlights)
  if (npc.id === 'charlie_brown') {
    // Schulz signature curly loop on crown with hair texture
    ctx.strokeStyle = '#18181B';
    ctx.lineWidth = 1.4;
    ctx.beginPath();
    ctx.arc(12, 4.0, 2.3, Math.PI, Math.PI * 1.85);
    ctx.stroke();
    ctx.lineWidth = 0.9;
    ctx.beginPath();
    ctx.arc(12.8, 4.4, 1.2, Math.PI * 0.9, Math.PI * 1.7);
    ctx.stroke();
  } else if (npc.id === 'lucy') {
    // Glossy black scalloped curls bob with volume & rich hair shine
    ctx.fillStyle = '#18181B';
    ctx.beginPath();
    ctx.arc(12, 6.2, 8.0, Math.PI, Math.PI * 2);
    ctx.fill();

    // Scalloped bob side curls
    const curls = [[4.2, 7.8], [4.2, 11], [19.8, 7.8], [19.8, 11]];
    curls.forEach(([cx, cy]) => {
      ctx.beginPath();
      ctx.arc(cx, cy, 2.6, 0, Math.PI * 2);
      ctx.fill();
    });

    // Curled bangs across forehead
    ctx.beginPath();
    ctx.moveTo(5.5, 6.5);
    ctx.quadraticCurveTo(12, 4.5, 18.5, 6.5);
    ctx.quadraticCurveTo(12, 7.5, 5.5, 6.5);
    ctx.fill();

    // Glossy hair highlight arc
    ctx.strokeStyle = '#52525B';
    ctx.lineWidth = 0.9;
    ctx.beginPath();
    ctx.arc(12, 6.2, 6.8, Math.PI * 1.15, Math.PI * 1.85);
    ctx.stroke();
  } else if (npc.id === 'linus') {
    // Wispy brown hair tufts with organic variety
    ctx.strokeStyle = '#78350F';
    ctx.lineWidth = 1.5;
    ctx.lineCap = 'round';
    const spikes = [
      [8, 3.5, 6.8, -0.8],
      [10.2, 2.5, 10.0, -1.8],
      [13.8, 2.5, 14.2, -1.8],
      [16, 3.5, 17.2, -0.8]
    ];
    spikes.forEach(([x1, y1, x2, y2]) => {
      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
      ctx.stroke();
    });
  } else if (npc.id === 'sally') {
    // Bright golden blonde flipped hair
    ctx.fillStyle = '#FDE047';
    ctx.beginPath();
    ctx.arc(12, 6.2, 8.0, Math.PI, Math.PI * 2);
    ctx.fill();

    // Flipped ear curls with blonde texture
    ctx.beginPath();
    ctx.arc(4.0, 9.0, 3.0, 0, Math.PI * 2);
    ctx.arc(20.0, 9.0, 3.0, 0, Math.PI * 2);
    ctx.fill();

    // Blonde highlights
    ctx.strokeStyle = '#FEF08A';
    ctx.lineWidth = 0.9;
    ctx.beginPath();
    ctx.arc(12, 6.2, 6.6, Math.PI * 1.15, Math.PI * 1.85);
    ctx.stroke();

    // Sally's signature golden-orange hair ribbon / bow
    ctx.fillStyle = '#F59E0B';
    ctx.beginPath();
    ctx.arc(18.2, 4.4, 2.6, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#D97706';
    ctx.beginPath();
    ctx.arc(18.2, 4.4, 1.1, 0, Math.PI * 2);
    ctx.fill();
  } else if (npc.id === 'schroeder') {
    // Combed golden blonde hair with clean side part & specular sheen
    ctx.fillStyle = '#FACC15';
    ctx.beginPath();
    ctx.arc(12, 6.2, 7.8, Math.PI, Math.PI * 2);
    ctx.fill();
    // Side part styling
    ctx.strokeStyle = '#CA8A04';
    ctx.lineWidth = 1.0;
    ctx.beginPath();
    ctx.moveTo(11.8, 2.2);
    ctx.lineTo(11.8, 6.5);
    ctx.stroke();
    // Highlights
    ctx.strokeStyle = '#FEF08A';
    ctx.lineWidth = 0.8;
    ctx.beginPath();
    ctx.arc(12, 6.2, 6.5, Math.PI * 1.2, Math.PI * 1.5);
    ctx.stroke();
  } else if (npc.id === 'peppermint_patty') {
    // Auburn chin-length layered human hair
    ctx.fillStyle = '#9A3412';
    ctx.beginPath();
    ctx.arc(12, 6.2, 8.0, Math.PI, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.roundRect(3.6, 6.2, 3.4, 8.5, [1, 1, 2, 2]);
    ctx.roundRect(17.0, 6.2, 3.4, 8.5, [1, 1, 2, 2]);
    ctx.fill();
    // Auburn specular strand
    ctx.strokeStyle = '#EA580C';
    ctx.lineWidth = 0.8;
    ctx.beginPath();
    ctx.moveTo(5.0, 7.5);
    ctx.lineTo(5.0, 13.5);
    ctx.moveTo(19.0, 7.5);
    ctx.lineTo(19.0, 13.5);
    ctx.stroke();
  } else if (npc.id === 'marcie') {
    // Dark pageboy bob hair with neat bangs
    ctx.fillStyle = '#18181B';
    ctx.beginPath();
    ctx.arc(12, 6.2, 8.0, Math.PI, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.roundRect(3.8, 6.2, 3.4, 8.0, [1, 1, 2, 2]);
    ctx.roundRect(16.8, 6.2, 3.4, 8.0, [1, 1, 2, 2]);
    ctx.fill();
    // Glossy pageboy sheen
    ctx.strokeStyle = '#3F3F46';
    ctx.lineWidth = 0.8;
    ctx.beginPath();
    ctx.arc(12, 6.2, 6.8, Math.PI * 1.15, Math.PI * 1.85);
    ctx.stroke();
  } else if (npc.id === 'franklin') {
    // Short neat textured curly afro hair
    ctx.fillStyle = '#1C1917';
    ctx.beginPath();
    ctx.arc(12, 6.0, 7.8, Math.PI, Math.PI * 2);
    ctx.fill();
    // Textured curl edges
    for (let angle = Math.PI; angle <= Math.PI * 2; angle += 0.45) {
      const cx = 12 + Math.cos(angle) * 7.5;
      const cy = 6.0 + Math.sin(angle) * 7.5;
      ctx.beginPath();
      ctx.arc(cx, cy, 1.8, 0, Math.PI * 2);
      ctx.fill();
    }
  } else if (npc.id === 'pig_pen') {
    // Messy tousled spikes of dusty brown hair
    ctx.fillStyle = '#451A03';
    ctx.beginPath();
    ctx.arc(12, 6.2, 7.5, Math.PI, Math.PI * 2);
    ctx.fill();
    // Wild dusty spikes pointing in different directions
    ctx.strokeStyle = '#451A03';
    ctx.lineWidth = 1.4;
    const spikes = [[8, 1, 6, -3], [11, 0, 11, -4], [14, 0, 16, -3], [6, 4, 3, 2], [18, 4, 21, 2]];
    spikes.forEach(([sx, sy, ex, ey]) => {
      ctx.beginPath();
      ctx.moveTo(sx, sy);
      ctx.lineTo(ex, ey);
      ctx.stroke();
    });
  }

  // Pig-Pen iconic animated swirling cloud of dust particles
  if (npc.id === 'pig_pen') {
    ctx.save();
    for (let i = 0; i < 8; i++) {
      const angle = time * 2.5 + i * (Math.PI / 4);
      const dist = 14 + Math.sin(time * 3 + i * 1.2) * 5;
      const px = 12 + Math.cos(angle) * dist;
      const py = 20 + Math.sin(angle * 1.4) * (dist * 0.6) - (i % 3) * 5;
      const radius = 2.0 + Math.sin(time * 4 + i) * 0.8;
      ctx.fillStyle = i % 2 === 0 ? 'rgba(168, 138, 107, 0.42)' : 'rgba(120, 113, 108, 0.35)';
      ctx.beginPath();
      ctx.arc(px, py, Math.max(1, radius), 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }

  ctx.restore();
}

function drawThinkingWall(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number
) {
  ctx.save();
  // Cast shadow
  ctx.fillStyle = 'rgba(0, 0, 0, 0.18)';
  ctx.fillRect(x - 2, y + h, w + 4, 5);

  // Brick body
  ctx.fillStyle = '#B91C1C';
  ctx.fillRect(x, y + 5, w, h - 5);
  ctx.strokeStyle = '#450A0A';
  ctx.lineWidth = 1.8;
  ctx.strokeRect(x, y + 5, w, h - 5);

  // Running bond brick pattern
  const rowH = 5.5;
  let rowCount = 0;
  for (let by = y + 5; by < y + h; by += rowH) {
    ctx.strokeStyle = '#7F1D1D';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(x, by);
    ctx.lineTo(x + w, by);
    ctx.stroke();

    const offset = (rowCount % 2 === 0) ? 0 : 12;
    for (let bx = x + offset; bx < x + w; bx += 24) {
      if (bx > x && bx < x + w) {
        ctx.beginPath();
        ctx.moveTo(bx, by);
        ctx.lineTo(bx, Math.min(by + rowH, y + h));
        ctx.stroke();
      }
    }
    rowCount++;
  }

  // Smooth concrete capstone on top with bevel
  ctx.fillStyle = '#E5E7EB';
  ctx.fillRect(x - 5, y, w + 10, 7);
  ctx.strokeStyle = '#374151';
  ctx.lineWidth = 1.4;
  ctx.strokeRect(x - 5, y, w + 10, 7);

  // Capstone highlight
  ctx.fillStyle = '#F9FAFB';
  ctx.fillRect(x - 4, y + 1, w + 8, 2);

  // Wildflowers and grass tufts growing at wall base
  ctx.fillStyle = '#16A34A';
  for (let gx = x + 4; gx < x + w - 4; gx += 16) {
    ctx.beginPath();
    ctx.moveTo(gx, y + h + 2);
    ctx.lineTo(gx - 2, y + h - 4);
    ctx.lineTo(gx + 1, y + h + 2);
    ctx.fill();
  }
  const flowerCols = ['#FBBF24', '#A855F7', '#F472B6', '#38BDF8'];
  for (let i = 0; i < 4; i++) {
    const fx = x + 15 + i * 32;
    ctx.fillStyle = flowerCols[i % flowerCols.length];
    ctx.beginPath();
    ctx.arc(fx, y + h - 2, 2, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.restore();
}

function drawKiteTree(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  time: number
) {
  ctx.save();

  // 1. Realistic dappled canopy shadow on the grass
  drawDappledCanopyShadow(ctx, x + 16, y + 74, 58, 20, time);

  // Soil and humus mound around ancient root base
  ctx.fillStyle = 'rgba(38, 24, 14, 0.42)';
  ctx.beginPath();
  ctx.ellipse(x + 16, y + 74, 46, 12, 0, 0, Math.PI * 2);
  ctx.fill();

  // Roots flared into soil
  ctx.fillStyle = '#5A2609';
  ctx.beginPath();
  ctx.moveTo(x - 12, y + 74);
  ctx.quadraticCurveTo(x + 5, y + 65, x + 8, y + 45);
  ctx.lineTo(x + 28, y + 45);
  ctx.quadraticCurveTo(x + 30, y + 65, x + 46, y + 74);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = '#18181B';
  ctx.lineWidth = 2;
  ctx.stroke();

  // Micro-grass tufts nestling against trunk roots
  ctx.fillStyle = '#2d6325';
  ctx.beginPath();
  ctx.moveTo(x - 14, y + 75);
  ctx.lineTo(x - 16, y + 67);
  ctx.lineTo(x - 12, y + 75);
  ctx.moveTo(x + 44, y + 75);
  ctx.lineTo(x + 48, y + 66);
  ctx.lineTo(x + 46, y + 75);
  ctx.fill();

  // Thick gnarled trunk with branches splitting
  ctx.fillStyle = '#78350F';
  ctx.beginPath();
  ctx.moveTo(x + 6, y + 70);
  ctx.quadraticCurveTo(x - 4, y + 35, x - 22, y + 10);
  ctx.lineTo(x - 6, y + 6);
  ctx.quadraticCurveTo(x + 12, y + 25, x + 18, y + 6);
  ctx.lineTo(x + 32, y + 8);
  ctx.quadraticCurveTo(x + 28, y + 28, x + 48, y + 12);
  ctx.lineTo(x + 56, y + 20);
  ctx.quadraticCurveTo(x + 36, y + 40, x + 30, y + 70);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Schulz bark ink texture lines
  ctx.strokeStyle = '#451A03';
  ctx.lineWidth = 1.2;
  ctx.beginPath();
  ctx.moveTo(x + 12, y + 68);
  ctx.quadraticCurveTo(x + 8, y + 48, x + 5, y + 28);
  ctx.moveTo(x + 22, y + 68);
  ctx.quadraticCurveTo(x + 20, y + 48, x + 24, y + 26);
  ctx.stroke();

  // Knot in tree trunk
  ctx.strokeStyle = '#18181B';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.arc(x + 16, y + 42, 4.5, 0.4, Math.PI * 1.8);
  ctx.stroke();

  // Massive billowy leafy foliage masses with rich organic volume
  const kiteFoliageLobes = [
    { cx: x - 26, cy: y + 4, r: 38, col: '#064E3B', midCol: '#14532D', lightCol: '#15803D' },
    { cx: x + 48, cy: y + 2, r: 40, col: '#064E3B', midCol: '#14532D', lightCol: '#15803D' },
    { cx: x + 14, cy: y - 10, r: 52, col: '#14532D', midCol: '#15803D', lightCol: '#16A34A' },
    { cx: x - 12, cy: y - 22, r: 36, col: '#15803D', midCol: '#16A34A', lightCol: '#22C55E' },
    { cx: x + 30, cy: y - 22, r: 38, col: '#15803D', midCol: '#16A34A', lightCol: '#22C55E' },
    { cx: x + 8, cy: y - 36, r: 28, col: '#16A34A', midCol: '#22C55E', lightCol: '#4ADE80' }
  ];

  kiteFoliageLobes.forEach((l) => {
    const fGrad = ctx.createRadialGradient(
      l.cx - l.r * 0.25,
      l.cy - l.r * 0.3,
      l.r * 0.1,
      l.cx,
      l.cy,
      l.r
    );
    fGrad.addColorStop(0, l.lightCol);
    fGrad.addColorStop(0.55, l.midCol);
    fGrad.addColorStop(1, l.col);
    ctx.fillStyle = fGrad;

    ctx.beginPath();
    const numScallops = 11;
    for (let s = 0; s < numScallops; s++) {
      const angle = (s / numScallops) * Math.PI * 2;
      const nextAngle = ((s + 1) / numScallops) * Math.PI * 2;
      const midAngle = (angle + nextAngle) / 2;
      const r1 = l.r * (0.92 + Math.sin(s * 2.1 + x) * 0.08);
      const rBump = l.r * (1.06 + Math.sin(s * 1.8) * 0.07);
      const px = l.cx + Math.cos(angle) * r1;
      const py = l.cy + Math.sin(angle) * r1;
      const cpx = l.cx + Math.cos(midAngle) * rBump;
      const cpy = l.cy + Math.sin(midAngle) * rBump;
      const nextPx = l.cx + Math.cos(nextAngle) * r1;
      const nextPy = l.cy + Math.sin(nextAngle) * r1;
      if (s === 0) ctx.moveTo(px, py);
      ctx.quadraticCurveTo(cpx, cpy, nextPx, nextPy);
    }
    ctx.closePath();
    ctx.fill();

    ctx.strokeStyle = '#052E16';
    ctx.lineWidth = 1.4;
    ctx.stroke();

    ctx.strokeStyle = l.lightCol;
    ctx.lineWidth = 1.3;
    ctx.beginPath();
    ctx.arc(l.cx - 3, l.cy - l.r * 0.35, l.r * 0.45, 0.4, Math.PI * 0.85);
    ctx.stroke();
  });

  // TRAPPED KITES FLUTTERING IN THE BRANCHES!
  const flutter = Math.sin(time * 4) * 3.5;

  // 1. Charlie Brown's famous Yellow Kite with Black Zigzag!
  const cbKiteX = x + 22;
  const cbKiteY = y - 24 + flutter;
  ctx.save();
  ctx.translate(cbKiteX, cbKiteY);
  ctx.rotate(0.2);

  ctx.fillStyle = '#FACC15';
  ctx.beginPath();
  ctx.moveTo(0, -16);
  ctx.lineTo(12, 0);
  ctx.lineTo(0, 16);
  ctx.lineTo(-12, 0);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = '#18181B';
  ctx.lineWidth = 1.5;
  ctx.stroke();

  // Signature zigzag
  ctx.strokeStyle = '#18181B';
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.moveTo(-10, -2);
  ctx.lineTo(-5, 4);
  ctx.lineTo(0, -2);
  ctx.lineTo(5, 4);
  ctx.lineTo(10, -2);
  ctx.stroke();

  // Tail string and bows
  ctx.strokeStyle = '#FFFFFF';
  ctx.lineWidth = 1.2;
  ctx.beginPath();
  ctx.moveTo(0, 16);
  const tailSway = Math.sin(time * 5) * 5;
  ctx.quadraticCurveTo(8 + tailSway, 28, 4 + tailSway * 1.5, 42);
  ctx.stroke();

  const bowCols = ['#EF4444', '#3B82F6', '#10B981'];
  for (let b = 0; b < 3; b++) {
    const by = 22 + b * 8;
    const bx = (b * 2) + tailSway * (0.3 + b * 0.3);
    ctx.fillStyle = bowCols[b];
    ctx.fillRect(bx - 3, by - 1.5, 6, 3);
  }
  ctx.restore();

  // 2. Red Diamond Kite tangled on left branch
  const redKiteX = x - 20;
  const redKiteY = y - 6 - flutter;
  ctx.save();
  ctx.translate(redKiteX, redKiteY);
  ctx.rotate(-0.35);
  ctx.fillStyle = '#EF4444';
  ctx.beginPath();
  ctx.moveTo(0, -14);
  ctx.lineTo(10, 0);
  ctx.lineTo(0, 14);
  ctx.lineTo(-10, 0);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = '#18181B';
  ctx.lineWidth = 1.4;
  ctx.stroke();
  ctx.restore();

  ctx.restore();
}

function drawBaseballDiamond(ctx: CanvasRenderingContext2D, x: number, y: number) {
  ctx.save();

  // Infield clay arc (warm ochre sand with dirt texture)
  ctx.fillStyle = '#D97706';
  ctx.beginPath();
  ctx.ellipse(x, y + 4, 88, 62, 0, 0, Math.PI * 2);
  ctx.fill();

  // Raked clay circular texture rings
  ctx.strokeStyle = '#B45309';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.ellipse(x, y + 4, 76, 52, 0, 0, Math.PI * 2);
  ctx.stroke();
  ctx.beginPath();
  ctx.ellipse(x, y + 4, 60, 40, 0, 0, Math.PI * 2);
  ctx.stroke();

  // Infield grass island cutout in center
  ctx.fillStyle = '#16A34A';
  ctx.beginPath();
  ctx.ellipse(x, y - 2, 42, 28, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#15803D';
  ctx.lineWidth = 1.2;
  ctx.stroke();

  // Base paths
  const homeX = x;
  const homeY = y + 42;
  const firstX = x + 52;
  const firstY = y + 2;
  const secondX = x;
  const secondY = y - 36;
  const thirdX = x - 52;
  const thirdY = y + 2;

  // White chalk base lines
  ctx.strokeStyle = '#FFFFFF';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(homeX, homeY);
  ctx.lineTo(firstX, firstY);
  ctx.lineTo(secondX, secondY);
  ctx.lineTo(thirdX, thirdY);
  ctx.closePath();
  ctx.stroke();

  // Chalk foul lines extending into outfield
  ctx.beginPath();
  ctx.moveTo(firstX, firstY);
  ctx.lineTo(firstX + 38, firstY - 26);
  ctx.moveTo(thirdX, thirdY);
  ctx.lineTo(thirdX - 38, thirdY - 26);
  ctx.stroke();

  // Yellow foul poles at edges
  ctx.fillStyle = '#FACC15';
  ctx.fillRect(firstX + 37, firstY - 44, 3, 20);
  ctx.fillRect(thirdX - 39, thirdY - 44, 3, 20);
  ctx.fillStyle = '#FBBF24';
  ctx.beginPath();
  ctx.moveTo(firstX + 40, firstY - 44);
  ctx.lineTo(firstX + 50, firstY - 40);
  ctx.lineTo(firstX + 40, firstY - 36);
  ctx.closePath();
  ctx.fill();

  // Pitcher's raised dirt mound
  const moundX = x;
  const moundY = y - 2;
  ctx.fillStyle = '#B45309';
  ctx.beginPath();
  ctx.ellipse(moundX, moundY, 14, 9, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#92400E';
  ctx.lineWidth = 1;
  ctx.stroke();

  // White pitcher rubber pitching plate
  ctx.fillStyle = '#FFFFFF';
  ctx.fillRect(moundX - 6, moundY - 2, 12, 4);
  ctx.strokeStyle = '#18181B';
  ctx.lineWidth = 1;
  ctx.strokeRect(moundX - 6, moundY - 2, 12, 4);

  // Five-sided Home Plate at batter box
  ctx.fillStyle = '#FFFFFF';
  ctx.beginPath();
  ctx.moveTo(homeX - 5, homeY - 3);
  ctx.lineTo(homeX + 5, homeY - 3);
  ctx.lineTo(homeX + 5, homeY + 1);
  ctx.lineTo(homeX, homeY + 5);
  ctx.lineTo(homeX - 5, homeY + 1);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = '#18181B';
  ctx.lineWidth = 1;
  ctx.stroke();

  // Chalk batter's boxes
  ctx.strokeStyle = '#FFFFFF';
  ctx.lineWidth = 1.2;
  ctx.strokeRect(homeX - 16, homeY - 6, 8, 14);
  ctx.strokeRect(homeX + 8, homeY - 6, 8, 14);

  // Bases: 1st, 2nd, 3rd (Raised white canvas square bags)
  const drawBaseBag = (bx: number, by: number) => {
    ctx.fillStyle = '#F8FAFC';
    ctx.beginPath();
    ctx.roundRect(bx - 4.5, by - 4.5, 9, 9, 1.5);
    ctx.fill();
    ctx.strokeStyle = '#475569';
    ctx.lineWidth = 1;
    ctx.stroke();
    ctx.fillStyle = '#CBD5E1';
    ctx.fillRect(bx - 1.5, by - 1.5, 3, 3);
  };
  drawBaseBag(firstX, firstY);
  drawBaseBag(secondX, secondY);
  drawBaseBag(thirdX, thirdY);

  // Wooden wire backstop fence behind home plate
  const bsX = homeX - 36;
  const bsY = homeY + 14;
  const bsW = 72;
  const bsH = 22;

  ctx.fillStyle = '#78350F';
  ctx.fillRect(bsX, bsY, 4, bsH);
  ctx.fillRect(bsX + bsW / 2 - 2, bsY, 4, bsH);
  ctx.fillRect(bsX + bsW - 4, bsY, 4, bsH);
  ctx.fillRect(bsX, bsY, bsW, 3);
  ctx.fillRect(bsX, bsY + bsH - 3, bsW, 3);

  // Wire mesh
  ctx.strokeStyle = '#94A3B8';
  ctx.lineWidth = 0.8;
  for (let mx = bsX + 6; mx < bsX + bsW; mx += 8) {
    ctx.beginPath();
    ctx.moveTo(mx, bsY + 3);
    ctx.lineTo(mx + 6, bsY + bsH - 3);
    ctx.moveTo(mx + 6, bsY + 3);
    ctx.lineTo(mx, bsY + bsH - 3);
    ctx.stroke();
  }

  // Wooden player dugout bench
  ctx.fillStyle = '#92400E';
  ctx.fillRect(firstX + 16, firstY + 14, 32, 7);
  ctx.strokeStyle = '#451A03';
  ctx.lineWidth = 1;
  ctx.strokeRect(firstX + 16, firstY + 14, 32, 7);
  ctx.fillStyle = '#451A03';
  ctx.fillRect(firstX + 18, firstY + 21, 3, 5);
  ctx.fillRect(firstX + 43, firstY + 21, 3, 5);

  // Baseball bat
  ctx.save();
  ctx.translate(homeX + 22, homeY + 6);
  ctx.rotate(0.6);
  ctx.fillStyle = '#D97706';
  ctx.fillRect(-2, -14, 4, 16);
  ctx.fillRect(-1.2, 2, 2.4, 6);
  ctx.fillStyle = '#18181B';
  ctx.fillRect(-1.5, 7, 3, 1.5);
  ctx.restore();

  // White baseball with red stitching
  const ballX = homeX + 18;
  const ballY = homeY + 12;
  ctx.fillStyle = '#FFFFFF';
  ctx.beginPath();
  ctx.arc(ballX, ballY, 3, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#18181B';
  ctx.lineWidth = 0.8;
  ctx.stroke();
  ctx.strokeStyle = '#EF4444';
  ctx.lineWidth = 0.6;
  ctx.beginPath();
  ctx.arc(ballX - 1.2, ballY, 2, -0.8, 0.8);
  ctx.arc(ballX + 1.2, ballY, 2, Math.PI - 0.8, Math.PI + 0.8);
  ctx.stroke();

  // Charlie Brown's brown leather glove
  const mittX = moundX - 18;
  const mittY = moundY + 6;
  ctx.fillStyle = '#854D0E';
  ctx.beginPath();
  ctx.ellipse(mittX, mittY, 5, 4, 0.3, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#451A03';
  ctx.lineWidth = 1;
  ctx.stroke();

  // Wooden scoreboard
  const sbX = thirdX - 32;
  const sbY = thirdY + 16;
  ctx.fillStyle = '#1E293B';
  ctx.fillRect(sbX, sbY, 38, 18);
  ctx.strokeStyle = '#78350F';
  ctx.lineWidth = 1.5;
  ctx.strokeRect(sbX, sbY, 38, 18);
  ctx.fillStyle = '#FDE047';
  ctx.font = 'bold 5.5px sans-serif';
  ctx.fillText('PEANUTS: 2', sbX + 3, sbY + 7);
  ctx.fillText('RIVALS: 1', sbX + 3, sbY + 14);

  ctx.restore();
}

function drawSchoolBuilding(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  timeOfDay: TimeOfDay = 'day'
) {
  const isNight = timeOfDay === 'night';
  const isSunset = timeOfDay === 'sunset';
  const isDawn = timeOfDay === 'dawn';

  ctx.save();
  // Foundation shadow
  ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
  ctx.fillRect(x - 4, y + h, w + 8, 8);

  // Stone foundation base
  ctx.fillStyle = '#78716C';
  ctx.fillRect(x, y + h - 8, w, 8);
  ctx.strokeStyle = '#44403C';
  ctx.lineWidth = 1;
  ctx.strokeRect(x, y + h - 8, w, 8);

  // Red brick body
  ctx.fillStyle = '#991B1B';
  ctx.fillRect(x, y, w, h - 8);
  ctx.strokeStyle = '#18181B';
  ctx.lineWidth = 2.2;
  ctx.strokeRect(x, y, w, h - 8);

  // Masonry brick courses
  ctx.strokeStyle = 'rgba(0, 0, 0, 0.15)';
  ctx.lineWidth = 1;
  for (let by = y + 8; by < y + h - 12; by += 8) {
    ctx.beginPath();
    ctx.moveTo(x, by);
    ctx.lineTo(x + w, by);
    ctx.stroke();
  }

  // Windows with white stone lintels
  const winY1 = y + 28;
  const winY2 = y + 75;
  const winWidth = 26;
  const winHeight = 30;

  const schoolWins = [
    { wx: x + 16, wy: winY1 },
    { wx: x + 54, wy: winY1 },
    { wx: x + w - 80, wy: winY1 },
    { wx: x + w - 42, wy: winY1 },
    { wx: x + 16, wy: winY2 },
    { wx: x + 54, wy: winY2 },
    { wx: x + w - 80, wy: winY2 },
    { wx: x + w - 42, wy: winY2 }
  ];

  schoolWins.forEach(({ wx, wy }) => {
    ctx.fillStyle = '#E5E7EB';
    ctx.fillRect(wx - 3, wy - 4, winWidth + 6, 4);
    ctx.strokeStyle = '#4B5563';
    ctx.lineWidth = 1;
    ctx.strokeRect(wx - 3, wy - 4, winWidth + 6, 4);
    drawWindow(ctx, wx, wy, winWidth, winHeight, isNight, isSunset, isDawn);
  });

  // Roof cornice
  ctx.fillStyle = '#7F1D1D';
  ctx.fillRect(x - 8, y - 8, w + 16, 10);
  ctx.strokeStyle = '#18181B';
  ctx.lineWidth = 2;
  ctx.strokeRect(x - 8, y - 8, w + 16, 10);

  // Central cupola / bell tower
  const btx = x + w / 2 - 18;
  const bty = y - 36;
  ctx.fillStyle = '#F8FAFC';
  ctx.fillRect(btx, bty, 36, 28);
  ctx.strokeStyle = '#18181B';
  ctx.lineWidth = 1.5;
  ctx.strokeRect(btx, bty, 36, 28);

  ctx.beginPath();
  ctx.moveTo(btx - 4, bty);
  ctx.lineTo(btx + 18, bty - 16);
  ctx.lineTo(btx + 40, bty);
  ctx.closePath();
  ctx.fillStyle = '#1E3A8A';
  ctx.fill();
  ctx.stroke();

  // Bronze bell
  ctx.fillStyle = '#D97706';
  ctx.beginPath();
  ctx.arc(btx + 18, bty + 14, 6, Math.PI, Math.PI * 2);
  ctx.lineTo(btx + 25, bty + 19);
  ctx.lineTo(btx + 11, bty + 19);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = '#78350F';
  ctx.lineWidth = 1;
  ctx.stroke();

  // Flagpole with waving flag
  const poleX = x + w - 16;
  const poleY = y + h - 8;
  ctx.fillStyle = '#CBD5E1';
  ctx.fillRect(poleX, poleY - 80, 3, 80);
  ctx.fillStyle = '#FBBF24';
  ctx.beginPath();
  ctx.arc(poleX + 1.5, poleY - 80, 3, 0, Math.PI * 2);
  ctx.fill();

  // Waving flag
  ctx.fillStyle = '#EF4444';
  ctx.fillRect(poleX + 3, poleY - 78, 22, 14);
  ctx.fillStyle = '#1D4ED8';
  ctx.fillRect(poleX + 3, poleY - 78, 9, 7);
  ctx.fillStyle = '#FFFFFF';
  ctx.fillRect(poleX + 12, poleY - 75, 13, 2.5);
  ctx.fillRect(poleX + 12, poleY - 70, 13, 2.5);
  ctx.fillRect(poleX + 3, poleY - 67, 22, 2.5);

  // Double entrance doors
  const doorW = 44;
  const doorH = 48;
  const doorX = x + w / 2 - doorW / 2;
  const doorY = y + h - doorH - 8;

  ctx.fillStyle = '#E5E7EB';
  ctx.fillRect(doorX - 6, doorY - 10, doorW + 12, doorH + 10);
  ctx.strokeStyle = '#374151';
  ctx.lineWidth = 1.5;
  ctx.strokeRect(doorX - 6, doorY - 10, doorW + 12, doorH + 10);

  // Arched fanlight transom
  ctx.fillStyle = '#FEF08A';
  ctx.beginPath();
  ctx.arc(doorX + doorW / 2, doorY - 2, 14, Math.PI, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#18181B';
  ctx.lineWidth = 1.2;
  ctx.stroke();

  // Dark wooden doors
  ctx.fillStyle = '#451A03';
  ctx.fillRect(doorX, doorY, doorW, doorH);
  ctx.strokeStyle = '#18181B';
  ctx.lineWidth = 1.5;
  ctx.strokeRect(doorX, doorY, doorW, doorH);

  ctx.beginPath();
  ctx.moveTo(doorX + doorW / 2, doorY);
  ctx.lineTo(doorX + doorW / 2, doorY + doorH);
  ctx.stroke();

  // Brass handles
  ctx.fillStyle = '#FBBF24';
  ctx.beginPath();
  ctx.arc(doorX + doorW / 2 - 4, doorY + 24, 2, 0, Math.PI * 2);
  ctx.arc(doorX + doorW / 2 + 4, doorY + 24, 2, 0, Math.PI * 2);
  ctx.fill();

  // Carved school name plaque
  ctx.fillStyle = '#FEF3C7';
  ctx.fillRect(x + w / 2 - 55, y + 10, 110, 14);
  ctx.strokeStyle = '#92400E';
  ctx.lineWidth = 1.2;
  ctx.strokeRect(x + w / 2 - 55, y + 10, 110, 14);
  ctx.fillStyle = '#78350F';
  ctx.font = 'bold 8px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('ELEMENTARY SCHOOL', x + w / 2, y + 20);
  ctx.textAlign = 'start';

  // Hopscotch court on sidewalk
  const hsX = x + 30;
  const hsY = y + h + 10;
  const hopscotchColors = ['#F43F5E', '#3B82F6', '#10B981', '#F59E0B', '#8B5CF6'];
  ctx.lineWidth = 1.2;
  for (let s = 0; s < 5; s++) {
    ctx.strokeStyle = hopscotchColors[s % hopscotchColors.length];
    ctx.strokeRect(hsX, hsY + s * 12, 14, 12);
    ctx.fillStyle = hopscotchColors[s % hopscotchColors.length];
    ctx.font = 'bold 7px sans-serif';
    ctx.fillText(`${s + 1}`, hsX + 4, hsY + s * 12 + 9);
  }

  ctx.restore();
}

function drawTimberBoardSegment(
  ctx: CanvasRenderingContext2D,
  bx: number,
  by: number,
  bw: number,
  bh: number,
  orientation: 'horizontal' | 'vertical',
  withRail: boolean = true
) {
  // Natural pine/cedar wood body
  const woodGrad = ctx.createLinearGradient(
    bx,
    by,
    orientation === 'horizontal' ? bx : bx + bw,
    orientation === 'horizontal' ? by + bh : by
  );
  woodGrad.addColorStop(0, '#A16207');
  woodGrad.addColorStop(0.5, '#CA8A04');
  woodGrad.addColorStop(1, '#78350F');
  ctx.fillStyle = woodGrad;
  ctx.fillRect(bx, by, bw, bh);
  ctx.strokeStyle = '#451A03';
  ctx.lineWidth = 1.2;
  ctx.strokeRect(bx, by, bw, bh);

  // Upright timber posts with bolting plates every 32px
  ctx.fillStyle = '#451A03';
  if (orientation === 'horizontal') {
    for (let px = bx + 16; px < bx + bw - 10; px += 32) {
      ctx.fillRect(px - 2, by, 4, bh);
      // Small iron bolt heads
      ctx.fillStyle = '#CBD5E1';
      ctx.fillRect(px - 1, by + 3, 2, 2);
      ctx.fillRect(px - 1, by + bh - 5, 2, 2);
      ctx.fillStyle = '#451A03';
    }
    // Bottom kickplate (scuffed dark composite)
    ctx.fillStyle = '#1E293B';
    ctx.fillRect(bx, by + bh - 3, bw, 3);
  } else {
    for (let py = by + 16; py < by + bh - 10; py += 32) {
      ctx.fillRect(bx, py - 2, bw, 4);
      ctx.fillStyle = '#CBD5E1';
      ctx.fillRect(bx + 3, py - 1, 2, 2);
      ctx.fillRect(bx + bw - 5, py - 1, 2, 2);
      ctx.fillStyle = '#451A03';
    }
  }

  // Glossy dark red handrail cap
  if (withRail) {
    ctx.fillStyle = '#991B1B';
    if (orientation === 'horizontal') {
      ctx.fillRect(bx - 1, by - 2, bw + 2, 4);
      ctx.strokeStyle = '#450A0A';
      ctx.lineWidth = 0.8;
      ctx.strokeRect(bx - 1, by - 2, bw + 2, 4);
      // Snow frost dusting on top of rail
      ctx.fillStyle = 'rgba(255, 255, 255, 0.75)';
      ctx.fillRect(bx, by - 2, bw, 1.2);
    } else {
      ctx.fillRect(bx - 2, by - 1, 4, bh + 2);
      ctx.strokeStyle = '#450A0A';
      ctx.lineWidth = 0.8;
      ctx.strokeRect(bx - 2, by - 1, 4, bh + 2);
      ctx.fillStyle = 'rgba(255, 255, 255, 0.75)';
      ctx.fillRect(bx - 2, by, 1.2, bh);
    }
  }
}

function drawIceRinkPerimeter(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  time: number = 0
) {
  ctx.save();

  // 1. SOFT AMBIENT CONTACT SHADOW UNDERNEATH RINK & BOARDS
  ctx.fillStyle = 'rgba(15, 23, 42, 0.22)';
  ctx.beginPath();
  ctx.roundRect(x - 6, y - 4, w + 12, h + 14, 22);
  ctx.fill();

  // 2. NATURAL GROUND INTEGRATION: PLOWED SNOW DRIFT BANKS AROUND PERIMETER
  // Piled soft snow berms created by clearing the ice - blends organically with the lawn!
  ctx.fillStyle = '#E2E8F0';
  ctx.beginPath();
  ctx.roundRect(x - 8, y - 6, w + 16, h + 14, 24);
  ctx.fill();

  // Fluffy snow highlights
  ctx.fillStyle = '#F8FAFC';
  for (let sx = x - 4; sx < x + w + 4; sx += 18) {
    // Top & bottom snow mounds
    const snowH = 4 + Math.sin(sx * 0.3) * 2.5;
    ctx.beginPath();
    ctx.ellipse(sx, y - 2, 12, snowH, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(sx, y + h + 2, 12, snowH + 1, 0, 0, Math.PI * 2);
    ctx.fill();
  }
  for (let sy = y; sy < y + h; sy += 16) {
    // East snow mounds
    ctx.beginPath();
    ctx.ellipse(x + w + 2, sy, 5, 10, 0, 0, Math.PI * 2);
    ctx.fill();
    // West snow mounds (skipping the entrance from y+65 to y+105)
    if (sy < y + 60 || sy > y + 110) {
      ctx.beginPath();
      ctx.ellipse(x - 2, sy, 5, 10, 0, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // 3. GLACIAL ICE SHEET (Multi-depth crystalline surface)
  const iceBase = ctx.createLinearGradient(x, y, x + w, y + h);
  iceBase.addColorStop(0, '#E0F2FE');
  iceBase.addColorStop(0.25, '#BAE6FD');
  iceBase.addColorStop(0.65, '#93C5FD');
  iceBase.addColorStop(1, '#7DD3FC');
  ctx.fillStyle = iceBase;
  ctx.beginPath();
  ctx.roundRect(x + 4, y + 4, w - 8, h - 8, 16);
  ctx.fill();

  // Translucent glacial depth layer
  const iceRadial = ctx.createRadialGradient(
    x + w * 0.45,
    y + h * 0.4,
    20,
    x + w * 0.5,
    y + h * 0.5,
    w * 0.55
  );
  iceRadial.addColorStop(0, 'rgba(240, 249, 255, 0.7)');
  iceRadial.addColorStop(0.5, 'rgba(186, 230, 253, 0.4)');
  iceRadial.addColorStop(1, 'rgba(147, 197, 253, 0.2)');
  ctx.fillStyle = iceRadial;
  ctx.beginPath();
  ctx.roundRect(x + 4, y + 4, w - 8, h - 8, 16);
  ctx.fill();

  // 4. FROZEN CRYSTALLINE HAIRLINE CRACKS & AIR BUBBLES
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.55)';
  ctx.lineWidth = 1;
  const iceCracks = [
    { start: [x + 50, y + 45], points: [[x + 65, y + 55], [x + 85, y + 50], [x + 105, y + 65]] },
    { start: [x + 140, y + 110], points: [[x + 155, y + 100], [x + 175, y + 105], [x + 185, y + 95]] },
    { start: [x + 80, y + 125], points: [[x + 95, y + 135], [x + 115, y + 130]] },
    { start: [x + 160, y + 40], points: [[x + 170, y + 52], [x + 182, y + 50]] }
  ];
  iceCracks.forEach((c) => {
    ctx.beginPath();
    ctx.moveTo(c.start[0], c.start[1]);
    c.points.forEach((pt) => ctx.lineTo(pt[0], pt[1]));
    ctx.stroke();
  });

  // Frozen air bubbles in the ice
  ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
  const bubbles = [
    [x + 45, y + 60, 2], [x + 48, y + 63, 1.2], [x + 90, y + 75, 1.8],
    [x + 130, y + 50, 2.2], [x + 165, y + 120, 2], [x + 170, y + 125, 1.4],
    [x + 110, y + 140, 1.8], [x + 70, y + 100, 1.5], [x + 180, y + 70, 2.5]
  ];
  bubbles.forEach(([bx, by, br]) => {
    ctx.beginPath();
    ctx.arc(bx, by, br, 0, Math.PI * 2);
    ctx.fill();
  });

  // 5. AUTHENTIC SKATE BLADE CARVINGS & POWDER SPRAY RUTS
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.75)';
  ctx.lineWidth = 1.6;
  const skateSwirls = [
    // Center figure-eight arcs
    () => {
      ctx.beginPath();
      ctx.arc(x + 110, y + 75, 32, -0.4, Math.PI * 1.4);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(x + 110, y + 115, 30, Math.PI * 0.6, Math.PI * 2.3);
      ctx.stroke();
    },
    // Sweeping high speed corner turns
    () => {
      ctx.beginPath();
      ctx.moveTo(x + 40, y + 35);
      ctx.quadraticCurveTo(x + 85, y + 75, x + 45, y + 125);
      ctx.stroke();
    },
    () => {
      ctx.beginPath();
      ctx.moveTo(x + 180, y + 45);
      ctx.quadraticCurveTo(x + 140, y + 85, x + 185, y + 120);
      ctx.stroke();
    },
    // Fast stop skids with shaved ice powder
    () => {
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.85)';
      ctx.lineWidth = 2.4;
      ctx.beginPath();
      ctx.moveTo(x + 95, y + 90);
      ctx.lineTo(x + 125, y + 84);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(x + 98, y + 93);
      ctx.lineTo(x + 128, y + 87);
      ctx.stroke();
    }
  ];
  skateSwirls.forEach((draw) => draw());

  // Shaved white ice powder spray patches
  ctx.fillStyle = 'rgba(255, 255, 255, 0.35)';
  ctx.beginPath();
  ctx.ellipse(x + 112, y + 87, 22, 7, -0.2, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(x + 65, y + 105, 16, 5, 0.3, 0, Math.PI * 2);
  ctx.fill();

  // Subtle animated sparkle on ice surface
  const sparklePhase = (time * 2.5) % (Math.PI * 2);
  const sp1 = Math.abs(Math.sin(sparklePhase));
  const sp2 = Math.abs(Math.sin(sparklePhase + 1.8));
  ctx.fillStyle = `rgba(255, 255, 255, ${0.4 + sp1 * 0.5})`;
  ctx.beginPath();
  ctx.arc(x + 85, y + 62, 1.8 + sp1, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = `rgba(255, 255, 255, ${0.4 + sp2 * 0.5})`;
  ctx.beginPath();
  ctx.arc(x + 145, y + 102, 1.8 + sp2, 0, Math.PI * 2);
  ctx.fill();

  // 6. RUSTIC TIMBER DASHER BOARDS (Sideboards)
  drawTimberBoardSegment(ctx, x, y, w, 14, 'horizontal', true);
  drawTimberBoardSegment(ctx, x, y + h - 14, w, 14, 'horizontal', true);
  drawTimberBoardSegment(ctx, x + w - 14, y, 14, h, 'vertical', true);
  // Left sideboard (with 40px entrance opening from y+65 to y+105)
  drawTimberBoardSegment(ctx, x, y, 14, 65, 'vertical', true);
  drawTimberBoardSegment(ctx, x, y + 105, 14, h - 105, 'vertical', true);

  // 7. ENTRANCE GATE OPENING: Heavy-duty textured rubber runner mat
  const matX = x - 14;
  const matY = y + 68;
  const matW = 32;
  const matH = 34;
  ctx.fillStyle = '#1E293B';
  ctx.beginPath();
  ctx.roundRect(matX, matY, matW, matH, 3);
  ctx.fill();
  ctx.strokeStyle = '#0F172A';
  ctx.lineWidth = 1;
  ctx.stroke();

  // Rubber tread grooved lines
  ctx.strokeStyle = '#334155';
  ctx.lineWidth = 1;
  for (let gy = matY + 3; gy < matY + matH - 2; gy += 4) {
    ctx.beginPath();
    ctx.moveTo(matX + 2, gy);
    ctx.lineTo(matX + matW - 2, gy);
    ctx.stroke();
  }

  // Wooden gate door swung open against outer post
  ctx.fillStyle = '#854D0E';
  ctx.fillRect(x - 12, y + 42, 6, 24);
  ctx.strokeStyle = '#451A03';
  ctx.lineWidth = 1;
  ctx.strokeRect(x - 12, y + 42, 6, 24);
  // Iron gate latch & hinges
  ctx.fillStyle = '#1F2937';
  ctx.fillRect(x - 13, y + 46, 8, 3);
  ctx.fillRect(x - 13, y + 58, 8, 3);

  // 8. RUSTIC WOODEN RESTING BENCH WITH VINTAGE SKATES
  const benchX = x + w - 44;
  const benchY = y + h - 26;
  const benchW = 38;
  const benchH = 16;
  // Bench shadow
  ctx.fillStyle = 'rgba(0, 0, 0, 0.25)';
  ctx.beginPath();
  ctx.roundRect(benchX - 2, benchY + benchH - 4, benchW + 4, 8, 3);
  ctx.fill();

  // Sturdy wooden slats
  ctx.fillStyle = '#78350F';
  ctx.beginPath();
  ctx.roundRect(benchX, benchY, benchW, benchH - 6, 3);
  ctx.fill();
  ctx.strokeStyle = '#451A03';
  ctx.lineWidth = 1;
  ctx.stroke();
  // Slat separation lines
  ctx.strokeStyle = '#92400E';
  ctx.beginPath();
  ctx.moveTo(benchX + 2, benchY + 5);
  ctx.lineTo(benchX + benchW - 2, benchY + 5);
  ctx.stroke();
  // Bench wooden legs
  ctx.fillStyle = '#451A03';
  ctx.fillRect(benchX + 3, benchY + benchH - 6, 4, 6);
  ctx.fillRect(benchX + benchW - 7, benchY + benchH - 6, 4, 6);

  // Pair of vintage leather ice skates resting on bench
  const skateX = benchX + 8;
  const skateY = benchY - 2;
  ctx.fillStyle = '#92400E';
  ctx.beginPath();
  ctx.roundRect(skateX, skateY, 8, 7, [2, 3, 1, 1]);
  ctx.fill();
  ctx.strokeStyle = '#451A03';
  ctx.lineWidth = 0.8;
  ctx.stroke();
  // Silver blade underneath
  ctx.strokeStyle = '#E2E8F0';
  ctx.lineWidth = 1.2;
  ctx.beginPath();
  ctx.moveTo(skateX - 1, skateY + 8);
  ctx.lineTo(skateX + 9, skateY + 8);
  ctx.stroke();
  // Blade stanchions
  ctx.strokeStyle = '#94A3B8';
  ctx.lineWidth = 0.8;
  ctx.beginPath();
  ctx.moveTo(skateX + 1, skateY + 6);
  ctx.lineTo(skateX + 1, skateY + 8);
  ctx.moveTo(skateX + 7, skateY + 6);
  ctx.lineTo(skateX + 7, skateY + 8);
  ctx.stroke();

  // 9. OUTDOOR WARMING BRAZIER / FIRE BARREL (Beside entrance)
  const barrelX = x - 26;
  const barrelY = y + 114;
  const fireGlow = ctx.createRadialGradient(barrelX, barrelY, 2, barrelX, barrelY, 34);
  fireGlow.addColorStop(0, 'rgba(251, 146, 60, 0.45)');
  fireGlow.addColorStop(0.5, 'rgba(234, 88, 12, 0.18)');
  fireGlow.addColorStop(1, 'rgba(234, 88, 12, 0)');
  ctx.fillStyle = fireGlow;
  ctx.beginPath();
  ctx.arc(barrelX, barrelY, 34, 0, Math.PI * 2);
  ctx.fill();

  // Cast iron barrel drum
  ctx.fillStyle = '#1E293B';
  ctx.fillRect(barrelX - 8, barrelY - 14, 16, 18);
  ctx.strokeStyle = '#0F172A';
  ctx.lineWidth = 1.2;
  ctx.strokeRect(barrelX - 8, barrelY - 14, 16, 18);
  // Metal barrel hoops
  ctx.strokeStyle = '#475569';
  ctx.beginPath();
  ctx.moveTo(barrelX - 8, barrelY - 9);
  ctx.lineTo(barrelX + 8, barrelY - 9);
  ctx.moveTo(barrelX - 8, barrelY - 2);
  ctx.lineTo(barrelX + 8, barrelY - 2);
  ctx.stroke();

  // Glowing charcoal embers & animated flame tips inside
  const flameFlicker = Math.sin(time * 6) * 2;
  ctx.fillStyle = '#EF4444';
  ctx.beginPath();
  ctx.ellipse(barrelX, barrelY - 14, 7, 3, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#F59E0B';
  ctx.beginPath();
  ctx.moveTo(barrelX - 4, barrelY - 14);
  ctx.quadraticCurveTo(barrelX, barrelY - 22 + flameFlicker, barrelX + 2, barrelY - 26 + flameFlicker * 0.8);
  ctx.quadraticCurveTo(barrelX + 4, barrelY - 20, barrelX + 5, barrelY - 14);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = '#FEF08A';
  ctx.beginPath();
  ctx.arc(barrelX + 1, barrelY - 16, 2.5, 0, Math.PI * 2);
  ctx.fill();

  // 10. FESTIVE TIMBER POLES & RETRO EDISON BULBS
  const poles = [
    { px: x + 6, py: y + 6 },
    { px: x + w - 6, py: y + 6 },
    { px: x + w - 6, py: y + h - 6 },
    { px: x + 6, py: y + h - 6 }
  ];
  poles.forEach((p) => {
    ctx.fillStyle = '#78350F';
    ctx.fillRect(p.px - 3, p.py - 24, 6, 24);
    ctx.strokeStyle = '#451A03';
    ctx.lineWidth = 1;
    ctx.strokeRect(p.px - 3, p.py - 24, 6, 24);
    ctx.fillStyle = '#B91C1C';
    ctx.fillRect(p.px - 4, p.py - 26, 8, 3);
  });

  // Hanging festive string with glowing vintage bulbs along north edge
  ctx.strokeStyle = '#18181B';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(x + 6, y - 18);
  ctx.quadraticCurveTo(x + w * 0.5, y - 10, x + w - 6, y - 18);
  ctx.stroke();

  const bulbCols = ['#F59E0B', '#EF4444', '#10B981', '#3B82F6', '#FACC15'];
  for (let bi = 1; bi <= 6; bi++) {
    const bx = x + 6 + bi * ((w - 12) / 7);
    const by = y - 18 + Math.sin((bi / 7) * Math.PI) * 8;
    ctx.fillStyle = 'rgba(254, 240, 138, 0.4)';
    ctx.beginPath();
    ctx.arc(bx, by + 4, 6, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = bulbCols[bi % bulbCols.length];
    ctx.beginPath();
    ctx.ellipse(bx, by + 4, 2.5, 3.5, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#18181B';
    ctx.lineWidth = 0.5;
    ctx.stroke();
  }

  ctx.restore();
}

function drawLucyBooth(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number
) {
  ctx.save();
  ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
  ctx.beginPath();
  ctx.ellipse(x + w / 2, y + h + 2, w / 2 + 6, 5, 0, 0, Math.PI * 2);
  ctx.fill();

  // Blue wooden crate body
  ctx.fillStyle = '#2563EB';
  ctx.fillRect(x, y, w, h);
  ctx.strokeStyle = '#18181B';
  ctx.lineWidth = 2;
  ctx.strokeRect(x, y, w, h);

  // Planks
  ctx.strokeStyle = '#1D4ED8';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(x + w * 0.33, y);
  ctx.lineTo(x + w * 0.33, y + h);
  ctx.moveTo(x + w * 0.66, y);
  ctx.lineTo(x + w * 0.66, y + h);
  ctx.stroke();

  // Wooden counter
  ctx.fillStyle = '#78350F';
  ctx.fillRect(x - 3, y + 14, w + 6, 5);
  ctx.strokeStyle = '#18181B';
  ctx.lineWidth = 1.2;
  ctx.strokeRect(x - 3, y + 14, w + 6, 5);

  // Overhead roof awning
  ctx.fillStyle = '#1D4ED8';
  ctx.fillRect(x - 6, y - 16, w + 12, 16);
  ctx.strokeStyle = '#18181B';
  ctx.lineWidth = 1.8;
  ctx.strokeRect(x - 6, y - 16, w + 12, 16);

  // "PSYCHIATRIC HELP 5¢"
  ctx.fillStyle = '#FEF08A';
  ctx.font = 'bold 7px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('PSYCHIATRIC', x + w / 2, y - 9);
  ctx.fillText('HELP 5¢', x + w / 2, y - 2);

  // Plaque: "THE DOCTOR IS IN"
  ctx.fillStyle = '#FEF3C7';
  ctx.fillRect(x + 4, y + 24, w - 8, 12);
  ctx.strokeStyle = '#92400E';
  ctx.lineWidth = 1;
  ctx.strokeRect(x + 4, y + 24, w - 8, 12);

  ctx.fillStyle = '#15803D';
  ctx.font = 'bold 6.5px sans-serif';
  ctx.fillText('THE DOCTOR', x + w / 2, y + 31);
  ctx.fillText('IS [ IN ]', x + w / 2, y + 35);
  ctx.textAlign = 'start';

  // Yellow coin tin can
  ctx.fillStyle = '#FACC15';
  ctx.fillRect(x + w - 12, y + 9, 7, 6);
  ctx.strokeStyle = '#78350F';
  ctx.lineWidth = 0.8;
  ctx.strokeRect(x + w - 12, y + 9, 7, 6);
  ctx.fillStyle = '#78350F';
  ctx.font = 'bold 4.5px sans-serif';
  ctx.fillText('5¢', x + w - 10, y + 13.5);

  // Stool
  ctx.fillStyle = '#92400E';
  ctx.beginPath();
  ctx.ellipse(x + 12, y + h + 10, 8, 4, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#451A03';
  ctx.lineWidth = 1;
  ctx.stroke();
  ctx.fillStyle = '#451A03';
  ctx.fillRect(x + 7, y + h + 11, 2, 7);
  ctx.fillRect(x + 15, y + h + 11, 2, 7);

  ctx.restore();
}

function drawPicketFence(ctx: CanvasRenderingContext2D, x: number, y: number, w: number) {
  ctx.save();
  // Horizontal cross rails
  ctx.fillStyle = '#E2E8F0';
  ctx.fillRect(x, y + 6, w, 3.5);
  ctx.fillRect(x, y + 15, w, 3.5);
  ctx.strokeStyle = '#94A3B8';
  ctx.lineWidth = 0.8;
  ctx.strokeRect(x, y + 6, w, 3.5);
  ctx.strokeRect(x, y + 15, w, 3.5);

  // Pointed pickets with gothic / dog-ear tips
  const picketStep = 12;
  for (let px = x; px < x + w; px += picketStep) {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.08)';
    ctx.fillRect(px + 1, y, 6, 22);

    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(px, y + 3, 6, 19);

    ctx.beginPath();
    ctx.moveTo(px, y + 3);
    ctx.lineTo(px + 3, y - 2);
    ctx.lineTo(px + 6, y + 3);
    ctx.closePath();
    ctx.fill();

    ctx.strokeStyle = '#CBD5E1';
    ctx.lineWidth = 0.8;
    ctx.beginPath();
    ctx.moveTo(px, y + 22);
    ctx.lineTo(px, y + 3);
    ctx.lineTo(px + 3, y - 2);
    ctx.lineTo(px + 6, y + 3);
    ctx.lineTo(px + 6, y + 22);
    ctx.stroke();
  }

  // Sturdy posts with rounded caps
  for (let postX = x; postX <= x + w; postX += 60) {
    ctx.fillStyle = '#F8FAFC';
    ctx.fillRect(postX - 2, y - 4, 8, 27);
    ctx.strokeStyle = '#64748B';
    ctx.lineWidth = 1;
    ctx.strokeRect(postX - 2, y - 4, 8, 27);

    ctx.beginPath();
    ctx.moveTo(postX - 3, y - 4);
    ctx.lineTo(postX + 2, y - 8);
    ctx.lineTo(postX + 7, y - 4);
    ctx.closePath();
    ctx.fillStyle = '#FFFFFF';
    ctx.fill();
    ctx.stroke();
  }

  // Grass blades along fence base
  ctx.fillStyle = '#16A34A';
  for (let gx = x + 3; gx < x + w; gx += 18) {
    ctx.beginPath();
    ctx.moveTo(gx, y + 22);
    ctx.lineTo(gx - 2, y + 17);
    ctx.lineTo(gx + 1, y + 22);
    ctx.fill();
  }

  ctx.restore();
}

function drawStreetLamp(ctx: CanvasRenderingContext2D, x: number, y: number, timeOfDay: TimeOfDay = 'day') {
  ctx.save();
  const isNight = timeOfDay === 'night';
  const isSunset = timeOfDay === 'sunset';

  ctx.fillStyle = '#1E293B';
  ctx.beginPath();
  ctx.moveTo(x - 5, y);
  ctx.lineTo(x + 5, y);
  ctx.lineTo(x + 2, y - 8);
  ctx.lineTo(x - 2, y - 8);
  ctx.closePath();
  ctx.fill();

  ctx.fillRect(x - 2, y - 44, 4, 38);

  // Ladder rest ornate crossbar
  ctx.fillRect(x - 8, y - 36, 16, 2.5);
  ctx.beginPath();
  ctx.arc(x - 8, y - 35, 1.8, 0, Math.PI * 2);
  ctx.arc(x + 8, y - 35, 1.8, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillRect(x - 6, y - 45, 12, 3);

  const lampColor = isNight ? '#FEF08A' : isSunset ? '#FBBF24' : '#E2E8F0';
  ctx.fillStyle = lampColor;
  ctx.beginPath();
  ctx.moveTo(x - 5, y - 45);
  ctx.lineTo(x - 6, y - 56);
  ctx.lineTo(x + 6, y - 56);
  ctx.lineTo(x + 5, y - 45);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = '#0F172A';
  ctx.lineWidth = 1.2;
  ctx.stroke();

  ctx.fillStyle = '#0F172A';
  ctx.fillRect(x - 7, y - 58, 14, 3);
  ctx.beginPath();
  ctx.moveTo(x - 5, y - 58);
  ctx.lineTo(x, y - 64);
  ctx.lineTo(x + 5, y - 58);
  ctx.closePath();
  ctx.fill();

  if (isNight) {
    // Subtle glass lantern glow (realistic, not an oversized blurry orb)
    const halo = ctx.createRadialGradient(x, y - 50, 1, x, y - 50, 12);
    halo.addColorStop(0, 'rgba(254, 240, 138, 0.55)');
    halo.addColorStop(0.5, 'rgba(251, 191, 36, 0.20)');
    halo.addColorStop(1, 'rgba(251, 191, 36, 0)');
    ctx.fillStyle = halo;
    ctx.beginPath();
    ctx.arc(x, y - 50, 12, 0, Math.PI * 2);
    ctx.fill();

    const groundPool = ctx.createRadialGradient(x, y + 2, 4, x, y + 2, 48);
    groundPool.addColorStop(0, 'rgba(254, 240, 138, 0.25)');
    groundPool.addColorStop(0.5, 'rgba(251, 191, 36, 0.10)');
    groundPool.addColorStop(1, 'rgba(251, 191, 36, 0)');
    ctx.fillStyle = groundPool;
    ctx.beginPath();
    ctx.ellipse(x, y + 2, 48, 16, 0, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.restore();
}

function drawPeanutsTree(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  radius: number,
  time: number = 0
) {
  ctx.save();

  // 1. SOFT DAPPLED CANOPY CONTACT SHADOW ON THE GRASS
  drawDappledCanopyShadow(ctx, x + 4, y + 26, radius * 1.2, radius * 0.45, time);

  // 2. ROOT FLARE INTO SOIL WITH ORGANIC SPREAD & HUMUS MOUND
  ctx.fillStyle = 'rgba(40, 25, 15, 0.42)';
  ctx.beginPath();
  ctx.ellipse(x + 1, y + 27, radius * 0.45, 7, 0, 0, Math.PI * 2);
  ctx.fill();

  // Organic flared roots grasping into the soil
  ctx.fillStyle = '#451A03';
  ctx.beginPath();
  ctx.moveTo(x - 12, y + 28);
  ctx.quadraticCurveTo(x - 6, y + 16, x - 5, y + 4);
  ctx.lineTo(x + 7, y + 4);
  ctx.quadraticCurveTo(x + 8, y + 16, x + 14, y + 28);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = '#18181B';
  ctx.lineWidth = 1.6;
  ctx.stroke();

  // Natural grass blades sprouting around roots
  ctx.fillStyle = '#15803D';
  for (let i = -14; i <= 14; i += 7) {
    ctx.beginPath();
    ctx.moveTo(x + i, y + 28);
    ctx.lineTo(x + i - 2, y + 22);
    ctx.lineTo(x + i + 1, y + 28);
    ctx.fill();
  }

  // Trunk with rich bark gradient & vertical furrow ridges
  const trunkW = Math.max(10, radius * 0.28);
  const trunkGrad = ctx.createLinearGradient(x - trunkW / 2, y, x + trunkW / 2, y);
  trunkGrad.addColorStop(0, '#451A03');
  trunkGrad.addColorStop(0.35, '#78350F');
  trunkGrad.addColorStop(0.7, '#854D0E');
  trunkGrad.addColorStop(1, '#3E1906');
  ctx.fillStyle = trunkGrad;
  ctx.fillRect(x - trunkW / 2, y - 8, trunkW, 34);
  ctx.strokeStyle = '#18181B';
  ctx.lineWidth = 1.6;
  ctx.strokeRect(x - trunkW / 2, y - 8, trunkW, 34);

  // Vertical bark grooves
  ctx.strokeStyle = '#270F04';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(x - 2, y - 4);
  ctx.lineTo(x - 2, y + 22);
  ctx.moveTo(x + 2, y + 2);
  ctx.lineTo(x + 2, y + 24);
  ctx.stroke();

  // 3. ORGANIC BILLOWY FOLIAGE CANOPY (Rich, multi-layered leaf clusters, NO flat geometric balls!)
  const sway = Math.sin(time * 2.0 + x * 0.05) * 2.2;
  const lobes = [
    // Underside deep shadow lobes (back layer)
    { dx: -radius * 0.42 + sway * 0.4, dy: -radius * 0.15, r: radius * 0.75, col: '#064E3B', midCol: '#14532D', lightCol: '#15803D' },
    { dx: radius * 0.42 + sway * 0.4, dy: -radius * 0.15, r: radius * 0.75, col: '#064E3B', midCol: '#14532D', lightCol: '#15803D' },
    // Midtone lush canopy
    { dx: 0 + sway * 0.6, dy: -radius * 0.42, r: radius * 0.95, col: '#14532D', midCol: '#15803D', lightCol: '#16A34A' },
    // Front sunlit leaf clusters
    { dx: -radius * 0.22 + sway * 0.7, dy: -radius * 0.68, r: radius * 0.65, col: '#15803D', midCol: '#16A34A', lightCol: '#22C55E' },
    { dx: radius * 0.22 + sway * 0.7, dy: -radius * 0.68, r: radius * 0.65, col: '#15803D', midCol: '#16A34A', lightCol: '#22C55E' },
    // Crown highlight cluster
    { dx: 0 + sway * 0.8, dy: -radius * 0.85, r: radius * 0.5, col: '#16A34A', midCol: '#22C55E', lightCol: '#4ADE80' }
  ];

  lobes.forEach((l) => {
    // Soft radial volumetric graduation
    const fGrad = ctx.createRadialGradient(
      x + l.dx - l.r * 0.25,
      y + l.dy - l.r * 0.3,
      l.r * 0.1,
      x + l.dx,
      y + l.dy,
      l.r
    );
    fGrad.addColorStop(0, l.lightCol);
    fGrad.addColorStop(0.55, l.midCol);
    fGrad.addColorStop(1, l.col);
    ctx.fillStyle = fGrad;

    // Organic cloud-like scalloped perimeter
    ctx.beginPath();
    const cx = x + l.dx;
    const cy = y + l.dy;
    const cr = l.r;
    const numScallops = 10;
    for (let s = 0; s < numScallops; s++) {
      const angle = (s / numScallops) * Math.PI * 2;
      const nextAngle = ((s + 1) / numScallops) * Math.PI * 2;
      const midAngle = (angle + nextAngle) / 2;
      const r1 = cr * (0.92 + Math.sin(s * 2.3 + x) * 0.08);
      const rBump = cr * (1.05 + Math.sin(s * 1.7) * 0.07);
      const px = cx + Math.cos(angle) * r1;
      const py = cy + Math.sin(angle) * r1;
      const cpx = cx + Math.cos(midAngle) * rBump;
      const cpy = cy + Math.sin(midAngle) * rBump;
      const nextPx = cx + Math.cos(nextAngle) * r1;
      const nextPy = cy + Math.sin(nextAngle) * r1;
      if (s === 0) ctx.moveTo(px, py);
      ctx.quadraticCurveTo(cpx, cpy, nextPx, nextPy);
    }
    ctx.closePath();
    ctx.fill();

    // Natural deep organic foliage contour (soft dark green, NOT harsh black!)
    ctx.strokeStyle = '#052E16';
    ctx.lineWidth = 1.4;
    ctx.stroke();

    // Delicate sunlit leaf scallop highlights along the top edge
    ctx.strokeStyle = l.lightCol;
    ctx.lineWidth = 1.3;
    ctx.beginPath();
    ctx.arc(cx - 3, cy - l.r * 0.35, l.r * 0.45, 0.4, Math.PI * 0.85);
    ctx.stroke();
  });

  ctx.restore();
}

// Furniture helpers for interiors
function drawCozySofa(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  color: string
) {
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, 8);
  ctx.fill();
  ctx.strokeStyle = '#1F2937';
  ctx.lineWidth = 1.5;
  ctx.stroke();
}

function drawArmchair(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  color: string
) {
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, 6);
  ctx.fill();
  ctx.strokeStyle = '#1F2937';
  ctx.stroke();
}

function drawBed(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  color: string
) {
  // Bed frame & mattress
  ctx.fillStyle = '#F3F4F6';
  ctx.fillRect(x, y, w, h);
  ctx.strokeStyle = '#1F2937';
  ctx.lineWidth = 1.5;
  ctx.strokeRect(x, y, w, h);

  // Blanket
  ctx.fillStyle = color;
  ctx.fillRect(x, y + 25, w, h - 25);

  // Pillow
  ctx.fillStyle = '#FFFFFF';
  ctx.fillRect(x + 10, y + 6, w - 20, 16);
  ctx.strokeRect(x + 10, y + 6, w - 20, 16);
}

function drawWritingDesk(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  title: string
) {
  ctx.fillStyle = '#B45309';
  ctx.fillRect(x, y, w, h);
  ctx.strokeStyle = '#1F2937';
  ctx.lineWidth = 1.5;
  ctx.strokeRect(x, y, w, h);

  // Sheet of writing paper & lamp
  ctx.fillStyle = '#FFFFFF';
  ctx.fillRect(x + 14, y + 8, 22, 28);
  ctx.strokeRect(x + 14, y + 8, 22, 28);

  ctx.fillStyle = '#FBBF24';
  ctx.beginPath();
  ctx.arc(x + w - 16, y + 16, 6, 0, Math.PI * 2);
  ctx.fill();
}

function drawKitchenCounter(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number) {
  ctx.fillStyle = '#E5E7EB';
  ctx.fillRect(x, y, w, h);
  ctx.strokeStyle = '#1F2937';
  ctx.lineWidth = 1.5;
  ctx.strokeRect(x, y, w, h);
}

function drawFridge(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number) {
  ctx.fillStyle = '#F9FAFB';
  ctx.fillRect(x, y, w, h);
  ctx.strokeStyle = '#1F2937';
  ctx.lineWidth = 1.5;
  ctx.strokeRect(x, y, w, h);
  // Handle
  ctx.fillStyle = '#9CA3AF';
  ctx.fillRect(x + 6, y + 15, 3, 14);
}

function drawBookshelf(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number) {
  ctx.fillStyle = '#78350F';
  ctx.fillRect(x, y, w, h);
  ctx.strokeStyle = '#1F2937';
  ctx.lineWidth = 1.5;
  ctx.strokeRect(x, y, w, h);

  // Colorful book spines
  const colors = ['#EF4444', '#3B82F6', '#10B981', '#F59E0B', '#8B5CF6'];
  for (let bx = x + 6; bx < x + w - 10; bx += 8) {
    ctx.fillStyle = colors[(bx * 3) % colors.length];
    ctx.fillRect(bx, y + 6, 6, h - 12);
  }
}

function drawStereoSystem(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number) {
  ctx.fillStyle = '#1F2937';
  ctx.fillRect(x, y, w, h);
  // Spinning vinyl disc
  ctx.fillStyle = '#111827';
  ctx.beginPath();
  ctx.arc(x + 35, y + 25, 18, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#DC2626';
  ctx.beginPath();
  ctx.arc(x + 35, y + 25, 6, 0, Math.PI * 2);
  ctx.fill();
}

function drawPingPongTable(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number) {
  ctx.fillStyle = '#15803D';
  ctx.fillRect(x, y, w, h);
  ctx.strokeStyle = '#FFFFFF';
  ctx.lineWidth = 1.5;
  ctx.strokeRect(x, y, w, h);
  // Net
  ctx.beginPath();
  ctx.moveTo(x + w / 2, y);
  ctx.lineTo(x + w / 2, y + h);
  ctx.stroke();
}

function drawTrophyCabinet(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number) {
  ctx.fillStyle = '#92400E';
  ctx.fillRect(x, y, w, h);
  ctx.strokeStyle = '#1F2937';
  ctx.strokeRect(x, y, w, h);
}

function drawTelevision(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number) {
  ctx.fillStyle = '#78350F';
  ctx.fillRect(x, y, w, h);
  ctx.fillStyle = '#67E8F9';
  ctx.fillRect(x + 5, y + 5, w - 16, h - 10);
  ctx.strokeStyle = '#1F2937';
  ctx.strokeRect(x, y, w, h);
}

function drawToyPiano(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number) {
  ctx.fillStyle = '#DC2626';
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, 6);
  ctx.fill();
  ctx.strokeStyle = '#1F2937';
  ctx.lineWidth = 1.5;
  ctx.stroke();

  // White and black keys
  ctx.fillStyle = '#FFFFFF';
  ctx.fillRect(x + 10, y + h - 16, w - 20, 14);
}

function drawBeethovenBust(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number) {
  ctx.fillStyle = '#D1D5DB';
  ctx.beginPath();
  ctx.arc(x + w / 2, y + 20, 16, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillRect(x + w / 2 - 10, y + 36, 20, 14);
}

function drawPumpkinPatchField(ctx: CanvasRenderingContext2D, w: number, h: number, time: number) {
  // Dispersed pumpkins
  const pumpkins = [
    { x: 180, y: 180, r: 18 },
    { x: 320, y: 220, r: 24 },
    { x: 520, y: 190, r: 20 },
    { x: 720, y: 250, r: 28 },
    { x: 260, y: 380, r: 22 },
    { x: 420, y: 360, r: 32 }, // Great Pumpkin size!
    { x: 640, y: 410, r: 26 },
    { x: 350, y: 520, r: 20 },
    { x: 580, y: 540, r: 22 }
  ];

  pumpkins.forEach((p, idx) => {
    ctx.fillStyle = '#EA580C';
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#9A3412';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Stem
    ctx.fillStyle = '#15803D';
    ctx.fillRect(p.x - 2, p.y - p.r - 5, 4, 6);
  });
}

function drawRedBarn(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number) {
  ctx.fillStyle = '#B91C1C';
  ctx.fillRect(x, y + 40, w, h - 40);
  // Barn roof
  ctx.beginPath();
  ctx.moveTo(x - 10, y + 40);
  ctx.lineTo(x + w / 2, y);
  ctx.lineTo(x + w + 10, y + 40);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = '#450A0A';
  ctx.lineWidth = 2;
  ctx.stroke();
}

function drawHayBales(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number) {
  ctx.fillStyle = '#FDE047';
  ctx.fillRect(x, y, w, h);
  ctx.strokeStyle = '#CA8A04';
  ctx.lineWidth = 1.5;
  ctx.strokeRect(x, y, w, h);
}

function drawLogCabin(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number) {
  ctx.fillStyle = '#78350F';
  ctx.fillRect(x, y, w, h);
  ctx.strokeStyle = '#451A03';
  ctx.lineWidth = 2;
  ctx.strokeRect(x, y, w, h);
}

function drawWoodenPier(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number) {
  ctx.fillStyle = '#92400E';
  ctx.fillRect(x, y, w, h);
  ctx.strokeStyle = '#451A03';
  ctx.lineWidth = 2;
  ctx.strokeRect(x, y, w, h);
}

function drawAtmosphericParticles(
  ctx: CanvasRenderingContext2D,
  loc: LocationData,
  time: number,
  timeOfDay: TimeOfDay = 'day'
) {
  if (loc.category === 'exterior') {
    if (timeOfDay === 'night') {
      // Twinkling night sky stars
      const starPositions = [
        { x: 90, y: 35 }, { x: 230, y: 65 }, { x: 370, y: 25 }, { x: 520, y: 70 },
        { x: 690, y: 40 }, { x: 840, y: 85 }, { x: 980, y: 30 }, { x: 1120, y: 60 },
        { x: 180, y: 110 }, { x: 440, y: 120 }, { x: 770, y: 105 }, { x: 1020, y: 125 }
      ];
      starPositions.forEach((star, idx) => {
        const twinkle = Math.sin(time * 3 + idx * 1.5) * 0.4 + 0.6;
        ctx.save();
        ctx.fillStyle = '#FEF08A';
        ctx.globalAlpha = twinkle * 0.85;
        ctx.beginPath();
        ctx.arc(star.x % loc.width, star.y, 1.5 + (idx % 2 === 0 ? 0.8 : 0), 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      });

      // Ambient night fireflies near bushes
      ctx.save();
      for (let f = 0; f < 6; f++) {
        const fx = (f * 200 + Math.sin(time * 2 + f) * 20) % loc.width;
        const fy = (200 + f * 70 + Math.cos(time * 1.8 + f) * 15) % loc.height;
        const glow = Math.sin(time * 4 + f) * 0.5 + 0.5;
        ctx.fillStyle = '#86EFAC';
        ctx.globalAlpha = glow * 0.7;
        ctx.beginPath();
        ctx.arc(fx, fy, 2, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
    } else if (timeOfDay === 'sunset') {
      // Autumn leaves gently drifting in warm golden sunset
      ctx.fillStyle = '#D97706';
      for (let i = 0; i < 9; i++) {
        const lx = (i * 150 + time * 30) % loc.width;
        const ly = (i * 100 + Math.sin(time * 1.5 + i) * 35 + time * 20) % loc.height;
        ctx.beginPath();
        ctx.ellipse(lx, ly, 4, 2.5, time + i, 0, Math.PI * 2);
        ctx.fill();
      }
    } else {
      // Day / Dawn gentle breeze leaves
      ctx.fillStyle = '#16A34A';
      for (let i = 0; i < 5; i++) {
        const lx = (i * 220 + time * 20) % loc.width;
        const ly = (i * 130 + Math.sin(time + i) * 25 + time * 12) % loc.height;
        ctx.beginPath();
        ctx.ellipse(lx, ly, 3.5, 2, time + i, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    // Drifting airborne dandelion fluff seeds on the breeze (day, dawn, sunset)
    if (timeOfDay !== 'night') {
      drawAirborneDandelionSeeds(ctx, loc.width, loc.height, time);
    }
  }
}

function drawLightingShader(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  timeOfDay: TimeOfDay,
  playerPos: Position,
  camX: number,
  camY: number,
  loc: LocationData
) {
  if (timeOfDay === 'day') return; // crisp clean daylight

  ctx.save();
  if (timeOfDay === 'dawn') {
    ctx.fillStyle = 'rgba(251, 146, 60, 0.14)'; // soft peach/rose
    ctx.fillRect(0, 0, w, h);
    if (loc.category === 'interior') {
      // Gentle dawn pinkish-gold ray through windows
      drawInteriorLightCone(ctx, loc.width * 0.45 - camX, 100 - camY, 140, 'dawn', 0.35, true);
    }
  } else if (timeOfDay === 'sunset') {
    ctx.fillStyle = 'rgba(217, 119, 6, 0.22)'; // warm golden hour
    ctx.fillRect(0, 0, w, h);
    if (loc.category === 'interior') {
      // Deep warm golden-amber sunset beam slicing into the room from the windows
      drawInteriorLightCone(ctx, loc.width * 0.4 - camX, 120 - camY, 160, 'sunset', 0.5, true);
      drawInteriorLightCone(ctx, loc.width * 0.7 - camX, 110 - camY, 130, 'sunset', 0.45, true);
    }
  } else if (timeOfDay === 'night') {
    // 1. Collect only authentic stationary environmental light fixtures (NO artificial light bulbs on characters)
    const lightSources: { x: number; y: number; r: number; intensity: number; isGroundPool?: boolean }[] = [];

    // Environmental Lights in the neighborhood (porches, windows, streetlamps)
    if (loc.id === 'neighborhood') {
      const fixtures = [
        // Casa de Ari (porch & warm window lights)
        { x: 180, y: 250, r: 55, intensity: 0.65 },
        { x: 135, y: 190, r: 45, intensity: 0.5 },
        { x: 225, y: 190, r: 45, intensity: 0.5 },
        // Casa Charlie Brown
        { x: 470, y: 250, r: 55, intensity: 0.65 },
        { x: 415, y: 190, r: 45, intensity: 0.5 },
        { x: 525, y: 190, r: 45, intensity: 0.5 },
        // Snoopy's Doghouse entrance
        { x: 355, y: 220, r: 35, intensity: 0.5 },
        // Casa Van Pelt (Lucy/Linus)
        { x: 765, y: 250, r: 55, intensity: 0.65 },
        { x: 715, y: 190, r: 45, intensity: 0.5 },
        { x: 815, y: 190, r: 45, intensity: 0.5 },
        // Casa Schroeder
        { x: 995, y: 250, r: 55, intensity: 0.65 },
        { x: 950, y: 190, r: 45, intensity: 0.5 },
        { x: 1035, y: 190, r: 45, intensity: 0.5 },
        // Streetlamps along sidewalk: soft warm illumination on the pavement
        { x: 220, y: 340, r: 65, intensity: 0.7, isGroundPool: true },
        { x: 520, y: 340, r: 65, intensity: 0.7, isGroundPool: true },
        { x: 840, y: 340, r: 65, intensity: 0.7, isGroundPool: true },
        { x: 1120, y: 340, r: 65, intensity: 0.7, isGroundPool: true },
        { x: 460, y: 680, r: 65, intensity: 0.7, isGroundPool: true },
        { x: 220, y: 765, r: 65, intensity: 0.7, isGroundPool: true },
        { x: 420, y: 765, r: 65, intensity: 0.7, isGroundPool: true }
      ];

      fixtures.forEach((f) => {
        lightSources.push({
          x: f.x - camX,
          y: f.y - camY,
          r: f.r,
          intensity: f.intensity,
          isGroundPool: f.isGroundPool
        });
      });
    } else if (loc.category === 'interior') {
      // Warm, realistic point lights projected from lamps, desks, fireplaces and windows inside each house
      if (loc.id === 'house_ari') {
        // Ari's writing desk lamp, living room floor lamp, kitchen stove, bedroom nightstand
        lightSources.push({ x: 430 - camX, y: 95 - camY, r: 90, intensity: 0.85, isGroundPool: true }); // Desk lamp
        lightSources.push({ x: 230 - camX, y: 85 - camY, r: 80, intensity: 0.8, isGroundPool: true }); // Table lamp by sofa
        lightSources.push({ x: 100 - camX, y: 270 - camY, r: 75, intensity: 0.7, isGroundPool: true }); // Kitchen stove/teapot
        lightSources.push({ x: 300 - camX, y: 80 - camY, r: 65, intensity: 0.6, isGroundPool: true }); // Bedroom warm glow
        lightSources.push({ x: 125 - camX, y: 65 - camY, r: 85, intensity: 0.7 }); // Salón window light
      } else if (loc.id === 'house_charlie_brown') {
        // Television screen flicker & floor lamp
        lightSources.push({ x: 92 - camX, y: 240 - camY, r: 95, intensity: 0.8, isGroundPool: true }); // TV
        lightSources.push({ x: 215 - camX, y: 90 - camY, r: 85, intensity: 0.75, isGroundPool: true }); // Floor lamp
        lightSources.push({ x: 500 - camX, y: 95 - camY, r: 70, intensity: 0.65, isGroundPool: true }); // Charlie's desk
        lightSources.push({ x: 400 - camX, y: 330 - camY, r: 70, intensity: 0.6, isGroundPool: true }); // Sally's room
      } else if (loc.id === 'doghouse_interior') {
        // Fireplace hearth, stereo vinyl glow, library reading lamps
        lightSources.push({ x: 100 - camX, y: 85 - camY, r: 130, intensity: 0.95, isGroundPool: true }); // Fireplace
        lightSources.push({ x: 400 - camX, y: 350 - camY, r: 90, intensity: 0.85, isGroundPool: true }); // Typewriter desk
        lightSources.push({ x: 610 - camX, y: 85 - camY, r: 95, intensity: 0.8, isGroundPool: true }); // Hi-Fi vinyl stereo
        lightSources.push({ x: 400 - camX, y: 80 - camY, r: 100, intensity: 0.75, isGroundPool: true }); // Library center
      } else if (loc.id === 'house_van_pelt') {
        // Linus's reading desk lamp and Lucy's vanity mirror
        lightSources.push({ x: 215 - camX, y: 280 - camY, r: 85, intensity: 0.8, isGroundPool: true }); // Linus lamp
        lightSources.push({ x: 500 - camX, y: 95 - camY, r: 80, intensity: 0.75, isGroundPool: true }); // Lucy vanity
        lightSources.push({ x: 120 - camX, y: 95 - camY, r: 80, intensity: 0.7, isGroundPool: true }); // Living room
      } else if (loc.id === 'house_schroeder') {
        // Schroeder's piano music stand candle & Beethoven bust spotlight
        lightSources.push({ x: 265 - camX, y: 155 - camY, r: 110, intensity: 0.9, isGroundPool: true }); // Piano
        lightSources.push({ x: 420 - camX, y: 80 - camY, r: 95, intensity: 0.85, isGroundPool: true }); // Beethoven bust
      } else if (loc.id === 'house_peppermint_patty') {
        // Warm living room lamp
        lightSources.push({ x: 110 - camX, y: 95 - camY, r: 85, intensity: 0.75, isGroundPool: true });
        lightSources.push({ x: 370 - camX, y: 100 - camY, r: 75, intensity: 0.65, isGroundPool: true });
      } else if (loc.id === 'house_marcie') {
        // Marcie's focused study desk lamp
        lightSources.push({ x: 470 - camX, y: 95 - camY, r: 95, intensity: 0.9, isGroundPool: true });
        lightSources.push({ x: 95 - camX, y: 100 - camY, r: 80, intensity: 0.75, isGroundPool: true });
      } else if (loc.id === 'school') {
        // Institutional hallway light pools
        lightSources.push({ x: 220 - camX, y: 120 - camY, r: 110, intensity: 0.75, isGroundPool: true });
        lightSources.push({ x: 200 - camX, y: 230 - camY, r: 100, intensity: 0.7, isGroundPool: true });
      } else {
        // Default warm cozy room center
        lightSources.push({
          x: loc.width / 2 - camX,
          y: loc.height / 2 - camY,
          r: 160,
          intensity: 0.7,
          isGroundPool: true
        });
      }
    }

    // Door exit triggers
    loc.triggers.forEach((trig) => {
      if (trig.actionType === 'door_exit') {
        lightSources.push({
          x: trig.x + trig.w / 2 - camX,
          y: trig.y + trig.h / 2 - camY,
          r: 65,
          intensity: 0.7
        });
      }
    });

    // 2. Atmospheric nocturnal veil (deep midnight indigo, realistic and clean)
    const nightSkyGrad = ctx.createLinearGradient(0, 0, 0, h);
    if (loc.category === 'interior') {
      nightSkyGrad.addColorStop(0, 'rgba(24, 18, 14, 0.45)');
      nightSkyGrad.addColorStop(1, 'rgba(32, 22, 16, 0.40)');
    } else {
      nightSkyGrad.addColorStop(0, 'rgba(10, 16, 32, 0.58)'); // clear midnight blue
      nightSkyGrad.addColorStop(0.5, 'rgba(12, 20, 38, 0.52)');
      nightSkyGrad.addColorStop(1, 'rgba(15, 24, 44, 0.48)');
    }
    ctx.fillStyle = nightSkyGrad;
    ctx.fillRect(0, 0, w, h);

    // Subtle moonlit stars in outdoor sky
    if (loc.category === 'exterior') {
      ctx.fillStyle = 'rgba(255, 255, 255, 0.75)';
      for (let s = 0; s < 22; s++) {
        const starX = (s * 139) % w;
        const starY = (s * 73) % (h * 0.4);
        const twinkle = 0.5 + Math.sin(starX + s) * 0.4;
        if (twinkle > 0.3) {
          ctx.fillRect(starX, starY, twinkle > 0.7 ? 1.5 : 1, twinkle > 0.7 ? 1.5 : 1);
        }
      }
    }

    // 3. Cut out gentle pools of light ONLY around environmental lamps/windows
    ctx.globalCompositeOperation = 'destination-out';
    lightSources.forEach((ls) => {
      if (ls.x < -ls.r || ls.x > w + ls.r || ls.y < -ls.r || ls.y > h + ls.r) return;

      const cutout = ctx.createRadialGradient(ls.x, ls.y, 4, ls.x, ls.y, ls.r);
      cutout.addColorStop(0, `rgba(0, 0, 0, ${ls.intensity * 0.85})`);
      cutout.addColorStop(0.5, `rgba(0, 0, 0, ${ls.intensity * 0.45})`);
      cutout.addColorStop(1, 'rgba(0, 0, 0, 0)');

      ctx.fillStyle = cutout;
      ctx.beginPath();
      if (ls.isGroundPool) {
        ctx.ellipse(ls.x, ls.y, ls.r, ls.r * 0.55, 0, 0, Math.PI * 2);
      } else {
        ctx.arc(ls.x, ls.y, ls.r, 0, Math.PI * 2);
      }
      ctx.fill();
    });

    // 4. Soft warm amber ground tint under streetlamps and lanterns (NO yellow blobs on characters!)
    ctx.globalCompositeOperation = 'source-over';
    lightSources.forEach((ls) => {
      if (ls.x < -ls.r || ls.x > w + ls.r || ls.y < -ls.r || ls.y > h + ls.r) return;

      if (ls.isGroundPool) {
        const groundGlow = ctx.createRadialGradient(ls.x, ls.y, 2, ls.x, ls.y, ls.r);
        groundGlow.addColorStop(0, 'rgba(254, 240, 138, 0.22)');
        groundGlow.addColorStop(0.5, 'rgba(251, 191, 36, 0.10)');
        groundGlow.addColorStop(1, 'rgba(251, 191, 36, 0)');

        ctx.fillStyle = groundGlow;
        ctx.beginPath();
        ctx.ellipse(ls.x, ls.y, ls.r, ls.r * 0.55, 0, 0, Math.PI * 2);
        ctx.fill();
      }
    });
  }
  ctx.restore();
}

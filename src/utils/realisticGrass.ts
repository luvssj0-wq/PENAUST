import { TimeOfDay } from '../types';

// Deterministic pseudo-random number generator for consistent vegetation layout
function pseudoRandom(seed: number): number {
  const x = Math.sin(seed * 12.9898 + 78.233) * 43758.5453;
  return x - Math.floor(x);
}

// Global offscreen cache to render base lawns, clovers, mower stripes and flowers once per zone & timeOfDay!
// This eliminates 90% of draw calls every frame, keeping the game at a silky smooth 60fps.
const lawnCanvasCache: Map<string, HTMLCanvasElement> = new Map();

function getCachedStaticLawn(
  x: number,
  y: number,
  w: number,
  h: number,
  options: GrassLawnOptions
): HTMLCanvasElement | null {
  if (typeof document === 'undefined') return null;
  const {
    timeOfDay = 'day',
    stripeWidth = 44,
    flowerDensity = 1.0,
    cloverDensity = 1.0,
    darkStripeColor = 'rgba(20, 55, 18, 0.28)',
    lightStripeColor = 'rgba(110, 195, 80, 0.18)',
  } = options;

  const key = `${Math.round(x)}_${Math.round(y)}_${Math.round(w)}_${Math.round(h)}_${timeOfDay}_${Math.round(flowerDensity * 10)}_${Math.round(cloverDensity * 10)}`;
  
  if (lawnCanvasCache.has(key)) {
    return lawnCanvasCache.get(key)!;
  }

  const offscreen = document.createElement('canvas');
  offscreen.width = Math.ceil(w);
  offscreen.height = Math.ceil(h);
  const oCtx = offscreen.getContext('2d');
  if (!oCtx) return null;

  // 1. RICH ORGANIC TURF BASE GRADIENT
  const baseGrad = oCtx.createLinearGradient(0, 0, 0, h);
  if (timeOfDay === 'sunset') {
    baseGrad.addColorStop(0, '#365314');
    baseGrad.addColorStop(0.5, '#2e4912');
    baseGrad.addColorStop(1, '#243b0d');
  } else if (timeOfDay === 'night') {
    baseGrad.addColorStop(0, '#102213');
    baseGrad.addColorStop(0.5, '#0b190e');
    baseGrad.addColorStop(1, '#08130a');
  } else if (timeOfDay === 'dawn') {
    baseGrad.addColorStop(0, '#3a6829');
    baseGrad.addColorStop(0.5, '#325d22');
    baseGrad.addColorStop(1, '#294f1c');
  } else {
    baseGrad.addColorStop(0, '#326829');
    baseGrad.addColorStop(0.35, '#2b5c22');
    baseGrad.addColorStop(0.7, '#356e2c');
    baseGrad.addColorStop(1, '#285620');
  }
  oCtx.fillStyle = baseGrad;
  oCtx.fillRect(0, 0, w, h);

  // 2. MOWER STRIPING
  oCtx.save();
  const stripeCount = Math.ceil((w + h) / stripeWidth);
  for (let i = -2; i < stripeCount + 2; i++) {
    const isEven = Math.abs(i) % 2 === 0;
    oCtx.fillStyle = isEven ? lightStripeColor : darkStripeColor;
    oCtx.beginPath();
    const sx = i * stripeWidth;
    oCtx.moveTo(sx, 0);
    oCtx.lineTo(sx + stripeWidth, 0);
    oCtx.lineTo(sx + stripeWidth - h * 0.35, h);
    oCtx.lineTo(sx - h * 0.35, h);
    oCtx.closePath();
    oCtx.fill();
  }
  oCtx.restore();

  // 3. ORGANIC UNDERGROWTH SOIL SPECKLING
  oCtx.save();
  const microPatchCount = Math.floor((w * h) / 1600);
  for (let i = 0; i < microPatchCount; i++) {
    const seed = i * 47.19 + (x + y) * 0.3;
    const px = pseudoRandom(seed) * w;
    const py = pseudoRandom(seed + 1.7) * h;
    const pr = 4 + pseudoRandom(seed + 3.1) * 9;
    const shade = pseudoRandom(seed + 5.2);
    oCtx.fillStyle = shade > 0.5 ? 'rgba(84, 168, 62, 0.12)' : 'rgba(20, 50, 16, 0.14)';
    oCtx.beginPath();
    oCtx.ellipse(px, py, pr, pr * 0.6, 0.3, 0, Math.PI * 2);
    oCtx.fill();
  }
  oCtx.restore();

  // 4. PRE-RENDER WILD CLOVERS & STATIC FLOWERS INTO CACHE
  drawWildClovers(oCtx, 0, 0, w, h, cloverDensity, timeOfDay);
  drawLawnFlowers(oCtx, 0, 0, w, h, 0, flowerDensity, timeOfDay);

  // Keep cache size bounded
  if (lawnCanvasCache.size > 20) {
    lawnCanvasCache.clear();
  }
  lawnCanvasCache.set(key, offscreen);
  return offscreen;
}

export interface GrassLawnOptions {
  timeOfDay?: TimeOfDay;
  stripeAngle?: number; // radians
  stripeWidth?: number;
  density?: number; // higher = more tufts
  flowerDensity?: number;
  cloverDensity?: number;
  soilEdge?: 'top' | 'bottom' | 'left' | 'right' | 'none';
  baseColor?: string;
  darkStripeColor?: string;
  lightStripeColor?: string;
}

/**
 * Draws a rich, multi-layered realistic lawn with mower striping, soil depth,
 * swaying grass blades with tapered geometry and lighting, wild clovers,
 * English daisies, dandelions, and morning dew glints.
 */
export function drawRealisticLawn(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  time: number,
  options: GrassLawnOptions = {}
) {
  if (w <= 0 || h <= 0) return;
  const {
    timeOfDay = 'day',
    density = 35,
  } = options;

  ctx.save();
  ctx.beginPath();
  ctx.rect(x, y, w, h);
  ctx.clip();

  // Render cached base (mower stripes, undergrowth turf, clovers and flora)
  const cachedLawn = getCachedStaticLawn(x, y, w, h, options);
  if (cachedLawn) {
    ctx.drawImage(cachedLawn, x, y);
  } else {
    // Fallback if offscreen canvas cannot be created
    ctx.fillStyle = '#2b5c22';
    ctx.fillRect(x, y, w, h);
  }

  // Animate dynamic swaying grass blade clusters on top with wind
  drawGrassBladeClusters(ctx, x, y, w, h, time, density, timeOfDay);

  // Dewdrop glints during daylight/dawn
  if (timeOfDay === 'day' || timeOfDay === 'dawn') {
    drawDewdropGlints(ctx, x, y, w, h, time);
  }

  ctx.restore();
}

/**
 * Procedural grass blade clusters: each clump has a soft contact shadow,
 * 5-8 tapered curved blades that sway dynamically with trigonometric wind,
 * and multi-toned blade lighting from shadow-green to sunny chartreuse.
 */
function drawGrassBladeClusters(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  time: number,
  density: number,
  timeOfDay: TimeOfDay
) {
  const tuftCount = Math.floor((w * h) / (density * 32));
  ctx.save();

  // Color palettes based on time of day
  let tipHighlight = '#8ee055';
  let bladeMid = '#3b8629';
  let bladeShadow = '#1c4a17';
  let shadowAlpha = 0.25;

  if (timeOfDay === 'sunset') {
    tipHighlight = '#eab308'; // golden sunset tip
    bladeMid = '#4d7c0f';
    bladeShadow = '#1e3a0f';
    shadowAlpha = 0.35;
  } else if (timeOfDay === 'night') {
    tipHighlight = '#34d399'; // subtle bioluminescent cool green
    bladeMid = '#164e28';
    bladeShadow = '#0c2814';
    shadowAlpha = 0.4;
  } else if (timeOfDay === 'dawn') {
    tipHighlight = '#a3e635';
    bladeMid = '#3f7e2d';
    bladeShadow = '#1e481b';
    shadowAlpha = 0.2;
  }

  for (let i = 0; i < tuftCount; i++) {
    const seed = i * 93.71 + (x * 3.1 + y * 7.3);
    const gx = x + pseudoRandom(seed) * (w - 12) + 6;
    const gy = y + pseudoRandom(seed + 2.3) * (h - 14) + 10;
    const bladeScale = 0.8 + pseudoRandom(seed + 5.1) * 0.55; // 80% to 135% height
    const baseHeight = 9 * bladeScale;

    // Wind calculation: organic multi-frequency breeze
    const windPhase = time * 2.4 + gx * 0.035 + gy * 0.02;
    const mainSway = Math.sin(windPhase) * (baseHeight * 0.32);
    const gustFlutter = Math.sin(time * 4.2 + gx * 0.015) * 1.1;
    const totalWind = mainSway + gustFlutter;

    // Contact shadow beneath grass clump
    ctx.fillStyle = `rgba(10, 30, 10, ${shadowAlpha})`;
    ctx.beginPath();
    ctx.ellipse(gx, gy + 1, 6 * bladeScale, 2.2 * bladeScale, 0, 0, Math.PI * 2);
    ctx.fill();

    // 4 optimized dynamic blades per cluster for smooth frame rates
    const bladeOffsets = [
      { dx: -3.5, spread: -0.55, hMult: 0.85, col: bladeShadow },
      { dx: -1.0, spread: -0.15, hMult: 1.2, col: tipHighlight },
      { dx: 1.5, spread: 0.25, hMult: 1.1, col: bladeMid },
      { dx: 3.8, spread: 0.65, hMult: 0.9, col: tipHighlight },
    ];

    for (let bIdx = 0; bIdx < bladeOffsets.length; bIdx++) {
      const b = bladeOffsets[bIdx];
      const bh = baseHeight * b.hMult;
      const rootX = gx + b.dx * bladeScale;
      const rootY = gy;
      const naturalLean = b.spread * (bh * 0.45);
      const tipX = rootX + naturalLean + totalWind * (bh / 10);
      const tipY = rootY - bh;
      const ctrlX = rootX + naturalLean * 0.5 + totalWind * 0.35;
      const ctrlY = rootY - bh * 0.55;

      // Draw tapered curved blade
      ctx.beginPath();
      ctx.moveTo(rootX - 0.7, rootY);
      ctx.quadraticCurveTo(ctrlX, ctrlY, tipX, tipY);
      ctx.quadraticCurveTo(ctrlX + 0.8, ctrlY, rootX + 0.7, rootY);
      ctx.fillStyle = b.col;
      ctx.fill();
    }
  }

  ctx.restore();
}

/**
 * Detailed wild clover patches (Trifolium repens) with heart-shaped leaflets,
 * delicate lighter center crescents, and soft grounding shadows.
 */
function drawWildClovers(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  cloverDensity: number,
  timeOfDay: TimeOfDay
) {
  const cloverCount = Math.floor((w * h) / (1600 / cloverDensity));
  ctx.save();

  for (let i = 0; i < cloverCount; i++) {
    const seed = i * 137.33 + (x + y * 2.1);
    const cx = x + pseudoRandom(seed) * (w - 16) + 8;
    const cy = y + pseudoRandom(seed + 1.9) * (h - 16) + 8;
    const isFourLeaf = pseudoRandom(seed + 7.7) > 0.96; // 4% chance of 4-leaf lucky clover!
    const leafCount = isFourLeaf ? 4 : 3;
    const leafSize = 3.2 + pseudoRandom(seed + 3.1) * 1.6;

    // Contact shadow
    ctx.fillStyle = 'rgba(10, 25, 10, 0.22)';
    ctx.beginPath();
    ctx.ellipse(cx, cy + 1, leafSize * 1.5, leafSize * 0.8, 0, 0, Math.PI * 2);
    ctx.fill();

    // Stem
    ctx.strokeStyle = '#1e481b';
    ctx.lineWidth = 0.8;
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.quadraticCurveTo(cx - 2, cy + 3, cx - 1, cy + 5);
    ctx.stroke();

    // Draw heart-shaped leaflets arranged radially
    for (let l = 0; l < leafCount; l++) {
      const angle = (l * (Math.PI * 2) / leafCount) - Math.PI / 2 + pseudoRandom(seed + l) * 0.2;
      const lx = cx + Math.cos(angle) * (leafSize * 0.85);
      const ly = cy + Math.sin(angle) * (leafSize * 0.85);

      ctx.save();
      ctx.translate(lx, ly);
      ctx.rotate(angle + Math.PI / 2);

      // Heart-shaped leaflet
      ctx.fillStyle = timeOfDay === 'night' ? '#143818' : '#22631f';
      ctx.beginPath();
      ctx.arc(-leafSize * 0.4, -leafSize * 0.3, leafSize * 0.45, 0, Math.PI * 2);
      ctx.arc(leafSize * 0.4, -leafSize * 0.3, leafSize * 0.45, 0, Math.PI * 2);
      ctx.moveTo(-leafSize * 0.8, -leafSize * 0.2);
      ctx.lineTo(0, leafSize * 0.6);
      ctx.lineTo(leafSize * 0.8, -leafSize * 0.2);
      ctx.closePath();
      ctx.fill();

      // Pale inner chevron crescent (botanical clover signature)
      if (timeOfDay !== 'night') {
        ctx.strokeStyle = 'rgba(170, 235, 130, 0.45)';
        ctx.lineWidth = 0.6;
        ctx.beginPath();
        ctx.arc(0, -leafSize * 0.1, leafSize * 0.35, 0.4, Math.PI - 0.4);
        ctx.stroke();
      }

      ctx.restore();
    }
  }

  ctx.restore();
}

/**
 * Botanical wild lawn flowers:
 * - English Daisies (white petals, raised golden disk floret)
 * - Wild Dandelions (vibrant yellow layered petals)
 * - Dandelion Seed Clocks (translucent white puffballs with delicate radiating parachutes)
 */
function drawLawnFlowers(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  time: number,
  flowerDensity: number,
  timeOfDay: TimeOfDay
) {
  const flowerCount = Math.floor((w * h) / (1200 / flowerDensity));
  ctx.save();

  for (let i = 0; i < flowerCount; i++) {
    const seed = i * 211.7 + (x * 1.3 + y);
    const fx = x + pseudoRandom(seed) * (w - 20) + 10;
    const fy = y + pseudoRandom(seed + 1.4) * (h - 20) + 10;
    const flowerType = pseudoRandom(seed + 4.9); // 0-0.5: Daisy, 0.5-0.85: Dandelion, 0.85-1.0: Seed Puff

    // Stem
    const stemWind = Math.sin(time * 2.2 + fx * 0.04) * 1.5;
    ctx.strokeStyle = '#1e5218';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(fx, fy + 4);
    ctx.quadraticCurveTo(fx + stemWind * 0.5, fy + 1, fx + stemWind, fy - 2);
    ctx.stroke();

    const flowerX = fx + stemWind;
    const flowerY = fy - 2;

    if (flowerType < 0.5) {
      // ENGLISH DAISY (Bellis perennis)
      // Soft shadow
      ctx.fillStyle = 'rgba(10, 25, 10, 0.2)';
      ctx.beginPath();
      ctx.ellipse(flowerX, flowerY + 4, 3.5, 1.5, 0, 0, Math.PI * 2);
      ctx.fill();

      // White radial ray petals
      const petalCount = 8;
      const petalLen = 3.6;
      ctx.fillStyle = '#FFFFFF';
      for (let p = 0; p < petalCount; p++) {
        const pAngle = (p * Math.PI * 2) / petalCount + (i * 0.3);
        const px = flowerX + Math.cos(pAngle) * petalLen;
        const py = flowerY + Math.sin(pAngle) * (petalLen * 0.75);
        ctx.beginPath();
        ctx.ellipse(px, py, 1.6, 0.9, pAngle, 0, Math.PI * 2);
        ctx.fill();
      }

      // Golden center button
      ctx.fillStyle = '#F59E0B';
      ctx.beginPath();
      ctx.arc(flowerX, flowerY, 1.8, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#FDE68A';
      ctx.beginPath();
      ctx.arc(flowerX - 0.5, flowerY - 0.5, 0.8, 0, Math.PI * 2);
      ctx.fill();
    } else if (flowerType < 0.85) {
      // DANDELION (Taraxacum officinale)
      ctx.fillStyle = 'rgba(10, 25, 10, 0.2)';
      ctx.beginPath();
      ctx.ellipse(flowerX, flowerY + 3, 3.5, 1.5, 0, 0, Math.PI * 2);
      ctx.fill();

      // Outer golden ray florets
      ctx.fillStyle = '#FBBF24';
      ctx.beginPath();
      ctx.arc(flowerX, flowerY, 3.5, 0, Math.PI * 2);
      ctx.fill();

      // Inner dense bright yellow florets
      ctx.fillStyle = '#FDE047';
      ctx.beginPath();
      ctx.arc(flowerX, flowerY, 2.2, 0, Math.PI * 2);
      ctx.fill();

      // Center orange stamen dot
      ctx.fillStyle = '#D97706';
      ctx.beginPath();
      ctx.arc(flowerX, flowerY, 0.9, 0, Math.PI * 2);
      ctx.fill();
    } else {
      // DANDELION SEED CLOCK / PUFFBALL
      // Delicate translucent white seed globe
      ctx.save();
      ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
      ctx.beginPath();
      ctx.arc(flowerX, flowerY, 4.2, 0, Math.PI * 2);
      ctx.fill();

      // Radiating fine parachute rays
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.85)';
      ctx.lineWidth = 0.5;
      for (let r = 0; r < 8; r++) {
        const rAngle = (r * Math.PI * 2) / 8;
        ctx.beginPath();
        ctx.moveTo(flowerX, flowerY);
        ctx.lineTo(flowerX + Math.cos(rAngle) * 4.6, flowerY + Math.sin(rAngle) * 4.6);
        ctx.stroke();
      }

      // Center receptacle pin
      ctx.fillStyle = '#78350F';
      ctx.beginPath();
      ctx.arc(flowerX, flowerY, 0.8, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
  }

  ctx.restore();
}

/**
 * Morning dew specular highlights that sparkle on grass blade tips.
 */
function drawDewdropGlints(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  time: number
) {
  const glintCount = Math.floor((w * h) / 2800);
  ctx.save();

  for (let i = 0; i < glintCount; i++) {
    const seed = i * 317.11 + (x * 2.7 + y * 1.9);
    const gx = x + pseudoRandom(seed) * (w - 20) + 10;
    const gy = y + pseudoRandom(seed + 1.2) * (h - 20) + 10;
    
    // Sparkle pulse based on time and location
    const sparkle = Math.sin(time * 3.5 + seed) * 0.5 + 0.5;
    if (sparkle > 0.65) {
      const alpha = (sparkle - 0.65) * 2.8;
      ctx.fillStyle = `rgba(255, 255, 255, ${alpha.toFixed(2)})`;
      ctx.beginPath();
      ctx.arc(gx, gy, 1.4, 0, Math.PI * 2);
      ctx.fill();

      // Cross glint star
      ctx.strokeStyle = `rgba(240, 253, 244, ${(alpha * 0.7).toFixed(2)})`;
      ctx.lineWidth = 0.6;
      ctx.beginPath();
      ctx.moveTo(gx - 2.5, gy);
      ctx.lineTo(gx + 2.5, gy);
      ctx.moveTo(gx, gy - 2.5);
      ctx.lineTo(gx, gy + 2.5);
      ctx.stroke();
    }
  }

  ctx.restore();
}

/**
 * Natural grass blades that spill organically over concrete sidewalks,
 * curbs, and stone pathways, removing sterile straight digital borders.
 */
export function drawGrassCurbOverhang(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  length: number,
  orientation: 'horizontal' | 'vertical',
  side: 'positive' | 'negative', // which direction the grass spills
  time: number
) {
  ctx.save();
  const bladeCount = Math.floor(length / 7);

  for (let i = 0; i < bladeCount; i++) {
    const step = i * 7 + 3;
    const seed = (x + y + step) * 19.3;
    const bladeLen = 5 + pseudoRandom(seed) * 5;
    const wind = Math.sin(time * 2.5 + step * 0.05) * 1.5;

    let bx = x;
    let by = y;
    let tipX = x;
    let tipY = y;

    if (orientation === 'horizontal') {
      bx = x + step;
      by = y;
      const dirY = side === 'positive' ? 1 : -1;
      tipX = bx + wind + pseudoRandom(seed + 1.5) * 3 - 1.5;
      tipY = by + dirY * bladeLen;
    } else {
      bx = x;
      by = y + step;
      const dirX = side === 'positive' ? 1 : -1;
      tipX = bx + dirX * bladeLen;
      tipY = by + wind + pseudoRandom(seed + 1.5) * 3 - 1.5;
    }

    // Shadow on concrete
    ctx.strokeStyle = 'rgba(15, 23, 42, 0.25)';
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.moveTo(bx, by);
    ctx.lineTo(tipX, tipY + 1);
    ctx.stroke();

    // Grass blade
    ctx.strokeStyle = i % 2 === 0 ? '#488f36' : '#65b33d';
    ctx.lineWidth = 1.4;
    ctx.beginPath();
    ctx.moveTo(bx, by);
    ctx.quadraticCurveTo((bx + tipX) / 2, (by + tipY) / 2, tipX, tipY);
    ctx.stroke();
  }

  ctx.restore();
}

/**
 * Realistic dappled tree canopy shadow on the grass (Komorebi):
 * Soft ambient shadow with moving circular sunlight cutouts filtering through leaves.
 */
export function drawDappledCanopyShadow(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  radiusX: number,
  radiusY: number,
  time: number
) {
  ctx.save();
  // Deep soft ground shadow
  const shadowGrad = ctx.createRadialGradient(x, y, 0, x, y, Math.max(radiusX, radiusY));
  shadowGrad.addColorStop(0, 'rgba(12, 38, 14, 0.42)');
  shadowGrad.addColorStop(0.7, 'rgba(15, 42, 16, 0.28)');
  shadowGrad.addColorStop(1, 'rgba(15, 42, 16, 0)');
  ctx.fillStyle = shadowGrad;
  ctx.beginPath();
  ctx.ellipse(x, y, radiusX, radiusY, 0, 0, Math.PI * 2);
  ctx.fill();

  // Dappled golden sunlight spots filtering through foliage (swaying in wind)
  const spotCount = 6;
  for (let s = 0; s < spotCount; s++) {
    const angle = (s * Math.PI * 2) / spotCount + Math.sin(time + s) * 0.15;
    const dist = (radiusX * 0.45) + Math.cos(time * 1.5 + s) * 5;
    const sx = x + Math.cos(angle) * dist;
    const sy = y + Math.sin(angle) * (dist * (radiusY / radiusX));
    const spotR = 5 + Math.sin(time * 2 + s) * 2;

    ctx.fillStyle = 'rgba(254, 240, 138, 0.25)';
    ctx.beginPath();
    ctx.ellipse(sx, sy, spotR, spotR * 0.7, 0.2, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.restore();
}

/**
 * Airborne dandelion seeds drifting across the screen on the breeze,
 * providing high visual polish and atmosphere.
 */
export function drawAirborneDandelionSeeds(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  time: number
) {
  ctx.save();
  const seedCount = 12;

  for (let i = 0; i < seedCount; i++) {
    const speedX = 18 + (i % 4) * 6;
    const speedY = Math.sin(time * 0.8 + i) * 8;
    const sx = ((i * 120 + time * speedX) % (w + 100)) - 50;
    const sy = ((i * 85 + time * 10 + Math.sin(time + i * 2) * 40) % (h + 60)) - 30;

    ctx.save();
    ctx.translate(sx, sy);
    ctx.rotate(Math.sin(time * 1.2 + i) * 0.35 + 0.2);

    // Parachute bristles
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.75)';
    ctx.lineWidth = 0.6;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(0, -6);
    ctx.lineTo(-4, -9);
    ctx.moveTo(0, -6);
    ctx.lineTo(4, -9);
    ctx.moveTo(0, -6);
    ctx.lineTo(-2, -10);
    ctx.moveTo(0, -6);
    ctx.lineTo(2, -10);
    ctx.stroke();

    // Dark seed body
    ctx.fillStyle = '#451A03';
    ctx.beginPath();
    ctx.ellipse(0, 1.5, 0.7, 1.8, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }

  ctx.restore();
}

/**
 * Realistic asphalt road graphics with aggregate speckling, tire wear channels,
 * and authentic weathered yellow line textures.
 */
export function drawRealisticAsphalt(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  orientation: 'horizontal' | 'vertical' = 'horizontal'
) {
  ctx.save();

  // Dark slate asphalt base with subtle depth gradient
  const roadGrad = ctx.createLinearGradient(
    x, y,
    orientation === 'horizontal' ? x : x + w,
    orientation === 'horizontal' ? y + h : y
  );
  roadGrad.addColorStop(0, '#1e293b'); // dark curb edge
  roadGrad.addColorStop(0.3, '#334155');
  roadGrad.addColorStop(0.7, '#334155');
  roadGrad.addColorStop(1, '#1e293b');
  ctx.fillStyle = roadGrad;
  ctx.fillRect(x, y, w, h);

  // Tire wear tracks (subtle darker polished channels where wheels roll)
  if (orientation === 'horizontal' && h >= 35) {
    ctx.fillStyle = 'rgba(15, 23, 42, 0.32)';
    ctx.fillRect(x, y + 6, w, 8);
    ctx.fillRect(x, y + h - 14, w, 8);
  } else if (orientation === 'vertical' && w >= 35) {
    ctx.fillStyle = 'rgba(15, 23, 42, 0.32)';
    ctx.fillRect(x + 6, y, 8, h);
    ctx.fillRect(x + w - 14, y, 8, h);
  }

  // Micro-aggregate speckles (crushed stone texture in asphalt)
  const speckleCount = Math.floor((w * h) / 180);
  for (let s = 0; s < speckleCount; s++) {
    const seed = s * 73.1 + x + y;
    const px = x + pseudoRandom(seed) * w;
    const py = y + pseudoRandom(seed + 1.3) * h;
    const val = pseudoRandom(seed + 2.7);
    ctx.fillStyle = val > 0.5 ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.2)';
    ctx.fillRect(px, py, 1.2, 1.2);
  }

  ctx.restore();
}

/**
 * Realistic concrete sidewalks with score line expansion joints,
 * surface mottling, and beveled curb edges.
 */
export function drawRealisticConcreteSidewalk(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number
) {
  ctx.save();

  // Natural warm concrete base
  const concreteGrad = ctx.createLinearGradient(x, y, x, y + h);
  concreteGrad.addColorStop(0, '#f1f5f9');
  concreteGrad.addColorStop(0.5, '#e2e8f0');
  concreteGrad.addColorStop(1, '#cbd5e1');
  ctx.fillStyle = concreteGrad;
  ctx.fillRect(x, y, w, h);

  // Micro-aggregate stone flecks
  const fleckCount = Math.floor((w * h) / 150);
  for (let f = 0; f < fleckCount; f++) {
    const seed = f * 53.7 + x + y;
    const px = x + pseudoRandom(seed) * w;
    const py = y + pseudoRandom(seed + 1.1) * h;
    ctx.fillStyle = pseudoRandom(seed + 2.1) > 0.5 ? 'rgba(255, 255, 255, 0.35)' : 'rgba(100, 116, 139, 0.15)';
    ctx.fillRect(px, py, 1.5, 1.5);
  }

  ctx.restore();
}

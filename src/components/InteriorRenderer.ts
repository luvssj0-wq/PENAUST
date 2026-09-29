import { LocationData, TimeOfDay } from '../types';

/**
 * High-definition, hand-crafted architectural interior rendering for all houses & buildings
 * in the Peanuts / Ari neighborhood.
 *
 * Implements:
 * 1. Architectural 3D wall depth: Crown molding, vintage wallpaper patterns, wooden chair rails,
 *    vertical beadboard wainscoting (boiserie), beveled hardwood baseboards, and corner ambient occlusion.
 *    Walls are never flat rectangles!
 * 2. Realistic hardwood floorboards with alternating plank tones, wood grain, staggered end joints,
 *    and tile zones with grout lines and bevels.
 * 3. Y-Sorting / Depth Sorting: Furniture items have precise baseY coordinates so Ari and NPCs can
 *    walk behind them (occluded by the furniture) or in front of them (occluding the furniture).
 * 4. Realistic furniture with cushion seams, wood grains, shadows, and reflections.
 * 5. Dynamic TimeOfDay light streaming through windows across the floorboards.
 */

export interface YSortItem {
  baseY: number;
  draw: (ctx: CanvasRenderingContext2D) => void;
}

// Point light projection onto the floor from a lamp or window
export function drawInteriorLightCone(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  radius: number,
  timeOfDay: TimeOfDay,
  intensity: number = 0.55,
  isOval: boolean = false
) {
  ctx.save();
  let innerCol = 'rgba(254, 240, 138, 0.40)';
  let midCol = 'rgba(251, 191, 36, 0.18)';
  let outerCol = 'rgba(251, 191, 36, 0)';

  if (timeOfDay === 'sunset') {
    innerCol = 'rgba(251, 146, 60, 0.48)';
    midCol = 'rgba(217, 119, 6, 0.22)';
    outerCol = 'rgba(217, 119, 6, 0)';
  } else if (timeOfDay === 'night') {
    innerCol = 'rgba(254, 243, 199, 0.50)';
    midCol = 'rgba(245, 158, 11, 0.18)';
    outerCol = 'rgba(245, 158, 11, 0)';
  } else if (timeOfDay === 'dawn') {
    innerCol = 'rgba(253, 186, 116, 0.38)';
    midCol = 'rgba(244, 114, 182, 0.14)';
    outerCol = 'rgba(244, 114, 182, 0)';
  }

  const grad = ctx.createRadialGradient(x, y, 4, x, y, radius);
  grad.addColorStop(0, innerCol);
  grad.addColorStop(0.55, midCol);
  grad.addColorStop(1, outerCol);

  ctx.fillStyle = grad;
  ctx.beginPath();
  if (isOval) {
    ctx.ellipse(x, y, radius, radius * 0.55, 0, 0, Math.PI * 2);
  } else {
    ctx.arc(x, y, radius, 0, Math.PI * 2);
  }
  ctx.fill();
  ctx.restore();
}

// Window with sunlight/moonlight streaming across the floor
export function drawInteriorWindow(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  timeOfDay: TimeOfDay,
  time: number
) {
  ctx.save();
  // Outer wooden frame with shadow
  ctx.fillStyle = 'rgba(0, 0, 0, 0.18)';
  ctx.fillRect(x - 4, y - 1, w + 8, h + 8);

  ctx.fillStyle = '#78350F';
  ctx.fillRect(x - 3, y - 3, w + 6, h + 6);
  ctx.strokeStyle = '#451A03';
  ctx.lineWidth = 1.2;
  ctx.strokeRect(x - 3, y - 3, w + 6, h + 6);

  // Sky backdrop showing outdoor timeOfDay
  let skyCol = '#7DD3FC';
  if (timeOfDay === 'sunset') skyCol = '#F97316';
  else if (timeOfDay === 'night') skyCol = '#0F172A';
  else if (timeOfDay === 'dawn') skyCol = '#FDBA74';

  ctx.fillStyle = skyCol;
  ctx.fillRect(x, y, w, h);

  // Stars / Moon at night through window
  if (timeOfDay === 'night') {
    ctx.fillStyle = '#FEF08A';
    ctx.fillRect(x + 8, y + 6, 2, 2);
    ctx.fillRect(x + w - 12, y + 10, 1.5, 1.5);
    // Crescent moon
    ctx.beginPath();
    ctx.arc(x + w - 10, y + 8, 4, 0, Math.PI * 2);
    ctx.fill();
  } else {
    // Distant tree silhouette
    ctx.fillStyle = timeOfDay === 'sunset' ? '#7C2D12' : '#15803D';
    ctx.beginPath();
    ctx.arc(x + w / 2, y + h + 2, w * 0.45, Math.PI, Math.PI * 2);
    ctx.fill();
  }

  // Window mullions (cross)
  ctx.strokeStyle = '#FEF3C7';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(x + w / 2, y);
  ctx.lineTo(x + w / 2, y + h);
  ctx.moveTo(x, y + h / 2);
  ctx.lineTo(x + w, y + h / 2);
  ctx.stroke();

  // Glass sheen
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.45)';
  ctx.lineWidth = 1.2;
  ctx.beginPath();
  ctx.moveTo(x + 4, y + 4);
  ctx.lineTo(x + w / 2 - 4, y + h / 2 - 4);
  ctx.moveTo(x + w / 2 + 4, y + 4);
  ctx.lineTo(x + w - 4, y + h / 2 - 4);
  ctx.stroke();

  // Curtains swaying gently
  const sway = Math.sin(time * 2 + x) * 1.5;
  ctx.fillStyle = '#FFFFFF';
  ctx.beginPath();
  ctx.moveTo(x - 2, y);
  ctx.quadraticCurveTo(x + 6 + sway, y + h / 2, x + 2, y + h);
  ctx.lineTo(x - 2, y + h);
  ctx.closePath();
  ctx.fill();

  ctx.beginPath();
  ctx.moveTo(x + w + 2, y);
  ctx.quadraticCurveTo(x + w - 6 - sway, y + h / 2, x + w - 2, y + h);
  ctx.lineTo(x + w + 2, y + h);
  ctx.closePath();
  ctx.fill();

  // Projected light trapezoid on floor
  const projLen = 65;
  const projSkew = timeOfDay === 'sunset' ? 35 : timeOfDay === 'dawn' ? -35 : 12;
  const pGrad = ctx.createLinearGradient(x + w / 2, y + h, x + w / 2 + projSkew, y + h + projLen);
  let pAlpha = 0.30;
  if (timeOfDay === 'sunset') {
    pGrad.addColorStop(0, `rgba(251, 146, 60, ${pAlpha * 1.2})`);
    pGrad.addColorStop(1, 'rgba(251, 146, 60, 0)');
  } else if (timeOfDay === 'night') {
    pGrad.addColorStop(0, `rgba(186, 230, 253, ${pAlpha * 0.7})`);
    pGrad.addColorStop(1, 'rgba(186, 230, 253, 0)');
  } else {
    pGrad.addColorStop(0, `rgba(254, 240, 138, ${pAlpha})`);
    pGrad.addColorStop(1, 'rgba(254, 240, 138, 0)');
  }

  ctx.fillStyle = pGrad;
  ctx.beginPath();
  ctx.moveTo(x, y + h);
  ctx.lineTo(x + w, y + h);
  ctx.lineTo(x + w + projSkew + 15, y + h + projLen);
  ctx.lineTo(x + projSkew - 15, y + h + projLen);
  ctx.closePath();
  ctx.fill();

  ctx.restore();
}

// Table lamp with glowing lampshade and warm pool of light
export function drawTableLamp(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  timeOfDay: TimeOfDay,
  baseColor: string = '#B45309'
) {
  ctx.save();
  // Wooden base
  ctx.fillStyle = baseColor;
  ctx.beginPath();
  ctx.ellipse(x, y + 2, 7, 3, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#1F2937';
  ctx.lineWidth = 1;
  ctx.stroke();

  // Brass stem
  ctx.fillStyle = '#F59E0B';
  ctx.fillRect(x - 1.5, y - 14, 3, 16);

  // Conical lampshade
  ctx.fillStyle = '#FEF3C7';
  ctx.beginPath();
  ctx.moveTo(x - 5, y - 14);
  ctx.lineTo(x + 5, y - 14);
  ctx.lineTo(x + 9, y - 4);
  ctx.lineTo(x - 9, y - 4);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = '#D97706';
  ctx.lineWidth = 1.2;
  ctx.stroke();

  // Projected point light pool
  drawInteriorLightCone(ctx, x, y + 14, 45, timeOfDay, 0.45, true);

  ctx.restore();
}

// Floor-standing lamp
export function drawFloorLamp(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  timeOfDay: TimeOfDay
) {
  ctx.save();
  ctx.fillStyle = '#1F2937';
  ctx.beginPath();
  ctx.ellipse(x, y + 20, 11, 4, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.strokeStyle = '#374151';
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.moveTo(x, y + 20);
  ctx.lineTo(x, y - 30);
  ctx.stroke();

  ctx.fillStyle = '#FEF08A';
  ctx.beginPath();
  ctx.moveTo(x - 8, y - 30);
  ctx.lineTo(x + 8, y - 30);
  ctx.lineTo(x + 14, y - 14);
  ctx.lineTo(x - 14, y - 14);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = '#D97706';
  ctx.lineWidth = 1.2;
  ctx.stroke();

  drawInteriorLightCone(ctx, x, y + 20, 65, timeOfDay, 0.55, true);
  ctx.restore();
}

// Wall clock with swinging brass pendulum
export function drawWallClock(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  time: number
) {
  ctx.save();
  ctx.fillStyle = '#78350F';
  ctx.beginPath();
  ctx.roundRect(x - 12, y - 16, 24, 38, 4);
  ctx.fill();
  ctx.strokeStyle = '#451A03';
  ctx.lineWidth = 1.2;
  ctx.stroke();

  // Clock face
  ctx.fillStyle = '#FFFFFF';
  ctx.beginPath();
  ctx.arc(x, y - 4, 9, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#1F2937';
  ctx.lineWidth = 1;
  ctx.stroke();

  // Hands
  const minuteAngle = (time * 0.8) % (Math.PI * 2);
  ctx.strokeStyle = '#18181B';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(x, y - 4);
  ctx.lineTo(x + Math.cos(minuteAngle) * 6, y - 4 + Math.sin(minuteAngle) * 6);
  ctx.stroke();

  // Swinging brass pendulum
  const pendAngle = Math.sin(time * 3) * 0.25;
  ctx.strokeStyle = '#F59E0B';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(x, y + 6);
  ctx.lineTo(x + Math.sin(pendAngle) * 12, y + 6 + Math.cos(pendAngle) * 12);
  ctx.stroke();
  ctx.fillStyle = '#F59E0B';
  ctx.beginPath();
  ctx.arc(x + Math.sin(pendAngle) * 12, y + 6 + Math.cos(pendAngle) * 12, 3, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
}

// Steaming cup
export function drawSteamingCup(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  time: number,
  cupColor: string = '#FFFFFF'
) {
  ctx.save();
  // Saucer
  ctx.fillStyle = '#E2E8F0';
  ctx.beginPath();
  ctx.ellipse(x, y + 2, 7, 2.5, 0, 0, Math.PI * 2);
  ctx.fill();

  // Cup body
  ctx.fillStyle = cupColor;
  ctx.fillRect(x - 4, y - 6, 8, 7);
  ctx.strokeStyle = '#475569';
  ctx.lineWidth = 0.8;
  ctx.strokeRect(x - 4, y - 6, 8, 7);

  // Steam
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.45)';
  ctx.lineWidth = 1;
  for (let s = 0; s < 2; s++) {
    const ox = (s === 0 ? -1.5 : 1.5) + Math.sin(time * 3 + s) * 1.5;
    ctx.beginPath();
    ctx.moveTo(x + ox, y - 7);
    ctx.quadraticCurveTo(x + ox - 2, y - 12, x + ox + 1, y - 16);
    ctx.stroke();
  }
  ctx.restore();
}

// Ornate rug
export function drawDetailedRug(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  baseColor: string,
  accentColor: string,
  fringeColor: string = '#FEF3C7'
) {
  ctx.save();
  ctx.fillStyle = baseColor;
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, 6);
  ctx.fill();
  ctx.strokeStyle = accentColor;
  ctx.lineWidth = 2;
  ctx.stroke();

  ctx.strokeStyle = fringeColor;
  ctx.lineWidth = 1.2;
  ctx.strokeRect(x + 8, y + 8, w - 16, h - 16);

  ctx.fillStyle = accentColor;
  ctx.beginPath();
  ctx.ellipse(x + w / 2, y + h / 2, (w - 28) / 2, (h - 28) / 2, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = fringeColor;
  ctx.stroke();

  // Fringes
  ctx.strokeStyle = fringeColor;
  ctx.lineWidth = 1.2;
  for (let ry = y + 4; ry < y + h - 4; ry += 5) {
    ctx.beginPath();
    ctx.moveTo(x - 3, ry);
    ctx.lineTo(x, ry);
    ctx.moveTo(x + w, ry);
    ctx.lineTo(x + w + 3, ry);
    ctx.stroke();
  }
  ctx.restore();
}

// Potted houseplant
export function drawPottedPlant(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  time: number
) {
  ctx.save();
  ctx.fillStyle = '#EA580C';
  ctx.beginPath();
  ctx.moveTo(x - 7, y - 10);
  ctx.lineTo(x + 7, y - 10);
  ctx.lineTo(x + 5, y + 2);
  ctx.lineTo(x - 5, y + 2);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = '#7C2D12';
  ctx.lineWidth = 1;
  ctx.stroke();

  ctx.fillStyle = '#C2410C';
  ctx.fillRect(x - 8, y - 12, 16, 3);

  const sway = Math.sin(time * 1.5 + x) * 1.2;
  const leafColors = ['#15803D', '#16A34A', '#22C55E'];
  for (let i = -2; i <= 2; i++) {
    ctx.fillStyle = leafColors[Math.abs(i)];
    ctx.beginPath();
    ctx.ellipse(x + i * 4 + sway, y - 16 - Math.abs(i) * 2, 4, 7, (i * 0.25), 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#052E16';
    ctx.lineWidth = 0.8;
    ctx.stroke();
  }
  ctx.restore();
}

// Bookshelf
export function drawDetailedBookshelf(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  woodColor: string = '#78350F'
) {
  ctx.save();
  ctx.fillStyle = woodColor;
  ctx.fillRect(x, y, w, h);
  ctx.strokeStyle = '#451A03';
  ctx.lineWidth = 1.5;
  ctx.strokeRect(x, y, w, h);

  const shelves = 3;
  const shelfH = (h - 8) / shelves;
  const bookColors = ['#DC2626', '#2563EB', '#16A34A', '#D97706', '#9333EA', '#0891B2'];
  let bIdx = 0;

  for (let s = 0; s < shelves; s++) {
    const sy = y + 4 + s * shelfH;
    ctx.fillStyle = '#451A03';
    ctx.fillRect(x + 3, sy + shelfH - 2, w - 6, 2.5);

    let bx = x + 5;
    while (bx < x + w - 10) {
      const bw = 5 + (bIdx % 4);
      const bh = shelfH - 5 - (bIdx % 3);
      if (bx + bw > x + w - 6) break;

      ctx.fillStyle = bookColors[bIdx % bookColors.length];
      ctx.fillRect(bx, sy + shelfH - bh - 2, bw, bh);
      ctx.strokeStyle = 'rgba(0, 0, 0, 0.4)';
      ctx.lineWidth = 0.8;
      ctx.strokeRect(bx, sy + shelfH - bh - 2, bw, bh);

      bx += bw + 1.5;
      bIdx++;
    }
  }
  ctx.restore();
}

/**
 * ARCHITECTURAL ROOM WALLS & REALISTIC FLOORS
 * Eliminates flat rectangles!
 * Features:
 * - 3D Oblique & Isometric cutaway side walls with beveled cap rails, wall thickness reveal, and boiserie paneling
 * - Deep 3-tier stepped crown molding with cove profile and drop shadow
 * - Picture rail molding with brass hooks and vintage wallpaper patterns
 * - Sculpted chair rail molding dividing wallpaper from lower wainscoting
 * - Recessed 3D beveled wainscoting panels (boiserie) with highlights and shadow bevels
 * - Multi-layer hardwood baseboards with 45-degree mitered corner returns
 * - 3D corner pilasters with fluted detailing that eliminate boxy 90-degree rectangle corners
 * - Alternating warm hardwood planks with realistic wood grain, end joints, and sheen
 * - Angled cutaway threshold entrance with brass saddle and exterior light spill
 */
export function drawArchitecturalWallsAndFloor(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  opts: {
    wallColor: string;
    wainscotColor: string;
    chairRailColor: string;
    crownColor?: string;
    baseboardColor?: string;
    plankTone1?: string;
    plankTone2?: string;
    wallpaperStripe?: string;
    tileArea?: { x: number; y: number; w: number; h: number; tileCol: string; groutCol: string };
    doorwayX?: number;
    doorwayW?: number;
  },
  timeOfDay: TimeOfDay
) {
  ctx.save();

  // 1. HARDWOOD FLOORBOARDS (Planks with alternating grain and staggered butt joints)
  const pCol1 = opts.plankTone1 || '#FEF3C7';
  const pCol2 = opts.plankTone2 || '#FDE68A';
  const plankH = 20;

  for (let py = 50; py < height - 20; py += plankH) {
    const isAltRow = Math.floor(py / plankH) % 2 === 0;
    ctx.fillStyle = isAltRow ? pCol1 : pCol2;
    ctx.fillRect(36, py, width - 72, plankH);

    // Plank horizontal groove with micro-highlight
    ctx.strokeStyle = 'rgba(180, 83, 9, 0.28)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(36, py);
    ctx.lineTo(width - 36, py);
    ctx.stroke();

    // Staggered vertical end joints
    const offset = (Math.floor(py / plankH) * 53) % 90;
    for (let px = 36 + offset; px < width - 36; px += 90) {
      ctx.strokeStyle = 'rgba(120, 53, 15, 0.35)';
      ctx.beginPath();
      ctx.moveTo(px, py);
      ctx.lineTo(px, py + plankH);
      ctx.stroke();
    }
  }

  // 2. CERAMIC TILE AREA (e.g. kitchen or bath)
  if (opts.tileArea) {
    const { x, y, w, h, tileCol, groutCol } = opts.tileArea;
    ctx.fillStyle = tileCol;
    ctx.fillRect(x, y, w, h);
    ctx.strokeStyle = groutCol;
    ctx.lineWidth = 1.2;

    for (let ty = y; ty <= y + h; ty += 18) {
      ctx.beginPath();
      ctx.moveTo(x, ty);
      ctx.lineTo(x + w, ty);
      ctx.stroke();
    }
    for (let tx = x; tx <= x + w; tx += 18) {
      ctx.beginPath();
      ctx.moveTo(tx, y);
      ctx.lineTo(tx, y + h);
      ctx.stroke();
    }
    // Subtle beveled perimeter trim around tile area
    ctx.strokeStyle = '#94A3B8';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(x, y, w, h);
  }

  // 3. ARCHITECTURAL TOP WALL (y: 0 to 60) - NON-RECTANGULAR, MULTI-TIER DEPTH
  const wallH = 60;
  const chairRailY = 38;

  // Upper Wall: Wallpaper with vertical decorative pinstripes and soft vertical lighting gradient
  const wallGrad = ctx.createLinearGradient(0, 0, 0, chairRailY);
  wallGrad.addColorStop(0, opts.wallColor);
  wallGrad.addColorStop(1, opts.wallColor);
  ctx.fillStyle = wallGrad;
  ctx.fillRect(0, 0, width, chairRailY);

  if (opts.wallpaperStripe) {
    ctx.strokeStyle = opts.wallpaperStripe;
    ctx.lineWidth = 1.4;
    for (let sx = 44; sx < width - 44; sx += 14) {
      ctx.beginPath();
      ctx.moveTo(sx, 10);
      ctx.lineTo(sx, chairRailY);
      ctx.stroke();

      // Delicate vintage micro-dot pattern between stripes
      ctx.fillStyle = opts.wallpaperStripe;
      ctx.fillRect(sx + 7, 24, 1.5, 1.5);
    }
  }

  // Ceiling Cornice / Stepped Crown Molding at top (y: 0..10)
  ctx.fillStyle = opts.crownColor || '#FFFFFF';
  ctx.fillRect(0, 0, width, 5);
  ctx.fillStyle = '#F3F4F6';
  ctx.fillRect(0, 5, width, 4);
  ctx.strokeStyle = '#D1D5DB';
  ctx.lineWidth = 1;
  ctx.strokeRect(0, 0, width, 9);
  // Deep ambient shadow under crown molding
  ctx.fillStyle = 'rgba(0, 0, 0, 0.22)';
  ctx.fillRect(0, 9, width, 3);

  // Picture Rail molding at y: 18 with brass hanging hooks
  ctx.fillStyle = opts.chairRailColor;
  ctx.fillRect(40, 18, width - 80, 2.5);
  ctx.strokeStyle = 'rgba(0, 0, 0, 0.3)';
  ctx.lineWidth = 0.8;
  ctx.strokeRect(40, 18, width - 80, 2.5);

  // Chair Rail Molding at y: 38 (3D sculpted profile dividing wallpaper from wainscot)
  ctx.fillStyle = 'rgba(255, 255, 255, 0.35)'; // top highlight
  ctx.fillRect(0, chairRailY - 1, width, 1.5);
  ctx.fillStyle = opts.chairRailColor;
  ctx.fillRect(0, chairRailY, width, 5);
  ctx.strokeStyle = 'rgba(0, 0, 0, 0.35)';
  ctx.lineWidth = 1;
  ctx.strokeRect(0, chairRailY, width, 5);
  // Shadow under chair rail
  ctx.fillStyle = 'rgba(0, 0, 0, 0.25)';
  ctx.fillRect(0, chairRailY + 5, width, 2);

  // Lower Wall: Vertical Beadboard Wainscoting (Boiserie) with 3D recessed panels
  ctx.fillStyle = opts.wainscotColor;
  ctx.fillRect(0, chairRailY + 5, width, wallH - (chairRailY + 5));

  // Wainscoting vertical grooves
  ctx.strokeStyle = 'rgba(0, 0, 0, 0.22)';
  ctx.lineWidth = 1;
  for (let wx = 42; wx < width - 42; wx += 8) {
    ctx.beginPath();
    ctx.moveTo(wx, chairRailY + 7);
    ctx.lineTo(wx, wallH);
    ctx.stroke();
  }

  // Recessed rectangular panel frames (Boiserie panels) along the bottom wall
  const panelW = 38;
  const panelH = wallH - (chairRailY + 11);
  for (let px = 46; px < width - 46 - panelW; px += panelW + 10) {
    // Outer bevel shadow
    ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
    ctx.fillRect(px, chairRailY + 8, panelW, panelH);
    // Inner panel highlight
    ctx.fillStyle = opts.wainscotColor;
    ctx.fillRect(px + 1.5, chairRailY + 9.5, panelW - 3, panelH - 3);
    // Bevel highlights
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.25)';
    ctx.lineWidth = 0.8;
    ctx.beginPath();
    ctx.moveTo(px + 1.5, chairRailY + 9.5 + panelH - 3);
    ctx.lineTo(px + 1.5, chairRailY + 9.5);
    ctx.lineTo(px + 1.5 + panelW - 3, chairRailY + 9.5);
    ctx.stroke();
  }

  // Baseboard trim at bottom of top wall (high-skirting design with quarter-round shoe)
  const baseCol = opts.baseboardColor || '#5A2609';
  ctx.fillStyle = baseCol;
  ctx.fillRect(36, wallH - 4, width - 72, 8);
  ctx.strokeStyle = '#292524';
  ctx.lineWidth = 1;
  ctx.strokeRect(36, wallH - 4, width - 72, 8);
  // Shoe moulding highlight
  ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
  ctx.fillRect(36, wallH - 4, width - 72, 1.5);

  // Ambient Occlusion drop shadow from top wall onto floorboards
  const wallShadow = ctx.createLinearGradient(0, wallH + 4, 0, wallH + 16);
  wallShadow.addColorStop(0, 'rgba(0, 0, 0, 0.32)');
  wallShadow.addColorStop(1, 'rgba(0, 0, 0, 0)');
  ctx.fillStyle = wallShadow;
  ctx.fillRect(36, wallH + 4, width - 72, 12);

  // 4. ARCHITECTURAL SIDE WALLS - NON-RECTANGULAR WITH 2.5D CUTAWAY PERSPECTIVE
  // Left side wall with angled cutaway cap and architectural depth
  ctx.save();
  // Main wall body
  ctx.fillStyle = opts.wainscotColor;
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.lineTo(36, 0);
  ctx.lineTo(36, height - 20);
  ctx.lineTo(24, height);
  ctx.lineTo(0, height);
  ctx.closePath();
  ctx.fill();

  // Outer cutaway beveled cap rail (gives realistic 3D wall thickness profile)
  ctx.fillStyle = opts.chairRailColor;
  ctx.beginPath();
  ctx.moveTo(34, 0);
  ctx.lineTo(38, 0);
  ctx.lineTo(38, height - 20);
  ctx.lineTo(26, height);
  ctx.lineTo(22, height);
  ctx.lineTo(34, height - 20);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = 'rgba(0, 0, 0, 0.35)';
  ctx.lineWidth = 1;
  ctx.stroke();

  // Left wall vertical baseboard
  ctx.fillStyle = baseCol;
  ctx.fillRect(32, wallH + 4, 5, height - wallH - 26);
  ctx.strokeStyle = '#292524';
  ctx.lineWidth = 1;
  ctx.strokeRect(32, wallH + 4, 5, height - wallH - 26);

  // Left wall recessed architectural panels
  for (let rpy = wallH + 20; rpy < height - 60; rpy += 55) {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.22)';
    ctx.fillRect(6, rpy, 22, 40);
    ctx.fillStyle = opts.wainscotColor;
    ctx.fillRect(8, rpy + 2, 18, 36);
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.18)';
    ctx.lineWidth = 0.8;
    ctx.strokeRect(8, rpy + 2, 18, 36);
  }
  ctx.restore();

  // Right side wall with symmetrical 2.5D cutaway perspective
  ctx.save();
  ctx.fillStyle = opts.wainscotColor;
  ctx.beginPath();
  ctx.moveTo(width - 36, 0);
  ctx.lineTo(width, 0);
  ctx.lineTo(width, height);
  ctx.lineTo(width - 24, height);
  ctx.lineTo(width - 36, height - 20);
  ctx.closePath();
  ctx.fill();

  // Right cutaway beveled cap rail
  ctx.fillStyle = opts.chairRailColor;
  ctx.beginPath();
  ctx.moveTo(width - 38, 0);
  ctx.lineTo(width - 34, 0);
  ctx.lineTo(width - 34, height - 20);
  ctx.lineTo(width - 22, height);
  ctx.lineTo(width - 26, height);
  ctx.lineTo(width - 38, height - 20);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = 'rgba(0, 0, 0, 0.35)';
  ctx.lineWidth = 1;
  ctx.stroke();

  // Right wall vertical baseboard
  ctx.fillStyle = baseCol;
  ctx.fillRect(width - 37, wallH + 4, 5, height - wallH - 26);
  ctx.strokeStyle = '#292524';
  ctx.lineWidth = 1;
  ctx.strokeRect(width - 37, wallH + 4, 5, height - wallH - 26);

  // Right wall recessed architectural panels
  for (let rpy = wallH + 20; rpy < height - 60; rpy += 55) {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.22)';
    ctx.fillRect(width - 28, rpy, 22, 40);
    ctx.fillStyle = opts.wainscotColor;
    ctx.fillRect(width - 26, rpy + 2, 18, 36);
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.18)';
    ctx.lineWidth = 0.8;
    ctx.strokeRect(width - 26, rpy + 2, 18, 36);
  }
  ctx.restore();

  // 3D CORNER PILASTERS / PIERS (Eliminates boxy 90-degree rectangle corners!)
  // Left corner pilaster
  ctx.save();
  ctx.fillStyle = '#451A03';
  ctx.beginPath();
  ctx.moveTo(34, wallH - 4);
  ctx.lineTo(44, wallH - 4);
  ctx.lineTo(38, wallH + 14);
  ctx.lineTo(34, wallH + 14);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = 'rgba(0, 0, 0, 0.4)';
  ctx.lineWidth = 1;
  ctx.stroke();

  // Corner ambient occlusion shadow wedges
  const leftCornerShadow = ctx.createRadialGradient(36, wallH + 4, 0, 36, wallH + 4, 28);
  leftCornerShadow.addColorStop(0, 'rgba(0, 0, 0, 0.42)');
  leftCornerShadow.addColorStop(1, 'rgba(0, 0, 0, 0)');
  ctx.fillStyle = leftCornerShadow;
  ctx.fillRect(36, wallH + 4, 28, 28);

  // Right corner pilaster
  ctx.fillStyle = '#451A03';
  ctx.beginPath();
  ctx.moveTo(width - 44, wallH - 4);
  ctx.lineTo(width - 34, wallH - 4);
  ctx.lineTo(width - 34, wallH + 14);
  ctx.lineTo(width - 38, wallH + 14);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = 'rgba(0, 0, 0, 0.4)';
  ctx.lineWidth = 1;
  ctx.stroke();

  const rightCornerShadow = ctx.createRadialGradient(width - 36, wallH + 4, 0, width - 36, wallH + 4, 28);
  rightCornerShadow.addColorStop(0, 'rgba(0, 0, 0, 0.42)');
  rightCornerShadow.addColorStop(1, 'rgba(0, 0, 0, 0)');
  ctx.fillStyle = rightCornerShadow;
  ctx.fillRect(width - 64, wallH + 4, 28, 28);
  ctx.restore();

  // 5. BOTTOM CUTAWAY WALL & ENTRANCE THRESHOLD
  // High-skirting bottom trim with beveled saddle
  ctx.fillStyle = baseCol;
  ctx.fillRect(0, height - 20, width, 20);
  ctx.strokeStyle = '#292524';
  ctx.lineWidth = 1.5;
  ctx.strokeRect(0, height - 20, width, 20);

  // Beveled top rail of bottom cutaway
  ctx.fillStyle = opts.chairRailColor;
  ctx.fillRect(0, height - 22, width, 3);
  ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
  ctx.fillRect(0, height - 22, width, 1);

  // Doorway opening with threshold sill
  const doorX = opts.doorwayX || width / 2 - 25;
  const doorW = opts.doorwayW || 50;

  // Door threshold light spill with directional fan
  const doorGrad = ctx.createLinearGradient(doorX, height - 32, doorX, height);
  doorGrad.addColorStop(0, 'rgba(254, 240, 138, 0.7)');
  doorGrad.addColorStop(1, 'rgba(251, 191, 36, 0.2)');
  ctx.fillStyle = doorGrad;
  ctx.fillRect(doorX - 6, height - 22, doorW + 12, 10);

  // Brass threshold plate
  ctx.fillStyle = '#D97706';
  ctx.fillRect(doorX, height - 22, doorW, 5);
  ctx.strokeStyle = '#92400E';
  ctx.lineWidth = 1;
  ctx.strokeRect(doorX, height - 22, doorW, 5);

  ctx.restore();
}

/**
 * ARCHITECTURAL PARTITION WALL (Tabique divisor con profundidad 3D y remate de pilar)
 * Replaces plain flat rectangles with full architectural depth:
 * - 3D molded open-end post (pilar de remate) with capital, base plinth, and shadow
 * - Double-sided boiserie with beveled wainscot panels
 * - Baseboard wrap around the partition foot
 * - Molded top cap rail
 */
export function drawArchitecturalPartitionWall(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  opts: {
    woodColor: string;
    trimColor: string;
    hasEndPost?: boolean;
    headerArch?: boolean;
  }
) {
  ctx.save();
  // 1. Wall body with double-sided paneling
  ctx.fillStyle = opts.woodColor;
  ctx.fillRect(x, y, w, h);
  ctx.strokeStyle = '#451A03';
  ctx.lineWidth = 1.2;
  ctx.strokeRect(x, y, w, h);

  // 2. Beveled wainscot panels along the partition face
  const panelH = 34;
  for (let py = y + 10; py < y + h - panelH; py += panelH + 12) {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.22)';
    ctx.fillRect(x + 2, py, w - 4, panelH);
    ctx.fillStyle = opts.woodColor;
    ctx.fillRect(x + 3, py + 1.5, w - 6, panelH - 3);
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.18)';
    ctx.lineWidth = 0.8;
    ctx.strokeRect(x + 3, py + 1.5, w - 6, panelH - 3);
  }

  // 3. Molded top cap rail
  ctx.fillStyle = opts.trimColor;
  ctx.fillRect(x - 2, y, w + 4, 5);
  ctx.strokeStyle = '#292524';
  ctx.lineWidth = 1;
  ctx.strokeRect(x - 2, y, w + 4, 5);
  ctx.fillStyle = 'rgba(255, 255, 255, 0.25)';
  ctx.fillRect(x - 2, y, w + 4, 1.2);

  // 4. Baseboard wrap around partition bottom
  ctx.fillStyle = '#5A2609';
  ctx.fillRect(x - 2, y + h - 6, w + 4, 6);
  ctx.strokeStyle = '#1C1917';
  ctx.lineWidth = 1;
  ctx.strokeRect(x - 2, y + h - 6, w + 4, 6);

  // 5. Open-End Architectural Post / Column (Remate escultórico 3D)
  if (opts.hasEndPost !== false) {
    const postY = y + h - 4;
    ctx.fillStyle = opts.trimColor;
    ctx.beginPath();
    ctx.roundRect(x - 3, postY - 8, w + 6, 12, 3);
    ctx.fill();
    ctx.strokeStyle = '#292524';
    ctx.lineWidth = 1.2;
    ctx.stroke();

    // Brass or carved finial accent
    ctx.fillStyle = '#F59E0B';
    ctx.beginPath();
    ctx.arc(x + w / 2, postY + 4, 2.5, 0, Math.PI * 2);
    ctx.fill();
  }

  // 6. Ambient drop shadow cast by partition wall onto floor
  const partShadow = ctx.createLinearGradient(x + w, y, x + w + 8, y);
  partShadow.addColorStop(0, 'rgba(0, 0, 0, 0.28)');
  partShadow.addColorStop(1, 'rgba(0, 0, 0, 0)');
  ctx.fillStyle = partShadow;
  ctx.fillRect(x + w, y, 8, h);

  ctx.restore();
}

// Cozy brick fireplace with carved mantelpiece and animated fire
export function drawCozyFireplace(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  time: number,
  timeOfDay: TimeOfDay
) {
  ctx.save();
  const w = 76;
  const h = 58;

  // 1. Hearthstone extension on the floor
  ctx.fillStyle = '#475569';
  ctx.beginPath();
  ctx.roundRect(x - 6, y + h - 8, w + 12, 16, 4);
  ctx.fill();
  ctx.strokeStyle = '#1E293B';
  ctx.lineWidth = 1.2;
  ctx.stroke();

  // Hearth tiles
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
  ctx.lineWidth = 1;
  for (let hx = x - 2; hx < x + w + 2; hx += 14) {
    ctx.beginPath();
    ctx.moveTo(hx, y + h - 7);
    ctx.lineTo(hx, y + h + 7);
    ctx.stroke();
  }

  // 2. Red Brick Fireplace Body
  ctx.fillStyle = '#991B1B';
  ctx.fillRect(x, y, w, h - 8);
  ctx.strokeStyle = '#7F1D1D';
  ctx.lineWidth = 1.2;
  ctx.strokeRect(x, y, w, h - 8);

  // Brick mortar lines
  ctx.strokeStyle = '#FEE2E2';
  ctx.lineWidth = 0.8;
  for (let by = y + 8; by < y + h - 10; by += 8) {
    ctx.beginPath();
    ctx.moveTo(x + 2, by);
    ctx.lineTo(x + w - 2, by);
    ctx.stroke();

    const isStagger = (Math.floor(by / 8) % 2 === 0);
    for (let bx = x + (isStagger ? 6 : 14); bx < x + w - 4; bx += 16) {
      ctx.beginPath();
      ctx.moveTo(bx, by);
      ctx.lineTo(bx, by + 8);
      ctx.stroke();
    }
  }

  // 3. Firebox Opening (Arched black cavity)
  ctx.fillStyle = '#09090B';
  ctx.beginPath();
  ctx.roundRect(x + 16, y + 16, w - 32, h - 24, [8, 8, 0, 0]);
  ctx.fill();
  ctx.strokeStyle = '#27272A';
  ctx.lineWidth = 1.5;
  ctx.stroke();

  // 4. Carved Wood Mantelpiece on Top
  ctx.fillStyle = '#78350F';
  ctx.fillRect(x - 8, y - 6, w + 16, 8);
  ctx.strokeStyle = '#451A03';
  ctx.lineWidth = 1.5;
  ctx.strokeRect(x - 8, y - 6, w + 16, 8);
  // Mantel top highlight
  ctx.fillStyle = '#B45309';
  ctx.fillRect(x - 8, y - 6, w + 16, 2);

  // Decorative corbels / brackets under mantel
  ctx.fillStyle = '#451A03';
  ctx.beginPath();
  ctx.moveTo(x - 4, y + 2);
  ctx.lineTo(x + 4, y + 2);
  ctx.lineTo(x - 4, y + 12);
  ctx.closePath();
  ctx.fill();

  ctx.beginPath();
  ctx.moveTo(x + w + 4, y + 2);
  ctx.lineTo(x + w - 4, y + 2);
  ctx.lineTo(x + w + 4, y + 12);
  ctx.closePath();
  ctx.fill();

  // 5. Fire Grate & Burning Logs
  ctx.fillStyle = '#18181B';
  ctx.fillRect(x + 22, y + h - 14, w - 44, 4);
  // Wooden logs
  ctx.fillStyle = '#78350F';
  ctx.fillRect(x + 24, y + h - 18, w - 48, 6);

  // Animated Flames & Embers
  const flame1 = Math.sin(time * 8) * 3;
  const flame2 = Math.cos(time * 10) * 2.5;
  const fireGrad = ctx.createRadialGradient(x + w / 2, y + h - 14, 2, x + w / 2, y + h - 14, 18);
  fireGrad.addColorStop(0, '#FEF08A');
  fireGrad.addColorStop(0.4, '#F59E0B');
  fireGrad.addColorStop(0.8, '#DC2626');
  fireGrad.addColorStop(1, 'rgba(220, 38, 38, 0)');
  ctx.fillStyle = fireGrad;
  ctx.beginPath();
  ctx.moveTo(x + 24, y + h - 14);
  ctx.quadraticCurveTo(x + w / 2 - 4 + flame1, y + h - 30 + flame2, x + w / 2, y + h - 32);
  ctx.quadraticCurveTo(x + w / 2 + 4 + flame2, y + h - 28 + flame1, x + w - 24, y + h - 14);
  ctx.closePath();
  ctx.fill();

  // Warm glowing radial pool on floor in front of fireplace
  drawInteriorLightCone(ctx, x + w / 2, y + h + 10, 65, timeOfDay, 0.7, true);

  ctx.restore();
}

/**
 * 1. CASA DE ARI
 */
export function drawHouseAri(
  ctx: CanvasRenderingContext2D,
  loc: LocationData,
  time: number,
  timeOfDay: TimeOfDay,
  sortableItems?: YSortItem[]
) {
  // Background walls, floor & architecture
  drawArchitecturalWallsAndFloor(
    ctx,
    loc.width,
    loc.height,
    {
      wallColor: '#FEF3C7',
      wallpaperStripe: 'rgba(217, 119, 6, 0.2)',
      chairRailColor: '#B45309',
      wainscotColor: '#92400E',
      plankTone1: '#FEF3C7',
      plankTone2: '#FDE68A',
      tileArea: { x: 40, y: 230, w: 220, h: 190, tileCol: '#F1F5F9', groutCol: '#CBD5E1' },
      doorwayX: 160,
      doorwayW: 50
    },
    timeOfDay
  );

  // Windows with natural light projection
  drawInteriorWindow(ctx, 430, 48, 60, 28, timeOfDay, time);
  drawInteriorWindow(ctx, 90, 48, 70, 28, timeOfDay, time);

  // Wall clock & partition walls
  drawWallClock(ctx, 115, 30, time);

  // Architectural Partition wall between living and bedroom (NOT a flat rectangle!)
  drawArchitecturalPartitionWall(ctx, 260, 56, 14, 175, {
    woodColor: '#78350F',
    trimColor: '#B45309',
    hasEndPost: true
  });

  // Architectural Bathroom divider with end post
  drawArchitecturalPartitionWall(ctx, 380, 230, 14, 190, {
    woodColor: '#78350F',
    trimColor: '#B45309',
    hasEndPost: true
  });

  // Flat rugs (rendered on floor)
  drawDetailedRug(ctx, 60, 125, 120, 80, '#991B1B', '#F59E0B');
  drawDetailedRug(ctx, 300, 160, 75, 55, '#0284C7', '#BAE6FD');

  // Furniture items list (depth-sortable)
  const items: YSortItem[] = [
    // Cozy fireplace in the living room
    {
      baseY: 110,
      draw: (c) => {
        drawCozyFireplace(c, 170, 58, time, timeOfDay);
      }
    },
    // Living room sofa
    {
      baseY: 125,
      draw: (c) => {
        c.fillStyle = '#7F1D1D';
        c.beginPath();
        c.roundRect(60, 75, 100, 45, 8);
        c.fill();
        c.strokeStyle = '#18181B';
        c.lineWidth = 1.5;
        c.stroke();
        c.fillStyle = '#991B1B';
        c.roundRect(66, 82, 42, 32, 6);
        c.fill();
        c.roundRect(112, 82, 42, 32, 6);
        c.fill();
      }
    },
    // Bookshelf
    {
      baseY: 75,
      draw: (c) => {
        drawDetailedBookshelf(c, 60, 40, 55, 32);
      }
    },
    // Table lamp
    {
      baseY: 82,
      draw: (c) => {
        drawTableLamp(c, 240, 75, timeOfDay);
      }
    },
    // Ari's bed
    {
      baseY: 160,
      draw: (c) => {
        c.fillStyle = '#F8FAFC';
        c.fillRect(300, 75, 75, 90);
        c.strokeStyle = '#64748B';
        c.lineWidth = 1.5;
        c.strokeRect(300, 75, 75, 90);
        c.fillStyle = '#0284C7';
        c.fillRect(300, 105, 75, 60);
      }
    },
    // Ari's writing desk
    {
      baseY: 115,
      draw: (c) => {
        c.fillStyle = '#78350F';
        c.fillRect(420, 75, 80, 42);
        c.strokeStyle = '#451A03';
        c.lineWidth = 1.5;
        c.strokeRect(420, 75, 80, 42);
        // Lamp & paper
        c.fillStyle = '#15803D';
        c.beginPath();
        c.roundRect(424, 82, 10, 6, 2);
        c.fill();
        drawInteriorLightCone(c, 429, 92, 40, timeOfDay, 0.65);
        drawPottedPlant(c, 515, 95, time);
      }
    },
    // Kitchen counter & sink
    {
      baseY: 295,
      draw: (c) => {
        c.fillStyle = '#CBD5E1';
        c.fillRect(50, 250, 120, 45);
        c.strokeStyle = '#475569';
        c.lineWidth = 1.5;
        c.strokeRect(50, 250, 120, 45);
        c.fillStyle = '#94A3B8';
        c.fillRect(115, 255, 30, 25);
        c.fillStyle = '#E2E8F0';
        c.fillRect(128, 250, 4, 8);
        drawSteamingCup(c, 70, 265, time, '#F59E0B');
      }
    },
    // Fridge
    {
      baseY: 300,
      draw: (c) => {
        c.fillStyle = '#F8FAFC';
        c.fillRect(180, 250, 45, 50);
        c.strokeStyle = '#64748B';
        c.lineWidth = 1.5;
        c.strokeRect(180, 250, 45, 50);
        c.fillStyle = '#94A3B8';
        c.fillRect(185, 265, 3, 16);
      }
    },
    // Kitchen dining table
    {
      baseY: 355,
      draw: (c) => {
        c.fillStyle = '#92400E';
        c.fillRect(90, 320, 60, 35);
        c.strokeStyle = '#451A03';
        c.lineWidth = 1.5;
        c.strokeRect(90, 320, 60, 35);
        drawSteamingCup(c, 120, 332, time);
      }
    },
    // Entry table & coat rack
    {
      baseY: 405,
      draw: (c) => {
        c.fillStyle = '#78350F';
        c.fillRect(80, 385, 45, 20);
        c.strokeStyle = '#451A03';
        c.strokeRect(80, 385, 45, 20);
        c.fillStyle = '#451A03';
        c.fillRect(60, 380, 4, 32);
        c.fillStyle = '#18181B';
        c.beginPath();
        c.arc(62, 385, 7, 0, Math.PI * 2);
        c.fill();
      }
    },
    // Bathroom tub
    {
      baseY: 310,
      draw: (c) => {
        c.fillStyle = '#F8FAFC';
        c.fillRect(400, 250, 45, 60);
        c.strokeStyle = '#64748B';
        c.strokeRect(400, 250, 45, 60);
        c.fillStyle = '#E2E8F0';
        c.fillRect(460, 250, 35, 25);
      }
    }
  ];

  if (sortableItems) {
    sortableItems.push(...items);
  } else {
    items.forEach((it) => it.draw(ctx));
  }
}

/**
 * 2. CASA DE CHARLIE BROWN Y SALLY
 */
export function drawHouseCharlieBrown(
  ctx: CanvasRenderingContext2D,
  loc: LocationData,
  time: number,
  timeOfDay: TimeOfDay,
  sortableItems?: YSortItem[]
) {
  drawArchitecturalWallsAndFloor(
    ctx,
    loc.width,
    loc.height,
    {
      wallColor: '#FEF08A',
      wallpaperStripe: 'rgba(245, 158, 11, 0.25)',
      chairRailColor: '#B45309',
      wainscotColor: '#78350F',
      plankTone1: '#FEF08A',
      plankTone2: '#FDE047',
      doorwayX: 240,
      doorwayW: 50
    },
    timeOfDay
  );

  drawInteriorWindow(ctx, 110, 48, 75, 28, timeOfDay, time);
  drawInteriorWindow(ctx, 450, 48, 70, 28, timeOfDay, time);

  // Architectural Partition walls with 3D end posts
  drawArchitecturalPartitionWall(ctx, 320, 56, 14, 175, {
    woodColor: '#78350F',
    trimColor: '#B45309',
    hasEndPost: true
  });
  drawArchitecturalPartitionWall(ctx, 320, 270, 14, 170, {
    woodColor: '#78350F',
    trimColor: '#B45309',
    hasEndPost: true
  });

  drawDetailedRug(ctx, 70, 125, 140, 85, '#D97706', '#FBBF24');

  const items: YSortItem[] = [
    // Living room cozy fireplace
    {
      baseY: 110,
      draw: (c) => {
        drawCozyFireplace(c, 210, 58, time, timeOfDay);
      }
    },
    // Living room sofa with zigzag pillow
    {
      baseY: 125,
      draw: (c) => {
        c.fillStyle = '#B45309';
        c.beginPath();
        c.roundRect(70, 75, 120, 48, 8);
        c.fill();
        c.strokeStyle = '#18181B';
        c.lineWidth = 1.5;
        c.stroke();

        // Zigzag pillow
        c.fillStyle = '#F59E0B';
        c.roundRect(76, 82, 38, 32, 6);
        c.fill();
        c.strokeStyle = '#18181B';
        c.lineWidth = 2.5;
        c.beginPath();
        c.moveTo(78, 98);
        c.lineTo(87, 90);
        c.lineTo(96, 98);
        c.lineTo(105, 90);
        c.lineTo(112, 98);
        c.stroke();
      }
    },
    // CRT Television
    {
      baseY: 262,
      draw: (c) => {
        c.fillStyle = '#5A2609';
        c.fillRect(70, 220, 52, 42);
        c.strokeStyle = '#18181B';
        c.lineWidth = 1.5;
        c.strokeRect(70, 220, 52, 42);
        c.fillStyle = timeOfDay === 'night' ? '#67E8F9' : '#A5F3FC';
        c.fillRect(75, 225, 34, 28);
        drawInteriorLightCone(c, 92, 255, 55, timeOfDay, 0.45, true);
      }
    },
    // Phone table
    {
      baseY: 257,
      draw: (c) => {
        c.fillStyle = '#78350F';
        c.fillRect(140, 225, 35, 32);
        c.strokeStyle = '#451A03';
        c.strokeRect(140, 225, 35, 32);
        c.fillStyle = '#18181B';
        c.beginPath();
        c.roundRect(146, 230, 22, 16, 4);
        c.fill();
      }
    },
    // Floor lamp
    {
      baseY: 95,
      draw: (c) => {
        drawFloorLamp(c, 295, 75, timeOfDay);
      }
    },
    // Charlie Brown's bed
    {
      baseY: 165,
      draw: (c) => {
        c.fillStyle = '#F8FAFC';
        c.fillRect(360, 75, 75, 90);
        c.strokeStyle = '#334155';
        c.lineWidth = 1.5;
        c.strokeRect(360, 75, 75, 90);
        c.fillStyle = '#F59E0B';
        c.fillRect(360, 105, 75, 60);
      }
    },
    // Desk with baseball glove
    {
      baseY: 120,
      draw: (c) => {
        c.fillStyle = '#92400E';
        c.fillRect(460, 75, 75, 45);
        c.strokeStyle = '#451A03';
        c.strokeRect(460, 75, 75, 45);
        c.fillStyle = '#78350F';
        c.beginPath();
        c.ellipse(475, 95, 10, 8, 0.4, 0, Math.PI * 2);
        c.fill();
      }
    },
    // Kitchen dining table
    {
      baseY: 360,
      draw: (c) => {
        c.fillStyle = '#78350F';
        c.fillRect(400, 320, 80, 40);
        c.strokeStyle = '#451A03';
        c.lineWidth = 1.5;
        c.strokeRect(400, 320, 80, 40);
        // Snoopy's red food bowl on floor
        c.fillStyle = '#DC2626';
        c.beginPath();
        c.ellipse(500, 350, 10, 5, 0, 0, Math.PI * 2);
        c.fill();
      }
    }
  ];

  if (sortableItems) {
    sortableItems.push(...items);
  } else {
    items.forEach((it) => it.draw(ctx));
  }
}

/**
 * 3. CASETA DE SNOOPY (Interior Mágico)
 */
export function drawDoghouseInterior(
  ctx: CanvasRenderingContext2D,
  loc: LocationData,
  time: number,
  timeOfDay: TimeOfDay,
  sortableItems?: YSortItem[]
) {
  drawArchitecturalWallsAndFloor(
    ctx,
    loc.width,
    loc.height,
    {
      wallColor: '#1E3A8A',
      wallpaperStripe: 'rgba(254, 240, 138, 0.15)',
      chairRailColor: '#B45309',
      wainscotColor: '#451A03',
      plankTone1: '#78350F',
      plankTone2: '#5A2609',
      doorwayX: 280,
      doorwayW: 45
    },
    timeOfDay
  );

  // Framed Van Gogh on wall
  ctx.fillStyle = '#F59E0B';
  ctx.fillRect(80, 20, 45, 30);
  ctx.fillStyle = '#1E40AF';
  ctx.fillRect(84, 24, 37, 22);

  const items: YSortItem[] = [
    // Pool table
    {
      baseY: 175,
      draw: (c) => {
        c.fillStyle = '#78350F';
        c.fillRect(180, 110, 120, 65);
        c.fillStyle = '#15803D';
        c.fillRect(188, 116, 104, 53);
        c.fillStyle = '#FFFFFF';
        c.beginPath();
        c.arc(220, 140, 3, 0, Math.PI * 2);
        c.fill();
      }
    },
    // Chesterfield leather sofa
    {
      baseY: 245,
      draw: (c) => {
        c.fillStyle = '#451A03';
        c.beginPath();
        c.roundRect(80, 200, 90, 45, 8);
        c.fill();
        c.strokeStyle = '#18181B';
        c.stroke();
      }
    },
    // Snoopy's writing desk & typewriter
    {
      baseY: 335,
      draw: (c) => {
        c.fillStyle = '#78350F';
        c.fillRect(360, 290, 80, 45);
        c.strokeStyle = '#451A03';
        c.strokeRect(360, 290, 80, 45);
        // Typewriter
        c.fillStyle = '#18181B';
        c.fillRect(385, 296, 26, 18);
        c.fillStyle = '#FFFFFF';
        c.fillRect(390, 288, 16, 10);
      }
    },
    // Grandfather clock
    {
      baseY: 120,
      draw: (c) => {
        drawWallClock(c, 340, 70, time);
      }
    }
  ];

  if (sortableItems) {
    sortableItems.push(...items);
  } else {
    items.forEach((it) => it.draw(ctx));
  }
}

/**
 * 4. CASA DE LUCY Y LINUS (Van Pelt)
 */
export function drawHouseVanPelt(
  ctx: CanvasRenderingContext2D,
  loc: LocationData,
  time: number,
  timeOfDay: TimeOfDay,
  sortableItems?: YSortItem[]
) {
  drawArchitecturalWallsAndFloor(
    ctx,
    loc.width,
    loc.height,
    {
      wallColor: '#BFDBFE',
      wallpaperStripe: 'rgba(30, 64, 175, 0.2)',
      chairRailColor: '#B45309',
      wainscotColor: '#78350F',
      plankTone1: '#FEF3C7',
      plankTone2: '#FDE68A',
      doorwayX: 240,
      doorwayW: 50
    },
    timeOfDay
  );

  drawInteriorWindow(ctx, 100, 48, 70, 28, timeOfDay, time);
  drawInteriorWindow(ctx, 420, 48, 70, 28, timeOfDay, time);

  const items: YSortItem[] = [
    // Lucy's bed
    {
      baseY: 160,
      draw: (c) => {
        c.fillStyle = '#1E40AF';
        c.fillRect(60, 75, 75, 85);
        c.strokeStyle = '#18181B';
        c.strokeRect(60, 75, 75, 85);
      }
    },
    // Linus' bed with blue blanket
    {
      baseY: 160,
      draw: (c) => {
        c.fillStyle = '#DC2626';
        c.fillRect(340, 75, 75, 85);
        c.strokeStyle = '#18181B';
        c.strokeRect(340, 75, 75, 85);
        // Blanket
        c.fillStyle = '#38BDF8';
        c.fillRect(360, 95, 45, 40);
      }
    },
    // Study desk
    {
      baseY: 115,
      draw: (c) => {
        c.fillStyle = '#78350F';
        c.fillRect(440, 75, 80, 40);
        c.strokeStyle = '#451A03';
        c.strokeRect(440, 75, 80, 40);
      }
    },
    // Sofa in lower living room
    {
      baseY: 330,
      draw: (c) => {
        c.fillStyle = '#1E3A8A';
        c.fillRect(60, 280, 110, 50);
        c.strokeStyle = '#172554';
        c.strokeRect(60, 280, 110, 50);
      }
    }
  ];

  if (sortableItems) {
    sortableItems.push(...items);
  } else {
    items.forEach((it) => it.draw(ctx));
  }
}

/**
 * 5. CASA DE SCHROEDER
 */
export function drawHouseSchroeder(
  ctx: CanvasRenderingContext2D,
  loc: LocationData,
  time: number,
  timeOfDay: TimeOfDay,
  sortableItems?: YSortItem[]
) {
  drawArchitecturalWallsAndFloor(
    ctx,
    loc.width,
    loc.height,
    {
      wallColor: '#FED7AA',
      wallpaperStripe: 'rgba(124, 45, 18, 0.2)',
      chairRailColor: '#7C2D12',
      wainscotColor: '#451A03',
      plankTone1: '#FEF3C7',
      plankTone2: '#FDE68A',
      doorwayX: 240,
      doorwayW: 50
    },
    timeOfDay
  );

  drawInteriorWindow(ctx, 110, 48, 75, 28, timeOfDay, time);
  drawInteriorWindow(ctx, 420, 48, 75, 28, timeOfDay, time);

  // Bust of Beethoven on wall bracket
  ctx.fillStyle = '#F8FAFC';
  ctx.beginPath();
  ctx.arc(220, 36, 10, 0, Math.PI * 2);
  ctx.fill();

  const items: YSortItem[] = [
    // Schroeder's iconic red toy piano
    {
      baseY: 220,
      draw: (c) => {
        c.fillStyle = '#DC2626';
        c.fillRect(180, 160, 80, 55);
        c.strokeStyle = '#18181B';
        c.lineWidth = 1.5;
        c.strokeRect(180, 160, 80, 55);
        // Piano keys
        c.fillStyle = '#FFFFFF';
        c.fillRect(186, 195, 68, 16);
        c.fillStyle = '#18181B';
        for (let k = 0; k < 7; k++) {
          c.fillRect(192 + k * 8, 195, 4, 10);
        }
      }
    },
    // Gramophone on table
    {
      baseY: 330,
      draw: (c) => {
        c.fillStyle = '#78350F';
        c.fillRect(80, 280, 50, 45);
        c.strokeStyle = '#451A03';
        c.strokeRect(80, 280, 50, 45);
        // Brass horn
        c.fillStyle = '#F59E0B';
        c.beginPath();
        c.arc(105, 275, 12, 0, Math.PI * 2);
        c.fill();
      }
    },
    // Music bookshelves
    {
      baseY: 115,
      draw: (c) => {
        drawDetailedBookshelf(c, 320, 75, 110, 40);
      }
    }
  ];

  if (sortableItems) {
    sortableItems.push(...items);
  } else {
    items.forEach((it) => it.draw(ctx));
  }
}

/**
 * 6. CASA DE PEPPERMINT PATTY
 */
export function drawHousePeppermintPatty(
  ctx: CanvasRenderingContext2D,
  loc: LocationData,
  time: number,
  timeOfDay: TimeOfDay,
  sortableItems?: YSortItem[]
) {
  drawArchitecturalWallsAndFloor(
    ctx,
    loc.width,
    loc.height,
    {
      wallColor: '#BBF7D0',
      wallpaperStripe: 'rgba(21, 128, 61, 0.2)',
      chairRailColor: '#15803D',
      wainscotColor: '#78350F',
      plankTone1: '#FEF3C7',
      plankTone2: '#FDE68A',
      doorwayX: 220,
      doorwayW: 50
    },
    timeOfDay
  );

  drawInteriorWindow(ctx, 110, 48, 75, 28, timeOfDay, time);

  const items: YSortItem[] = [
    // Patty's bed
    {
      baseY: 160,
      draw: (c) => {
        c.fillStyle = '#15803D';
        c.fillRect(60, 75, 80, 85);
        c.strokeStyle = '#18181B';
        c.strokeRect(60, 75, 80, 85);
      }
    },
    // Sports trophy case
    {
      baseY: 115,
      draw: (c) => {
        c.fillStyle = '#78350F';
        c.fillRect(160, 75, 70, 40);
        c.fillStyle = '#F59E0B';
        c.fillRect(180, 80, 10, 14); // trophy cup
      }
    },
    // Baseball locker & bats
    {
      baseY: 330,
      draw: (c) => {
        c.fillStyle = '#166534';
        c.fillRect(330, 260, 50, 70);
        c.strokeStyle = '#14532D';
        c.strokeRect(330, 260, 50, 70);
      }
    }
  ];

  if (sortableItems) {
    sortableItems.push(...items);
  } else {
    items.forEach((it) => it.draw(ctx));
  }
}

/**
 * 7. CASA DE MARCIE
 */
export function drawHouseMarcie(
  ctx: CanvasRenderingContext2D,
  loc: LocationData,
  time: number,
  timeOfDay: TimeOfDay,
  sortableItems?: YSortItem[]
) {
  drawArchitecturalWallsAndFloor(
    ctx,
    loc.width,
    loc.height,
    {
      wallColor: '#DDD6FE',
      wallpaperStripe: 'rgba(109, 40, 217, 0.2)',
      chairRailColor: '#6D28D9',
      wainscotColor: '#581C87',
      plankTone1: '#FEF3C7',
      plankTone2: '#FDE68A',
      doorwayX: 220,
      doorwayW: 50
    },
    timeOfDay
  );

  drawInteriorWindow(ctx, 110, 48, 75, 28, timeOfDay, time);

  const items: YSortItem[] = [
    // Massive bookshelves
    {
      baseY: 115,
      draw: (c) => {
        drawDetailedBookshelf(c, 60, 70, 140, 45);
      }
    },
    // Reading armchair
    {
      baseY: 155,
      draw: (c) => {
        c.fillStyle = '#7C2D12';
        c.beginPath();
        c.roundRect(230, 100, 55, 55, 8);
        c.fill();
        c.strokeStyle = '#18181B';
        c.stroke();
      }
    },
    // Study desk
    {
      baseY: 115,
      draw: (c) => {
        c.fillStyle = '#78350F';
        c.fillRect(330, 70, 80, 45);
        c.strokeStyle = '#451A03';
        c.strokeRect(330, 70, 80, 45);
      }
    }
  ];

  if (sortableItems) {
    sortableItems.push(...items);
  } else {
    items.forEach((it) => it.draw(ctx));
  }
}

/**
 * 8. CASA DE FRANKLIN
 */
export function drawHouseFranklin(
  ctx: CanvasRenderingContext2D,
  loc: LocationData,
  time: number,
  timeOfDay: TimeOfDay,
  sortableItems?: YSortItem[]
) {
  drawArchitecturalWallsAndFloor(
    ctx,
    loc.width,
    loc.height,
    {
      wallColor: '#DBEAFE',
      wallpaperStripe: 'rgba(30, 64, 175, 0.18)',
      chairRailColor: '#1D4ED8',
      wainscotColor: '#1E3A8A',
      plankTone1: '#FEF3C7',
      plankTone2: '#FDE68A',
      doorwayX: 220,
      doorwayW: 50
    },
    timeOfDay
  );

  drawInteriorWindow(ctx, 110, 48, 75, 28, timeOfDay, time);
  drawInteriorLightCone(ctx, 430, 120, 60, timeOfDay, 0.45);

  const items: YSortItem[] = [
    // Franklin's bed
    {
      baseY: 160,
      draw: (c) => {
        c.fillStyle = '#1D4ED8';
        c.fillRect(60, 75, 80, 85);
        c.strokeStyle = '#1E3A8A';
        c.lineWidth = 1.2;
        c.strokeRect(60, 75, 80, 85);
        // Pillow
        c.fillStyle = '#EFF6FF';
        c.fillRect(65, 78, 40, 20);
        c.strokeStyle = '#93C5FD';
        c.strokeRect(65, 78, 40, 20);
      }
    },
    // Grandfather's historical library & certificates
    {
      baseY: 115,
      draw: (c) => {
        drawDetailedBookshelf(c, 160, 70, 95, 45);
        // Framed certificate / historical photo on wall
        c.fillStyle = '#78350F';
        c.fillRect(270, 35, 30, 24);
        c.fillStyle = '#FEF3C7';
        c.fillRect(272, 37, 26, 20);
      }
    },
    // Chessboard table
    {
      baseY: 260,
      draw: (c) => {
        c.fillStyle = '#78350F';
        c.fillRect(320, 210, 65, 50);
        c.strokeStyle = '#451A03';
        c.lineWidth = 1.2;
        c.strokeRect(320, 210, 65, 50);
        // Checkered board
        c.fillStyle = '#FEF3C7';
        c.fillRect(332, 216, 40, 36);
        c.fillStyle = '#1E293B';
        for (let row = 0; row < 4; row++) {
          for (let col = 0; col < 4; col++) {
            if ((row + col) % 2 === 1) {
              c.fillRect(332 + col * 10, 216 + row * 9, 10, 9);
            }
          }
        }
      }
    },
    // Study desk with notebook, inkwell & lamp
    {
      baseY: 115,
      draw: (c) => {
        c.fillStyle = '#78350F';
        c.fillRect(400, 70, 80, 45);
        c.strokeStyle = '#451A03';
        c.strokeRect(400, 70, 80, 45);
        // Open notebook
        c.fillStyle = '#FFFFFF';
        c.fillRect(415, 78, 22, 14);
        c.strokeStyle = '#CBD5E1';
        c.strokeRect(415, 78, 22, 14);
        // Brass reading lamp
        c.fillStyle = '#F59E0B';
        c.fillRect(460, 74, 10, 18);
        c.beginPath();
        c.arc(465, 74, 7, Math.PI, 0);
        c.fill();
      }
    }
  ];

  if (sortableItems) {
    sortableItems.push(...items);
  } else {
    items.forEach((it) => it.draw(ctx));
  }
}

/**
 * 9. CASA DE PIG-PEN
 */
export function drawHousePigpen(
  ctx: CanvasRenderingContext2D,
  loc: LocationData,
  time: number,
  timeOfDay: TimeOfDay,
  sortableItems?: YSortItem[]
) {
  drawArchitecturalWallsAndFloor(
    ctx,
    loc.width,
    loc.height,
    {
      wallColor: '#E7E5E4',
      wallpaperStripe: 'rgba(120, 113, 108, 0.16)',
      chairRailColor: '#78716C',
      wainscotColor: '#57534E',
      plankTone1: '#FDE68A',
      plankTone2: '#FCD34D',
      doorwayX: 220,
      doorwayW: 50
    },
    timeOfDay
  );

  drawInteriorWindow(ctx, 110, 48, 75, 28, timeOfDay, time);

  // Tiny friendly floating dust motes catching the room light
  ctx.save();
  ctx.fillStyle = 'rgba(214, 211, 209, 0.45)';
  for (let i = 0; i < 16; i++) {
    const px = 100 + ((i * 37 + Math.sin(time * 0.8 + i) * 15) % 400);
    const py = 80 + ((i * 29 + Math.cos(time * 0.7 + i) * 12) % 300);
    ctx.beginPath();
    ctx.arc(px, py, 1.2 + (i % 3) * 0.5, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();

  const items: YSortItem[] = [
    // Pig-Pen's unmade cozy bed
    {
      baseY: 160,
      draw: (c) => {
        c.fillStyle = '#78716C';
        c.fillRect(60, 75, 80, 85);
        c.strokeStyle = '#44403C';
        c.lineWidth = 1.2;
        c.strokeRect(60, 75, 80, 85);
        // Earth-toned blanket
        c.fillStyle = '#A8A29E';
        c.fillRect(64, 98, 72, 58);
      }
    },
    // Comic book stacks
    {
      baseY: 115,
      draw: (c) => {
        // Shelf with colorful comics
        c.fillStyle = '#78350F';
        c.fillRect(160, 75, 85, 40);
        c.strokeStyle = '#451A03';
        c.strokeRect(160, 75, 85, 40);
        // Stack of comics
        const colors = ['#EF4444', '#3B82F6', '#F59E0B', '#10B981'];
        for (let j = 0; j < 4; j++) {
          c.fillStyle = colors[j];
          c.fillRect(175, 82 + j * 5, 20, 4);
        }
      }
    },
    // Dusty comfortable armchair
    {
      baseY: 260,
      draw: (c) => {
        c.fillStyle = '#854D0E';
        c.beginPath();
        c.roundRect(320, 205, 60, 55, 8);
        c.fill();
        c.strokeStyle = '#57534E';
        c.stroke();
        // Little playful dust swirl near chair base
        c.fillStyle = 'rgba(168, 162, 158, 0.4)';
        c.beginPath();
        c.arc(350, 255, 8, 0, Math.PI * 2);
        c.fill();
      }
    },
    // Vintage tube radio & specimen cabinet
    {
      baseY: 115,
      draw: (c) => {
        c.fillStyle = '#78350F';
        c.fillRect(400, 70, 80, 45);
        c.strokeStyle = '#451A03';
        c.strokeRect(400, 70, 80, 45);
        // Vintage wood radio
        c.fillStyle = '#B45309';
        c.fillRect(415, 75, 30, 22);
        c.fillStyle = '#FEF08A';
        c.beginPath();
        c.arc(430, 84, 5, 0, Math.PI * 2);
        c.fill();
      }
    }
  ];

  if (sortableItems) {
    sortableItems.push(...items);
  } else {
    items.forEach((it) => it.draw(ctx));
  }
}

/**
 * 10. ESCUELA PRIMARIA
 */
export function drawSchoolInterior(
  ctx: CanvasRenderingContext2D,
  loc: LocationData,
  time: number,
  timeOfDay: TimeOfDay,
  sortableItems?: YSortItem[]
) {
  drawArchitecturalWallsAndFloor(
    ctx,
    loc.width,
    loc.height,
    {
      wallColor: '#FEE2E2',
      wallpaperStripe: 'rgba(185, 28, 28, 0.15)',
      chairRailColor: '#991B1B',
      wainscotColor: '#78350F',
      plankTone1: '#FEF08A',
      plankTone2: '#FDE047',
      doorwayX: 300,
      doorwayW: 60
    },
    timeOfDay
  );

  // Large green chalkboard on top wall
  ctx.fillStyle = '#14532D';
  ctx.fillRect(80, 20, 280, 32);
  ctx.strokeStyle = '#78350F';
  ctx.lineWidth = 2.5;
  ctx.strokeRect(80, 20, 280, 32);

  // Chalk writing
  ctx.fillStyle = '#F8FAFC';
  ctx.font = 'bold 8px sans-serif';
  ctx.fillText('AULA 4 - LA ESPERANZA ES UN PAJARITO AMARILLO', 95, 38);

  const items: YSortItem[] = [
    // Teacher's oak desk
    {
      baseY: 140,
      draw: (c) => {
        c.fillStyle = '#78350F';
        c.fillRect(180, 100, 90, 40);
        c.strokeStyle = '#451A03';
        c.lineWidth = 1.5;
        c.strokeRect(180, 100, 90, 40);
        c.fillStyle = '#EF4444';
        c.beginPath();
        c.arc(200, 110, 4, 0, Math.PI * 2);
        c.fill(); // red apple for teacher
      }
    },
    // Row 1 of student desks
    {
      baseY: 215,
      draw: (c) => {
        for (let dx = 80; dx <= 320; dx += 80) {
          c.fillStyle = '#B45309';
          c.fillRect(dx, 180, 50, 35);
          c.strokeStyle = '#451A03';
          c.strokeRect(dx, 180, 50, 35);
        }
      }
    },
    // Row 2 of student desks
    {
      baseY: 275,
      draw: (c) => {
        for (let dx = 80; dx <= 320; dx += 80) {
          c.fillStyle = '#B45309';
          c.fillRect(dx, 240, 50, 35);
          c.strokeStyle = '#451A03';
          c.strokeRect(dx, 240, 50, 35);
        }
      }
    },
    // School nurse cot
    {
      baseY: 120,
      draw: (c) => {
        c.fillStyle = '#F8FAFC';
        c.fillRect(480, 70, 100, 50);
        c.strokeStyle = '#94A3B8';
        c.strokeRect(480, 70, 100, 50);
        // Red cross
        c.fillStyle = '#EF4444';
        c.fillRect(525, 78, 10, 3);
        c.fillRect(528, 75, 4, 9);
      }
    }
  ];

  if (sortableItems) {
    sortableItems.push(...items);
  } else {
    items.forEach((it) => it.draw(ctx));
  }
}

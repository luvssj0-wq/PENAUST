import { LocationData, TimeOfDay, Position } from '../types';

/**
 * Hand-crafted, authentic Charles M. Schulz Peanuts Sandlot Baseball Field renderer.
 * Features:
 * - Natural grass outfield with surrounding oaks and maples
 * - Realistic dirt diamond mixing grass and infield clay
 * - Charlie Brown's famous pitcher's mound with dirt elevation & rubber
 * - Home plate, white canvas bases (1st, 2nd, 3rd) and chalk foul lines
 * - Wooden & wire chain-link backstop behind batter
 * - Two covered wooden player dugouts (banquillos)
 * - Hand-numbered wooden manual scoreboard (HOME 2, VISITORS 3, INNING 6)
 * - Wooden spectator benches on grass
 * - Small rustic equipment shed (almacén) with bats, balls, gloves, rake
 * - Drinking water fountain & picnic resting area
 * - Snoopy watching from the fence or dugout roof, Woodstock perched on the scoreboard
 */

export function drawRealisticBaseballFieldScene(
  ctx: CanvasRenderingContext2D,
  loc: LocationData,
  time: number,
  timeOfDay: TimeOfDay = 'day',
  playerPos?: Position
) {
  const isNight = timeOfDay === 'night';
  const isSunset = timeOfDay === 'sunset';

  ctx.save();

  // 1. BASE ATHLETIC GRASS FIELD (with soft diagonal mower striping)
  const grassBase = isNight ? '#143118' : isSunset ? '#4D7C0F' : '#65A30D';
  const grassAlt = isNight ? '#16381B' : isSunset ? '#558911' : '#71B20E';

  ctx.fillStyle = grassBase;
  ctx.fillRect(0, 0, loc.width, loc.height);

  // Mower stripes
  ctx.fillStyle = grassAlt;
  for (let sx = -loc.height; sx < loc.width + loc.height; sx += 60) {
    ctx.beginPath();
    ctx.moveTo(sx, 0);
    ctx.lineTo(sx + 30, 0);
    ctx.lineTo(sx + 30 + loc.height, loc.height);
    ctx.lineTo(sx + loc.height, loc.height);
    ctx.closePath();
    ctx.fill();
  }

  // Outfield perimeter trees and bushes (background boundary)
  drawOutfieldTrees(ctx, loc.width, time, isNight, isSunset);

  // 2. INFIELD DIRT DIAMOND
  // Centered at around x: 500, y: 440
  const diamondCenterX = 500;
  const diamondCenterY = 440;
  const diamondSpan = 140;

  // Dirt clay base gradient
  const dirtCol = isNight ? '#5A2A14' : isSunset ? '#9A3412' : '#B45309';
  const dirtBorder = isNight ? '#3E1906' : '#78350F';

  // Infield arc dirt track
  ctx.fillStyle = dirtCol;
  ctx.beginPath();
  ctx.arc(diamondCenterX, diamondCenterY, diamondSpan + 30, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = dirtBorder;
  ctx.lineWidth = 2;
  ctx.stroke();

  // Infield lawn patch inside the dirt running basepaths
  ctx.fillStyle = isNight ? '#163B1C' : '#65A30D';
  ctx.beginPath();
  ctx.moveTo(diamondCenterX, diamondCenterY - diamondSpan + 25); // 2nd base point
  ctx.lineTo(diamondCenterX + diamondSpan - 25, diamondCenterY); // 1st base point
  ctx.lineTo(diamondCenterX, diamondCenterY + diamondSpan - 25); // Home plate point
  ctx.lineTo(diamondCenterX - diamondSpan + 25, diamondCenterY); // 3rd base point
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = dirtBorder;
  ctx.lineWidth = 1.5;
  ctx.stroke();

  // 3. CHARLIE BROWN'S PITCHER'S MOUND (Center)
  const moundX = diamondCenterX;
  const moundY = diamondCenterY;
  const moundR = 24;

  // Mound elevation shadow
  ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
  ctx.beginPath();
  ctx.ellipse(moundX, moundY + 4, moundR + 2, moundR * 0.7, 0, 0, Math.PI * 2);
  ctx.fill();

  // Mound packed clay
  ctx.fillStyle = isNight ? '#6A3218' : '#C2410C';
  ctx.beginPath();
  ctx.arc(moundX, moundY, moundR, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#78350F';
  ctx.lineWidth = 1.8;
  ctx.stroke();

  // Pitcher's rubber slab (white rectangular rubber plate)
  ctx.fillStyle = '#FFFFFF';
  ctx.fillRect(moundX - 8, moundY - 2.5, 16, 5);
  ctx.strokeStyle = '#1F2937';
  ctx.lineWidth = 1;
  ctx.strokeRect(moundX - 8, moundY - 2.5, 16, 5);

  // 4. BASES AND HOME PLATE
  const homeX = diamondCenterX;
  const homeY = diamondCenterY + diamondSpan;
  const firstBaseX = diamondCenterX + diamondSpan;
  const firstBaseY = diamondCenterY;
  const secondBaseX = diamondCenterX;
  const secondBaseY = diamondCenterY - diamondSpan;
  const thirdBaseX = diamondCenterX - diamondSpan;
  const thirdBaseY = diamondCenterY;

  // White chalk foul lines
  ctx.strokeStyle = '#FFFFFF';
  ctx.lineWidth = 2.2;
  // Foul line from home to 1st and extending to outfield
  ctx.beginPath();
  ctx.moveTo(homeX, homeY);
  ctx.lineTo(firstBaseX + 160, firstBaseY - 160);
  ctx.stroke();

  // Foul line from home to 3rd and extending to outfield
  ctx.beginPath();
  ctx.moveTo(homeX, homeY);
  ctx.lineTo(thirdBaseX - 160, thirdBaseY - 160);
  ctx.stroke();

  // White canvas bases
  drawBaseSquare(ctx, firstBaseX, firstBaseY, '1B');
  drawBaseSquare(ctx, secondBaseX, secondBaseY, '2B');
  drawBaseSquare(ctx, thirdBaseX, thirdBaseY, '3B');

  // Home plate (white five-sided rubber)
  ctx.fillStyle = '#FFFFFF';
  ctx.beginPath();
  ctx.moveTo(homeX - 8, homeY - 4);
  ctx.lineTo(homeX + 8, homeY - 4);
  ctx.lineTo(homeX + 8, homeY + 4);
  ctx.lineTo(homeX, homeY + 11);
  ctx.lineTo(homeX - 8, homeY + 4);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = '#1F2937';
  ctx.lineWidth = 1.2;
  ctx.stroke();

  // Batter's chalk boxes (left and right of home plate)
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.7)';
  ctx.lineWidth = 1.4;
  ctx.strokeRect(homeX - 22, homeY - 8, 11, 20);
  ctx.strokeRect(homeX + 11, homeY - 8, 11, 20);

  // 5. PROTECTIVE BACKSTOP (behind home plate)
  const backstopX = homeX;
  const backstopY = homeY + 34;
  drawBackstop(ctx, backstopX, backstopY);

  // 6. TWO COVERED WOODEN DUGOUHTS (Banquillos)
  // Home team dugout on 3rd base side
  drawDugout(ctx, diamondCenterX - 180, diamondCenterY + 80, 'VISITANTES');
  // Visitor team dugout on 1st base side
  drawDugout(ctx, diamondCenterX + 90, diamondCenterY + 80, 'CHARLIE BROWN');

  // 7. MANUAL SCOREBOARD (Marcador de madera)
  drawScoreboard(ctx, diamondCenterX - 160, diamondCenterY - 190);

  // 8. SPECTATOR BENCHES ON GRASS (Behind backstop and 1st base line)
  drawSpectatorBenches(ctx, homeX - 90, homeY + 50);
  drawSpectatorBenches(ctx, homeX + 40, homeY + 50);

  // 9. WOODEN EQUIPMENT SHED (Almacén de material)
  drawEquipmentShed(ctx, diamondCenterX + 240, diamondCenterY + 20, time);

  // 10. DRINKING WATER FOUNTAIN & PICNIC TABLE
  drawWaterFountain(ctx, diamondCenterX - 110, homeY + 25);
  drawPicnicRestArea(ctx, diamondCenterX + 160, homeY + 40);

  ctx.restore();
}

// Helper: Square canvas base
function drawBaseSquare(ctx: CanvasRenderingContext2D, x: number, y: number, label: string) {
  ctx.save();
  ctx.fillStyle = '#FFFFFF';
  ctx.beginPath();
  ctx.roundRect(x - 8, y - 8, 16, 16, 2);
  ctx.fill();
  ctx.strokeStyle = '#1F2937';
  ctx.lineWidth = 1.2;
  ctx.stroke();

  // Little strap in center
  ctx.fillStyle = '#D1D5DB';
  ctx.fillRect(x - 3, y - 1, 6, 2);
  ctx.restore();
}

// Helper: Wire backstop behind catcher
function drawBackstop(ctx: CanvasRenderingContext2D, x: number, y: number) {
  ctx.save();
  const w = 110;
  const h = 42;
  const startX = x - w / 2;

  // Wooden support posts
  ctx.fillStyle = '#78350F';
  for (let px = startX; px <= startX + w; px += 28) {
    ctx.fillRect(px, y, 4, h);
    ctx.strokeStyle = '#451A03';
    ctx.lineWidth = 1;
    ctx.strokeRect(px, y, 4, h);
  }

  // Top rail
  ctx.fillStyle = '#92400E';
  ctx.fillRect(startX, y, w, 4);

  // Wire chain-link mesh
  ctx.strokeStyle = 'rgba(156, 163, 175, 0.7)';
  ctx.lineWidth = 0.8;
  for (let ly = y + 4; ly < y + h; ly += 6) {
    ctx.beginPath();
    ctx.moveTo(startX, ly);
    ctx.lineTo(startX + w, ly);
    ctx.stroke();
  }
  for (let lx = startX; lx <= startX + w; lx += 8) {
    ctx.beginPath();
    ctx.moveTo(lx, y + 4);
    ctx.lineTo(lx, y + h);
    ctx.stroke();
  }
  ctx.restore();
}

// Helper: Wooden covered team dugout (banquillo)
function drawDugout(ctx: CanvasRenderingContext2D, x: number, y: number, teamName: string) {
  ctx.save();
  const w = 90;
  const h = 44;

  // Drop shadow
  ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
  ctx.fillRect(x, y + h - 2, w, 6);

  // Dugout back & side walls (weathered green painted wood)
  ctx.fillStyle = '#166534';
  ctx.fillRect(x, y, w, h);
  ctx.strokeStyle = '#14532D';
  ctx.lineWidth = 1.5;
  ctx.strokeRect(x, y, w, h);

  // Slanted corrugated tin / wood roof
  ctx.fillStyle = '#78350F';
  ctx.beginPath();
  ctx.moveTo(x - 4, y);
  ctx.lineTo(x + w + 4, y);
  ctx.lineTo(x + w + 2, y + 10);
  ctx.lineTo(x - 2, y + 10);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = '#1F2937';
  ctx.lineWidth = 1.2;
  ctx.stroke();

  // Bench interior
  ctx.fillStyle = '#451A03';
  ctx.fillRect(x + 6, y + 14, w - 12, h - 20);

  // Long wooden sitting bench
  ctx.fillStyle = '#B45309';
  ctx.fillRect(x + 8, y + 26, w - 16, 7);
  ctx.strokeStyle = '#78350F';
  ctx.lineWidth = 1;
  ctx.strokeRect(x + 8, y + 26, w - 16, 7);

  // Baseball bats resting against the side
  ctx.strokeStyle = '#D97706';
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.moveTo(x + 12, y + 36);
  ctx.lineTo(x + 18, y + 16);
  ctx.moveTo(x + 16, y + 36);
  ctx.lineTo(x + 22, y + 16);
  ctx.stroke();

  // Team sign plaque
  ctx.fillStyle = '#FEF3C7';
  ctx.fillRect(x + 12, y - 10, w - 24, 10);
  ctx.strokeStyle = '#92400E';
  ctx.lineWidth = 1;
  ctx.strokeRect(x + 12, y - 10, w - 24, 10);
  ctx.fillStyle = '#78350F';
  ctx.font = 'bold 7px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText(teamName, x + w / 2, y - 2);
  ctx.textAlign = 'start';

  ctx.restore();
}

// Helper: Scoreboard with real manual numbers
function drawScoreboard(ctx: CanvasRenderingContext2D, x: number, y: number) {
  ctx.save();
  const w = 120;
  const h = 54;

  // Wooden support poles
  ctx.fillStyle = '#78350F';
  ctx.fillRect(x + 12, y + h, 6, 26);
  ctx.fillRect(x + w - 18, y + h, 6, 26);

  // Green chalkboard scoreboard
  ctx.fillStyle = '#14532D';
  ctx.fillRect(x, y, w, h);
  ctx.strokeStyle = '#78350F';
  ctx.lineWidth = 2.5;
  ctx.strokeRect(x, y, w, h);

  // Heading
  ctx.fillStyle = '#FEF08A';
  ctx.font = 'bold 8px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('MARCADOR SANDLOT', x + w / 2, y + 11);

  // Grid lines
  ctx.strokeStyle = '#166534';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(x + 6, y + 16);
  ctx.lineTo(x + w - 6, y + 16);
  ctx.moveTo(x + 6, y + 34);
  ctx.lineTo(x + w - 6, y + 34);
  ctx.stroke();

  // Column headers
  ctx.font = 'bold 7px sans-serif';
  ctx.fillStyle = '#E2E8F0';
  ctx.textAlign = 'start';
  ctx.fillText('EQUIPO', x + 10, y + 28);
  ctx.fillText('C', x + 62, y + 28);
  ctx.fillText('H', x + 82, y + 28);
  ctx.fillText('E', x + 102, y + 28);

  // Charlie Brown team score
  ctx.fillStyle = '#FEF08A';
  ctx.fillText('PEANUTS', x + 10, y + 46);
  ctx.fillText('2', x + 64, y + 46);
  ctx.fillText('4', x + 84, y + 46);
  ctx.fillText('1', x + 104, y + 46);

  // Woodstock perched on the scoreboard corner
  ctx.fillStyle = '#FACC15';
  ctx.beginPath();
  ctx.arc(x + w - 6, y - 6, 4, 0, Math.PI * 2);
  ctx.fill();
  // Beak
  ctx.fillStyle = '#F97316';
  ctx.beginPath();
  ctx.moveTo(x + w - 2, y - 6);
  ctx.lineTo(x + w + 3, y - 5);
  ctx.lineTo(x + w - 2, y - 4);
  ctx.fill();

  ctx.restore();
}

// Helper: Wooden spectator benches on grass
function drawSpectatorBenches(ctx: CanvasRenderingContext2D, x: number, y: number) {
  ctx.save();
  const w = 50;
  // Cast shadow
  ctx.fillStyle = 'rgba(0,0,0,0.18)';
  ctx.fillRect(x, y + 16, w, 4);

  // Wooden bench seat
  ctx.fillStyle = '#78350F';
  ctx.fillRect(x, y + 6, w, 8);
  ctx.strokeStyle = '#451A03';
  ctx.lineWidth = 1;
  ctx.strokeRect(x, y + 6, w, 8);

  // Bench backrest
  ctx.fillStyle = '#92400E';
  ctx.fillRect(x, y - 4, w, 6);
  ctx.strokeRect(x, y - 4, w, 6);

  // Bench legs
  ctx.fillStyle = '#451A03';
  ctx.fillRect(x + 4, y + 14, 4, 8);
  ctx.fillRect(x + w - 8, y + 14, 4, 8);
  ctx.restore();
}

// Helper: Small rustic wooden equipment shed (almacén)
function drawEquipmentShed(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  time: number
) {
  ctx.save();
  const w = 70;
  const h = 58;

  // Drop shadow
  ctx.fillStyle = 'rgba(0, 0, 0, 0.22)';
  ctx.fillRect(x - 2, y + h, w + 4, 6);

  // Wooden walls
  ctx.fillStyle = '#B45309';
  ctx.fillRect(x, y + 12, w, h - 12);
  ctx.strokeStyle = '#78350F';
  ctx.lineWidth = 1.5;
  ctx.strokeRect(x, y + 12, w, h - 12);

  // Gabled roof
  ctx.fillStyle = '#78350F';
  ctx.beginPath();
  ctx.moveTo(x - 4, y + 12);
  ctx.lineTo(x + w / 2, y - 4);
  ctx.lineTo(x + w + 4, y + 12);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = '#1F2937';
  ctx.lineWidth = 1.5;
  ctx.stroke();

  // Shed door
  ctx.fillStyle = '#451A03';
  ctx.fillRect(x + 22, y + 22, 26, h - 22);
  ctx.strokeStyle = '#292524';
  ctx.strokeRect(x + 22, y + 22, 26, h - 22);
  // Cross diagonal brace
  ctx.strokeStyle = '#78350F';
  ctx.lineWidth = 1.2;
  ctx.beginPath();
  ctx.moveTo(x + 23, y + 23);
  ctx.lineTo(x + 47, y + h - 1);
  ctx.stroke();

  // Brass handle
  ctx.fillStyle = '#FBBF24';
  ctx.beginPath();
  ctx.arc(x + 44, y + 38, 2, 0, Math.PI * 2);
  ctx.fill();

  // Sign: "MATERIAL"
  ctx.fillStyle = '#FEF3C7';
  ctx.fillRect(x + 14, y + 8, w - 28, 9);
  ctx.strokeStyle = '#92400E';
  ctx.lineWidth = 0.8;
  ctx.strokeRect(x + 14, y + 8, w - 28, 9);
  ctx.fillStyle = '#78350F';
  ctx.font = 'bold 6.5px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('ALMACÉN', x + w / 2, y + 15);
  ctx.textAlign = 'start';

  // Rake & base bag leaning outside the shed
  ctx.strokeStyle = '#94A3B8';
  ctx.lineWidth = 1.6;
  ctx.beginPath();
  ctx.moveTo(x + 8, y + h);
  ctx.lineTo(x + 14, y + 24);
  ctx.stroke();
  ctx.fillStyle = '#64748B';
  ctx.fillRect(x + 10, y + 22, 8, 4);

  ctx.restore();
}

// Helper: Drinking water fountain
function drawWaterFountain(ctx: CanvasRenderingContext2D, x: number, y: number) {
  // Pedestal
  ctx.fillStyle = '#64748B';
  ctx.fillRect(x, y, 10, 18);
  ctx.strokeStyle = '#334155';
  ctx.lineWidth = 1;
  ctx.strokeRect(x, y, 10, 18);

  // Basin bowl
  ctx.fillStyle = '#94A3B8';
  ctx.beginPath();
  ctx.ellipse(x + 5, y, 8, 4, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // Chrome spigot
  ctx.fillStyle = '#E2E8F0';
  ctx.fillRect(x + 4, y - 6, 2, 6);
}

// Helper: Picnic rest area with table under shade tree
function drawPicnicRestArea(ctx: CanvasRenderingContext2D, x: number, y: number) {
  // Picnic table
  ctx.fillStyle = '#78350F';
  ctx.fillRect(x, y, 40, 12);
  ctx.strokeStyle = '#451A03';
  ctx.lineWidth = 1;
  ctx.strokeRect(x, y, 40, 12);

  // Benches
  ctx.fillStyle = '#92400E';
  ctx.fillRect(x - 4, y + 14, 48, 5);
}

// Helper: Distant outfield trees
function drawOutfieldTrees(
  ctx: CanvasRenderingContext2D,
  width: number,
  time: number,
  isNight: boolean,
  isSunset: boolean
) {
  const treeY = 60;
  for (let tx = 40; tx < width; tx += 95) {
    const sway = Math.sin(time * 1.4 + tx * 0.05) * 3;
    // Trunk
    ctx.fillStyle = isNight ? '#2A1A0A' : '#78350F';
    ctx.fillRect(tx - 4, treeY, 8, 38);

    // Foliage canopy
    ctx.fillStyle = isNight ? '#102A14' : isSunset ? '#166534' : '#15803D';
    ctx.beginPath();
    ctx.arc(tx + sway, treeY - 8, 28, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(tx - 14 + sway, treeY - 2, 20, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(tx + 14 + sway, treeY - 2, 20, 0, Math.PI * 2);
    ctx.fill();
  }
}

import { LocationData, TimeOfDay, Position } from '../types';

/**
 * Hand-crafted, authentic Charles M. Schulz Peanuts beach renderer.
 * Features:
 * - Natural transition: Grass & path -> Dunes with coastal grass, flowers, wood fences, sand trails -> Wide golden sand
 * - Dynamic ocean waves that roll in and out with frothy crests and foam
 * - Wet sand shoreline that darkens as waves recede
 * - Footprints and water splashes when Ari walks in shallow water
 * - Colorful Schulz-style striped umbrellas, beach towels, buckets & shovels, detailed sandcastles
 * - Scattered seashells, smooth pebbles, beach balls, coolers (neveritas)
 * - Rocky point (zona de rocas) with tide pools, creeping crabs, and rare seaweeds
 * - Beach volleyball court with wooden poles, rope net, and volleyball
 * - Traditional wooden beach shack (Chiringuito) with awning, menu chalkboard, picnic tables, and refreshments
 * - Outdoor wooden showers, foot-rinse station, and elevated lifeguard tower
 * - Snoopy with his iconic Joe Cool sunglasses sunbathing or strutting
 * - Woodstock on the shoreline dodging oncoming waves
 * - Time-of-day dynamic lighting: warm golden sunset with sky gradient and water reflections, starry night with moon glint
 */

export function drawRealisticBeachScene(
  ctx: CanvasRenderingContext2D,
  loc: LocationData,
  time: number,
  timeOfDay: TimeOfDay = 'day',
  playerPos?: Position
) {
  const isNight = timeOfDay === 'night';
  const isSunset = timeOfDay === 'sunset';
  const isDawn = timeOfDay === 'dawn';

  // 1. OCEAN SKY HORIZON (Upper region 0..60)
  ctx.save();
  const skyGrad = ctx.createLinearGradient(0, 0, 0, 70);
  if (isNight) {
    skyGrad.addColorStop(0, '#0F172A');
    skyGrad.addColorStop(0.7, '#1E293B');
    skyGrad.addColorStop(1, '#0C4A6E');
  } else if (isSunset) {
    skyGrad.addColorStop(0, '#4C1D95');
    skyGrad.addColorStop(0.35, '#BE185D');
    skyGrad.addColorStop(0.7, '#F97316');
    skyGrad.addColorStop(1, '#FDE047');
  } else if (isDawn) {
    skyGrad.addColorStop(0, '#1E1B4B');
    skyGrad.addColorStop(0.5, '#F472B6');
    skyGrad.addColorStop(1, '#FDE68A');
  } else {
    skyGrad.addColorStop(0, '#0284C7');
    skyGrad.addColorStop(0.5, '#38BDF8');
    skyGrad.addColorStop(1, '#BAE6FD');
  }
  ctx.fillStyle = skyGrad;
  ctx.fillRect(0, 0, loc.width, 70);

  // Distant stars / moon at night
  if (isNight) {
    ctx.fillStyle = '#FEF08A';
    // Crescent / full moon
    ctx.beginPath();
    ctx.arc(loc.width - 140, 28, 12, 0, Math.PI * 2);
    ctx.fill();
    // Moon glow
    const mGlow = ctx.createRadialGradient(loc.width - 140, 28, 6, loc.width - 140, 28, 45);
    mGlow.addColorStop(0, 'rgba(254, 240, 138, 0.4)');
    mGlow.addColorStop(1, 'rgba(254, 240, 138, 0)');
    ctx.fillStyle = mGlow;
    ctx.beginPath();
    ctx.arc(loc.width - 140, 28, 45, 0, Math.PI * 2);
    ctx.fill();

    // Twinkling stars
    const starCoords = [[80, 18], [220, 25], [380, 15], [540, 28], [760, 20], [920, 14], [1100, 24]];
    starCoords.forEach(([sx, sy], idx) => {
      const sAlpha = 0.4 + 0.6 * Math.abs(Math.sin(time * 2 + idx));
      ctx.fillStyle = `rgba(255, 255, 255, ${sAlpha})`;
      ctx.beginPath();
      ctx.arc(sx, sy, 1.5, 0, Math.PI * 2);
      ctx.fill();
    });
  }

  // Distant tiny sailboats on the horizon
  const boatX = ((loc.width * 0.35 + Math.sin(time * 0.1) * 40) % loc.width);
  ctx.fillStyle = isNight ? '#1E293B' : '#FFFFFF';
  ctx.beginPath();
  ctx.moveTo(boatX, 60);
  ctx.lineTo(boatX + 5, 52);
  ctx.lineTo(boatX + 5, 60);
  ctx.fill();
  ctx.fillStyle = '#78350F';
  ctx.fillRect(boatX - 3, 60, 12, 2.5);

  // Distant flying gulls in classic Schulz v-shapes
  ctx.strokeStyle = isNight ? 'rgba(255,255,255,0.2)' : 'rgba(30, 41, 59, 0.6)';
  ctx.lineWidth = 1.2;
  const gulls = [
    [boatX + 120, 32 + Math.sin(time * 1.5) * 4],
    [boatX + 134, 26 + Math.sin(time * 1.5 + 0.6) * 4],
    [boatX + 150, 35 + Math.sin(time * 1.5 + 1.2) * 4],
  ];
  gulls.forEach(([gx, gy]) => {
    ctx.beginPath();
    ctx.moveTo(gx - 5, gy + 2);
    ctx.quadraticCurveTo(gx - 2.5, gy - 2, gx, gy);
    ctx.quadraticCurveTo(gx + 2.5, gy - 2, gx + 5, gy + 2);
    ctx.stroke();
  });

  // 2. OCEAN WATER LAYERS (y: 65 to 215)
  // Deep sea to clear shallows gradient
  const seaGrad = ctx.createLinearGradient(0, 65, 0, 215);
  if (isNight) {
    seaGrad.addColorStop(0, '#0C4A6E');
    seaGrad.addColorStop(0.5, '#075985');
    seaGrad.addColorStop(1, '#0369A1');
  } else if (isSunset) {
    seaGrad.addColorStop(0, '#831843');
    seaGrad.addColorStop(0.4, '#C2410C');
    seaGrad.addColorStop(0.7, '#D97706');
    seaGrad.addColorStop(1, '#0284C7');
  } else {
    seaGrad.addColorStop(0, '#0369A1');
    seaGrad.addColorStop(0.35, '#0284C7');
    seaGrad.addColorStop(0.7, '#0EA5E9');
    seaGrad.addColorStop(1, '#38BDF8');
  }
  ctx.fillStyle = seaGrad;
  ctx.fillRect(0, 65, loc.width, 150);

  // Distant gentle rolling swell lines
  ctx.strokeStyle = isNight ? 'rgba(255, 255, 255, 0.12)' : 'rgba(255, 255, 255, 0.35)';
  ctx.lineWidth = 1.4;
  for (let r = 85; r < 170; r += 24) {
    const waveShift = Math.sin(time * 1.6 + r * 0.05) * 18;
    ctx.beginPath();
    ctx.moveTo(0, r);
    for (let wx = 0; wx < loc.width; wx += 45) {
      const wy = r + Math.sin(time * 2 + wx * 0.04) * 3;
      ctx.quadraticCurveTo(wx + 22, wy - 3, wx + 45, wy);
    }
    ctx.stroke();
  }

  // Floating red & white swim safety buoys
  const buoyPositions = [180, 420, 700, 960, 1180];
  buoyPositions.forEach((bx, idx) => {
    const bob = Math.sin(time * 2.2 + idx * 1.3) * 3;
    const by = 135 + bob;
    // Buoy base
    ctx.fillStyle = '#EF4444';
    ctx.beginPath();
    ctx.arc(bx, by, 6, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#FFFFFF';
    ctx.beginPath();
    ctx.arc(bx, by, 6, 0, Math.PI);
    ctx.fill();
    ctx.strokeStyle = '#1F2937';
    ctx.lineWidth = 1;
    ctx.stroke();
    // Tiny flag on top
    ctx.strokeStyle = '#FBBF24';
    ctx.beginPath();
    ctx.moveTo(bx, by - 6);
    ctx.lineTo(bx, by - 14);
    ctx.stroke();
    ctx.fillStyle = '#F59E0B';
    ctx.beginPath();
    ctx.moveTo(bx, by - 14);
    ctx.lineTo(bx + 6, by - 11);
    ctx.lineTo(bx, by - 8);
    ctx.fill();
  });

  // 3. BREAKING SURF & FOAM WAVE CRESTS (y: 190..235)
  // Wave movement oscillates in and out over the sand
  const waveCycle = (Math.sin(time * 1.5) + 1) * 0.5; // 0..1
  const surfY = 205 + waveCycle * 22; // Wave travels between 205 and 227

  // Wet sand bed revealed underneath when wave recedes
  const wetSandGrad = ctx.createLinearGradient(0, 195, 0, 245);
  wetSandGrad.addColorStop(0, isNight ? '#451A03' : '#B45309');
  wetSandGrad.addColorStop(0.5, isNight ? '#78350F' : '#D97706');
  wetSandGrad.addColorStop(1, isNight ? '#92400E' : '#FBBF24');
  ctx.fillStyle = wetSandGrad;
  ctx.beginPath();
  ctx.moveTo(0, 195);
  for (let wx = 0; wx <= loc.width; wx += 30) {
    const wy = 230 + Math.sin(wx * 0.03) * 6;
    ctx.lineTo(wx, wy);
  }
  ctx.lineTo(loc.width, 195);
  ctx.closePath();
  ctx.fill();

  // Translucent leading water tongue (shallow water Ari can walk in)
  ctx.fillStyle = isNight ? 'rgba(14, 165, 233, 0.35)' : 'rgba(56, 189, 248, 0.45)';
  ctx.beginPath();
  ctx.moveTo(0, 185);
  for (let wx = 0; wx <= loc.width; wx += 25) {
    const wy = surfY + Math.sin(wx * 0.05 + time * 2) * 5;
    ctx.lineTo(wx, wy);
  }
  ctx.lineTo(loc.width, 185);
  ctx.closePath();
  ctx.fill();

  // Foaming white crest along the front edge of the wave
  ctx.fillStyle = 'rgba(255, 255, 255, 0.88)';
  ctx.strokeStyle = 'rgba(224, 242, 254, 0.95)';
  ctx.lineWidth = 1.5;
  for (let wx = 0; wx < loc.width; wx += 16) {
    const wy = surfY + Math.sin(wx * 0.05 + time * 2) * 5;
    const foamR = 4 + Math.sin(wx * 0.2 + time * 4) * 2;
    ctx.beginPath();
    ctx.arc(wx, wy, foamR, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
  }

  // Small receding foam trails / bubbles
  ctx.fillStyle = 'rgba(255, 255, 255, 0.55)';
  for (let i = 0; i < 28; i++) {
    const fx = (i * 47 + Math.sin(time * 3 + i) * 15) % loc.width;
    const fy = surfY - 10 - (i % 4) * 6;
    ctx.beginPath();
    ctx.arc(fx, fy, 2, 0, Math.PI * 2);
    ctx.fill();
  }

  // Water splashes if Ari is walking in the shallows (y: 195..235)
  if (playerPos && playerPos.y >= 195 && playerPos.y <= 245) {
    const splashY = playerPos.y;
    const splashX = playerPos.x;
    ctx.fillStyle = '#FFFFFF';
    for (let sp = 0; sp < 6; sp++) {
      const sx = splashX + Math.sin(time * 12 + sp * 1.2) * 14;
      const sy = splashY - 4 - Math.abs(Math.cos(time * 12 + sp)) * 8;
      ctx.beginPath();
      ctx.arc(sx, sy, 1.8, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // 4. MAIN GOLDEN SAND BEACH (y: 235 to 840)
  const sandGrad = ctx.createLinearGradient(0, 235, 0, 840);
  if (isNight) {
    sandGrad.addColorStop(0, '#5A3816');
    sandGrad.addColorStop(0.5, '#784E1A');
    sandGrad.addColorStop(1, '#8C5B1E');
  } else if (isSunset) {
    sandGrad.addColorStop(0, '#F59E0B');
    sandGrad.addColorStop(0.4, '#FBBF24');
    sandGrad.addColorStop(1, '#FCD34D');
  } else {
    sandGrad.addColorStop(0, '#FDE68A');
    sandGrad.addColorStop(0.4, '#FEF08A');
    sandGrad.addColorStop(1, '#FDE68A');
  }
  ctx.fillStyle = sandGrad;
  ctx.fillRect(0, 235, loc.width, 605);

  // Subtle natural sand grain texture specks
  ctx.fillStyle = isNight ? 'rgba(0,0,0,0.08)' : 'rgba(180, 83, 9, 0.08)';
  for (let s = 0; s < 45; s++) {
    const sx = (s * 89) % loc.width;
    const sy = 250 + ((s * 61) % 550);
    ctx.fillRect(sx, sy, 2, 1.5);
  }

  // Footprints on the sand (little pairs of oval Schulz prints)
  const footprintTrails = [
    { x: 340, y: 320 }, { x: 348, y: 335 }, { x: 342, y: 350 }, { x: 352, y: 365 },
    { x: 580, y: 290 }, { x: 586, y: 305 }, { x: 582, y: 320 },
    { x: 740, y: 380 }, { x: 746, y: 395 }, { x: 742, y: 410 }
  ];
  ctx.fillStyle = isNight ? 'rgba(30, 20, 10, 0.25)' : 'rgba(180, 83, 9, 0.22)';
  footprintTrails.forEach((fp) => {
    ctx.beginPath();
    ctx.ellipse(fp.x, fp.y, 4, 2.5, 0.2, 0, Math.PI * 2);
    ctx.fill();
  });

  // 5. NATURAL DUNES & COASTAL VEGETATION (y: 800 to loc.height)
  // Transition from golden sand to grassy dunes with paths
  drawCoastalDunes(ctx, loc.width, loc.height, time, timeOfDay);

  // 6. SCATTERED BEACH SHELLS & PEBBLES
  drawBeachShells(ctx, time);

  // 7. DETAILED SCULPTED SANDCASTLES
  drawSandcastles(ctx, 320, 360, time);
  drawSandcastles(ctx, 720, 340, time);

  // 8. COLORFUL STRIPED SCHULZ UMBRELLAS & BEACH TOWELS
  drawBeachUmbrella(ctx, 240, 430, '#EF4444', '#FFFFFF'); // Red/White
  drawBeachTowel(ctx, 225, 450, '#38BDF8', '#1E40AF', 42, 24);

  drawBeachUmbrella(ctx, 480, 460, '#F59E0B', '#1E3A8A'); // Yellow/Blue
  drawBeachTowel(ctx, 465, 480, '#F472B6', '#BE185D', 44, 25);

  drawBeachUmbrella(ctx, 880, 420, '#10B981', '#FFFFFF'); // Green/White
  drawBeachTowel(ctx, 865, 440, '#FBBF24', '#B45309', 42, 24);

  // Linus' special shaded spot with his blue blanket
  drawBeachUmbrella(ctx, 620, 520, '#6366F1', '#FEF08A');
  drawLinusBlanketSpot(ctx, 608, 540);

  // 9. BEACH VOLLEYBALL COURT (y: 420..580, x: 960..1220)
  drawBeachVolleyballCourt(ctx, 1040, 460, time);

  // 10. ROCKY POINT (Zona de Rocas) with tide pools and crabs on the far West (x: 20..180, y: 160..340)
  drawRockyPoint(ctx, 40, 180, time, timeOfDay);

  // 11. CHIRINGUITO (Authentic wooden beach snack shack) at entrance (x: 640..800, y: 720..830)
  drawChiringuitoShack(ctx, 680, 720, time, timeOfDay);

  // 12. OUTDOOR WOODEN SHOWERS & FOOT-RINSE STATION (x: 480, y: 780)
  drawOutdoorShowers(ctx, 490, 770);

  // 13. ELEVATED LIFEGUARD TOWER (Puesto de socorrista) (x: 180, y: 260)
  drawLifeguardTower(ctx, 170, 260, time);

  // 14. INFLATABLE BEACH BALLS & COOLERS
  drawBeachBall(ctx, 285, 460, time);
  drawBeachBall(ctx, 1020, 530, time);
  drawCoolerBox(ctx, 255, 440, '#0284C7');
  drawCoolerBox(ctx, 850, 430, '#DC2626');

  // Sand buckets & shovels
  drawBucketAndSpade(ctx, 360, 375, '#EF4444', '#FBBF24');
  drawBucketAndSpade(ctx, 760, 355, '#3B82F6', '#10B981');

  ctx.restore();
}

// Helper: Coastal dunes with high sea oats, marram grass, wooden dune fences, wild beach morning glories
function drawCoastalDunes(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  time: number,
  timeOfDay: TimeOfDay
) {
  const isNight = timeOfDay === 'night';
  const duneTopY = 820;

  // Sandy ridge slope
  ctx.fillStyle = isNight ? '#452A14' : '#EAB308';
  ctx.beginPath();
  ctx.moveTo(0, duneTopY);
  for (let x = 0; x <= width; x += 40) {
    const dy = duneTopY + Math.sin(x * 0.015) * 12;
    ctx.lineTo(x, dy);
  }
  ctx.lineTo(width, height);
  ctx.lineTo(0, height);
  ctx.closePath();
  ctx.fill();

  // Natural coastal grass mounds
  ctx.fillStyle = isNight ? '#1C381E' : '#4ADE80';
  ctx.beginPath();
  ctx.moveTo(0, duneTopY + 25);
  for (let x = 0; x <= width; x += 50) {
    const gy = duneTopY + 28 + Math.cos(x * 0.02) * 10;
    ctx.lineTo(x, gy);
  }
  ctx.lineTo(width, height);
  ctx.lineTo(0, height);
  ctx.closePath();
  ctx.fill();

  // Low weathered wooden sand-fence slats connected with wire
  ctx.fillStyle = '#78350F';
  ctx.strokeStyle = '#94A3B8';
  ctx.lineWidth = 1;
  const fenceStarts = [80, 320, 880];
  fenceStarts.forEach((fx) => {
    // Top and bottom wire
    ctx.beginPath();
    ctx.moveTo(fx, duneTopY + 12);
    ctx.lineTo(fx + 160, duneTopY + 12);
    ctx.moveTo(fx, duneTopY + 26);
    ctx.lineTo(fx + 160, duneTopY + 26);
    ctx.stroke();

    for (let sl = 0; sl < 11; sl++) {
      const sx = fx + sl * 15;
      const tilt = Math.sin(sl * 1.5) * 1.5;
      ctx.fillRect(sx, duneTopY + 6 + tilt, 4.5, 26);
    }
  });

  // Tall swaying sea-oats & dune marram grass
  const grassClusters = [120, 240, 420, 580, 840, 1020, 1180];
  grassClusters.forEach((gx, idx) => {
    const sway = Math.sin(time * 2.5 + idx) * 5;
    for (let b = -4; b <= 4; b += 2) {
      ctx.strokeStyle = isNight ? '#166534' : '#15803D';
      ctx.lineWidth = 1.4;
      ctx.beginPath();
      ctx.moveTo(gx + b * 2, duneTopY + 24);
      ctx.quadraticCurveTo(gx + b * 3 + sway * 0.6, duneTopY + 5, gx + b * 4 + sway, duneTopY - 14);
      ctx.stroke();
    }
    // Oat seedheads on tips
    ctx.fillStyle = '#FDE047';
    ctx.beginPath();
    ctx.arc(gx + sway, duneTopY - 14, 2, 0, Math.PI * 2);
    ctx.fill();
  });

  // Pink coastal beach flowers (sea bindweed / morning glory)
  const flowerColors = ['#F472B6', '#E879F9', '#FBBF24'];
  for (let f = 0; f < 18; f++) {
    const fx = (f * 71 + 35) % (width - 60);
    const fy = duneTopY + 30 + (f % 4) * 18;
    ctx.fillStyle = flowerColors[f % flowerColors.length];
    ctx.beginPath();
    ctx.arc(fx, fy, 3, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#FFFFFF';
    ctx.beginPath();
    ctx.arc(fx, fy, 1, 0, Math.PI * 2);
    ctx.fill();
  }

  // Winding sandy pathway leading Ari from the neighborhood down to the sea
  ctx.fillStyle = isNight ? '#713F12' : '#FDE68A';
  ctx.beginPath();
  ctx.moveTo(width / 2 - 28, height);
  ctx.quadraticCurveTo(width / 2 - 15, duneTopY + 40, width / 2 - 20, duneTopY);
  ctx.lineTo(width / 2 + 20, duneTopY);
  ctx.quadraticCurveTo(width / 2 + 25, duneTopY + 40, width / 2 + 28, height);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = '#D97706';
  ctx.lineWidth = 1;
  ctx.stroke();
}

// Helper: Beautiful sculpted sandcastles with towers, turrets, and shells
function drawSandcastles(ctx: CanvasRenderingContext2D, x: number, y: number, time: number) {
  ctx.save();
  // Castle shadow
  ctx.fillStyle = 'rgba(180, 83, 9, 0.25)';
  ctx.beginPath();
  ctx.ellipse(x + 22, y + 26, 32, 10, 0, 0, Math.PI * 2);
  ctx.fill();

  // Main square keep
  ctx.fillStyle = '#F59E0B';
  ctx.fillRect(x + 6, y + 6, 32, 20);
  ctx.strokeStyle = '#B45309';
  ctx.lineWidth = 1.2;
  ctx.strokeRect(x + 6, y + 6, 32, 20);

  // Left & right round turrets
  ctx.fillStyle = '#FBBF24';
  ctx.fillRect(x, y, 10, 24);
  ctx.strokeRect(x, y, 10, 24);
  ctx.fillRect(x + 34, y, 10, 24);
  ctx.strokeRect(x + 34, y, 10, 24);

  // Turret crenellations (merlons)
  for (let m = 0; m < 3; m++) {
    ctx.fillRect(x + m * 3.5, y - 4, 2.5, 4);
    ctx.fillRect(x + 34 + m * 3.5, y - 4, 2.5, 4);
  }

  // Central high tower
  ctx.fillStyle = '#D97706';
  ctx.fillRect(x + 16, y - 6, 12, 14);
  ctx.strokeRect(x + 16, y - 6, 12, 14);

  // Shell crowning the central peak
  ctx.fillStyle = '#FFFFFF';
  ctx.beginPath();
  ctx.arc(x + 22, y - 9, 3.5, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#F43F5E';
  ctx.lineWidth = 0.8;
  ctx.stroke();

  // Little toothpick flag fluttering in breeze
  const flap = Math.sin(time * 6) * 2;
  ctx.strokeStyle = '#78350F';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(x + 22, y - 9);
  ctx.lineTo(x + 22, y - 20);
  ctx.stroke();
  ctx.fillStyle = '#EF4444';
  ctx.beginPath();
  ctx.moveTo(x + 22, y - 20);
  ctx.lineTo(x + 30 + flap, y - 16);
  ctx.lineTo(x + 22, y - 12);
  ctx.closePath();
  ctx.fill();

  // Moat groove dug around castle
  ctx.strokeStyle = 'rgba(146, 64, 14, 0.4)';
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.ellipse(x + 22, y + 16, 28, 16, 0, 0, Math.PI * 2);
  ctx.stroke();

  ctx.restore();
}

// Helper: Classic Peanuts striped beach umbrella
function drawBeachUmbrella(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  color1: string,
  color2: string
) {
  ctx.save();
  // Angled oval drop shadow on sand
  ctx.fillStyle = 'rgba(146, 64, 14, 0.28)';
  ctx.beginPath();
  ctx.ellipse(x + 16, y + 14, 28, 14, 0.3, 0, Math.PI * 2);
  ctx.fill();

  // White umbrella pole tilted into the sand
  ctx.strokeStyle = '#FFFFFF';
  ctx.lineWidth = 2.8;
  ctx.beginPath();
  ctx.moveTo(x, y - 38);
  ctx.lineTo(x + 4, y + 8);
  ctx.stroke();
  ctx.strokeStyle = '#1F2937';
  ctx.lineWidth = 0.8;
  ctx.stroke();

  // Umbrella canopy dome (scalloped Schulz style)
  const rad = 32;
  const numSegments = 6;
  const cx = x;
  const cy = y - 38;

  for (let i = 0; i < numSegments; i++) {
    const angle1 = Math.PI + (i * Math.PI) / numSegments;
    const angle2 = Math.PI + ((i + 1) * Math.PI) / numSegments;
    ctx.fillStyle = i % 2 === 0 ? color1 : color2;
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.arc(cx, cy, rad, angle1, angle2);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = '#1F2937';
    ctx.lineWidth = 1;
    ctx.stroke();
  }

  // Scalloped fringe along bottom edge
  ctx.fillStyle = '#FFFFFF';
  for (let i = 0; i < 8; i++) {
    const fx = cx - rad + 4 + i * 8;
    ctx.beginPath();
    ctx.arc(fx, cy, 3, 0, Math.PI);
    ctx.fill();
  }

  // Finial cap on top
  ctx.fillStyle = '#F59E0B';
  ctx.beginPath();
  ctx.arc(cx, cy - rad + 2, 3, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
}

// Helper: Striped beach towel
function drawBeachTowel(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  mainColor: string,
  stripeColor: string,
  w: number,
  h: number
) {
  ctx.save();
  ctx.fillStyle = mainColor;
  ctx.fillRect(x, y, w, h);
  ctx.strokeStyle = '#1F2937';
  ctx.lineWidth = 1;
  ctx.strokeRect(x, y, w, h);

  // Decorative stripes
  ctx.fillStyle = stripeColor;
  ctx.fillRect(x + 5, y, 4, h);
  ctx.fillRect(x + w - 9, y, 4, h);
  ctx.fillRect(x + w / 2 - 3, y, 6, h);

  // Soft fringes on sides
  ctx.strokeStyle = '#FFFFFF';
  ctx.lineWidth = 1;
  for (let py = y + 2; py < y + h; py += 3) {
    ctx.beginPath();
    ctx.moveTo(x - 2, py);
    ctx.lineTo(x, py);
    ctx.moveTo(x + w, py);
    ctx.lineTo(x + w + 2, py);
    ctx.stroke();
  }
  ctx.restore();
}

// Helper: Linus' cozy spot with his blanket and open book
function drawLinusBlanketSpot(ctx: CanvasRenderingContext2D, x: number, y: number) {
  // Baby blue iconic blanket
  ctx.fillStyle = '#38BDF8';
  ctx.fillRect(x, y, 46, 26);
  ctx.strokeStyle = '#0284C7';
  ctx.lineWidth = 1.2;
  ctx.strokeRect(x, y, 46, 26);

  // Open book beside blanket
  ctx.fillStyle = '#FFFFFF';
  ctx.fillRect(x + 30, y + 4, 12, 9);
  ctx.strokeStyle = '#78350F';
  ctx.lineWidth = 0.8;
  ctx.strokeRect(x + 30, y + 4, 12, 9);
  ctx.beginPath();
  ctx.moveTo(x + 36, y + 4);
  ctx.lineTo(x + 36, y + 13);
  ctx.stroke();
}

// Helper: Beach volleyball court
function drawBeachVolleyballCourt(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  time: number
) {
  ctx.save();
  const netW = 140;
  const netH = 34;

  // Court boundary lines dug into sand
  ctx.strokeStyle = '#F59E0B';
  ctx.lineWidth = 1.5;
  ctx.setLineDash([4, 4]);
  ctx.strokeRect(x - 70, y - 30, 140, 80);
  ctx.setLineDash([]);

  // Left wooden pole
  ctx.fillStyle = '#78350F';
  ctx.fillRect(x - 70, y - 48, 5, 52);
  ctx.strokeStyle = '#451A03';
  ctx.lineWidth = 1;
  ctx.strokeRect(x - 70, y - 48, 5, 52);

  // Right wooden pole
  ctx.fillStyle = '#78350F';
  ctx.fillRect(x + 70, y - 48, 5, 52);
  ctx.strokeRect(x + 70, y - 48, 5, 52);

  // White top tape of the net
  ctx.fillStyle = '#FFFFFF';
  ctx.fillRect(x - 70, y - 44, netW, 3.5);

  // Cross-hatched net mesh
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.75)';
  ctx.lineWidth = 0.8;
  for (let ny = y - 44; ny < y - 14; ny += 5) {
    ctx.beginPath();
    ctx.moveTo(x - 70, ny);
    ctx.lineTo(x + 70, ny);
    ctx.stroke();
  }
  for (let nx = x - 70; nx <= x + 70; nx += 7) {
    ctx.beginPath();
    ctx.moveTo(nx, y - 44);
    ctx.lineTo(nx, y - 14);
    ctx.stroke();
  }

  // Volleyball resting on sand
  const ballX = x + 24;
  const ballY = y + 16;
  ctx.fillStyle = '#FFFFFF';
  ctx.beginPath();
  ctx.arc(ballX, ballY, 7, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#1F2937';
  ctx.lineWidth = 1.2;
  ctx.stroke();
  // Tri-color swirls (blue, yellow, white)
  ctx.fillStyle = '#0284C7';
  ctx.beginPath();
  ctx.arc(ballX, ballY, 7, -0.6, 0.6);
  ctx.lineTo(ballX, ballY);
  ctx.fill();
  ctx.fillStyle = '#FACC15';
  ctx.beginPath();
  ctx.arc(ballX, ballY, 7, Math.PI - 0.6, Math.PI + 0.6);
  ctx.lineTo(ballX, ballY);
  ctx.fill();

  ctx.restore();
}

// Helper: Rocky point on the beach with tide pools and crawling crabs
function drawRockyPoint(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  time: number,
  timeOfDay: TimeOfDay
) {
  ctx.save();
  // Clusters of rounded weathered granite rocks
  const rocks = [
    { rx: x, ry: y, w: 55, h: 32 },
    { rx: x + 40, ry: y - 15, w: 48, h: 28 },
    { rx: x + 25, ry: y + 22, w: 60, h: 35 },
    { rx: x + 75, ry: y + 10, w: 42, h: 25 },
    { rx: x - 15, ry: y + 18, w: 38, h: 24 }
  ];

  rocks.forEach((rk) => {
    // Drop shadow
    ctx.fillStyle = 'rgba(0, 0, 0, 0.22)';
    ctx.beginPath();
    ctx.ellipse(rk.rx + rk.w / 2, rk.ry + rk.h, rk.w / 2 + 4, 6, 0, 0, Math.PI * 2);
    ctx.fill();

    // Rock body
    ctx.fillStyle = '#64748B';
    ctx.beginPath();
    ctx.roundRect(rk.rx, rk.ry, rk.w, rk.h, 12);
    ctx.fill();
    ctx.strokeStyle = '#334155';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // Green sea moss / algae on top
    ctx.fillStyle = '#15803D';
    ctx.beginPath();
    ctx.roundRect(rk.rx + 4, rk.ry + 2, rk.w - 8, 7, 3);
    ctx.fill();
  });

  // Tide pool filled with crystal turquoise water
  const poolX = x + 30;
  const poolY = y + 12;
  ctx.fillStyle = '#06B6D4';
  ctx.beginPath();
  ctx.ellipse(poolX, poolY, 18, 9, 0.2, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#0891B2';
  ctx.lineWidth = 1.2;
  ctx.stroke();

  // Little red crab skittering on the rock
  const crabWalk = Math.sin(time * 8) * 4;
  const crabX = x + 50 + crabWalk;
  const crabY = y - 5;
  ctx.fillStyle = '#EF4444';
  ctx.beginPath();
  ctx.arc(crabX, crabY, 4, 0, Math.PI * 2);
  ctx.fill();
  // Claws
  ctx.beginPath();
  ctx.arc(crabX - 5, crabY - 3, 2, 0, Math.PI * 2);
  ctx.arc(crabX + 5, crabY - 3, 2, 0, Math.PI * 2);
  ctx.fill();
  // Legs
  ctx.strokeStyle = '#B91C1C';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(crabX - 3, crabY + 2);
  ctx.lineTo(crabX - 6, crabY + 5);
  ctx.moveTo(crabX + 3, crabY + 2);
  ctx.lineTo(crabX + 6, crabY + 5);
  ctx.stroke();

  ctx.restore();
}

// Helper: Chiringuito (Rustic wooden beach food & drink kiosk)
function drawChiringuitoShack(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  time: number,
  timeOfDay: TimeOfDay
) {
  ctx.save();
  const shackW = 110;
  const shackH = 65;

  // Shadow on sand
  ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
  ctx.fillRect(x - 5, y + shackH - 4, shackW + 10, 8);

  // Weathered wooden wall siding
  ctx.fillStyle = '#D97706';
  ctx.fillRect(x, y, shackW, shackH);
  ctx.strokeStyle = '#78350F';
  ctx.lineWidth = 1.5;
  ctx.strokeRect(x, y, shackW, shackH);

  // Wood plank lines
  ctx.strokeStyle = '#B45309';
  ctx.lineWidth = 1;
  for (let py = y + 8; py < y + shackH; py += 7) {
    ctx.beginPath();
    ctx.moveTo(x, py);
    ctx.lineTo(x + shackW, py);
    ctx.stroke();
  }

  // Open serving counter hatch
  ctx.fillStyle = '#1C1917';
  ctx.fillRect(x + 12, y + 16, 86, 26);
  ctx.strokeStyle = '#78350F';
  ctx.strokeRect(x + 12, y + 16, 86, 26);

  // Counter shelf with lemonade dispenser and ice creams
  ctx.fillStyle = '#FDE68A';
  ctx.fillRect(x + 8, y + 40, 94, 6);
  ctx.strokeStyle = '#92400E';
  ctx.strokeRect(x + 8, y + 40, 94, 6);

  // Lemonade jar with tap
  ctx.fillStyle = '#FEF08A';
  ctx.fillRect(x + 18, y + 26, 12, 14);
  ctx.strokeStyle = '#CA8A04';
  ctx.strokeRect(x + 18, y + 26, 12, 14);

  // Blue and white striped awning canopy
  const numStripes = 8;
  const stripeW = (shackW + 16) / numStripes;
  for (let s = 0; s < numStripes; s++) {
    ctx.fillStyle = s % 2 === 0 ? '#0284C7' : '#FFFFFF';
    ctx.beginPath();
    ctx.moveTo(x - 8 + s * stripeW, y);
    ctx.lineTo(x - 8 + (s + 1) * stripeW, y);
    ctx.lineTo(x - 14 + (s + 1) * stripeW, y + 14);
    ctx.lineTo(x - 14 + s * stripeW, y + 14);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = '#1F2937';
    ctx.lineWidth = 1;
    ctx.stroke();
  }

  // Signboard: "CHIRINGUITO"
  ctx.fillStyle = '#FEF3C7';
  ctx.fillRect(x + 16, y - 14, shackW - 32, 12);
  ctx.strokeStyle = '#92400E';
  ctx.lineWidth = 1.2;
  ctx.strokeRect(x + 16, y - 14, shackW - 32, 12);
  ctx.fillStyle = '#78350F';
  ctx.font = 'bold 8px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('🏖️ CHIRINGUITO', x + shackW / 2, y - 5);
  ctx.textAlign = 'start';

  // Wooden picnic table with bench next to chiringuito
  drawPicnicTable(ctx, x + shackW + 15, y + 16);

  ctx.restore();
}

// Helper: Wooden picnic table with umbrella
function drawPicnicTable(ctx: CanvasRenderingContext2D, x: number, y: number) {
  // Table top
  ctx.fillStyle = '#78350F';
  ctx.fillRect(x, y, 36, 12);
  ctx.strokeStyle = '#451A03';
  ctx.lineWidth = 1;
  ctx.strokeRect(x, y, 36, 12);

  // Table legs
  ctx.fillStyle = '#5A2609';
  ctx.fillRect(x + 4, y + 12, 3, 16);
  ctx.fillRect(x + 29, y + 12, 3, 16);

  // Bench seats
  ctx.fillStyle = '#92400E';
  ctx.fillRect(x - 4, y + 18, 44, 4);
}

// Helper: Outdoor showers and foot wash station
function drawOutdoorShowers(ctx: CanvasRenderingContext2D, x: number, y: number) {
  ctx.save();
  // Wooden slatted deck platform
  ctx.fillStyle = '#78350F';
  ctx.fillRect(x, y + 26, 45, 14);
  ctx.strokeStyle = '#451A03';
  ctx.lineWidth = 1;
  ctx.strokeRect(x, y + 26, 45, 14);

  // Slats
  for (let px = x + 6; px < x + 45; px += 6) {
    ctx.strokeStyle = '#3E1906';
    ctx.beginPath();
    ctx.moveTo(px, y + 26);
    ctx.lineTo(px, y + 40);
    ctx.stroke();
  }

  // Wooden vertical pole & stainless steel shower pipe
  ctx.fillStyle = '#92400E';
  ctx.fillRect(x + 20, y - 24, 6, 50);
  ctx.strokeStyle = '#94A3B8';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(x + 23, y - 24);
  ctx.lineTo(x + 23, y - 32);
  ctx.lineTo(x + 30, y - 32);
  ctx.stroke();

  // Shower head
  ctx.fillStyle = '#CBD5E1';
  ctx.beginPath();
  ctx.arc(x + 30, y - 32, 4, 0, Math.PI * 2);
  ctx.fill();

  // Fresh water foot rinse faucet
  ctx.fillStyle = '#F59E0B';
  ctx.fillRect(x + 21, y + 14, 4, 4);

  ctx.restore();
}

// Helper: Elevated lifeguard tower
function drawLifeguardTower(ctx: CanvasRenderingContext2D, x: number, y: number, time: number) {
  ctx.save();
  // Stilts / support legs
  ctx.strokeStyle = '#FFFFFF';
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.moveTo(x, y + 50);
  ctx.lineTo(x + 6, y + 16);
  ctx.moveTo(x + 38, y + 50);
  ctx.lineTo(x + 32, y + 16);
  ctx.stroke();
  ctx.strokeStyle = '#1F2937';
  ctx.lineWidth = 1;
  ctx.stroke();

  // Elevated cabin
  ctx.fillStyle = '#FFFFFF';
  ctx.fillRect(x + 4, y - 10, 30, 26);
  ctx.strokeStyle = '#1F2937';
  ctx.lineWidth = 1.2;
  ctx.strokeRect(x + 4, y - 10, 30, 26);

  // Red gable roof
  ctx.fillStyle = '#EF4444';
  ctx.beginPath();
  ctx.moveTo(x + 2, y - 10);
  ctx.lineTo(x + 19, y - 24);
  ctx.lineTo(x + 36, y - 10);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = '#1F2937';
  ctx.stroke();

  // Life preserver buoy hung on the wall
  ctx.fillStyle = '#FFFFFF';
  ctx.beginPath();
  ctx.arc(x + 19, y + 3, 5, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#EF4444';
  ctx.beginPath();
  ctx.arc(x + 19, y + 3, 5, 0, 0.8);
  ctx.lineTo(x + 19, y + 3);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(x + 19, y + 3, 5, Math.PI, Math.PI + 0.8);
  ctx.lineTo(x + 19, y + 3);
  ctx.fill();
  ctx.fillStyle = '#0284C7';
  ctx.beginPath();
  ctx.arc(x + 19, y + 3, 2, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
}

// Helper: Beach ball
function drawBeachBall(ctx: CanvasRenderingContext2D, x: number, y: number, time: number) {
  ctx.save();
  const r = 8;
  ctx.fillStyle = '#FFFFFF';
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.fill();

  // Stripes (red, blue, yellow)
  ctx.fillStyle = '#EF4444';
  ctx.beginPath();
  ctx.arc(x, y, r, -0.6, 0.6);
  ctx.lineTo(x, y);
  ctx.fill();

  ctx.fillStyle = '#3B82F6';
  ctx.beginPath();
  ctx.arc(x, y, r, 1.4, 2.6);
  ctx.lineTo(x, y);
  ctx.fill();

  ctx.fillStyle = '#FBBF24';
  ctx.beginPath();
  ctx.arc(x, y, r, 3.4, 4.6);
  ctx.lineTo(x, y);
  ctx.fill();

  ctx.strokeStyle = '#1F2937';
  ctx.lineWidth = 1.2;
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.stroke();
  ctx.restore();
}

// Helper: Cooler ice box
function drawCoolerBox(ctx: CanvasRenderingContext2D, x: number, y: number, color: string) {
  ctx.fillStyle = color;
  ctx.fillRect(x, y, 16, 12);
  ctx.strokeStyle = '#1F2937';
  ctx.lineWidth = 1;
  ctx.strokeRect(x, y, 16, 12);
  // White lid
  ctx.fillStyle = '#FFFFFF';
  ctx.fillRect(x - 1, y - 3, 18, 4);
  ctx.strokeRect(x - 1, y - 3, 18, 4);
}

// Helper: Sand bucket and spade
function drawBucketAndSpade(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  bucketCol: string,
  spadeCol: string
) {
  // Bucket
  ctx.fillStyle = bucketCol;
  ctx.beginPath();
  ctx.moveTo(x, y);
  ctx.lineTo(x + 12, y);
  ctx.lineTo(x + 10, y + 12);
  ctx.lineTo(x + 2, y + 12);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = '#1F2937';
  ctx.lineWidth = 1;
  ctx.stroke();

  // Spade stuck in sand beside bucket
  ctx.strokeStyle = spadeCol;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(x + 16, y - 6);
  ctx.lineTo(x + 16, y + 8);
  ctx.stroke();
  ctx.fillStyle = spadeCol;
  ctx.fillRect(x + 14, y + 8, 4, 5);
}

// Helper: Scattered beach shells
function drawBeachShells(ctx: CanvasRenderingContext2D, time: number) {
  const shells = [
    { x: 260, y: 280, col: '#FECDD3' },
    { x: 380, y: 295, col: '#FEF08A' },
    { x: 510, y: 275, col: '#FFFFFF' },
    { x: 670, y: 310, col: '#FED7AA' },
    { x: 820, y: 285, col: '#FECDD3' },
    { x: 940, y: 330, col: '#FEF08A' },
    { x: 1120, y: 290, col: '#FFFFFF' }
  ];

  shells.forEach((sh) => {
    ctx.fillStyle = sh.col;
    ctx.beginPath();
    ctx.arc(sh.x, sh.y, 3.5, 0, Math.PI, true);
    ctx.lineTo(sh.x, sh.y + 1);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = '#92400E';
    ctx.lineWidth = 0.8;
    ctx.stroke();
  });
}

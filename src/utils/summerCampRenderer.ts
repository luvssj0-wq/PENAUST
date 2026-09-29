import { LocationData, TimeOfDay, Position } from '../types';

/**
 * Hand-crafted, authentic Charles M. Schulz Peanuts Summer Camp renderer.
 * Features:
 * - Camp entrance with rustic carved wooden sign "CAMPAMENTO", bus stop & luggage
 * - Reception cabin with porch, bronze bell, counter, camp map & schedule
 * - Central Camp Plaza: flagpole with fluttering pennant, activity board, assembly bell, benches
 * - Camper Cabins: Ari's shared cabin with bunk beds, wooden trunks, windows
 * - Boys' cabin, Girls' cabin, and Snoopy's improvised campsite tent pitched near Charlie Brown
 * - Grand Mess Hall (comedor) with long tables, wooden benches, kitchen pass-through
 * - Infirmary cabin (enfermería) with medical cross sign & resting cots
 * - Crafts cabin (cabaña de manualidades) with paint jars, friendship bracelets, clay
 * - Camp lake with lakeside beach, long wooden canoe pier & colorful canoes (red, green, yellow)
 * - Signposted hiking trails through towering pine forests:
 *   - Hidden waterfall with mossy boulders & cool mountain mist
 *   - Scenic panoramic mountain overlook (mirador) with resting bench
 *   - Rustic timber footbridge over babbling forest stream
 *   - Camp vegetable garden (huerto) with ripening tomatoes & berry bushes
 * - Great evening campfire (gran hoguera) with crackling flames, log seating circle, and open grass for stargazing!
 */

export function drawDetailedSummerCampScene(
  ctx: CanvasRenderingContext2D,
  loc: LocationData,
  time: number,
  timeOfDay: TimeOfDay = 'day',
  playerPos?: Position
) {
  const isNight = timeOfDay === 'night';
  const isSunset = timeOfDay === 'sunset';

  ctx.save();

  // 1. PINE FOREST FLOOR BASE (Deep evergreen mossy turf)
  const forestFloor = isNight ? '#0F291E' : isSunset ? '#166534' : '#14532D';
  ctx.fillStyle = forestFloor;
  ctx.fillRect(0, 0, loc.width, loc.height);

  // Soft dirt trails winding through the camp
  drawCampTrails(ctx, loc.width, loc.height, isNight);

  // Towering border pines around the camp perimeter
  drawPerimeterPines(ctx, loc.width, loc.height, time, isNight, isSunset);

  // 2. CAMP LAKE & CANOE PIER (Upper right sector x: 620..loc.width, y: 40..250)
  drawCampLakeAndPier(ctx, 650, 50, loc.width - 670, 190, time, isNight, isSunset);

  // 3. CAMP ENTRANCE (West / South road entry x: 60..240, y: loc.height - 130)
  drawCampEntrance(ctx, 120, loc.height - 110);

  // 4. RECEPTION CABIN (Next to entrance x: 80, y: loc.height - 230)
  drawCampCabin(ctx, 80, loc.height - 240, 120, 80, 'RECEPCIÓN', '#B45309', true);

  // 5. CENTRAL CAMP PLAZA (Flagpole, daily activities board, gathering bell) (x: 420, y: 380)
  drawCentralCampPlaza(ctx, 430, 390, time);

  // 6. ARI'S CABIN (Shared camper cabin x: 200, y: 150)
  drawCampCabin(ctx, 190, 140, 140, 95, 'CABAÑA DE ARI', '#92400E', false, '🛏️');

  // 7. BOYS' CABIN & SNOOPY'S TENT (x: 380, y: 140)
  drawCampCabin(ctx, 380, 140, 130, 95, 'CABAÑA CHICOS', '#78350F', false);
  drawSnoopyCampTent(ctx, 525, 205, time);

  // 8. GRAND MESS HALL / COMEDOR (Large dining hall x: 100, y: 320)
  drawMessHall(ctx, 90, 310, 190, 115, time);

  // 9. CRAFTS CABIN (Manualidades x: 100, y: 490)
  drawCampCabin(ctx, 90, 480, 130, 85, 'MANUALIDADES', '#B45309', false, '🎨');

  // 10. INFIRMARY CABIN (Enfermería x: 260, y: 490)
  drawCampCabin(ctx, 250, 480, 110, 80, 'ENFERMERÍA', '#A16207', false, '➕');

  // 11. CAMP VEGETABLE GARDEN (Huerto x: 680, y: 280)
  drawCampGarden(ctx, 670, 270, 140, 75);

  // 12. SCENIC FOREST WATERFALL (Cascada x: 740, y: 420)
  drawCampWaterfall(ctx, 740, 400, time);

  // 13. TIMBER FOOTBRIDGE OVER FOREST STREAM (x: 640, y: 560)
  drawCampBridgeAndStream(ctx, 640, 540, time);

  // 14. PANORAMIC MOUNTAIN OVERLOOK (El Mirador x: 820, y: 640)
  drawCampScenicOverlook(ctx, 810, 620);

  // 15. GREAT CENTRAL EVENING CAMPFIRE (Hoguera central x: 440, y: 550)
  drawCampfireRing(ctx, 450, 560, time, isNight, isSunset);

  ctx.restore();
}

// Helper: Winding camp dirt trails
function drawCampTrails(ctx: CanvasRenderingContext2D, w: number, h: number, isNight: boolean) {
  ctx.save();
  ctx.strokeStyle = isNight ? '#5A3816' : '#D97706';
  ctx.lineWidth = 26;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';

  // Main artery from entrance to central plaza
  ctx.beginPath();
  ctx.moveTo(140, h - 80);
  ctx.quadraticCurveTo(240, h - 220, 430, 420);
  // Branch to cabins
  ctx.quadraticCurveTo(340, 260, 260, 240);
  ctx.moveTo(430, 420);
  // Branch to campfire
  ctx.quadraticCurveTo(440, 490, 450, 560);
  // Branch to lake and dock
  ctx.quadraticCurveTo(560, 360, 660, 220);
  // Branch to waterfall & overlook
  ctx.moveTo(450, 560);
  ctx.quadraticCurveTo(580, 560, 660, 560);
  ctx.quadraticCurveTo(750, 560, 820, 630);
  ctx.stroke();

  // Fine inner packed earth color
  ctx.strokeStyle = isNight ? '#784E1A' : '#FDE68A';
  ctx.lineWidth = 20;
  ctx.stroke();
  ctx.restore();
}

// Helper: Camp entrance with signpost and bus stop
function drawCampEntrance(ctx: CanvasRenderingContext2D, x: number, y: number) {
  ctx.save();
  // Rustic archway with two pine log pillars
  ctx.fillStyle = '#78350F';
  ctx.fillRect(x, y - 50, 10, 55);
  ctx.fillRect(x + 95, y - 50, 10, 55);
  ctx.strokeStyle = '#451A03';
  ctx.lineWidth = 1.5;
  ctx.strokeRect(x, y - 50, 10, 55);
  ctx.strokeRect(x + 95, y - 50, 10, 55);

  // Large carved wooden banner: "CAMPAMENTO"
  ctx.fillStyle = '#92400E';
  ctx.fillRect(x - 10, y - 62, 125, 20);
  ctx.strokeStyle = '#292524';
  ctx.lineWidth = 2;
  ctx.strokeRect(x - 10, y - 62, 125, 20);

  ctx.fillStyle = '#FEF08A';
  ctx.font = 'bold 9px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('🏕️ CAMPAMENTO DE VERANO', x + 52, y - 48);
  ctx.textAlign = 'start';

  // Bus stop bench with leather camper backpacks and suitcases
  ctx.fillStyle = '#5A2609';
  ctx.fillRect(x - 45, y - 8, 35, 6);
  ctx.fillRect(x - 42, y - 2, 4, 8);
  ctx.fillRect(x - 16, y - 2, 4, 8);

  // Backpacks & luggage on ground
  ctx.fillStyle = '#DC2626'; // Red backpack
  ctx.beginPath();
  ctx.roundRect(x - 44, y - 22, 12, 14, 3);
  ctx.fill();
  ctx.fillStyle = '#0284C7'; // Blue duffel bag
  ctx.beginPath();
  ctx.roundRect(x - 30, y - 18, 16, 10, 3);
  ctx.fill();

  ctx.restore();
}

// Helper: Camp log cabin building
function drawCampCabin(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  name: string,
  wallColor: string,
  hasBell: boolean = false,
  icon?: string
) {
  ctx.save();
  // Drop shadow
  ctx.fillStyle = 'rgba(0, 0, 0, 0.24)';
  ctx.fillRect(x - 4, y + h - 2, w + 8, 8);

  // Horizontal log walls
  ctx.fillStyle = wallColor;
  ctx.fillRect(x, y + 20, w, h - 20);
  ctx.strokeStyle = '#451A03';
  ctx.lineWidth = 1.5;
  ctx.strokeRect(x, y + 20, w, h - 20);

  // Rounded log ends extending past corners
  for (let ly = y + 26; ly < y + h; ly += 10) {
    ctx.strokeStyle = 'rgba(0, 0, 0, 0.18)';
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.moveTo(x, ly);
    ctx.lineTo(x + w, ly);
    ctx.stroke();

    // End caps
    ctx.fillStyle = '#B45309';
    ctx.beginPath();
    ctx.arc(x - 3, ly - 4, 4, 0, Math.PI * 2);
    ctx.arc(x + w + 3, ly - 4, 4, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#78350F';
    ctx.stroke();
  }

  // Gabled shingled pine roof
  ctx.fillStyle = '#5A2609';
  ctx.beginPath();
  ctx.moveTo(x - 12, y + 20);
  ctx.lineTo(x + w / 2, y);
  ctx.lineTo(x + w + 12, y + 20);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = '#1F2937';
  ctx.lineWidth = 2;
  ctx.stroke();

  // Front porch with timber steps
  const doorW = 22;
  const doorH = 34;
  const doorX = x + w / 2 - doorW / 2;
  const doorY = y + h - doorH;

  // Door
  ctx.fillStyle = '#292524';
  ctx.fillRect(doorX, doorY, doorW, doorH);
  ctx.strokeStyle = '#78350F';
  ctx.lineWidth = 1;
  ctx.strokeRect(doorX, doorY, doorW, doorH);

  // Porch awning
  ctx.fillStyle = '#78350F';
  ctx.fillRect(doorX - 6, doorY - 4, doorW + 12, 4);

  // Cabin window with golden interior glow
  ctx.fillStyle = '#FEF08A';
  ctx.fillRect(x + 14, y + 34, 18, 18);
  ctx.strokeStyle = '#451A03';
  ctx.lineWidth = 1;
  ctx.strokeRect(x + 14, y + 34, 18, 18);
  ctx.beginPath();
  ctx.moveTo(x + 23, y + 34);
  ctx.lineTo(x + 23, y + 52);
  ctx.moveTo(x + 14, y + 43);
  ctx.lineTo(x + 32, y + 43);
  ctx.stroke();

  // Name plaque
  ctx.fillStyle = '#FEF3C7';
  ctx.fillRect(x + w / 2 - 38, y + 6, 76, 12);
  ctx.strokeStyle = '#92400E';
  ctx.lineWidth = 1;
  ctx.strokeRect(x + w / 2 - 38, y + 6, 76, 12);

  ctx.fillStyle = '#78350F';
  ctx.font = 'bold 7px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText((icon ? icon + ' ' : '') + name, x + w / 2, y + 15);
  ctx.textAlign = 'start';

  // Bronze bell on porch post if requested
  if (hasBell) {
    ctx.fillStyle = '#F59E0B';
    ctx.beginPath();
    ctx.arc(doorX + doorW + 6, doorY + 6, 4, 0, Math.PI);
    ctx.fill();
    ctx.strokeStyle = '#B45309';
    ctx.stroke();
  }

  ctx.restore();
}

// Helper: Snoopy's improvised tent pitched near Charlie Brown
function drawSnoopyCampTent(ctx: CanvasRenderingContext2D, x: number, y: number, time: number) {
  ctx.save();
  // Classic pup tent (red canvas, just like his doghouse)
  ctx.fillStyle = '#DC2626';
  ctx.beginPath();
  ctx.moveTo(x, y + 30);
  ctx.lineTo(x + 22, y);
  ctx.lineTo(x + 44, y + 30);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = '#18181B';
  ctx.lineWidth = 1.5;
  ctx.stroke();

  // Tent entrance opening
  ctx.fillStyle = '#18181B';
  ctx.beginPath();
  ctx.moveTo(x + 8, y + 30);
  ctx.lineTo(x + 22, y + 6);
  ctx.lineTo(x + 36, y + 30);
  ctx.closePath();
  ctx.fill();

  // Red dog food bowl outside tent
  ctx.fillStyle = '#EF4444';
  ctx.beginPath();
  ctx.ellipse(x + 50, y + 26, 6, 3, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#18181B';
  ctx.lineWidth = 0.8;
  ctx.stroke();

  // Little sign: "SNOOPY"
  ctx.fillStyle = '#FEF3C7';
  ctx.fillRect(x - 2, y + 32, 28, 8);
  ctx.strokeStyle = '#92400E';
  ctx.strokeRect(x - 2, y + 32, 28, 8);
  ctx.fillStyle = '#78350F';
  ctx.font = 'bold 6px sans-serif';
  ctx.fillText('SNOOPY', x + 1, y + 38);

  ctx.restore();
}

// Helper: Large Camp Dining Hall (Comedor común)
function drawMessHall(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  time: number
) {
  ctx.save();
  // Shadow
  ctx.fillStyle = 'rgba(0, 0, 0, 0.25)';
  ctx.fillRect(x - 5, y + h, w + 10, 8);

  // Cedar log walls
  ctx.fillStyle = '#A16207';
  ctx.fillRect(x, y + 24, w, h - 24);
  ctx.strokeStyle = '#451A03';
  ctx.lineWidth = 2;
  ctx.strokeRect(x, y + 24, w, h - 24);

  // Large gabled roof
  ctx.fillStyle = '#451A03';
  ctx.beginPath();
  ctx.moveTo(x - 14, y + 24);
  ctx.lineTo(x + w / 2, y);
  ctx.lineTo(x + w + 14, y + 24);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = '#1F2937';
  ctx.lineWidth = 2.2;
  ctx.stroke();

  // Stone chimney with gentle curling smoke
  ctx.fillStyle = '#64748B';
  ctx.fillRect(x + 22, y - 14, 16, 28);
  ctx.strokeStyle = '#334155';
  ctx.lineWidth = 1.2;
  ctx.strokeRect(x + 22, y - 14, 16, 28);

  // Smoke puffs
  ctx.fillStyle = 'rgba(241, 245, 249, 0.45)';
  for (let sm = 0; sm < 3; sm++) {
    const smY = y - 20 - sm * 10 - ((time * 8) % 15);
    const smX = x + 30 + Math.sin(time * 2 + sm) * 6;
    ctx.beginPath();
    ctx.arc(smX, smY, 5 + sm * 2, 0, Math.PI * 2);
    ctx.fill();
  }

  // Row of large windows showing dining tables inside
  for (let wx = x + 24; wx < x + w - 40; wx += 38) {
    ctx.fillStyle = '#FEF08A';
    ctx.fillRect(wx, y + 36, 24, 20);
    ctx.strokeStyle = '#78350F';
    ctx.lineWidth = 1;
    ctx.strokeRect(wx, y + 36, 24, 20);
    ctx.beginPath();
    ctx.moveTo(wx + 12, y + 36);
    ctx.lineTo(wx + 12, y + 56);
    ctx.moveTo(wx, y + 46);
    ctx.lineTo(wx + 24, y + 46);
    ctx.stroke();
  }

  // Double entrance doors
  ctx.fillStyle = '#292524';
  ctx.fillRect(x + w / 2 - 16, y + h - 40, 32, 40);
  ctx.strokeStyle = '#78350F';
  ctx.strokeRect(x + w / 2 - 16, y + h - 40, 32, 40);

  // Sign: "COMEDOR DEL CAMPAMENTO"
  ctx.fillStyle = '#FEF3C7';
  ctx.fillRect(x + w / 2 - 55, y + 10, 110, 13);
  ctx.strokeStyle = '#92400E';
  ctx.lineWidth = 1.2;
  ctx.strokeRect(x + w / 2 - 55, y + 10, 110, 13);
  ctx.fillStyle = '#78350F';
  ctx.font = 'bold 7.5px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('🍽️ COMEDOR PRINCIPAL', x + w / 2, y + 20);
  ctx.textAlign = 'start';

  ctx.restore();
}

// Helper: Central camp plaza with flagpole & activities chalkboard
function drawCentralCampPlaza(ctx: CanvasRenderingContext2D, x: number, y: number, time: number) {
  ctx.save();
  // Packed circular dirt clearing
  ctx.fillStyle = 'rgba(217, 119, 6, 0.35)';
  ctx.beginPath();
  ctx.arc(x, y, 55, 0, Math.PI * 2);
  ctx.fill();

  // White flagpole
  ctx.fillStyle = '#F8FAFC';
  ctx.fillRect(x - 2, y - 75, 4, 80);
  ctx.strokeStyle = '#64748B';
  ctx.lineWidth = 0.8;
  ctx.strokeRect(x - 2, y - 75, 4, 80);

  // Golden eagle finial ball
  ctx.fillStyle = '#F59E0B';
  ctx.beginPath();
  ctx.arc(x, y - 76, 3, 0, Math.PI * 2);
  ctx.fill();

  // Fluttering Camp Peanuts flag
  const wave = Math.sin(time * 5) * 4;
  ctx.fillStyle = '#0284C7';
  ctx.beginPath();
  ctx.moveTo(x + 2, y - 74);
  ctx.lineTo(x + 26 + wave, y - 66);
  ctx.lineTo(x + 2, y - 58);
  ctx.closePath();
  ctx.fill();

  // Activity Schedule Board (Tablón de actividades)
  const boardX = x + 25;
  const boardY = y - 10;
  ctx.fillStyle = '#78350F';
  ctx.fillRect(boardX, boardY, 4, 30);
  ctx.fillRect(boardX + 60, boardY, 4, 30);

  // Cork/chalkboard
  ctx.fillStyle = '#14532D';
  ctx.fillRect(boardX - 4, boardY - 32, 72, 34);
  ctx.strokeStyle = '#B45309';
  ctx.lineWidth = 2;
  ctx.strokeRect(boardX - 4, boardY - 32, 72, 34);

  // Text on board
  ctx.fillStyle = '#FEF08A';
  ctx.font = 'bold 6.5px sans-serif';
  ctx.fillText('HORARIO DEL DÍA', boardX + 4, boardY - 22);
  ctx.font = '5.5px sans-serif';
  ctx.fillStyle = '#FFFFFF';
  ctx.fillText('10:00 - Canoas', boardX + 4, boardY - 14);
  ctx.fillText('12:00 - Béisbol', boardX + 4, boardY - 7);
  ctx.fillText('21:00 - Hoguera', boardX + 4, boardY);

  // Large brass assembly bell on post
  const bellX = x - 35;
  const bellY = y;
  ctx.fillStyle = '#78350F';
  ctx.fillRect(bellX, bellY - 30, 4, 34);
  ctx.fillStyle = '#F59E0B';
  ctx.beginPath();
  ctx.arc(bellX + 2, bellY - 26, 6, 0, Math.PI);
  ctx.fill();
  ctx.strokeStyle = '#B45309';
  ctx.lineWidth = 1;
  ctx.stroke();

  ctx.restore();
}

// Helper: Camp lake with beach and wooden canoe dock
function drawCampLakeAndPier(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  time: number,
  isNight: boolean,
  isSunset: boolean
) {
  ctx.save();
  // Deep serene mountain lake gradient
  const lakeGrad = ctx.createLinearGradient(x, y, x + w, y + h);
  if (isNight) {
    lakeGrad.addColorStop(0, '#064E3B');
    lakeGrad.addColorStop(0.5, '#065F46');
    lakeGrad.addColorStop(1, '#022C22');
  } else if (isSunset) {
    lakeGrad.addColorStop(0, '#B45309');
    lakeGrad.addColorStop(0.5, '#0D9488');
    lakeGrad.addColorStop(1, '#0F766E');
  } else {
    lakeGrad.addColorStop(0, '#0284C7');
    lakeGrad.addColorStop(0.6, '#0891B2');
    lakeGrad.addColorStop(1, '#0D9488');
  }

  // Organic lake contour
  ctx.fillStyle = lakeGrad;
  ctx.beginPath();
  ctx.moveTo(x, y);
  ctx.quadraticCurveTo(x + w * 0.4, y - 20, x + w, y);
  ctx.lineTo(x + w, y + h);
  ctx.quadraticCurveTo(x + w * 0.5, y + h + 25, x - 20, y + h - 20);
  ctx.quadraticCurveTo(x + 20, y + h * 0.5, x, y);
  ctx.closePath();
  ctx.fill();

  // Shoreline sand fringe
  ctx.strokeStyle = isNight ? '#78350F' : '#FDE68A';
  ctx.lineWidth = 4;
  ctx.stroke();

  // Water ripples
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.35)';
  ctx.lineWidth = 1;
  for (let r = 0; r < 5; r++) {
    const ry = y + 30 + r * 28;
    const wave = Math.sin(time * 1.8 + r) * 12;
    ctx.beginPath();
    ctx.moveTo(x + 40 + wave, ry);
    ctx.lineTo(x + w - 40 - wave, ry);
    ctx.stroke();
  }

  // Long wooden canoe dock
  const pierX = x + 35;
  const pierY = y + 70;
  const pierW = 100;
  const pierH = 26;

  ctx.fillStyle = '#78350F';
  ctx.fillRect(pierX, pierY, pierW, pierH);
  ctx.strokeStyle = '#451A03';
  ctx.lineWidth = 1.5;
  ctx.strokeRect(pierX, pierY, pierW, pierH);

  // Pier wood planks
  for (let px = pierX + 8; px < pierX + pierW; px += 8) {
    ctx.beginPath();
    ctx.moveTo(px, pierY);
    ctx.lineTo(px, pierY + pierH);
    ctx.stroke();
  }

  // Moored colorful canoes (red & yellow)
  drawCanoe(ctx, pierX + 20, pierY + pierH + 8, '#DC2626', time);
  drawCanoe(ctx, pierX + 60, pierY + pierH + 8, '#F59E0B', time + 1);

  ctx.restore();
}

// Helper: Moored camp canoe
function drawCanoe(ctx: CanvasRenderingContext2D, x: number, y: number, color: string, time: number) {
  const bob = Math.sin(time * 2.2) * 2;
  ctx.save();
  ctx.translate(x, y + bob);

  // Hull
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.moveTo(0, 4);
  ctx.quadraticCurveTo(20, -4, 40, 4);
  ctx.quadraticCurveTo(20, 14, 0, 4);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = '#18181B';
  ctx.lineWidth = 1;
  ctx.stroke();

  // Wooden seats & paddles
  ctx.fillStyle = '#78350F';
  ctx.fillRect(10, 3, 5, 4);
  ctx.fillRect(25, 3, 5, 4);

  // Paddle
  ctx.strokeStyle = '#FDE68A';
  ctx.lineWidth = 1.2;
  ctx.beginPath();
  ctx.moveTo(6, 0);
  ctx.lineTo(24, 12);
  ctx.stroke();

  ctx.restore();
}

// Helper: Camp vegetable garden (Huerto de hortalizas)
function drawCampGarden(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number) {
  ctx.save();
  // Low timber fence around garden
  ctx.fillStyle = '#78350F';
  ctx.strokeRect(x, y, w, h);

  // Rich dark tilled soil rows
  ctx.fillStyle = '#27201D';
  for (let ry = y + 8; ry < y + h - 8; ry += 18) {
    ctx.fillRect(x + 6, ry, w - 12, 12);
    // Green tomato plants & red tomatoes
    for (let px = x + 16; px < x + w - 16; px += 20) {
      ctx.fillStyle = '#15803D';
      ctx.beginPath();
      ctx.arc(px, ry + 5, 5, 0, Math.PI * 2);
      ctx.fill();
      // Red ripe tomato
      ctx.fillStyle = '#EF4444';
      ctx.beginPath();
      ctx.arc(px + 2, ry + 6, 2.5, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // Wooden sign: "HUERTO"
  ctx.fillStyle = '#FEF3C7';
  ctx.fillRect(x + w / 2 - 24, y - 10, 48, 10);
  ctx.strokeStyle = '#92400E';
  ctx.strokeRect(x + w / 2 - 24, y - 10, 48, 10);
  ctx.fillStyle = '#78350F';
  ctx.font = 'bold 6.5px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('🌱 HUERTO', x + w / 2, y - 2);
  ctx.textAlign = 'start';

  ctx.restore();
}

// Helper: Secret forest waterfall (Cascada)
function drawCampWaterfall(ctx: CanvasRenderingContext2D, x: number, y: number, time: number) {
  ctx.save();
  // Dark rocky cliff
  ctx.fillStyle = '#334155';
  ctx.beginPath();
  ctx.roundRect(x - 20, y - 40, 75, 70, 8);
  ctx.fill();
  ctx.strokeStyle = '#1E293B';
  ctx.lineWidth = 1.5;
  ctx.stroke();

  // Green moss & ferns
  ctx.fillStyle = '#15803D';
  ctx.beginPath();
  ctx.arc(x - 12, y - 36, 12, 0, Math.PI * 2);
  ctx.arc(x + 46, y - 30, 10, 0, Math.PI * 2);
  ctx.fill();

  // Falling white water torrent
  const waterFlow = (time * 18) % 12;
  ctx.fillStyle = '#E0F2FE';
  ctx.fillRect(x + 8, y - 38, 20, 55);

  // Animated falling foam lines
  ctx.strokeStyle = '#FFFFFF';
  ctx.lineWidth = 1.5;
  for (let s = 0; s < 4; s++) {
    const fx = x + 12 + s * 4;
    ctx.beginPath();
    ctx.moveTo(fx, y - 36 + ((waterFlow + s * 4) % 45));
    ctx.lineTo(fx, y - 24 + ((waterFlow + s * 4) % 45));
    ctx.stroke();
  }

  // Crystal pool at bottom
  ctx.fillStyle = '#0284C7';
  ctx.beginPath();
  ctx.ellipse(x + 18, y + 22, 28, 12, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#38BDF8';
  ctx.lineWidth = 1.5;
  ctx.stroke();

  // Sign: "CASCADA"
  ctx.fillStyle = '#FEF3C7';
  ctx.fillRect(x - 10, y + 36, 56, 10);
  ctx.strokeStyle = '#92400E';
  ctx.strokeRect(x - 10, y + 36, 56, 10);
  ctx.fillStyle = '#78350F';
  ctx.font = 'bold 6px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('💧 CASCADA', x + 18, y + 43);
  ctx.textAlign = 'start';

  ctx.restore();
}

// Helper: Timber footbridge over forest stream
function drawCampBridgeAndStream(ctx: CanvasRenderingContext2D, x: number, y: number, time: number) {
  ctx.save();
  // Flowing brook water
  ctx.fillStyle = '#0284C7';
  ctx.beginPath();
  ctx.moveTo(x - 30, y - 25);
  ctx.quadraticCurveTo(x, y, x + 30, y + 25);
  ctx.lineTo(x + 45, y + 25);
  ctx.quadraticCurveTo(x + 15, y, x - 15, y - 25);
  ctx.closePath();
  ctx.fill();

  // Wooden log bridge planks
  ctx.fillStyle = '#78350F';
  ctx.fillRect(x - 22, y - 10, 44, 20);
  ctx.strokeStyle = '#451A03';
  ctx.lineWidth = 1.2;
  ctx.strokeRect(x - 22, y - 10, 44, 20);

  // Bridge handrails
  ctx.fillStyle = '#92400E';
  ctx.fillRect(x - 22, y - 12, 44, 3);
  ctx.fillRect(x - 22, y + 9, 44, 3);

  ctx.restore();
}

// Helper: Panoramic mountain overlook (El Mirador)
function drawCampScenicOverlook(ctx: CanvasRenderingContext2D, x: number, y: number) {
  ctx.save();
  // Elevated plateau ridge
  ctx.fillStyle = '#475569';
  ctx.beginPath();
  ctx.roundRect(x - 25, y - 15, 60, 40, 8);
  ctx.fill();
  ctx.strokeStyle = '#1E293B';
  ctx.lineWidth = 1.2;
  ctx.stroke();

  // Wooden scenic rest bench
  ctx.fillStyle = '#78350F';
  ctx.fillRect(x - 15, y - 6, 40, 8);
  ctx.fillRect(x - 15, y - 14, 40, 5);

  // Sign: "EL MIRADOR"
  ctx.fillStyle = '#FEF3C7';
  ctx.fillRect(x - 16, y + 15, 42, 9);
  ctx.strokeStyle = '#92400E';
  ctx.strokeRect(x - 16, y + 15, 42, 9);
  ctx.fillStyle = '#78350F';
  ctx.font = 'bold 6px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('🌄 MIRADOR', x + 5, y + 22);
  ctx.textAlign = 'start';

  ctx.restore();
}

// Helper: Great evening campfire (Hoguera central)
function drawCampfireRing(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  time: number,
  isNight: boolean,
  isSunset: boolean
) {
  ctx.save();
  // Clear circular earth
  ctx.fillStyle = '#1C1917';
  ctx.beginPath();
  ctx.arc(x, y, 42, 0, Math.PI * 2);
  ctx.fill();

  // Ring of grey granite stones
  for (let s = 0; s < 12; s++) {
    const angle = (s * Math.PI * 2) / 12;
    const sx = x + Math.cos(angle) * 26;
    const sy = y + Math.sin(angle) * 18;
    ctx.fillStyle = '#64748B';
    ctx.beginPath();
    ctx.arc(sx, sy, 5, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#334155';
    ctx.lineWidth = 1;
    ctx.stroke();
  }

  // Cross stacked pine logs
  ctx.strokeStyle = '#78350F';
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(x - 14, y - 8);
  ctx.lineTo(x + 14, y + 8);
  ctx.moveTo(x - 14, y + 8);
  ctx.lineTo(x + 14, y - 8);
  ctx.stroke();

  // Animated dancing fire flames (active especially at sunset and night!)
  const fireFlicker = Math.sin(time * 14) * 3;
  const flameHeight = isNight ? 28 : isSunset ? 22 : 14;

  // Outer orange glow
  const glowGrad = ctx.createRadialGradient(x, y, 2, x, y, 40);
  glowGrad.addColorStop(0, 'rgba(249, 115, 22, 0.6)');
  glowGrad.addColorStop(0.6, 'rgba(234, 88, 12, 0.2)');
  glowGrad.addColorStop(1, 'rgba(234, 88, 12, 0)');
  ctx.fillStyle = glowGrad;
  ctx.beginPath();
  ctx.arc(x, y, 40, 0, Math.PI * 2);
  ctx.fill();

  // Orange flame body
  ctx.fillStyle = '#EA580C';
  ctx.beginPath();
  ctx.moveTo(x - 10, y + 4);
  ctx.quadraticCurveTo(x - 12 + fireFlicker, y - flameHeight * 0.6, x + fireFlicker * 0.5, y - flameHeight);
  ctx.quadraticCurveTo(x + 12 + fireFlicker, y - flameHeight * 0.6, x + 10, y + 4);
  ctx.closePath();
  ctx.fill();

  // Bright yellow hot core
  ctx.fillStyle = '#FDE047';
  ctx.beginPath();
  ctx.moveTo(x - 5, y + 2);
  ctx.quadraticCurveTo(x - 6 + fireFlicker * 0.5, y - flameHeight * 0.4, x, y - flameHeight * 0.7);
  ctx.quadraticCurveTo(x + 6 + fireFlicker * 0.5, y - flameHeight * 0.4, x + 5, y + 2);
  ctx.closePath();
  ctx.fill();

  // Tree log benches arranged in a circle for campers
  const logBenches = [
    { bx: x - 42, by: y, rot: Math.PI / 2 },
    { bx: x + 42, by: y, rot: Math.PI / 2 },
    { bx: x, by: y - 36, rot: 0 },
    { bx: x, by: y + 36, rot: 0 }
  ];
  logBenches.forEach((lb) => {
    ctx.save();
    ctx.translate(lb.bx, lb.by);
    ctx.rotate(lb.rot);
    ctx.fillStyle = '#5A2609';
    ctx.beginPath();
    ctx.roundRect(-16, -4, 32, 8, 3);
    ctx.fill();
    ctx.strokeStyle = '#3E1906';
    ctx.lineWidth = 1;
    ctx.stroke();
    ctx.restore();
  });

  ctx.restore();
}

// Helper: Surrounding pine trees
function drawPerimeterPines(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  time: number,
  isNight: boolean,
  isSunset: boolean
) {
  const pineCoords = [
    [50, 60], [140, 50], [280, 55], [420, 50], [540, 55],
    [50, h - 50], [280, h - 45], [420, h - 50], [600, h - 50], [780, h - 50]
  ];

  pineCoords.forEach(([px, py], idx) => {
    const sway = Math.sin(time * 1.5 + idx) * 3;
    // Trunk
    ctx.fillStyle = '#451A03';
    ctx.fillRect(px - 3, py, 6, 26);

    // Conical pine tiers
    const pineColor = isNight ? '#0B2316' : isSunset ? '#14532D' : '#166534';
    ctx.fillStyle = pineColor;
    for (let tier = 0; tier < 3; tier++) {
      const ty = py - tier * 14;
      const tw = 28 - tier * 6;
      ctx.beginPath();
      ctx.moveTo(px - tw / 2, ty + 4);
      ctx.lineTo(px + sway * (tier * 0.4), ty - 16);
      ctx.lineTo(px + tw / 2, ty + 4);
      ctx.closePath();
      ctx.fill();
    }
  });
}

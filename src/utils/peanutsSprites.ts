// Peanuts Retro Sprite Rendering System
// Hand-crafted pixel/vector sprites matching the official Peanuts RPG sprite sheet reference
// Characters: Snoopy, Charlie Brown, Lucy, Linus, Sally, Woodstock, Schroeder, Peppermint Patty, Marcie, Ari
// Directions: 'down' (Abajo), 'up' (Arriba), 'left' (Izquierda), 'right' (Derecha)
// Frames: 1, 2, 3, 4 walk cycle

export type Direction = 'down' | 'up' | 'left' | 'right';

export interface DrawSpriteOptions {
  ctx: CanvasRenderingContext2D;
  characterId: string;
  direction: Direction;
  walkFrame: number; // 0, 1, 2, 3
  time?: number;
  isMoving?: boolean;
}

const PEACH_SKIN = '#FED7AA';
const INK_BLACK = '#18181B';
const PURE_WHITE = '#FFFFFF';

// Helper: draw ground contact shadow
function drawGroundShadow(ctx: CanvasRenderingContext2D, w = 18, h = 7, y = 37) {
  ctx.save();
  ctx.fillStyle = 'rgba(0, 0, 0, 0.28)';
  ctx.beginPath();
  ctx.ellipse(12, y, w / 2, h / 2, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

/* ==========================================================================
   1. SNOOPY (El famoso Beagle de Charles Schulz)
   ========================================================================== */
export function drawSnoopySprite(
  ctx: CanvasRenderingContext2D,
  dir: Direction,
  frame: number,
  time = 0
) {
  ctx.save();
  drawGroundShadow(ctx, 16, 6, 36);

  const isLeft = dir === 'left';
  const isRight = dir === 'right';
  const isUp = dir === 'up';

  // Walk stride displacement
  const stride = (frame === 0 || frame === 2) ? (frame === 0 ? -2.5 : 2.5) : 0;
  const bob = (frame === 0 || frame === 2) ? -0.8 : 0;

  ctx.translate(0, bob);

  if (isLeft || isRight) {
    // === SNOOPY: IZQUIERDA / DERECHA ===
    ctx.save();
    if (isRight) {
      ctx.translate(24, 0);
      ctx.scale(-1, 1);
    }

    // Upright white tail with wag
    ctx.fillStyle = PURE_WHITE;
    ctx.strokeStyle = INK_BLACK;
    ctx.lineWidth = 1.3;
    ctx.beginPath();
    ctx.moveTo(18, 23);
    ctx.quadraticCurveTo(23, 20, 22, 14);
    ctx.quadraticCurveTo(19, 18, 17, 24);
    ctx.fill();
    ctx.stroke();

    // Back leg
    ctx.fillStyle = PURE_WHITE;
    ctx.beginPath();
    ctx.roundRect(14 - stride, 26, 4.5, 9, 2);
    ctx.fill();
    ctx.stroke();
    // Back paw
    ctx.beginPath();
    ctx.ellipse(15 - stride, 34.5, 3.5, 2, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // White body
    ctx.beginPath();
    ctx.ellipse(13, 22, 6.5, 7.5, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Black spot on Snoopy's back
    ctx.fillStyle = INK_BLACK;
    ctx.beginPath();
    ctx.ellipse(16, 21, 3.2, 4.2, 0.2, 0, Math.PI * 2);
    ctx.fill();

    // Front leg
    ctx.fillStyle = PURE_WHITE;
    ctx.beginPath();
    ctx.roundRect(9 + stride, 26, 4.5, 9, 2);
    ctx.fill();
    ctx.stroke();
    // Front paw
    ctx.beginPath();
    ctx.ellipse(10 + stride, 34.5, 3.5, 2, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Red Collar
    ctx.fillStyle = '#DC2626';
    ctx.beginPath();
    ctx.roundRect(9, 14.5, 6, 2.2, 1);
    ctx.fill();
    ctx.stroke();

    // Snoopy's Iconic Snout & Head in Profile
    ctx.fillStyle = PURE_WHITE;
    ctx.beginPath();
    // Head back
    ctx.arc(12.5, 10, 6, -Math.PI * 0.5, Math.PI * 0.5, true);
    // Under jaw
    ctx.lineTo(8, 16);
    // Under snout
    ctx.quadraticCurveTo(4, 15.5, 3, 13.5);
    // Tip of snout
    ctx.quadraticCurveTo(2.5, 10.5, 5, 9.5);
    // Bridge of nose to forehead
    ctx.quadraticCurveTo(8.5, 9.5, 11, 4.5);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Black Nose at the tip of the snout
    ctx.fillStyle = INK_BLACK;
    ctx.beginPath();
    ctx.ellipse(3.2, 11.2, 2.2, 2.4, 0, 0, Math.PI * 2);
    ctx.fill();

    // Black Eye Dot
    ctx.beginPath();
    ctx.arc(9.2, 8.8, 1.2, 0, Math.PI * 2);
    ctx.fill();

    // Smile line along snout
    ctx.strokeStyle = INK_BLACK;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.arc(6.5, 12, 1.8, 0, Math.PI * 0.7);
    ctx.stroke();

    // Drooping Black Ear on side of head
    ctx.fillStyle = INK_BLACK;
    ctx.beginPath();
    ctx.moveTo(12.5, 7.5);
    ctx.quadraticCurveTo(17.5, 10, 16.5, 17);
    ctx.quadraticCurveTo(14, 19, 11.5, 14.5);
    ctx.closePath();
    ctx.fill();

    ctx.restore();
  } else if (isUp) {
    // === SNOOPY: ARRIBA (Back View) ===
    // Left & Right stepping hind paws
    ctx.fillStyle = PURE_WHITE;
    ctx.strokeStyle = INK_BLACK;
    ctx.lineWidth = 1.3;

    ctx.beginPath();
    ctx.roundRect(7, 26 + stride * 0.8, 4.5, 9, 2);
    ctx.roundRect(12.5, 26 - stride * 0.8, 4.5, 9, 2);
    ctx.fill();
    ctx.stroke();

    // Paws
    ctx.beginPath();
    ctx.ellipse(9, 34.5 + stride * 0.8, 3, 2, 0, 0, Math.PI * 2);
    ctx.ellipse(15, 34.5 - stride * 0.8, 3, 2, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // White Back Torso
    ctx.beginPath();
    ctx.ellipse(12, 22, 6.5, 7.5, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // BIG ICONIC BLACK SPOT ON SNOOPY'S BACK
    ctx.fillStyle = INK_BLACK;
    ctx.beginPath();
    ctx.ellipse(12, 22, 3.8, 4.5, 0, 0, Math.PI * 2);
    ctx.fill();

    // Upright white pointed tail
    ctx.fillStyle = PURE_WHITE;
    ctx.strokeStyle = INK_BLACK;
    ctx.beginPath();
    ctx.moveTo(11, 25);
    ctx.quadraticCurveTo(12, 19, 12, 15);
    ctx.quadraticCurveTo(13, 19, 13, 25);
    ctx.fill();
    ctx.stroke();

    // Red Collar
    ctx.fillStyle = '#DC2626';
    ctx.beginPath();
    ctx.roundRect(8, 14.5, 8, 2.2, 1);
    ctx.fill();
    ctx.stroke();

    // Back of White Head
    ctx.fillStyle = PURE_WHITE;
    ctx.beginPath();
    ctx.ellipse(12, 9.5, 6.8, 6.5, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Two Drooping Black Ears on Left & Right Sides
    ctx.fillStyle = INK_BLACK;
    ctx.beginPath();
    // Left ear
    ctx.ellipse(5.8, 11, 2.4, 5, -0.2, 0, Math.PI * 2);
    // Right ear
    ctx.ellipse(18.2, 11, 2.4, 5, 0.2, 0, Math.PI * 2);
    ctx.fill();
  } else {
    // === SNOOPY: ABAJO (Front View) ===
    // Left & Right walking paws
    ctx.fillStyle = PURE_WHITE;
    ctx.strokeStyle = INK_BLACK;
    ctx.lineWidth = 1.3;

    ctx.beginPath();
    ctx.roundRect(7, 26 + stride * 0.8, 4.5, 9, 2);
    ctx.roundRect(12.5, 26 - stride * 0.8, 4.5, 9, 2);
    ctx.fill();
    ctx.stroke();

    // Paws
    ctx.beginPath();
    ctx.ellipse(9, 34.5 + stride * 0.8, 3.2, 2.2, 0, 0, Math.PI * 2);
    ctx.ellipse(15, 34.5 - stride * 0.8, 3.2, 2.2, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // White Belly Torso
    ctx.beginPath();
    ctx.ellipse(12, 22, 6.5, 7.5, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Red Collar
    ctx.fillStyle = '#DC2626';
    ctx.beginPath();
    ctx.roundRect(8, 14.5, 8, 2.2, 1);
    ctx.fill();
    ctx.stroke();

    // White Head Front
    ctx.fillStyle = PURE_WHITE;
    ctx.beginPath();
    ctx.ellipse(12, 9.5, 6.8, 6.5, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Two Long Drooping Black Ears on both sides
    ctx.fillStyle = INK_BLACK;
    ctx.beginPath();
    // Left ear
    ctx.ellipse(5.5, 11.5, 2.4, 5.2, -0.2, 0, Math.PI * 2);
    // Right ear
    ctx.ellipse(18.5, 11.5, 2.4, 5.2, 0.2, 0, Math.PI * 2);
    ctx.fill();

    // Two black eye dots
    ctx.beginPath();
    ctx.arc(9.5, 8.5, 1.2, 0, Math.PI * 2);
    ctx.arc(14.5, 8.5, 1.2, 0, Math.PI * 2);
    ctx.fill();

    // Big black round nose in center
    ctx.beginPath();
    ctx.ellipse(12, 11.5, 2.2, 1.8, 0, 0, Math.PI * 2);
    ctx.fill();

    // Cute mouth line
    ctx.strokeStyle = INK_BLACK;
    ctx.lineWidth = 1.1;
    ctx.beginPath();
    ctx.arc(12, 12.8, 1.5, 0.1, Math.PI - 0.1);
    ctx.stroke();
  }

  ctx.restore();
}

/* ==========================================================================
   2. WOODSTOCK (El pequeño pájaro amarillo)
   ========================================================================== */
export function drawWoodstockSprite(
  ctx: CanvasRenderingContext2D,
  dir: Direction,
  frame: number,
  time = 0
) {
  ctx.save();
  drawGroundShadow(ctx, 10, 4, 36);

  const isLeft = dir === 'left';
  const isRight = dir === 'right';
  const isUp = dir === 'up';

  const hop = Math.abs(Math.sin(time * 8)) * -3.5;
  const flap = Math.sin(time * 14) * 2;

  ctx.translate(0, hop);

  if (isLeft || isRight) {
    ctx.save();
    if (isRight) {
      ctx.translate(24, 0);
      ctx.scale(-1, 1);
    }

    // Black stick legs
    ctx.strokeStyle = INK_BLACK;
    ctx.lineWidth = 1.1;
    ctx.beginPath();
    ctx.moveTo(11, 30);
    ctx.lineTo(11, 36);
    ctx.moveTo(14, 30);
    ctx.lineTo(14, 36);
    // Toes
    ctx.moveTo(9, 36);
    ctx.lineTo(12, 36);
    ctx.moveTo(12, 36);
    ctx.lineTo(15, 36);
    ctx.stroke();

    // Tiny Yellow Bird Body
    ctx.fillStyle = '#FACC15';
    ctx.strokeStyle = INK_BLACK;
    ctx.lineWidth = 1.1;
    ctx.beginPath();
    ctx.ellipse(13, 27, 4, 4.5, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Fluttering Little Wing
    ctx.fillStyle = '#EAB308';
    ctx.beginPath();
    ctx.ellipse(14, 27, 2.2, 3 + Math.abs(flap * 0.3), flap * 0.1, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Yellow Head
    ctx.fillStyle = '#FACC15';
    ctx.beginPath();
    ctx.arc(11, 21, 3.8, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // 3 Spiky Feather Tufts on Head (pointing back)
    ctx.strokeStyle = INK_BLACK;
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.moveTo(11, 18);
    ctx.lineTo(14, 14);
    ctx.moveTo(12.5, 18.5);
    ctx.lineTo(16, 16);
    ctx.moveTo(13.5, 19.5);
    ctx.lineTo(17.5, 19);
    ctx.stroke();

    // Pointed Beak sticking out to the left
    ctx.fillStyle = '#F59E0B';
    ctx.beginPath();
    ctx.moveTo(7.5, 20);
    ctx.lineTo(3.5, 21.5);
    ctx.lineTo(7.5, 23);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Bead Eye
    ctx.fillStyle = INK_BLACK;
    ctx.beginPath();
    ctx.arc(9.2, 20.5, 0.9, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  } else if (isUp) {
    // === WOODSTOCK: ARRIBA ===
    ctx.strokeStyle = INK_BLACK;
    ctx.lineWidth = 1.1;
    ctx.beginPath();
    ctx.moveTo(10, 30);
    ctx.lineTo(10, 36);
    ctx.moveTo(14, 30);
    ctx.lineTo(14, 36);
    ctx.stroke();

    // Body
    ctx.fillStyle = '#FACC15';
    ctx.beginPath();
    ctx.ellipse(12, 27, 4, 4.5, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Head
    ctx.beginPath();
    ctx.arc(12, 21, 3.8, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // 3 Spiky Crest Tufts
    ctx.beginPath();
    ctx.moveTo(10.5, 18);
    ctx.lineTo(9.5, 14);
    ctx.moveTo(12, 17.5);
    ctx.lineTo(12, 13);
    ctx.moveTo(13.5, 18);
    ctx.lineTo(14.5, 14);
    ctx.stroke();
  } else {
    // === WOODSTOCK: ABAJO ===
    ctx.strokeStyle = INK_BLACK;
    ctx.lineWidth = 1.1;
    ctx.beginPath();
    ctx.moveTo(10, 30);
    ctx.lineTo(10, 36);
    ctx.moveTo(14, 30);
    ctx.lineTo(14, 36);
    ctx.stroke();

    // Body
    ctx.fillStyle = '#FACC15';
    ctx.beginPath();
    ctx.ellipse(12, 27, 4.2, 4.5, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Head
    ctx.beginPath();
    ctx.arc(12, 21, 3.8, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // 3 Crest Feathers
    ctx.beginPath();
    ctx.moveTo(10.5, 18);
    ctx.lineTo(9.5, 14);
    ctx.moveTo(12, 17.5);
    ctx.lineTo(12, 13);
    ctx.moveTo(13.5, 18);
    ctx.lineTo(14.5, 14);
    ctx.stroke();

    // Eyes
    ctx.fillStyle = INK_BLACK;
    ctx.beginPath();
    ctx.arc(10.5, 20.8, 0.8, 0, Math.PI * 2);
    ctx.arc(13.5, 20.8, 0.8, 0, Math.PI * 2);
    ctx.fill();

    // Beak
    ctx.fillStyle = '#F59E0B';
    ctx.beginPath();
    ctx.moveTo(11, 22);
    ctx.lineTo(12, 23.5);
    ctx.lineTo(13, 22);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
  }

  ctx.restore();
}

/* ==========================================================================
   3. CHARLIE BROWN (El chico del zigzag)
   ========================================================================== */
export function drawCharlieBrownSprite(
  ctx: CanvasRenderingContext2D,
  dir: Direction,
  frame: number
) {
  ctx.save();
  drawGroundShadow(ctx, 18, 7, 37);

  const isLeft = dir === 'left';
  const isRight = dir === 'right';
  const isUp = dir === 'up';

  const stride = (frame === 0 || frame === 2) ? (frame === 0 ? -3 : 3) : 0;
  const bob = (frame === 0 || frame === 2) ? -0.8 : 0;

  ctx.translate(0, bob);

  if (isLeft || isRight) {
    // === PROFILE (IZQUIERDA / DERECHA) ===
    ctx.save();
    if (isRight) {
      ctx.translate(24, 0);
      ctx.scale(-1, 1);
    }

    // Legs & Shoes
    ctx.fillStyle = PEACH_SKIN;
    ctx.strokeStyle = INK_BLACK;
    ctx.lineWidth = 1.3;

    // Back leg & shoe
    ctx.fillRect(13 - stride, 26, 3.5, 8);
    ctx.fillStyle = '#78350F';
    ctx.beginPath();
    ctx.roundRect(11.5 - stride, 33, 6, 4, 2);
    ctx.fill();
    ctx.stroke();

    // Black Shorts
    ctx.fillStyle = INK_BLACK;
    ctx.beginPath();
    ctx.roundRect(8, 22, 8, 6, [1, 1, 2, 2]);
    ctx.fill();

    // Front leg & shoe
    ctx.fillStyle = PEACH_SKIN;
    ctx.fillRect(8 + stride, 26, 3.5, 8);
    ctx.fillStyle = '#78350F';
    ctx.beginPath();
    ctx.roundRect(6.5 + stride, 33, 6, 4, 2);
    ctx.fill();
    ctx.stroke();

    // Yellow Polo Shirt
    ctx.fillStyle = '#FACC15';
    ctx.strokeStyle = INK_BLACK;
    ctx.beginPath();
    ctx.roundRect(7, 14.5, 10, 9, [3, 3, 1, 1]);
    ctx.fill();
    ctx.stroke();

    // Black Zigzag Chevron across shirt
    ctx.strokeStyle = INK_BLACK;
    ctx.lineWidth = 2.2;
    ctx.beginPath();
    ctx.moveTo(7, 19);
    ctx.lineTo(10, 20.8);
    ctx.lineTo(13, 19);
    ctx.lineTo(16, 20.8);
    ctx.lineTo(17, 19.5);
    ctx.stroke();

    // Yellow sleeve & peach hand
    ctx.fillStyle = '#FACC15';
    ctx.strokeStyle = INK_BLACK;
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.roundRect(10, 16, 4, 6, 2);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = PEACH_SKIN;
    ctx.beginPath();
    ctx.arc(12, 23, 1.8, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Round Peach Head with Cute Protruding Nose
    ctx.fillStyle = PEACH_SKIN;
    ctx.strokeStyle = INK_BLACK;
    ctx.lineWidth = 1.3;
    ctx.beginPath();
    // Head circle base
    ctx.arc(12, 8, 6.8, -Math.PI * 0.4, Math.PI * 0.45, true);
    // Nose loop bump on the left
    ctx.quadraticCurveTo(4.5, 8, 4, 9);
    ctx.quadraticCurveTo(3.8, 10.5, 5.2, 10.5);
    ctx.lineTo(7.5, 12);
    // Chin to jaw
    ctx.quadraticCurveTo(10, 15, 12, 14.8);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Eye dot
    ctx.fillStyle = INK_BLACK;
    ctx.beginPath();
    ctx.arc(8.5, 7.8, 1.1, 0, Math.PI * 2);
    ctx.fill();

    // Smile
    ctx.strokeStyle = INK_BLACK;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.arc(7.8, 11, 1.5, 0, Math.PI * 0.6);
    ctx.stroke();

    // Charlie's Forehead Loop Curl 'C' in Front
    ctx.strokeStyle = INK_BLACK;
    ctx.lineWidth = 1.3;
    ctx.beginPath();
    ctx.arc(8, 4.8, 1.8, Math.PI * 0.8, Math.PI * 1.8);
    ctx.stroke();

    // Neck hairs in back
    ctx.beginPath();
    ctx.moveTo(17, 11);
    ctx.quadraticCurveTo(18.5, 12, 17, 13);
    ctx.stroke();

    ctx.restore();
  } else if (isUp) {
    // === ARRIBA (Back View) ===
    // Stepping shoes
    ctx.fillStyle = '#78350F';
    ctx.strokeStyle = INK_BLACK;
    ctx.lineWidth = 1.3;
    ctx.beginPath();
    ctx.roundRect(6, 33 + stride * 0.8, 5, 4, 2);
    ctx.roundRect(13, 33 - stride * 0.8, 5, 4, 2);
    ctx.fill();
    ctx.stroke();

    // Black Shorts
    ctx.fillStyle = INK_BLACK;
    ctx.beginPath();
    ctx.roundRect(6, 22, 12, 6, [1, 1, 2, 2]);
    ctx.fill();

    // Yellow Shirt Back
    ctx.fillStyle = '#FACC15';
    ctx.strokeStyle = INK_BLACK;
    ctx.beginPath();
    ctx.roundRect(5, 14.5, 14, 9, [3, 3, 1, 1]);
    ctx.fill();
    ctx.stroke();

    // Black Zigzag wrapping around
    ctx.strokeStyle = INK_BLACK;
    ctx.lineWidth = 2.4;
    ctx.beginPath();
    ctx.moveTo(5, 19);
    ctx.lineTo(8, 20.8);
    ctx.lineTo(12, 19);
    ctx.lineTo(16, 20.8);
    ctx.lineTo(19, 19);
    ctx.stroke();

    // Round Peach Head Back
    ctx.fillStyle = PEACH_SKIN;
    ctx.strokeStyle = INK_BLACK;
    ctx.lineWidth = 1.3;
    ctx.beginPath();
    ctx.arc(12, 8, 7, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Small nape hair wisps
    ctx.strokeStyle = INK_BLACK;
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.arc(12, 13.5, 2.5, Math.PI * 0.2, Math.PI * 0.8);
    ctx.stroke();
  } else {
    // === ABAJO (Front View - Iconic Charlie Brown) ===
    // Stepping Shoes
    ctx.fillStyle = '#78350F';
    ctx.strokeStyle = INK_BLACK;
    ctx.lineWidth = 1.3;
    ctx.beginPath();
    ctx.roundRect(6, 33 + stride * 0.8, 5.2, 4.2, 2);
    ctx.roundRect(12.8, 33 - stride * 0.8, 5.2, 4.2, 2);
    ctx.fill();
    ctx.stroke();

    // Black Shorts
    ctx.fillStyle = INK_BLACK;
    ctx.beginPath();
    ctx.roundRect(6, 22, 12, 6, [1, 1, 2, 2]);
    ctx.fill();

    // Yellow Shirt
    ctx.fillStyle = '#FACC15';
    ctx.strokeStyle = INK_BLACK;
    ctx.beginPath();
    ctx.roundRect(5, 14.5, 14, 9, [3, 3, 1, 1]);
    ctx.fill();
    ctx.stroke();

    // THE ICONIC BLACK ZIGZAG CHEVRON
    ctx.strokeStyle = INK_BLACK;
    ctx.lineWidth = 2.4;
    ctx.beginPath();
    ctx.moveTo(5, 19);
    ctx.lineTo(8, 21);
    ctx.lineTo(12, 19);
    ctx.lineTo(16, 21);
    ctx.lineTo(19, 19);
    ctx.stroke();

    // Yellow sleeves & peach hands
    ctx.fillStyle = '#FACC15';
    ctx.strokeStyle = INK_BLACK;
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.roundRect(3.2, 15.5, 3.2, 5.5, 1.5);
    ctx.roundRect(17.6, 15.5, 3.2, 5.5, 1.5);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = PEACH_SKIN;
    ctx.beginPath();
    ctx.arc(4.8, 22.2, 1.6, 0, Math.PI * 2);
    ctx.arc(19.2, 22.2, 1.6, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Perfectly Round Peach Head
    ctx.fillStyle = PEACH_SKIN;
    ctx.strokeStyle = INK_BLACK;
    ctx.lineWidth = 1.3;
    ctx.beginPath();
    ctx.arc(12, 8, 7, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Ears
    ctx.beginPath();
    ctx.arc(5, 8.5, 1.5, Math.PI * 0.5, Math.PI * 1.5);
    ctx.arc(19, 8.5, 1.5, -Math.PI * 0.5, Math.PI * 0.5);
    ctx.stroke();

    // The signature Forehead Hair Curl loop 'C'
    ctx.strokeStyle = INK_BLACK;
    ctx.lineWidth = 1.3;
    ctx.beginPath();
    ctx.arc(12, 4.2, 2.2, Math.PI * 0.8, Math.PI * 1.8);
    ctx.stroke();

    // Two clean black vertical dot eyes
    ctx.fillStyle = INK_BLACK;
    ctx.beginPath();
    ctx.ellipse(9.2, 7.8, 1.1, 1.4, 0, 0, Math.PI * 2);
    ctx.ellipse(14.8, 7.8, 1.1, 1.4, 0, 0, Math.PI * 2);
    ctx.fill();

    // Curved loop nose 'C'
    ctx.strokeStyle = INK_BLACK;
    ctx.lineWidth = 1.1;
    ctx.beginPath();
    ctx.arc(12, 9.6, 1.2, -Math.PI * 0.4, Math.PI * 0.5);
    ctx.stroke();

    // Gentle smile line
    ctx.beginPath();
    ctx.arc(12, 11.6, 2.2, 0.15, Math.PI - 0.15);
    ctx.stroke();
  }

  ctx.restore();
}

/* ==========================================================================
   4. LUCY VAN PELT (La dueña del puesto de 5¢)
   ========================================================================== */
export function drawLucySprite(
  ctx: CanvasRenderingContext2D,
  dir: Direction,
  frame: number
) {
  ctx.save();
  drawGroundShadow(ctx, 18, 7, 37);

  const isLeft = dir === 'left';
  const isRight = dir === 'right';
  const isUp = dir === 'up';

  const stride = (frame === 0 || frame === 2) ? (frame === 0 ? -3 : 3) : 0;
  const bob = (frame === 0 || frame === 2) ? -0.8 : 0;

  ctx.translate(0, bob);

  if (isLeft || isRight) {
    ctx.save();
    if (isRight) {
      ctx.translate(24, 0);
      ctx.scale(-1, 1);
    }

    // Saddle shoes & white socks
    ctx.fillStyle = PURE_WHITE;
    ctx.strokeStyle = INK_BLACK;
    ctx.lineWidth = 1.2;
    ctx.fillRect(13 - stride, 27, 3.5, 6);
    ctx.fillStyle = '#1D4ED8';
    ctx.beginPath();
    ctx.roundRect(11.5 - stride, 33, 6, 4, 2);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = PURE_WHITE;
    ctx.fillRect(8 + stride, 27, 3.5, 6);
    ctx.fillStyle = '#1D4ED8';
    ctx.beginPath();
    ctx.roundRect(6.5 + stride, 33, 6, 4, 2);
    ctx.fill();
    ctx.stroke();

    // Royal Blue Dress Profile
    ctx.fillStyle = '#2563EB';
    ctx.beginPath();
    ctx.moveTo(9, 15);
    ctx.lineTo(16, 15);
    ctx.lineTo(18.5, 26);
    ctx.lineTo(6.5, 26);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // White collar peek
    ctx.fillStyle = PURE_WHITE;
    ctx.beginPath();
    ctx.arc(9.5, 15, 2, 0, Math.PI);
    ctx.fill();

    // Blue Puffed Sleeve
    ctx.fillStyle = '#2563EB';
    ctx.beginPath();
    ctx.arc(12.5, 17, 2.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Peach Face & Nose Profile
    ctx.fillStyle = PEACH_SKIN;
    ctx.strokeStyle = INK_BLACK;
    ctx.lineWidth = 1.3;
    ctx.beginPath();
    ctx.arc(12, 8, 6.5, -Math.PI * 0.4, Math.PI * 0.45, true);
    ctx.quadraticCurveTo(4.5, 8, 4, 9.2);
    ctx.quadraticCurveTo(3.8, 10.5, 5.2, 10.5);
    ctx.lineTo(7.5, 12.5);
    ctx.quadraticCurveTo(10, 15, 12, 14.8);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Eye dot
    ctx.fillStyle = INK_BLACK;
    ctx.beginPath();
    ctx.arc(8.5, 7.8, 1.1, 0, Math.PI * 2);
    ctx.fill();

    // Sassy smile
    ctx.strokeStyle = INK_BLACK;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.arc(8, 11, 1.5, 0, Math.PI * 0.6);
    ctx.stroke();

    // Lucy's Voluminous Black Curls Profile (Flicking out at back)
    ctx.fillStyle = INK_BLACK;
    ctx.beginPath();
    ctx.arc(12, 7, 7.5, Math.PI * 0.8, Math.PI * 2);
    ctx.lineTo(19, 14);
    ctx.arc(17.5, 13, 2.5, 0, Math.PI * 2);
    ctx.arc(15, 15, 2.5, 0, Math.PI * 2);
    ctx.arc(10, 5, 3.5, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  } else if (isUp) {
    // === ARRIBA (Back View) ===
    // Saddle shoes
    ctx.fillStyle = '#1D4ED8';
    ctx.strokeStyle = INK_BLACK;
    ctx.lineWidth = 1.3;
    ctx.beginPath();
    ctx.roundRect(6, 33 + stride * 0.8, 5, 4, 2);
    ctx.roundRect(13, 33 - stride * 0.8, 5, 4, 2);
    ctx.fill();
    ctx.stroke();

    // Blue Dress Back
    ctx.fillStyle = '#2563EB';
    ctx.beginPath();
    ctx.moveTo(8, 15);
    ctx.lineTo(16, 15);
    ctx.lineTo(19.5, 26);
    ctx.lineTo(4.5, 26);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // BACK OF LUCY'S VOLUMINOUS SCALLOPED BLACK HAIR
    ctx.fillStyle = INK_BLACK;
    ctx.beginPath();
    ctx.arc(12, 7, 7.5, Math.PI, Math.PI * 2);
    ctx.fill();

    // Scalloped loops
    const loops = [[4.5, 8], [4.2, 11.5], [19.5, 8], [19.8, 11.5], [8, 13], [12, 13.5], [16, 13]];
    loops.forEach(([cx, cy]) => {
      ctx.beginPath();
      ctx.arc(cx, cy, 2.8, 0, Math.PI * 2);
      ctx.fill();
    });
  } else {
    // === ABAJO (Front View) ===
    // Saddle shoes & white socks
    ctx.fillStyle = '#1D4ED8';
    ctx.strokeStyle = INK_BLACK;
    ctx.lineWidth = 1.3;
    ctx.beginPath();
    ctx.roundRect(6, 33 + stride * 0.8, 5.2, 4.2, 2);
    ctx.roundRect(12.8, 33 - stride * 0.8, 5.2, 4.2, 2);
    ctx.fill();
    ctx.stroke();

    // Royal Blue Dress with flared pleated skirt
    ctx.fillStyle = '#2563EB';
    ctx.beginPath();
    ctx.moveTo(7, 15);
    ctx.lineTo(17, 15);
    ctx.lineTo(20, 26);
    ctx.lineTo(4, 26);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // White Peter Pan Collar
    ctx.fillStyle = PURE_WHITE;
    ctx.beginPath();
    ctx.arc(12, 15, 3.2, 0, Math.PI);
    ctx.fill();
    ctx.stroke();

    // Blue Puffed Sleeves
    ctx.fillStyle = '#2563EB';
    ctx.beginPath();
    ctx.arc(4.8, 17, 2.5, 0, Math.PI * 2);
    ctx.arc(19.2, 17, 2.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Peach Face
    ctx.fillStyle = PEACH_SKIN;
    ctx.strokeStyle = INK_BLACK;
    ctx.lineWidth = 1.3;
    ctx.beginPath();
    ctx.arc(12, 8.5, 6.8, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Dot eyes
    ctx.fillStyle = INK_BLACK;
    ctx.beginPath();
    ctx.arc(9.2, 8, 1.2, 0, Math.PI * 2);
    ctx.arc(14.8, 8, 1.2, 0, Math.PI * 2);
    ctx.fill();

    // Smile & nose
    ctx.strokeStyle = INK_BLACK;
    ctx.lineWidth = 1.1;
    ctx.beginPath();
    ctx.arc(12, 9.8, 1.2, -Math.PI * 0.4, Math.PI * 0.5);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(12, 11.8, 2.2, 0.15, Math.PI - 0.15);
    ctx.stroke();

    // LUCY'S SIGNATURE SCALLOPED BLACK CURLS
    ctx.fillStyle = INK_BLACK;
    ctx.beginPath();
    ctx.arc(12, 6, 7.8, Math.PI, Math.PI * 2);
    ctx.fill();

    // Curls around cheeks
    const sideCurls = [[4, 7.5], [4, 11], [20, 7.5], [20, 11]];
    sideCurls.forEach(([cx, cy]) => {
      ctx.beginPath();
      ctx.arc(cx, cy, 2.6, 0, Math.PI * 2);
      ctx.fill();
    });
  }

  ctx.restore();
}

/* ==========================================================================
   5. LINUS VAN PELT (El filósofo con su manta)
   ========================================================================== */
export function drawLinusSprite(
  ctx: CanvasRenderingContext2D,
  dir: Direction,
  frame: number
) {
  ctx.save();
  drawGroundShadow(ctx, 18, 7, 37);

  const isLeft = dir === 'left';
  const isRight = dir === 'right';
  const isUp = dir === 'up';

  const stride = (frame === 0 || frame === 2) ? (frame === 0 ? -3 : 3) : 0;
  const bob = (frame === 0 || frame === 2) ? -0.8 : 0;

  ctx.translate(0, bob);

  if (isLeft || isRight) {
    ctx.save();
    if (isRight) {
      ctx.translate(24, 0);
      ctx.scale(-1, 1);
    }

    // Brown oxford shoes
    ctx.fillStyle = '#78350F';
    ctx.strokeStyle = INK_BLACK;
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.roundRect(11.5 - stride, 33, 6, 4, 2);
    ctx.roundRect(6.5 + stride, 33, 6, 4, 2);
    ctx.fill();
    ctx.stroke();

    // Black Shorts
    ctx.fillStyle = INK_BLACK;
    ctx.beginPath();
    ctx.roundRect(8, 22, 8, 6, [1, 1, 2, 2]);
    ctx.fill();

    // Red & Black Striped Shirt
    ctx.fillStyle = '#DC2626';
    ctx.strokeStyle = INK_BLACK;
    ctx.beginPath();
    ctx.roundRect(7, 14.5, 10, 9, [3, 3, 1, 1]);
    ctx.fill();
    ctx.stroke();

    // Horizontal black stripes
    ctx.strokeStyle = INK_BLACK;
    ctx.lineWidth = 1.4;
    ctx.beginPath();
    ctx.moveTo(7, 17.5);
    ctx.lineTo(17, 17.5);
    ctx.moveTo(7, 20.5);
    ctx.lineTo(17, 20.5);
    ctx.stroke();

    // Blue security blanket tucked in hand
    ctx.fillStyle = '#93C5FD';
    ctx.strokeStyle = '#38BDF8';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.roundRect(14, 17, 7, 12, 2);
    ctx.fill();
    ctx.stroke();

    // Peach Face & Nose Profile
    ctx.fillStyle = PEACH_SKIN;
    ctx.strokeStyle = INK_BLACK;
    ctx.lineWidth = 1.3;
    ctx.beginPath();
    ctx.arc(12, 8, 6.8, -Math.PI * 0.4, Math.PI * 0.45, true);
    ctx.quadraticCurveTo(4.5, 8, 4, 9);
    ctx.quadraticCurveTo(3.8, 10.5, 5.2, 10.5);
    ctx.lineTo(7.5, 12);
    ctx.quadraticCurveTo(10, 15, 12, 14.8);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Eye dot
    ctx.fillStyle = INK_BLACK;
    ctx.beginPath();
    ctx.arc(8.5, 7.8, 1.1, 0, Math.PI * 2);
    ctx.fill();

    // Linus's distinctive delicate hair strands combed back
    ctx.strokeStyle = INK_BLACK;
    ctx.lineWidth = 1.2;
    const strands = [
      [8, 4, 6, 1],
      [10, 3, 9, 0],
      [12, 2.5, 12, 0],
      [14, 3, 15, 0],
      [16, 4, 17, 1]
    ];
    strands.forEach(([x1, y1, x2, y2]) => {
      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
      ctx.stroke();
    });

    ctx.restore();
  } else if (isUp) {
    // === ARRIBA (Back View) ===
    ctx.fillStyle = '#78350F';
    ctx.strokeStyle = INK_BLACK;
    ctx.lineWidth = 1.3;
    ctx.beginPath();
    ctx.roundRect(6, 33 + stride * 0.8, 5, 4, 2);
    ctx.roundRect(13, 33 - stride * 0.8, 5, 4, 2);
    ctx.fill();
    ctx.stroke();

    // Black Shorts
    ctx.fillStyle = INK_BLACK;
    ctx.beginPath();
    ctx.roundRect(6, 22, 12, 6, [1, 1, 2, 2]);
    ctx.fill();

    // Red Shirt Back with horizontal stripes
    ctx.fillStyle = '#DC2626';
    ctx.strokeStyle = INK_BLACK;
    ctx.beginPath();
    ctx.roundRect(5, 14.5, 14, 9, [3, 3, 1, 1]);
    ctx.fill();
    ctx.stroke();

    ctx.strokeStyle = INK_BLACK;
    ctx.lineWidth = 1.4;
    ctx.beginPath();
    ctx.moveTo(5, 17.5);
    ctx.lineTo(19, 17.5);
    ctx.moveTo(5, 20.5);
    ctx.lineTo(19, 20.5);
    ctx.stroke();

    // Round Peach Head Back
    ctx.fillStyle = PEACH_SKIN;
    ctx.strokeStyle = INK_BLACK;
    ctx.lineWidth = 1.3;
    ctx.beginPath();
    ctx.arc(12, 8, 7, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Linus's Combed Back Hair Strands
    ctx.strokeStyle = INK_BLACK;
    ctx.lineWidth = 1.2;
    const strands = [
      [8, 5, 7, 1],
      [10, 4, 10, 0],
      [12, 3.5, 12, 0],
      [14, 4, 14, 0],
      [16, 5, 17, 1]
    ];
    strands.forEach(([x1, y1, x2, y2]) => {
      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
      ctx.stroke();
    });
  } else {
    // === ABAJO (Front View) ===
    ctx.fillStyle = '#78350F';
    ctx.strokeStyle = INK_BLACK;
    ctx.lineWidth = 1.3;
    ctx.beginPath();
    ctx.roundRect(6, 33 + stride * 0.8, 5.2, 4.2, 2);
    ctx.roundRect(12.8, 33 - stride * 0.8, 5.2, 4.2, 2);
    ctx.fill();
    ctx.stroke();

    // Black Shorts
    ctx.fillStyle = INK_BLACK;
    ctx.beginPath();
    ctx.roundRect(6, 22, 12, 6, [1, 1, 2, 2]);
    ctx.fill();

    // Red Shirt
    ctx.fillStyle = '#DC2626';
    ctx.strokeStyle = INK_BLACK;
    ctx.beginPath();
    ctx.roundRect(5, 14.5, 14, 9, [3, 3, 1, 1]);
    ctx.fill();
    ctx.stroke();

    // Horizontal Black Stripes
    ctx.strokeStyle = INK_BLACK;
    ctx.lineWidth = 1.4;
    ctx.beginPath();
    ctx.moveTo(5, 17.5);
    ctx.lineTo(19, 17.5);
    ctx.moveTo(5, 20.5);
    ctx.lineTo(19, 20.5);
    ctx.stroke();

    // Blue security blanket in hand
    ctx.fillStyle = '#93C5FD';
    ctx.strokeStyle = '#38BDF8';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.roundRect(17, 18, 6, 12, 2);
    ctx.fill();
    ctx.stroke();

    // Round Peach Head
    ctx.fillStyle = PEACH_SKIN;
    ctx.strokeStyle = INK_BLACK;
    ctx.lineWidth = 1.3;
    ctx.beginPath();
    ctx.arc(12, 8, 7, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Dot eyes & nose
    ctx.fillStyle = INK_BLACK;
    ctx.beginPath();
    ctx.ellipse(9.2, 7.8, 1.1, 1.4, 0, 0, Math.PI * 2);
    ctx.ellipse(14.8, 7.8, 1.1, 1.4, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = INK_BLACK;
    ctx.lineWidth = 1.1;
    ctx.beginPath();
    ctx.arc(12, 9.6, 1.2, -Math.PI * 0.4, Math.PI * 0.5);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(12, 11.6, 2.2, 0.15, Math.PI - 0.15);
    ctx.stroke();

    // LINUS'S ICONIC HAIR: DELICATE BLACK COMBED STRANDS
    ctx.strokeStyle = INK_BLACK;
    ctx.lineWidth = 1.2;
    const strands = [
      [8, 4, 7, 0],
      [10, 3, 9.5, -1],
      [12, 2.5, 12, -1.5],
      [14, 3, 14.5, -1],
      [16, 4, 17, 0]
    ];
    strands.forEach(([x1, y1, x2, y2]) => {
      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
      ctx.stroke();
    });
  }

  ctx.restore();
}

/* ==========================================================================
   6. SALLY BROWN (La hermanita con rizos rubios)
   ========================================================================== */
export function drawSallySprite(
  ctx: CanvasRenderingContext2D,
  dir: Direction,
  frame: number
) {
  ctx.save();
  drawGroundShadow(ctx, 18, 7, 37);

  const isLeft = dir === 'left';
  const isRight = dir === 'right';
  const isUp = dir === 'up';

  const stride = (frame === 0 || frame === 2) ? (frame === 0 ? -3 : 3) : 0;
  const bob = (frame === 0 || frame === 2) ? -0.8 : 0;

  ctx.translate(0, bob);

  if (isLeft || isRight) {
    ctx.save();
    if (isRight) {
      ctx.translate(24, 0);
      ctx.scale(-1, 1);
    }

    // Pink/black Mary Jane shoes
    ctx.fillStyle = '#DB2777';
    ctx.strokeStyle = INK_BLACK;
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.roundRect(11.5 - stride, 33, 6, 4, 2);
    ctx.roundRect(6.5 + stride, 33, 6, 4, 2);
    ctx.fill();
    ctx.stroke();

    // Pink dress profile
    ctx.fillStyle = '#F472B6';
    ctx.beginPath();
    ctx.moveTo(9, 15);
    ctx.lineTo(16, 15);
    ctx.lineTo(18.5, 26);
    ctx.lineTo(6.5, 26);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Peach Face & Nose Profile
    ctx.fillStyle = PEACH_SKIN;
    ctx.strokeStyle = INK_BLACK;
    ctx.lineWidth = 1.3;
    ctx.beginPath();
    ctx.arc(12, 8, 6.5, -Math.PI * 0.4, Math.PI * 0.45, true);
    ctx.quadraticCurveTo(4.5, 8, 4, 9.2);
    ctx.quadraticCurveTo(3.8, 10.5, 5.2, 10.5);
    ctx.lineTo(7.5, 12.5);
    ctx.quadraticCurveTo(10, 15, 12, 14.8);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Eye dot
    ctx.fillStyle = INK_BLACK;
    ctx.beginPath();
    ctx.arc(8.5, 7.8, 1.1, 0, Math.PI * 2);
    ctx.fill();

    // Sally's blonde hair with top puff tufts
    ctx.fillStyle = '#FACC15';
    ctx.strokeStyle = INK_BLACK;
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.arc(12, 6, 7.2, Math.PI * 0.8, Math.PI * 2);
    ctx.lineTo(18, 12);
    ctx.arc(17, 11, 2.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Top knot / flower bow tufts
    ctx.beginPath();
    ctx.arc(13, 1.5, 2.4, 0, Math.PI * 2);
    ctx.arc(16, 2.5, 2.2, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    ctx.restore();
  } else if (isUp) {
    // === ARRIBA (Back View) ===
    ctx.fillStyle = '#DB2777';
    ctx.strokeStyle = INK_BLACK;
    ctx.lineWidth = 1.3;
    ctx.beginPath();
    ctx.roundRect(6, 33 + stride * 0.8, 5, 4, 2);
    ctx.roundRect(13, 33 - stride * 0.8, 5, 4, 2);
    ctx.fill();
    ctx.stroke();

    // Pink dress back
    ctx.fillStyle = '#F472B6';
    ctx.beginPath();
    ctx.moveTo(8, 15);
    ctx.lineTo(16, 15);
    ctx.lineTo(19.5, 26);
    ctx.lineTo(4.5, 26);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Blonde Hair Back
    ctx.fillStyle = '#FACC15';
    ctx.strokeStyle = INK_BLACK;
    ctx.lineWidth = 1.3;
    ctx.beginPath();
    ctx.arc(12, 7, 7.5, Math.PI, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Top tufts
    ctx.beginPath();
    ctx.arc(10, 2, 2.6, 0, Math.PI * 2);
    ctx.arc(14, 2, 2.6, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
  } else {
    // === ABAJO (Front View) ===
    ctx.fillStyle = '#DB2777';
    ctx.strokeStyle = INK_BLACK;
    ctx.lineWidth = 1.3;
    ctx.beginPath();
    ctx.roundRect(6, 33 + stride * 0.8, 5.2, 4.2, 2);
    ctx.roundRect(12.8, 33 - stride * 0.8, 5.2, 4.2, 2);
    ctx.fill();
    ctx.stroke();

    // Pink Dress with white collar
    ctx.fillStyle = '#F472B6';
    ctx.beginPath();
    ctx.moveTo(7, 15);
    ctx.lineTo(17, 15);
    ctx.lineTo(20, 26);
    ctx.lineTo(4, 26);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // White Collar
    ctx.fillStyle = PURE_WHITE;
    ctx.beginPath();
    ctx.arc(12, 15, 3, 0, Math.PI);
    ctx.fill();
    ctx.stroke();

    // Peach Face
    ctx.fillStyle = PEACH_SKIN;
    ctx.strokeStyle = INK_BLACK;
    ctx.lineWidth = 1.3;
    ctx.beginPath();
    ctx.arc(12, 8.5, 6.8, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Dot eyes & sweet smile
    ctx.fillStyle = INK_BLACK;
    ctx.beginPath();
    ctx.arc(9.2, 8, 1.2, 0, Math.PI * 2);
    ctx.arc(14.8, 8, 1.2, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = INK_BLACK;
    ctx.lineWidth = 1.1;
    ctx.beginPath();
    ctx.arc(12, 9.8, 1.2, -Math.PI * 0.4, Math.PI * 0.5);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(12, 11.8, 2, 0.15, Math.PI - 0.15);
    ctx.stroke();

    // SALLY'S BLONDE HAIR & TOP PUFF TUFTS
    ctx.fillStyle = '#FACC15';
    ctx.strokeStyle = INK_BLACK;
    ctx.lineWidth = 1.3;
    ctx.beginPath();
    ctx.arc(12, 6, 7.8, Math.PI, Math.PI * 2);
    ctx.fill();

    // Ear curls
    ctx.beginPath();
    ctx.arc(4.5, 8.5, 2.6, 0, Math.PI * 2);
    ctx.arc(19.5, 8.5, 2.6, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Two iconic bow/puff tufts on top
    ctx.beginPath();
    ctx.arc(9.5, 1.5, 2.8, 0, Math.PI * 2);
    ctx.arc(14.5, 1.5, 2.8, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
  }

  ctx.restore();
}

/* ==========================================================================
   7. SCHROEDER (El pianista fan de Beethoven)
   ========================================================================== */
export function drawSchroederSprite(
  ctx: CanvasRenderingContext2D,
  dir: Direction,
  frame: number
) {
  ctx.save();
  drawGroundShadow(ctx, 18, 7, 37);

  const isLeft = dir === 'left';
  const isRight = dir === 'right';
  const isUp = dir === 'up';

  const stride = (frame === 0 || frame === 2) ? (frame === 0 ? -3 : 3) : 0;
  const bob = (frame === 0 || frame === 2) ? -0.8 : 0;

  ctx.translate(0, bob);

  if (isLeft || isRight) {
    ctx.save();
    if (isRight) {
      ctx.translate(24, 0);
      ctx.scale(-1, 1);
    }

    ctx.fillStyle = '#78350F';
    ctx.strokeStyle = INK_BLACK;
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.roundRect(11.5 - stride, 33, 6, 4, 2);
    ctx.roundRect(6.5 + stride, 33, 6, 4, 2);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = INK_BLACK;
    ctx.beginPath();
    ctx.roundRect(8, 22, 8, 6, [1, 1, 2, 2]);
    ctx.fill();

    // Purple / Blue Striped Polo
    ctx.fillStyle = '#6366F1';
    ctx.strokeStyle = INK_BLACK;
    ctx.beginPath();
    ctx.roundRect(7, 14.5, 10, 9, [3, 3, 1, 1]);
    ctx.fill();
    ctx.stroke();

    ctx.strokeStyle = '#312E81';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(7, 18);
    ctx.lineTo(17, 18);
    ctx.moveTo(7, 21);
    ctx.lineTo(17, 21);
    ctx.stroke();

    // Head
    ctx.fillStyle = PEACH_SKIN;
    ctx.strokeStyle = INK_BLACK;
    ctx.lineWidth = 1.3;
    ctx.beginPath();
    ctx.arc(12, 8, 6.8, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = INK_BLACK;
    ctx.beginPath();
    ctx.arc(8.5, 7.8, 1.1, 0, Math.PI * 2);
    ctx.fill();

    // Schroeder's Combed Blonde Layered Hair
    ctx.fillStyle = '#FACC15';
    ctx.strokeStyle = INK_BLACK;
    ctx.lineWidth = 1.3;
    ctx.beginPath();
    ctx.arc(12, 6.5, 7.2, Math.PI * 0.8, Math.PI * 2);
    ctx.lineTo(18, 10);
    ctx.fill();
    ctx.stroke();

    ctx.restore();
  } else if (isUp) {
    ctx.fillStyle = '#78350F';
    ctx.strokeStyle = INK_BLACK;
    ctx.lineWidth = 1.3;
    ctx.beginPath();
    ctx.roundRect(6, 33 + stride * 0.8, 5, 4, 2);
    ctx.roundRect(13, 33 - stride * 0.8, 5, 4, 2);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = INK_BLACK;
    ctx.beginPath();
    ctx.roundRect(6, 22, 12, 6, [1, 1, 2, 2]);
    ctx.fill();

    ctx.fillStyle = '#6366F1';
    ctx.strokeStyle = INK_BLACK;
    ctx.beginPath();
    ctx.roundRect(5, 14.5, 14, 9, [3, 3, 1, 1]);
    ctx.fill();
    ctx.stroke();

    ctx.strokeStyle = '#312E81';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(5, 18);
    ctx.lineTo(19, 18);
    ctx.moveTo(5, 21);
    ctx.lineTo(19, 21);
    ctx.stroke();

    ctx.fillStyle = '#FACC15';
    ctx.strokeStyle = INK_BLACK;
    ctx.lineWidth = 1.3;
    ctx.beginPath();
    ctx.arc(12, 7.5, 7.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
  } else {
    // ABAJO
    ctx.fillStyle = '#78350F';
    ctx.strokeStyle = INK_BLACK;
    ctx.lineWidth = 1.3;
    ctx.beginPath();
    ctx.roundRect(6, 33 + stride * 0.8, 5.2, 4.2, 2);
    ctx.roundRect(12.8, 33 - stride * 0.8, 5.2, 4.2, 2);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = INK_BLACK;
    ctx.beginPath();
    ctx.roundRect(6, 22, 12, 6, [1, 1, 2, 2]);
    ctx.fill();

    ctx.fillStyle = '#6366F1';
    ctx.strokeStyle = INK_BLACK;
    ctx.beginPath();
    ctx.roundRect(5, 14.5, 14, 9, [3, 3, 1, 1]);
    ctx.fill();
    ctx.stroke();

    ctx.strokeStyle = '#312E81';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(5, 18);
    ctx.lineTo(19, 18);
    ctx.moveTo(5, 21);
    ctx.lineTo(19, 21);
    ctx.stroke();

    ctx.fillStyle = PEACH_SKIN;
    ctx.strokeStyle = INK_BLACK;
    ctx.lineWidth = 1.3;
    ctx.beginPath();
    ctx.arc(12, 8.5, 6.8, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = INK_BLACK;
    ctx.beginPath();
    ctx.arc(9.2, 8, 1.2, 0, Math.PI * 2);
    ctx.arc(14.8, 8, 1.2, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = INK_BLACK;
    ctx.lineWidth = 1.1;
    ctx.beginPath();
    ctx.arc(12, 9.8, 1.2, -Math.PI * 0.4, Math.PI * 0.5);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(12, 11.8, 2, 0.15, Math.PI - 0.15);
    ctx.stroke();

    // Layered blonde hair
    ctx.fillStyle = '#FACC15';
    ctx.strokeStyle = INK_BLACK;
    ctx.lineWidth = 1.3;
    ctx.beginPath();
    ctx.arc(12, 6.2, 7.4, Math.PI, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(12, 2);
    ctx.lineTo(12, 6.5);
    ctx.stroke();
  }

  ctx.restore();
}

/* ==========================================================================
   8. PEPPERMINT PATTY & MARCIE
   ========================================================================== */
export function drawPeppermintPattySprite(
  ctx: CanvasRenderingContext2D,
  dir: Direction,
  frame: number
) {
  ctx.save();
  drawGroundShadow(ctx, 18, 7, 37);

  const stride = (frame === 0 || frame === 2) ? (frame === 0 ? -3 : 3) : 0;
  const bob = (frame === 0 || frame === 2) ? -0.8 : 0;
  ctx.translate(0, bob);

  // Brown leather strapped sandals
  ctx.fillStyle = '#78350F';
  ctx.strokeStyle = INK_BLACK;
  ctx.lineWidth = 1.2;
  ctx.beginPath();
  ctx.roundRect(6, 33 + stride * 0.8, 5.2, 4.2, 1);
  ctx.roundRect(12.8, 33 - stride * 0.8, 5.2, 4.2, 1);
  ctx.fill();
  ctx.stroke();

  // Blue athletic shorts
  ctx.fillStyle = '#1E3A8A';
  ctx.fillRect(6, 22, 12, 6);

  // Green polo jersey with pin-stripes
  ctx.fillStyle = '#16A34A';
  ctx.strokeStyle = INK_BLACK;
  ctx.lineWidth = 1.2;
  ctx.beginPath();
  ctx.roundRect(5, 14.5, 14, 9, [3, 3, 1, 1]);
  ctx.fill();
  ctx.stroke();

  // White pin-stripes
  ctx.strokeStyle = '#DCFCE7';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(9, 15);
  ctx.lineTo(9, 23);
  ctx.moveTo(12, 15);
  ctx.lineTo(12, 23);
  ctx.moveTo(15, 15);
  ctx.lineTo(15, 23);
  ctx.stroke();

  // Head
  ctx.fillStyle = PEACH_SKIN;
  ctx.strokeStyle = INK_BLACK;
  ctx.lineWidth = 1.3;
  ctx.beginPath();
  ctx.arc(12, 8.5, 6.8, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // Eyes & Smile
  ctx.fillStyle = INK_BLACK;
  ctx.beginPath();
  ctx.arc(9.2, 8, 1.2, 0, Math.PI * 2);
  ctx.arc(14.8, 8, 1.2, 0, Math.PI * 2);
  ctx.fill();

  ctx.strokeStyle = INK_BLACK;
  ctx.lineWidth = 1.1;
  ctx.beginPath();
  ctx.arc(12, 11.6, 2.2, 0.15, Math.PI - 0.15);
  ctx.stroke();

  // Auburn Bobbed Hair with straight bangs
  ctx.fillStyle = '#9A3412';
  ctx.strokeStyle = INK_BLACK;
  ctx.lineWidth = 1.3;
  ctx.beginPath();
  ctx.arc(12, 6.5, 7.5, Math.PI, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // Side bobs
  ctx.beginPath();
  ctx.roundRect(4, 7, 3, 7, 1);
  ctx.roundRect(17, 7, 3, 7, 1);
  ctx.fill();
  ctx.stroke();

  ctx.restore();
}

export function drawMarcieSprite(
  ctx: CanvasRenderingContext2D,
  dir: Direction,
  frame: number
) {
  ctx.save();
  drawGroundShadow(ctx, 18, 7, 37);

  const stride = (frame === 0 || frame === 2) ? (frame === 0 ? -3 : 3) : 0;
  const bob = (frame === 0 || frame === 2) ? -0.8 : 0;
  ctx.translate(0, bob);

  // Shoes
  ctx.fillStyle = '#18181B';
  ctx.strokeStyle = INK_BLACK;
  ctx.lineWidth = 1.2;
  ctx.beginPath();
  ctx.roundRect(6, 33 + stride * 0.8, 5.2, 4.2, 2);
  ctx.roundRect(12.8, 33 - stride * 0.8, 5.2, 4.2, 2);
  ctx.fill();
  ctx.stroke();

  // Skirt
  ctx.fillStyle = '#1E293B';
  ctx.fillRect(5, 23, 14, 5);

  // Orange sweater
  ctx.fillStyle = '#EA580C';
  ctx.strokeStyle = INK_BLACK;
  ctx.lineWidth = 1.2;
  ctx.beginPath();
  ctx.roundRect(5, 14.5, 14, 9, [3, 3, 1, 1]);
  ctx.fill();
  ctx.stroke();

  // Head
  ctx.fillStyle = PEACH_SKIN;
  ctx.strokeStyle = INK_BLACK;
  ctx.lineWidth = 1.3;
  ctx.beginPath();
  ctx.arc(12, 8.5, 6.8, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // Marcie's Iconic Round White Spectacles with Black Rims
  ctx.fillStyle = PURE_WHITE;
  ctx.strokeStyle = INK_BLACK;
  ctx.lineWidth = 1.3;
  ctx.beginPath();
  ctx.arc(9.2, 8.5, 2.6, 0, Math.PI * 2);
  ctx.arc(14.8, 8.5, 2.6, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(11.8, 8.5);
  ctx.lineTo(12.2, 8.5);
  ctx.stroke();

  // Dark hair with bangs
  ctx.fillStyle = INK_BLACK;
  ctx.beginPath();
  ctx.arc(12, 6, 7.5, Math.PI, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
  ctx.beginPath();
  ctx.roundRect(4, 7, 3, 6, 1);
  ctx.roundRect(17, 7, 3, 6, 1);
  ctx.fill();
  ctx.stroke();

  ctx.restore();
}

/* ==========================================================================
   9. ARI (Protagonista - Dibujado en el mismo estilo Peanuts Retro)
   ========================================================================== */
export function drawAriSprite(
  ctx: CanvasRenderingContext2D,
  dir: Direction,
  walkStep: number
) {
  ctx.save();
  drawGroundShadow(ctx, 18, 7, 37);

  const isLeft = dir === 'left';
  const isRight = dir === 'right';
  const isUp = dir === 'up';

  const frame = Math.floor(((walkStep % (Math.PI * 2)) + Math.PI * 2) / (Math.PI / 2)) % 4;
  const stride = (frame === 0 || frame === 2) ? (frame === 0 ? -3 : 3) : 0;
  const bob = (frame === 0 || frame === 2) ? -0.8 : 0;

  ctx.translate(0, bob);

  if (isLeft || isRight) {
    ctx.save();
    if (isRight) {
      ctx.translate(24, 0);
      ctx.scale(-1, 1);
    }

    // Black sneakers with white soles
    ctx.fillStyle = INK_BLACK;
    ctx.strokeStyle = INK_BLACK;
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.roundRect(11.5 - stride, 33, 6.2, 3.8, 2);
    ctx.roundRect(6.5 + stride, 33, 6.2, 3.8, 2);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = PURE_WHITE;
    ctx.fillRect(11.5 - stride, 35.8, 6.2, 1.2);
    ctx.fillRect(6.5 + stride, 35.8, 6.2, 1.2);

    // Khaki pants
    ctx.fillStyle = '#D4B489';
    ctx.strokeStyle = INK_BLACK;
    ctx.beginPath();
    ctx.roundRect(8, 22, 8, 6, [1, 1, 2, 2]);
    ctx.fill();

    // Dark stylish jacket
    ctx.fillStyle = '#1E293B';
    ctx.beginPath();
    ctx.roundRect(7, 14.5, 10, 9, [3, 3, 1, 1]);
    ctx.fill();
    ctx.stroke();

    // Peach Face & Nose Profile
    ctx.fillStyle = PEACH_SKIN;
    ctx.strokeStyle = INK_BLACK;
    ctx.lineWidth = 1.3;
    ctx.beginPath();
    ctx.arc(12, 8, 6.8, -Math.PI * 0.4, Math.PI * 0.45, true);
    ctx.quadraticCurveTo(4.5, 8, 4, 9);
    ctx.quadraticCurveTo(3.8, 10.5, 5.2, 10.5);
    ctx.lineTo(7.5, 12);
    ctx.quadraticCurveTo(10, 15, 12, 14.8);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Eye dot
    ctx.fillStyle = INK_BLACK;
    ctx.beginPath();
    ctx.arc(8.5, 7.8, 1.1, 0, Math.PI * 2);
    ctx.fill();

    // Ari's stylish dark swept hair
    ctx.fillStyle = INK_BLACK;
    ctx.strokeStyle = INK_BLACK;
    ctx.lineWidth = 1.3;
    ctx.beginPath();
    ctx.arc(12, 6, 7.4, Math.PI * 0.8, Math.PI * 2);
    ctx.lineTo(18, 11);
    ctx.arc(16, 10, 2.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    ctx.restore();
  } else if (isUp) {
    // Up
    ctx.fillStyle = INK_BLACK;
    ctx.strokeStyle = INK_BLACK;
    ctx.lineWidth = 1.3;
    ctx.beginPath();
    ctx.roundRect(6, 33 + stride * 0.8, 5, 4, 2);
    ctx.roundRect(13, 33 - stride * 0.8, 5, 4, 2);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#D4B489';
    ctx.beginPath();
    ctx.roundRect(6, 22, 12, 6, [1, 1, 2, 2]);
    ctx.fill();

    ctx.fillStyle = '#1E293B';
    ctx.strokeStyle = INK_BLACK;
    ctx.beginPath();
    ctx.roundRect(5, 14.5, 14, 9, [3, 3, 1, 1]);
    ctx.fill();
    ctx.stroke();

    // Head back
    ctx.fillStyle = INK_BLACK;
    ctx.strokeStyle = INK_BLACK;
    ctx.lineWidth = 1.3;
    ctx.beginPath();
    ctx.arc(12, 7.5, 7.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
  } else {
    // Down
    ctx.fillStyle = INK_BLACK;
    ctx.strokeStyle = INK_BLACK;
    ctx.lineWidth = 1.3;
    ctx.beginPath();
    ctx.roundRect(6, 33 + stride * 0.8, 5.2, 4.2, 2);
    ctx.roundRect(12.8, 33 - stride * 0.8, 5.2, 4.2, 2);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = PURE_WHITE;
    ctx.fillRect(6, 36.2 + stride * 0.8, 5.2, 1.2);
    ctx.fillRect(12.8, 36.2 - stride * 0.8, 5.2, 1.2);

    ctx.fillStyle = '#D4B489';
    ctx.beginPath();
    ctx.roundRect(6, 22, 12, 6, [1, 1, 2, 2]);
    ctx.fill();

    ctx.fillStyle = '#1E293B';
    ctx.strokeStyle = INK_BLACK;
    ctx.beginPath();
    ctx.roundRect(5, 14.5, 14, 9, [3, 3, 1, 1]);
    ctx.fill();
    ctx.stroke();

    // Zipper
    ctx.strokeStyle = '#94A3B8';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(12, 14.5);
    ctx.lineTo(12, 23.5);
    ctx.stroke();

    // Face
    ctx.fillStyle = PEACH_SKIN;
    ctx.strokeStyle = INK_BLACK;
    ctx.lineWidth = 1.3;
    ctx.beginPath();
    ctx.arc(12, 8.5, 6.8, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Eyes
    ctx.fillStyle = INK_BLACK;
    ctx.beginPath();
    ctx.arc(9.2, 8, 1.2, 0, Math.PI * 2);
    ctx.arc(14.8, 8, 1.2, 0, Math.PI * 2);
    ctx.fill();

    // Smile & nose
    ctx.strokeStyle = INK_BLACK;
    ctx.lineWidth = 1.1;
    ctx.beginPath();
    ctx.arc(12, 9.8, 1.2, -Math.PI * 0.4, Math.PI * 0.5);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(12, 11.8, 2, 0.15, Math.PI - 0.15);
    ctx.stroke();

    // Ari's hairstyle
    ctx.fillStyle = INK_BLACK;
    ctx.strokeStyle = INK_BLACK;
    ctx.lineWidth = 1.3;
    ctx.beginPath();
    ctx.arc(12, 6, 7.8, Math.PI, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(7, 5.5);
    ctx.quadraticCurveTo(11, 7.5, 17, 5.5);
    ctx.stroke();
  }

  ctx.restore();
}

/* ==========================================================================
   MAIN DISPATCHER: drawCharacterSprite
   ========================================================================== */
export function drawCharacterSprite(options: DrawSpriteOptions) {
  const { ctx, characterId, direction, walkFrame, time = 0 } = options;

  switch (characterId) {
    case 'snoopy':
      drawSnoopySprite(ctx, direction, walkFrame, time);
      break;
    case 'woodstock':
      drawWoodstockSprite(ctx, direction, walkFrame, time);
      break;
    case 'charlie_brown':
      drawCharlieBrownSprite(ctx, direction, walkFrame);
      break;
    case 'lucy':
      drawLucySprite(ctx, direction, walkFrame);
      break;
    case 'linus':
      drawLinusSprite(ctx, direction, walkFrame);
      break;
    case 'sally':
      drawSallySprite(ctx, direction, walkFrame);
      break;
    case 'schroeder':
      drawSchroederSprite(ctx, direction, walkFrame);
      break;
    case 'peppermint_patty':
      drawPeppermintPattySprite(ctx, direction, walkFrame);
      break;
    case 'marcie':
      drawMarcieSprite(ctx, direction, walkFrame);
      break;
    default:
      drawCharlieBrownSprite(ctx, direction, walkFrame);
      break;
  }
}

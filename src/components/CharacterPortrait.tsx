import React from 'react';

interface CharacterPortraitProps {
  characterId: string;
  size?: number; // width & height in px
  className?: string;
  border?: boolean;
}

/**
 * Authentic Charles M. Schulz style character portraits
 * Faithfully captures the signature comic strip aesthetic:
 * rounded shapes, expressive hand-inked line quality, and iconic character traits.
 */
export const CharacterPortrait: React.FC<CharacterPortraitProps> = ({
  characterId,
  size = 56,
  className = '',
  border = true
}) => {
  const normId = (characterId || '').toLowerCase().replace(/[\s-]/g, '_');

  const renderContent = () => {
    switch (normId) {
      case 'charlie_brown':
      case 'charlie':
        return (
          <svg viewBox="0 0 100 100" className="w-full h-full">
            {/* Comic panel background */}
            <circle cx="50" cy="50" r="49" fill="#FEF9C3" />
            <circle cx="50" cy="50" r="47" fill="#FEF08A" />

            {/* Signature yellow shirt with black zigzag chevron */}
            <path d="M 16 82 C 24 70 76 70 84 82 L 88 100 L 12 100 Z" fill="#FACC15" stroke="#18181B" strokeWidth="2.8" strokeLinejoin="round" />
            {/* White/Yellow collar fold */}
            <path d="M 40 73 L 50 82 L 60 73" fill="#EAB308" stroke="#18181B" strokeWidth="2" strokeLinejoin="round" />
            {/* Iconic bold zigzag chevron stripe */}
            <polyline points="18,87 29,95 40,87 50,95 61,87 72,95 82,87" fill="none" stroke="#18181B" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" />

            {/* Neck */}
            <rect x="44" y="61" width="12" height="13" fill="#FDE68A" stroke="#18181B" strokeWidth="2.2" />

            {/* Schulz perfectly round head */}
            <circle cx="50" cy="39" r="28" fill="#FDE68A" stroke="#18181B" strokeWidth="2.8" />

            {/* Authentic Schulz ears with inner curve */}
            <path d="M 22 37 C 17 37 17 44 22 45" fill="#FDE68A" stroke="#18181B" strokeWidth="2.5" />
            <path d="M 21 40 C 19 40 19 42 21 43" fill="none" stroke="#18181B" strokeWidth="1.8" />

            <path d="M 78 37 C 83 37 83 44 78 45" fill="#FDE68A" stroke="#18181B" strokeWidth="2.5" />
            <path d="M 79 40 C 81 40 81 42 79 43" fill="none" stroke="#18181B" strokeWidth="1.8" />

            {/* Classic Schulz "C" loop nose */}
            <path d="M 47 41 C 47 44 53 44 53 41" fill="none" stroke="#18181B" strokeWidth="2.6" strokeLinecap="round" />

            {/* Thoughtful, kind Peanuts dot eyes */}
            <ellipse cx="39" cy="35" rx="2.8" ry="3.8" fill="#18181B" />
            <ellipse cx="61" cy="35" rx="2.8" ry="3.8" fill="#18181B" />

            {/* Gentle curved Schulz eyebrows */}
            <path d="M 34 26 Q 39 21 44 25" fill="none" stroke="#18181B" strokeWidth="2.4" strokeLinecap="round" />
            <path d="M 56 25 Q 61 21 66 26" fill="none" stroke="#18181B" strokeWidth="2.4" strokeLinecap="round" />

            {/* Characteristic Schulz smile with sweet dimple */}
            <path d="M 43 51 Q 50 56 57 51" fill="none" stroke="#18181B" strokeWidth="2.6" strokeLinecap="round" />
            <path d="M 57 50 Q 58.5 52 57.5 53.5" fill="none" stroke="#18181B" strokeWidth="1.8" strokeLinecap="round" />

            {/* The legendary single curl of hair in front */}
            <path d="M 49 13 C 55 10 56 18 50 18 C 45 18 46 11 51 11" fill="none" stroke="#18181B" strokeWidth="3" strokeLinecap="round" />
            {/* Subtle Schulz hair wisps behind ears */}
            <path d="M 23 31 C 21 28 22 24 24 23" fill="none" stroke="#18181B" strokeWidth="2.2" strokeLinecap="round" />
            <path d="M 77 31 C 79 28 78 24 76 23" fill="none" stroke="#18181B" strokeWidth="2.2" strokeLinecap="round" />
          </svg>
        );

      case 'lucy':
      case 'lucy_van_pelt':
        return (
          <svg viewBox="0 0 100 100" className="w-full h-full">
            {/* Comic panel background - Schulz cool pastel blue */}
            <circle cx="50" cy="50" r="49" fill="#E0F2FE" />
            <circle cx="50" cy="50" r="47" fill="#BAE6FD" />

            {/* Royal blue dress with shoulder curves */}
            <path d="M 16 82 C 24 70 76 70 84 82 L 88 100 L 12 100 Z" fill="#2563EB" stroke="#18181B" strokeWidth="2.8" strokeLinejoin="round" />
            {/* Peter Pan white collar */}
            <path d="M 35 72 C 41 78 49 77 50 73 C 51 77 59 78 65 72 C 67 79 33 79 35 72 Z" fill="#FFFFFF" stroke="#18181B" strokeWidth="2.2" strokeLinejoin="round" />

            {/* Neck */}
            <rect x="44" y="60" width="12" height="14" fill="#FDE68A" stroke="#18181B" strokeWidth="2.2" />

            {/* AUTHENTIC SCHULZ LUCY HAIR (Back volume with scalloped outer edges) */}
            <path
              d="M 50 11 
                 C 33 11 20 22 17 35 
                 C 13 41 14 50 19 56 
                 C 21 59 26 62 31 63
                 L 69 63
                 C 74 62 79 59 81 56
                 C 86 50 87 41 83 35
                 C 80 22 67 11 50 11 Z"
              fill="#18181B"
              stroke="#18181B"
              strokeWidth="2.5"
            />
            {/* Scalloped side curls framing the cheeks */}
            <path d="M 16 33 C 11 36 11 44 16 47 C 11 50 12 58 18 60" fill="#18181B" stroke="#18181B" strokeWidth="2" />
            <path d="M 84 33 C 89 36 89 44 84 47 C 89 50 88 58 82 60" fill="#18181B" stroke="#18181B" strokeWidth="2" />

            {/* Head */}
            <circle cx="50" cy="40" r="26" fill="#FDE68A" stroke="#18181B" strokeWidth="2.8" />

            {/* Schulz Lucy Front Bangs (Iconic scalloped forehead wave curls) */}
            <path
              d="M 24 33 
                 C 28 20 38 21 44 26 
                 C 49 19 59 19 65 24 
                 C 70 20 77 24 76 34
                 C 71 31 64 29 58 31
                 C 51 28 43 28 37 32
                 C 32 35 27 35 24 33 Z"
              fill="#18181B"
              stroke="#18181B"
              strokeWidth="2"
            />

            {/* Ears */}
            <path d="M 24 39 C 20 39 20 45 24 46" fill="#FDE68A" stroke="#18181B" strokeWidth="2.4" />
            <path d="M 76 39 C 80 39 80 45 76 46" fill="#FDE68A" stroke="#18181B" strokeWidth="2.4" />

            {/* Arched confident Schulz eyebrows */}
            <path d="M 33 28 Q 40 22 46 27" fill="none" stroke="#18181B" strokeWidth="2.8" strokeLinecap="round" />
            <path d="M 54 27 Q 60 22 67 28" fill="none" stroke="#18181B" strokeWidth="2.8" strokeLinecap="round" />

            {/* Big expressive Schulz eyes with upper eyelashes */}
            <ellipse cx="40" cy="37" rx="3.6" ry="4.8" fill="#18181B" />
            <ellipse cx="60" cy="37" rx="3.6" ry="4.8" fill="#18181B" />
            {/* White catchlight dots */}
            <circle cx="39" cy="35.5" r="1.3" fill="#FFFFFF" />
            <circle cx="59" cy="35.5" r="1.3" fill="#FFFFFF" />

            {/* Signature Lucy eyelashes (curved outwards) */}
            <path d="M 34 34 Q 31 32 29 32" fill="none" stroke="#18181B" strokeWidth="2" strokeLinecap="round" />
            <path d="M 35 32 Q 33 29 32 28" fill="none" stroke="#18181B" strokeWidth="2" strokeLinecap="round" />
            <path d="M 66 34 Q 69 32 71 32" fill="none" stroke="#18181B" strokeWidth="2" strokeLinecap="round" />
            <path d="M 65 32 Q 67 29 68 28" fill="none" stroke="#18181B" strokeWidth="2" strokeLinecap="round" />

            {/* Peanuts "C" curve nose */}
            <path d="M 47 43 C 47 46 53 46 53 43" fill="none" stroke="#18181B" strokeWidth="2.5" strokeLinecap="round" />

            {/* Sassy, confident Lucy smile */}
            <path d="M 41 51 Q 50 58 59 51" fill="none" stroke="#18181B" strokeWidth="2.8" strokeLinecap="round" />
            <path d="M 59 50 Q 61 52 59.5 54" fill="none" stroke="#18181B" strokeWidth="2" strokeLinecap="round" />
          </svg>
        );

      case 'linus':
      case 'linus_van_pelt':
        return (
          <svg viewBox="0 0 100 100" className="w-full h-full">
            {/* Comic panel background - soft peach */}
            <circle cx="50" cy="50" r="49" fill="#FFE4E6" />
            <circle cx="50" cy="50" r="47" fill="#FECDD3" />

            {/* Red striped polo */}
            <path d="M 16 82 C 24 70 76 70 84 82 L 88 100 L 12 100 Z" fill="#EF4444" stroke="#18181B" strokeWidth="2.8" strokeLinejoin="round" />
            <line x1="20" y1="87" x2="80" y2="87" stroke="#18181B" strokeWidth="4.5" />
            <line x1="16" y1="96" x2="84" y2="96" stroke="#18181B" strokeWidth="4.5" />

            {/* Sky-Blue Security Blanket held affectionately to cheek */}
            <path d="M 60 62 C 70 58 84 66 84 84 C 84 94 74 100 66 100 L 56 100 C 58 86 52 74 60 62 Z" fill="#7DD3FC" stroke="#18181B" strokeWidth="2.5" strokeLinejoin="round" />
            {/* Blanket fold lines */}
            <path d="M 64 68 Q 72 74 74 88" fill="none" stroke="#38BDF8" strokeWidth="2" />
            {/* Linus hand clutching blanket */}
            <circle cx="62" cy="68" r="5" fill="#FDE68A" stroke="#18181B" strokeWidth="2" />

            {/* Neck */}
            <rect x="44" y="60" width="12" height="14" fill="#FDE68A" stroke="#18181B" strokeWidth="2.2" />

            {/* Head */}
            <circle cx="50" cy="39" r="27" fill="#FDE68A" stroke="#18181B" strokeWidth="2.8" />

            {/* Ears */}
            <path d="M 23 37 C 18 37 18 44 23 45" fill="#FDE68A" stroke="#18181B" strokeWidth="2.5" />
            <path d="M 77 37 C 82 37 82 44 77 45" fill="#FDE68A" stroke="#18181B" strokeWidth="2.5" />

            {/* Thoughtful, kind eyes */}
            <ellipse cx="39" cy="36" rx="2.8" ry="3.8" fill="#18181B" />
            <ellipse cx="61" cy="36" rx="2.8" ry="3.8" fill="#18181B" />

            {/* Gentle, philosophical eyebrows */}
            <path d="M 34 27 Q 39 23 44 27" fill="none" stroke="#18181B" strokeWidth="2.4" strokeLinecap="round" />
            <path d="M 56 27 Q 61 23 66 27" fill="none" stroke="#18181B" strokeWidth="2.4" strokeLinecap="round" />

            {/* Nose */}
            <path d="M 47 42 C 47 45 53 45 53 42" fill="none" stroke="#18181B" strokeWidth="2.5" strokeLinecap="round" />

            {/* Sweet philosophical smile */}
            <path d="M 43 51 Q 50 55 57 51" fill="none" stroke="#18181B" strokeWidth="2.6" strokeLinecap="round" />

            {/* AUTHENTIC SCHULZ LINUS HAIR: Distinctive scattered wisps/spikes of brown hair */}
            <path d="M 33 14 L 28 5" stroke="#18181B" strokeWidth="3.2" strokeLinecap="round" />
            <path d="M 39 12 L 36 2" stroke="#18181B" strokeWidth="3.2" strokeLinecap="round" />
            <path d="M 46 11 L 46 1" stroke="#18181B" strokeWidth="3.2" strokeLinecap="round" />
            <path d="M 53 11 L 55 2" stroke="#18181B" strokeWidth="3.2" strokeLinecap="round" />
            <path d="M 60 12 L 64 4" stroke="#18181B" strokeWidth="3.2" strokeLinecap="round" />
            <path d="M 66 15 L 72 7" stroke="#18181B" strokeWidth="3.2" strokeLinecap="round" />
          </svg>
        );

      case 'snoopy':
        return (
          <svg viewBox="0 0 100 100" className="w-full h-full">
            {/* Comic panel background - Sky blue */}
            <circle cx="50" cy="50" r="49" fill="#F0F9FF" />
            <circle cx="50" cy="50" r="47" fill="#E0F2FE" />

            {/* Red Collar with Gold Medallion */}
            <path d="M 28 72 Q 48 78 68 72 L 68 79 Q 48 85 28 79 Z" fill="#DC2626" stroke="#18181B" strokeWidth="2" strokeLinejoin="round" />
            <circle cx="48" cy="83" r="4" fill="#FACC15" stroke="#18181B" strokeWidth="1.8" />

            {/* White Body / Chest */}
            <path d="M 28 74 Q 48 70 68 74 L 74 100 L 22 100 Z" fill="#FFFFFF" stroke="#18181B" strokeWidth="2.8" strokeLinejoin="round" />

            {/* Authentic Schulz Snoopy Ear (Floppy black beagle ear in back) */}
            <path
              d="M 24 30 
                 C 10 38 12 58 24 60 
                 C 32 61 36 46 28 32 Z"
              fill="#18181B"
              stroke="#18181B"
              strokeWidth="2.2"
              strokeLinejoin="round"
            />

            {/* Schulz Snoopy Head & Rounded Snout Profile */}
            <path
              d="M 30 40 
                 C 30 22 52 18 64 27 
                 C 72 33 86 36 86 46 
                 C 86 54 75 58 60 56 
                 C 46 56 32 52 30 40 Z"
              fill="#FFFFFF"
              stroke="#18181B"
              strokeWidth="2.8"
              strokeLinejoin="round"
            />

            {/* Shiny Black Button Nose */}
            <ellipse cx="86" cy="45" rx="5.5" ry="6.5" fill="#18181B" />
            <ellipse cx="84.5" cy="43" rx="1.5" ry="2.2" fill="#FFFFFF" />

            {/* Happy curved Schulz eye */}
            <path d="M 50 32 Q 55 27 60 32" fill="none" stroke="#18181B" strokeWidth="3.2" strokeLinecap="round" />

            {/* Snoopy's Joyful Comic Smile with Cheek Crease */}
            <path d="M 54 46 Q 64 52 74 46" fill="none" stroke="#18181B" strokeWidth="2.8" strokeLinecap="round" />
            <path d="M 74 45 Q 76 46.5 75 48" fill="none" stroke="#18181B" strokeWidth="2" strokeLinecap="round" />
          </svg>
        );

      case 'sally':
      case 'sally_brown':
        return (
          <svg viewBox="0 0 100 100" className="w-full h-full">
            {/* Comic panel background - warm pink */}
            <circle cx="50" cy="50" r="49" fill="#FDF2F8" />
            <circle cx="50" cy="50" r="47" fill="#FCE7F3" />

            {/* Pink Dress with Black Polka Dots */}
            <path d="M 16 82 C 24 70 76 70 84 82 L 88 100 L 12 100 Z" fill="#F472B6" stroke="#18181B" strokeWidth="2.8" strokeLinejoin="round" />
            <circle cx="30" cy="89" r="3" fill="#18181B" />
            <circle cx="50" cy="87" r="3" fill="#18181B" />
            <circle cx="70" cy="89" r="3" fill="#18181B" />
            <circle cx="40" cy="97" r="3" fill="#18181B" />
            <circle cx="60" cy="97" r="3" fill="#18181B" />

            {/* White Collar */}
            <path d="M 36 71 C 42 77 58 77 64 71 C 68 77 32 77 36 71 Z" fill="#FFFFFF" stroke="#18181B" strokeWidth="2.2" strokeLinejoin="round" />

            {/* Neck */}
            <rect x="44" y="60" width="12" height="14" fill="#FDE68A" stroke="#18181B" strokeWidth="2.2" />

            {/* AUTHENTIC SCHULZ SALLY HAIR: Flipped blonde curls behind */}
            <path
              d="M 50 14 
                 C 28 14 18 24 16 38 
                 C 14 50 20 62 30 64 
                 L 70 64 
                 C 80 62 86 50 84 38 
                 C 82 24 72 14 50 14 Z"
              fill="#FDE047"
              stroke="#18181B"
              strokeWidth="2.6"
            />
            {/* Flipped side wings */}
            <circle cx="17" cy="46" r="9" fill="#FDE047" stroke="#18181B" strokeWidth="2.2" />
            <circle cx="83" cy="46" r="9" fill="#FDE047" stroke="#18181B" strokeWidth="2.2" />

            {/* Head */}
            <circle cx="50" cy="40" r="26" fill="#FDE68A" stroke="#18181B" strokeWidth="2.8" />

            {/* Hair bangs curls */}
            <path d="M 26 28 C 34 18 48 20 52 24 C 56 18 70 20 74 27 C 66 31 46 27 26 28 Z" fill="#FDE047" stroke="#18181B" strokeWidth="2.2" />

            {/* Iconic Hair Flower Bow */}
            <circle cx="75" cy="21" r="6" fill="#F59E0B" stroke="#18181B" strokeWidth="2" />
            <circle cx="75" cy="21" r="2.5" fill="#DC2626" />

            {/* Sweet eyes */}
            <ellipse cx="39" cy="37" rx="3.2" ry="4.2" fill="#18181B" />
            <ellipse cx="61" cy="37" rx="3.2" ry="4.2" fill="#18181B" />
            <circle cx="38.5" cy="35.5" r="1.1" fill="#FFFFFF" />
            <circle cx="60.5" cy="35.5" r="1.1" fill="#FFFFFF" />

            {/* Eyebrows */}
            <path d="M 34 28 Q 39 24 44 28" fill="none" stroke="#18181B" strokeWidth="2.2" strokeLinecap="round" />
            <path d="M 56 28 Q 61 24 66 28" fill="none" stroke="#18181B" strokeWidth="2.2" strokeLinecap="round" />

            {/* Nose */}
            <path d="M 47 43 C 47 46 53 46 53 43" fill="none" stroke="#18181B" strokeWidth="2.4" strokeLinecap="round" />

            {/* Playful Cheerful Smile */}
            <path d="M 42 51 Q 50 57 58 51" fill="none" stroke="#18181B" strokeWidth="2.6" strokeLinecap="round" />
          </svg>
        );

      case 'schroeder':
        return (
          <svg viewBox="0 0 100 100" className="w-full h-full">
            {/* Lavender background */}
            <circle cx="50" cy="50" r="49" fill="#F5F3FF" />
            <circle cx="50" cy="50" r="47" fill="#EDE9FE" />

            {/* Purple Striped Sweater */}
            <path d="M 16 82 C 24 70 76 70 84 82 L 88 100 L 12 100 Z" fill="#6366F1" stroke="#18181B" strokeWidth="2.8" strokeLinejoin="round" />
            <line x1="20" y1="87" x2="80" y2="87" stroke="#312E81" strokeWidth="4.5" />
            <line x1="16" y1="96" x2="84" y2="96" stroke="#312E81" strokeWidth="4.5" />

            {/* Neck */}
            <rect x="44" y="60" width="12" height="14" fill="#FDE68A" stroke="#18181B" strokeWidth="2.2" />

            {/* Head */}
            <circle cx="50" cy="40" r="26" fill="#FDE68A" stroke="#18181B" strokeWidth="2.8" />

            {/* Swept Blonde Hair with Neat Part */}
            <path d="M 23 32 C 23 15 77 15 77 32 C 68 19 32 19 23 32 Z" fill="#FACC15" stroke="#18181B" strokeWidth="2.6" strokeLinejoin="round" />
            <path d="M 46 17 Q 52 25 50 32" stroke="#18181B" strokeWidth="2.2" fill="none" />

            {/* Ears */}
            <path d="M 23 39 C 19 39 19 44 23 45" fill="#FDE68A" stroke="#18181B" strokeWidth="2.4" />
            <path d="M 77 39 C 81 39 81 44 77 45" fill="#FDE68A" stroke="#18181B" strokeWidth="2.4" />

            {/* Focused Artistic Eyes */}
            <ellipse cx="39" cy="37" rx="2.8" ry="3.8" fill="#18181B" />
            <ellipse cx="61" cy="37" rx="2.8" ry="3.8" fill="#18181B" />
            <path d="M 34 28 Q 39 25 44 29" fill="none" stroke="#18181B" strokeWidth="2.4" strokeLinecap="round" />
            <path d="M 56 29 Q 61 25 66 28" fill="none" stroke="#18181B" strokeWidth="2.4" strokeLinecap="round" />

            {/* Nose */}
            <path d="M 47 43 C 47 46 53 46 53 43" fill="none" stroke="#18181B" strokeWidth="2.4" strokeLinecap="round" />

            {/* Composed artistic calm smile */}
            <path d="M 43 51 Q 50 55 57 51" fill="none" stroke="#18181B" strokeWidth="2.6" strokeLinecap="round" />

            {/* Floating musical note */}
            <path d="M 80 20 L 85 16 L 85 26 M 80 26 A 2.5 2 0 1 1 80 22 A 2.5 2 0 1 1 80 26" fill="#4F46E5" stroke="#18181B" strokeWidth="1.2" />
          </svg>
        );

      case 'peppermint_patty':
        return (
          <svg viewBox="0 0 100 100" className="w-full h-full">
            {/* Mint green background */}
            <circle cx="50" cy="50" r="49" fill="#F0FDF4" />
            <circle cx="50" cy="50" r="47" fill="#DCFCE7" />

            {/* Green Polo Shirt with Pinstripes */}
            <path d="M 16 82 C 24 70 76 70 84 82 L 88 100 L 12 100 Z" fill="#16A34A" stroke="#18181B" strokeWidth="2.8" strokeLinejoin="round" />
            <line x1="40" y1="74" x2="40" y2="100" stroke="#FFFFFF" strokeWidth="2.5" />
            <line x1="50" y1="74" x2="50" y2="100" stroke="#FFFFFF" strokeWidth="2.5" />
            <line x1="60" y1="74" x2="60" y2="100" stroke="#FFFFFF" strokeWidth="2.5" />

            {/* Neck */}
            <rect x="44" y="60" width="12" height="14" fill="#FDE68A" stroke="#18181B" strokeWidth="2.2" />

            {/* Chin-length Layered Auburn Hair */}
            <path d="M 22 36 C 22 14 78 14 78 36 L 83 60 L 74 54 L 72 38 L 28 38 L 26 54 L 17 60 Z" fill="#9A3412" stroke="#18181B" strokeWidth="2.6" strokeLinejoin="round" />

            {/* Head */}
            <circle cx="50" cy="40" r="26" fill="#FDE68A" stroke="#18181B" strokeWidth="2.8" />

            {/* Energetic Sporty Eyes */}
            <ellipse cx="39" cy="36" rx="3.4" ry="4.2" fill="#18181B" />
            <ellipse cx="61" cy="36" rx="3.4" ry="4.2" fill="#18181B" />
            <circle cx="38" cy="34.5" r="1.1" fill="#FFFFFF" />
            <circle cx="60" cy="34.5" r="1.1" fill="#FFFFFF" />

            {/* Bold Sporty Eyebrows */}
            <path d="M 33 27 Q 40 23 46 28" fill="none" stroke="#18181B" strokeWidth="2.6" strokeLinecap="round" />
            <path d="M 54 28 Q 60 23 67 27" fill="none" stroke="#18181B" strokeWidth="2.6" strokeLinecap="round" />

            {/* Iconic Freckles! */}
            <circle cx="42" cy="44" r="1.4" fill="#9A3412" />
            <circle cx="45" cy="46" r="1.4" fill="#9A3412" />
            <circle cx="55" cy="46" r="1.4" fill="#9A3412" />
            <circle cx="58" cy="44" r="1.4" fill="#9A3412" />

            {/* Nose */}
            <path d="M 47 43 C 47 46 53 46 53 43" fill="none" stroke="#18181B" strokeWidth="2.5" strokeLinecap="round" />

            {/* Energetic Friendly Grin */}
            <path d="M 41 51 Q 50 59 59 51" fill="none" stroke="#18181B" strokeWidth="2.8" strokeLinecap="round" />
          </svg>
        );

      case 'marcie':
        return (
          <svg viewBox="0 0 100 100" className="w-full h-full">
            {/* Soft cream background */}
            <circle cx="50" cy="50" r="49" fill="#FFF7ED" />
            <circle cx="50" cy="50" r="47" fill="#FFEDD5" />

            {/* Orange Turtleneck Sweater */}
            <path d="M 16 82 C 24 70 76 70 84 82 L 88 100 L 12 100 Z" fill="#EA580C" stroke="#18181B" strokeWidth="2.8" strokeLinejoin="round" />
            <rect x="39" y="67" width="22" height="10" rx="3" fill="#C2410C" stroke="#18181B" strokeWidth="2.2" />

            {/* Neck */}
            <rect x="44" y="60" width="12" height="14" fill="#FDE68A" stroke="#18181B" strokeWidth="2.2" />

            {/* Dark Pageboy Bob Hair */}
            <ellipse cx="50" cy="38" rx="33" ry="30" fill="#18181B" stroke="#18181B" strokeWidth="2.5" />
            <rect x="19" y="32" width="12" height="28" rx="4" fill="#18181B" />
            <rect x="69" y="32" width="12" height="28" rx="4" fill="#18181B" />

            {/* Head */}
            <circle cx="50" cy="40" r="26" fill="#FDE68A" stroke="#18181B" strokeWidth="2.8" />

            {/* Bangs across forehead */}
            <path d="M 23 30 C 35 22 65 22 77 30 L 75 36 C 63 28 37 28 25 36 Z" fill="#18181B" />

            {/* Polite eyebrows */}
            <path d="M 33 25 Q 40 22 45 25" fill="none" stroke="#18181B" strokeWidth="2.2" strokeLinecap="round" />
            <path d="M 55 25 Q 60 22 67 25" fill="none" stroke="#18181B" strokeWidth="2.2" strokeLinecap="round" />

            {/* Iconic Round Gold Spectacles with Glare & Eyes Behind */}
            <circle cx="39" cy="38" r="11.5" fill="rgba(255, 255, 255, 0.9)" stroke="#EAB308" strokeWidth="3" />
            <circle cx="61" cy="38" r="11.5" fill="rgba(255, 255, 255, 0.9)" stroke="#EAB308" strokeWidth="3" />
            <line x1="50.5" y1="38" x2="50.5" y2="38" stroke="#EAB308" strokeWidth="3" />

            {/* Eyes behind glass */}
            <circle cx="39" cy="38" r="2.8" fill="#18181B" />
            <circle cx="61" cy="38" r="2.8" fill="#18181B" />
            {/* Signature Glass Glare Streaks */}
            <line x1="33" y1="32" x2="41" y2="44" stroke="#FFFFFF" strokeWidth="2.5" strokeLinecap="round" />
            <line x1="55" y1="32" x2="63" y2="44" stroke="#FFFFFF" strokeWidth="2.5" strokeLinecap="round" />

            {/* Nose */}
            <path d="M 48 45 C 48 47 52 47 52 45" fill="none" stroke="#18181B" strokeWidth="2.2" strokeLinecap="round" />

            {/* Polite, respectful smile */}
            <path d="M 44 52 Q 50 56 56 52" fill="none" stroke="#18181B" strokeWidth="2.4" strokeLinecap="round" />
          </svg>
        );

      case 'woodstock':
        return (
          <svg viewBox="0 0 100 100" className="w-full h-full">
            {/* Pale yellow sunburst */}
            <circle cx="50" cy="50" r="49" fill="#FFFBEB" />
            <circle cx="50" cy="50" r="47" fill="#FEF3C7" />

            {/* Spiky Tuft Feathers */}
            <path d="M 46 20 L 40 6 M 52 18 L 52 4 M 58 20 L 64 8" stroke="#18181B" strokeWidth="3.2" strokeLinecap="round" />
            <path d="M 46 20 L 40 6 M 52 18 L 52 4 M 58 20 L 64 8" stroke="#FACC15" strokeWidth="2" strokeLinecap="round" />

            {/* Round Yellow Bird Head */}
            <circle cx="50" cy="34" r="18" fill="#FACC15" stroke="#18181B" strokeWidth="2.6" />

            {/* Orange Pointed Beak */}
            <polygon points="64,30 84,36 64,42" fill="#F97316" stroke="#18181B" strokeWidth="2.2" strokeLinejoin="round" />

            {/* Cheerful Black Eye with Catchlight */}
            <circle cx="54" cy="30" r="3.5" fill="#18181B" />
            <circle cx="53" cy="28.5" r="1.2" fill="#FFFFFF" />

            {/* Tiny Bird Body & Flapping Wing */}
            <ellipse cx="44" cy="58" rx="17" ry="15" fill="#FACC15" stroke="#18181B" strokeWidth="2.6" />
            <ellipse cx="38" cy="56" rx="10" ry="7" fill="#F59E0B" stroke="#18181B" strokeWidth="2" transform="rotate(-20 38 56)" />

            {/* Little bird legs */}
            <line x1="42" y1="73" x2="40" y2="84" stroke="#18181B" strokeWidth="2.2" />
            <line x1="48" y1="73" x2="50" y2="84" stroke="#18181B" strokeWidth="2.2" />
          </svg>
        );

      case 'franklin':
        return (
          <svg viewBox="0 0 100 100" className="w-full h-full">
            <circle cx="50" cy="50" r="49" fill="#E0F2FE" />
            <circle cx="50" cy="50" r="47" fill="#BAE6FD" />
            {/* Sky blue polo */}
            <path d="M 16 82 C 24 70 76 70 84 82 L 88 100 L 12 100 Z" fill="#38BDF8" stroke="#18181B" strokeWidth="2.8" strokeLinejoin="round" />
            <path d="M 40 73 L 50 82 L 60 73" fill="#FFFFFF" stroke="#18181B" strokeWidth="2" strokeLinejoin="round" />
            {/* Neck */}
            <rect x="44" y="61" width="12" height="13" fill="#854D0E" stroke="#18181B" strokeWidth="2.2" />
            {/* Head */}
            <circle cx="50" cy="39" r="28" fill="#854D0E" stroke="#18181B" strokeWidth="2.8" />
            {/* Textured curly black hair */}
            <path d="M 23 35 C 20 18 80 18 77 35 C 72 22 28 22 23 35 Z" fill="#18181B" />
            <circle cx="28" cy="22" r="6" fill="#18181B" />
            <circle cx="39" cy="18" r="6.5" fill="#18181B" />
            <circle cx="50" cy="16" r="7" fill="#18181B" />
            <circle cx="61" cy="18" r="6.5" fill="#18181B" />
            <circle cx="72" cy="22" r="6" fill="#18181B" />
            {/* Ears */}
            <path d="M 22 37 C 17 37 17 44 22 45" fill="#854D0E" stroke="#18181B" strokeWidth="2.5" />
            <path d="M 78 37 C 83 37 83 44 78 45" fill="#854D0E" stroke="#18181B" strokeWidth="2.5" />
            {/* Nose */}
            <path d="M 47 41 C 47 44 53 44 53 41" fill="none" stroke="#18181B" strokeWidth="2.6" strokeLinecap="round" />
            {/* Eyes */}
            <ellipse cx="39" cy="35" rx="2.8" ry="3.8" fill="#18181B" />
            <ellipse cx="61" cy="35" rx="2.8" ry="3.8" fill="#18181B" />
            {/* Eyebrows */}
            <path d="M 34 26 Q 39 21 44 25" fill="none" stroke="#18181B" strokeWidth="2.4" strokeLinecap="round" />
            <path d="M 56 25 Q 61 21 66 26" fill="none" stroke="#18181B" strokeWidth="2.4" strokeLinecap="round" />
            {/* Smile */}
            <path d="M 42 51 Q 50 56 58 51" fill="none" stroke="#18181B" strokeWidth="2.6" strokeLinecap="round" />
          </svg>
        );

      case 'pig_pen':
      case 'pigpen':
        return (
          <svg viewBox="0 0 100 100" className="w-full h-full">
            <circle cx="50" cy="50" r="49" fill="#FEF3C7" />
            <circle cx="50" cy="50" r="47" fill="#FDE68A" />
            {/* Dust cloud motes */}
            <circle cx="18" cy="25" r="3.5" fill="#B45309" opacity="0.4" />
            <circle cx="82" cy="30" r="4.0" fill="#B45309" opacity="0.35" />
            <circle cx="22" cy="70" r="3.0" fill="#78350F" opacity="0.45" />
            <circle cx="80" cy="65" r="3.8" fill="#78350F" opacity="0.4" />
            {/* Dusty shirt */}
            <path d="M 16 82 C 24 70 76 70 84 82 L 88 100 L 12 100 Z" fill="#D6D3D1" stroke="#18181B" strokeWidth="2.8" strokeLinejoin="round" />
            {/* Dirt smudges on shirt */}
            <circle cx="35" cy="88" r="4.5" fill="#78350F" opacity="0.6" />
            <circle cx="68" cy="85" r="3.5" fill="#78350F" opacity="0.5" />
            {/* Neck */}
            <rect x="44" y="61" width="12" height="13" fill="#FDE68A" stroke="#18181B" strokeWidth="2.2" />
            {/* Head */}
            <circle cx="50" cy="39" r="28" fill="#FDE68A" stroke="#18181B" strokeWidth="2.8" />
            {/* Cheek smudges */}
            <circle cx="34" cy="45" r="3.2" fill="#78350F" opacity="0.55" />
            <circle cx="67" cy="43" r="2.8" fill="#78350F" opacity="0.5" />
            {/* Tousled spiky brown hair */}
            <path d="M 22 36 L 18 24 L 28 26 L 34 16 L 42 22 L 50 14 L 58 22 L 66 16 L 72 26 L 82 24 L 78 36 Z" fill="#713F12" stroke="#18181B" strokeWidth="2.6" strokeLinejoin="round" />
            {/* Nose */}
            <path d="M 47 41 C 47 44 53 44 53 41" fill="none" stroke="#18181B" strokeWidth="2.6" strokeLinecap="round" />
            {/* Eyes */}
            <ellipse cx="39" cy="35" rx="2.8" ry="3.8" fill="#18181B" />
            <ellipse cx="61" cy="35" rx="2.8" ry="3.8" fill="#18181B" />
            {/* Smile */}
            <path d="M 42 51 Q 50 56 58 51" fill="none" stroke="#18181B" strokeWidth="2.6" strokeLinecap="round" />
          </svg>
        );

      case 'ari':
      default:
        // Ari - The player character: Long flowing dark hair, black hoodie, warm friendly face
        return (
          <svg viewBox="0 0 100 100" className="w-full h-full">
            {/* Warm amber background */}
            <circle cx="50" cy="50" r="49" fill="#FFFBEB" />
            <circle cx="50" cy="50" r="47" fill="#FEF3C7" />

            {/* Black Hoodie & Zipper */}
            <path d="M 16 82 C 24 70 76 70 84 82 L 88 100 L 12 100 Z" fill="#18181B" stroke="#18181B" strokeWidth="2.8" strokeLinejoin="round" />
            <line x1="50" y1="74" x2="50" y2="100" stroke="#E4E4E7" strokeWidth="2.5" />

            {/* Neck */}
            <rect x="44" y="60" width="12" height="14" fill="#FDE68A" stroke="#18181B" strokeWidth="2.2" />

            {/* Long Wavy Black Hair Cascading Behind & Shoulders */}
            <ellipse cx="50" cy="38" rx="34" ry="34" fill="#18181B" stroke="#18181B" strokeWidth="2" />
            <path d="M 17 38 C 15 52 21 68 27 74 C 31 64 25 50 27 38 Z" fill="#18181B" />
            <path d="M 83 38 C 85 52 79 68 73 74 C 69 64 75 50 73 38 Z" fill="#18181B" />

            {/* Head */}
            <circle cx="50" cy="40" r="26" fill="#FDE68A" stroke="#18181B" strokeWidth="2.8" />

            {/* Stylish Bangs Fringe */}
            <path d="M 24 30 C 32 20 46 24 50 20 C 54 24 68 20 76 30 C 67 24 53 26 50 23 C 47 26 33 24 24 30 Z" fill="#18181B" />

            {/* Expressive Warm Eyes */}
            <ellipse cx="39" cy="37" rx="3.6" ry="4.5" fill="#18181B" />
            <ellipse cx="61" cy="37" rx="3.6" ry="4.5" fill="#18181B" />
            <circle cx="38" cy="35.5" r="1.3" fill="#FFFFFF" />
            <circle cx="60" cy="35.5" r="1.3" fill="#FFFFFF" />

            {/* Arched Friendly Eyebrows */}
            <path d="M 33 27 Q 39 23 45 27" fill="none" stroke="#18181B" strokeWidth="2.5" strokeLinecap="round" />
            <path d="M 55 27 Q 61 23 67 27" fill="none" stroke="#18181B" strokeWidth="2.5" strokeLinecap="round" />

            {/* Nose */}
            <path d="M 47 43 C 47 46 53 46 53 43" fill="none" stroke="#18181B" strokeWidth="2.4" strokeLinecap="round" />

            {/* Warm, genuine smile */}
            <path d="M 42 51 Q 50 57 58 51" fill="none" stroke="#18181B" strokeWidth="2.6" strokeLinecap="round" />
          </svg>
        );
    }
  };

  return (
    <div
      style={{ width: size, height: size }}
      className={`shrink-0 rounded-full overflow-hidden bg-amber-50 ${
        border ? 'border-2 border-stone-900 shadow-md ring-2 ring-amber-400/60' : ''
      } ${className}`}
    >
      {renderContent()}
    </div>
  );
};

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { LocationId, LocationData, TimeOfDay, Position, InteractiveTrigger, CharacterNpc, SaveSlot } from './types';
import { LOCATIONS_DATA } from './data/neighborhoodData';
import { getActiveCharactersForTime } from './data/charactersData';
import {
  formatInGameClock,
  getDayPhaseFromMinutes,
  getMinutesForTimeOfDay,
  getActiveSession,
  saveActiveSession
} from './utils/saveManager';
import { sound } from './utils/audio';

import { GameCanvas } from './components/GameCanvas';
import { ControlOverlay } from './components/ControlOverlay';
import { NotebookModal } from './components/NotebookModal';
import { ThinkingWallModal } from './components/ThinkingWallModal';
import { LucyBoothModal } from './components/LucyBoothModal';
import { SchroederPianoModal } from './components/SchroederPianoModal';
import { WorldMapModal } from './components/WorldMapModal';
import { SaveLoadModal } from './components/SaveLoadModal';
import { DialogueBox, DialogueMessageItem } from './components/DialogueBox';
import { BaseballModal } from './components/BaseballModal';
import { SkatingModal } from './components/SkatingModal';
import { PumpkinPatchModal } from './components/PumpkinPatchModal';
import { AiConfigModal } from './components/AiConfigModal';
import { getAiConfig, getAiHeaders, AiConfig } from './utils/aiConfig';
import { getContextualReply } from './utils/peanutsDialogueEngine';
import { updateNpcSimulation } from './utils/npcSimulation';

// Map for exiting any interior or sub-area directly to its corresponding front door
const EXIT_DESTINATIONS: Record<string, { locationId: LocationId; pos: Position }> = {
  house_ari: { locationId: 'neighborhood', pos: { x: 170, y: 295 } },
  house_charlie_brown: { locationId: 'neighborhood', pos: { x: 450, y: 290 } },
  doghouse_interior: { locationId: 'neighborhood', pos: { x: 350, y: 265 } },
  house_van_pelt: { locationId: 'neighborhood', pos: { x: 745, y: 290 } },
  house_schroeder: { locationId: 'neighborhood', pos: { x: 980, y: 290 } },
  house_peppermint_patty: { locationId: 'neighborhood', pos: { x: 160, y: 860 } },
  house_marcie: { locationId: 'neighborhood', pos: { x: 360, y: 860 } },
  house_franklin: { locationId: 'neighborhood', pos: { x: 580, y: 860 } },
  house_pigpen: { locationId: 'neighborhood', pos: { x: 1210, y: 860 } },
  school: { locationId: 'neighborhood', pos: { x: 160, y: 640 } },
  pumpkin_patch: { locationId: 'neighborhood', pos: { x: 670, y: 940 } },
  baseball_field: { locationId: 'neighborhood', pos: { x: 620, y: 740 } },
  ice_rink: { locationId: 'neighborhood', pos: { x: 1010, y: 560 } },
  beach: { locationId: 'neighborhood', pos: { x: 1080, y: 700 } },
  summer_camp: { locationId: 'neighborhood', pos: { x: 500, y: 730 } },
  lake: { locationId: 'neighborhood', pos: { x: 880, y: 480 } },
  daisy_hill: { locationId: 'neighborhood', pos: { x: 350, y: 265 } }
};

export default function App() {
  const initialSession = useMemo(() => getActiveSession(), []);

  const [currentLocationId, setCurrentLocationId] = useState<LocationId>(
    initialSession?.locationId || 'neighborhood'
  );
  const [playerPos, setPlayerPos] = useState<Position>(
    initialSession?.playerPos || { x: 170, y: 295 }
  );
  const [playerDir, setPlayerDir] = useState<'down' | 'up' | 'left' | 'right'>(
    initialSession?.playerDir || 'down'
  );
  const [isMoving, setIsMoving] = useState<boolean>(false);
  const [timeOfDay, setTimeOfDay] = useState<TimeOfDay>(
    initialSession?.timeOfDay || 'day'
  );
  const [inGameMinutes, setInGameMinutes] = useState<number>(
    initialSession?.inGameMinutes ?? 510
  ); // 08:30 AM
  const [dayNumber, setDayNumber] = useState<number>(
    initialSession?.dayNumber ?? 1
  );
  const [timeSpeed, setTimeSpeed] = useState<'paused' | 'normal' | 'fast'>('normal');
  const [isMuted, setIsMuted] = useState<boolean>(sound.getIsMuted());

  // Interactive states
  const [activeTrigger, setActiveTrigger] = useState<InteractiveTrigger | null>(null);
  const [nearbyNpc, setNearbyNpc] = useState<CharacterNpc | null>(null);

  // Modals & UI overlays
  const [isNotebookOpen, setIsNotebookOpen] = useState(false);
  const [notebookInitialThought, setNotebookInitialThought] = useState<string | undefined>(undefined);
  const [isThinkingWallOpen, setIsThinkingWallOpen] = useState(false);
  const [isLucyBoothOpen, setIsLucyBoothOpen] = useState(false);
  const [isSchroederPianoOpen, setIsSchroederPianoOpen] = useState(false);
  const [isWorldMapOpen, setIsWorldMapOpen] = useState(false);
  const [isSaveModalOpen, setIsSaveModalOpen] = useState(false);
  const [saveModalMode, setSaveModalMode] = useState<'save' | 'load'>('save');
  const [isBaseballOpen, setIsBaseballOpen] = useState(false);
  const [isSkatingOpen, setIsSkatingOpen] = useState(false);
  const [isPumpkinPatchOpen, setIsPumpkinPatchOpen] = useState(false);
  const [isAiConfigOpen, setIsAiConfigOpen] = useState(false);
  const [aiConfig, setAiConfig] = useState<AiConfig>(() => getAiConfig());

  // Sleep & Toast notifications
  const [isSleeping, setIsSleeping] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Comic dialogue bubble (supports interactive keyboard AI chat with characters)
  const [dialogue, setDialogue] = useState<{
    speaker: string;
    avatar: string;
    text: string;
    hint?: string;
    characterId?: string;
    isInteractiveNpc?: boolean;
  } | null>(null);
  const [dialogueHistory, setDialogueHistory] = useState<DialogueMessageItem[]>([]);
  const [isNpcReplying, setIsNpcReplying] = useState(false);

  // Key tracking & animation frame
  const keysPressed = useRef<{ [key: string]: boolean }>({});
  const mobileDirRef = useRef<'up' | 'down' | 'left' | 'right' | null>(null);
  const joystickVectorRef = useRef<{ x: number; y: number } | null>(null);

  const currentLocation = LOCATIONS_DATA[currentLocationId] || LOCATIONS_DATA.neighborhood;
  const currentLocationRef = useRef<LocationData>(currentLocation);
  currentLocationRef.current = currentLocation;

  const playerPosRef = useRef<Position>(playerPos);
  playerPosRef.current = playerPos;

  const playerDirRef = useRef<'down' | 'up' | 'left' | 'right'>(playerDir);
  playerDirRef.current = playerDir;
  
  // Dynamic characters list (supports walking NPCs like Snoopy and Woodstock, and location presence)
  const [characters, setCharacters] = useState<CharacterNpc[]>(() =>
    getActiveCharactersForTime(timeOfDay, currentLocationId)
  );

  // Update base schedule positions ONLY when location changes (so characters never teleport in place!)
  const prevLocationIdRef = useRef(currentLocationId);
  useEffect(() => {
    if (prevLocationIdRef.current !== currentLocationId) {
      prevLocationIdRef.current = currentLocationId;
      setCharacters(getActiveCharactersForTime(timeOfDay, currentLocationId));
    }
  }, [currentLocationId, timeOfDay]);

  // When time of day phase changes within same location, update dialogues without jumping/teleporting positions
  const prevTimeOfDayRef = useRef(timeOfDay);
  useEffect(() => {
    if (prevTimeOfDayRef.current !== timeOfDay) {
      prevTimeOfDayRef.current = timeOfDay;
      setCharacters((prevList) => {
        const updated = getActiveCharactersForTime(timeOfDay, currentLocationId);
        return prevList.map((c) => {
          const matching = updated.find((u) => u.id === c.id);
          if (!matching) return c;
          return {
            ...c,
            currentActivity: matching.currentActivity,
            dialoguePool: matching.dialoguePool
          };
        });
      });
    }
  }, [timeOfDay, currentLocationId]);

  // Multi-NPC autonomous roaming & inter-character social simulation loop
  // Note: playerPos and playerDir are accessed via stable refs so the loop never freezes when Ari walks!
  useEffect(() => {
    let animId: number;
    let lastTime = performance.now();

    const simLoop = (currentTime: number) => {
      const dt = Math.min((currentTime - lastTime) / 1000, 0.1);
      lastTime = currentTime;

      const isPaused =
        dialogue !== null ||
        isNotebookOpen ||
        isThinkingWallOpen ||
        isLucyBoothOpen ||
        isSchroederPianoOpen ||
        isWorldMapOpen ||
        isSaveModalOpen ||
        isBaseballOpen ||
        isSkatingOpen ||
        isPumpkinPatchOpen ||
        isSleeping;

      if (!isPaused) {
        setCharacters((prevList) => {
          return updateNpcSimulation(prevList, dt, currentLocationRef.current, playerPosRef.current);
        });
      }

      animId = requestAnimationFrame(simLoop);
    };

    animId = requestAnimationFrame(simLoop);
    return () => cancelAnimationFrame(animId);
  }, [
    currentLocationId,
    dialogue,
    isNotebookOpen,
    isThinkingWallOpen,
    isLucyBoothOpen,
    isSchroederPianoOpen,
    isWorldMapOpen,
    isSaveModalOpen,
    isBaseballOpen,
    isSkatingOpen,
    isPumpkinPatchOpen,
    isSleeping
  ]);

  // Check if current location is an interior room or sub-activity location from which 'A' exits
  const isInterior =
    currentLocation.category === 'interior' ||
    currentLocationId === 'baseball_field' ||
    currentLocationId === 'ice_rink';

  // Toast notification helper
  const showToast = useCallback((msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((curr) => (curr === msg ? null : curr));
    }, 3200);
  }, []);

  // Quick Exit from any interior room or sub-activity area back to the neighborhood
  const handleExitCurrentLocation = useCallback(() => {
    if (isInterior) {
      sound.playDoor();
      const target = EXIT_DESTINATIONS[currentLocationId] || {
        locationId: 'neighborhood' as LocationId,
        pos: { x: 190, y: 310 }
      };
      setCurrentLocationId(target.locationId);
      setPlayerPos(target.pos);
      setPlayerDir('down');
      showToast(`🚪 Saliste de ${currentLocation.name}`);
      return true;
    }
    return false;
  }, [isInterior, currentLocationId, currentLocation.name, showToast]);

  // Clock progression loop
  useEffect(() => {
    if (timeSpeed === 'paused') return;

    const intervalMs = timeSpeed === 'fast' ? 500 : 1200;
    const minuteStep = timeSpeed === 'fast' ? 6 : 2;

    const timer = setInterval(() => {
      setInGameMinutes((prevMinutes) => {
        const nextTotal = prevMinutes + minuteStep;
        if (nextTotal >= 1440) {
          setDayNumber((d) => d + 1);
          return nextTotal % 1440;
        }
        return nextTotal;
      });
    }, intervalMs);

    return () => clearInterval(timer);
  }, [timeSpeed]);

  // Synchronize timeOfDay phase when inGameMinutes changes
  useEffect(() => {
    const nextPhase = getDayPhaseFromMinutes(inGameMinutes);
    setTimeOfDay((prev) => (prev === nextPhase ? prev : nextPhase));
  }, [inGameMinutes]);

  // Persist current session state so the game never restarts out of nowhere
  useEffect(() => {
    saveActiveSession({
      locationId: currentLocationId,
      playerPos,
      playerDir,
      timeOfDay,
      inGameMinutes,
      dayNumber
    });
  }, [currentLocationId, playerPos, playerDir, timeOfDay, inGameMinutes, dayNumber]);

  // Collision helper
  const checkCollision = useCallback(
    (x: number, y: number, loc = currentLocation): boolean => {
      // Ari's collision bounding box aligned with actual feet (visual span: y+26 to y+38)
      const footBox = {
        x: x + 3,
        y: y + 26,
        w: 18,
        h: 12
      };

      // Out of bounds check
      if (
        footBox.x < 0 ||
        footBox.y < 0 ||
        footBox.x + footBox.w > loc.width ||
        footBox.y + footBox.h > loc.height
      ) {
        return true;
      }

      // Check against location colliders
      for (const col of loc.colliders) {
        if (
          footBox.x < col.x + col.w &&
          footBox.x + footBox.w > col.x &&
          footBox.y < col.y + col.h &&
          footBox.y + footBox.h > col.y
        ) {
          return true;
        }
      }

      return false;
    },
    [currentLocation]
  );

  // Find active trigger & nearby character
  useEffect(() => {
    // Check triggers
    let foundTrigger: InteractiveTrigger | null = null;
    for (const trig of currentLocation.triggers) {
      const padding = 20;
      if (
        playerPos.x >= trig.x - padding &&
        playerPos.x <= trig.x + trig.w + padding &&
        playerPos.y >= trig.y - padding &&
        playerPos.y <= trig.y + trig.h + padding
      ) {
        foundTrigger = trig;
        break;
      }
    }
    setActiveTrigger((prev) => (prev?.id === foundTrigger?.id ? prev : foundTrigger));

    // Check characters based on current positions and schedule
    let foundNpc: CharacterNpc | null = null;
    for (const npc of characters) {
      if (npc.locationId === currentLocationId) {
        const dx = Math.abs(playerPos.x - npc.x);
        const dy = Math.abs(playerPos.y - npc.y);
        if (dx < 40 && dy < 40) {
          foundNpc = npc;
          break;
        }
      }
    }
    setNearbyNpc((prev) => (prev?.id === foundNpc?.id ? prev : foundNpc));
  }, [playerPos.x, playerPos.y, currentLocation, currentLocationId, characters]);

  // Movement loop
  useEffect(() => {
    let animId: number;
    const speed = 3.2;

    const moveLoop = () => {
      const isAnyModalOpen =
        isNotebookOpen ||
        isThinkingWallOpen ||
        isLucyBoothOpen ||
        isSchroederPianoOpen ||
        isWorldMapOpen ||
        isSaveModalOpen ||
        isBaseballOpen ||
        isSkatingOpen ||
        isSleeping ||
        dialogue !== null;

      if (!isAnyModalOpen) {
        let dx = 0;
        let dy = 0;

        // Circular Virtual Joystick (analog 360-degree precision)
        if (joystickVectorRef.current) {
          dx = joystickVectorRef.current.x;
          dy = joystickVectorRef.current.y;
        } else {
          // Keyboard
          if (keysPressed.current['ArrowUp'] || keysPressed.current['KeyW']) dy -= 1;
          if (keysPressed.current['ArrowDown'] || keysPressed.current['KeyS']) dy += 1;
          if (keysPressed.current['ArrowLeft'] || keysPressed.current['KeyA']) dx -= 1;
          if (keysPressed.current['ArrowRight'] || keysPressed.current['KeyD']) dx += 1;

          // Mobile fallback
          if (mobileDirRef.current === 'up') dy -= 1;
          if (mobileDirRef.current === 'down') dy += 1;
          if (mobileDirRef.current === 'left') dx -= 1;
          if (mobileDirRef.current === 'right') dx += 1;

          if (dx !== 0 && dy !== 0) {
            dx *= 0.7071;
            dy *= 0.7071;
          }
        }

        const cur = playerPosRef.current;
        if (dx !== 0 || dy !== 0) {
          let newDir = playerDirRef.current;
          if (Math.abs(dx) > Math.abs(dy)) {
            newDir = dx > 0 ? 'right' : 'left';
          } else if (dy !== 0) {
            newDir = dy > 0 ? 'down' : 'up';
          }
          if (newDir !== playerDirRef.current) {
            playerDirRef.current = newDir;
            setPlayerDir(newDir);
          }

          const nextX = cur.x + dx * speed;
          const nextY = cur.y + dy * speed;

          let updatedX = cur.x;
          let updatedY = cur.y;

          // Attempt full move or sliding
          if (!checkCollision(nextX, nextY)) {
            updatedX = nextX;
            updatedY = nextY;
          } else if (!checkCollision(nextX, cur.y)) {
            updatedX = nextX;
          } else if (!checkCollision(cur.x, nextY)) {
            updatedY = nextY;
          }

          if (updatedX !== cur.x || updatedY !== cur.y) {
            playerPosRef.current = { x: updatedX, y: updatedY };
            setPlayerPos({ x: updatedX, y: updatedY });
            setIsMoving((prev) => (prev ? prev : true));
          } else {
            setIsMoving((prev) => (!prev ? prev : false));
          }
        } else {
          setIsMoving((prev) => (!prev ? prev : false));
        }
      } else {
        setIsMoving((prev) => (!prev ? prev : false));
      }

      animId = requestAnimationFrame(moveLoop);
    };

    animId = requestAnimationFrame(moveLoop);
    return () => cancelAnimationFrame(animId);
  }, [
    checkCollision,
    isNotebookOpen,
    isThinkingWallOpen,
    isLucyBoothOpen,
    isSchroederPianoOpen,
    isWorldMapOpen,
    isSaveModalOpen,
    isBaseballOpen,
    isSkatingOpen,
    isSleeping,
    dialogue
  ]);

  // Sleep Until Dawn Mechanic
  const handleSleepUntilDawn = useCallback(() => {
    setIsSleeping(true);
    sound.playSleepChime();
    setDialogue(null);

    setTimeout(() => {
      setDayNumber((d) => d + 1);
      setInGameMinutes(390); // 06:30 AM Dawn
      setTimeOfDay('dawn');
      setIsSleeping(false);
      showToast('☀️ ¡Has dormido plácidamente! Comienza un nuevo día en el vecindario.');
    }, 1800);
  }, [showToast]);

  // Action A (Talk / Enter Door / Play Baseball / Skate / Pumpkin / Open Fridge / Sink / Examine / Exit Interior)
  const handleActionA = useCallback(() => {
    // If Baseball, Skating or Pumpkin modal is open, A closes it
    if (isBaseballOpen) {
      setIsBaseballOpen(false);
      return;
    }
    if (isSkatingOpen) {
      setIsSkatingOpen(false);
      return;
    }
    if (isPumpkinPatchOpen) {
      setIsPumpkinPatchOpen(false);
      return;
    }

    // If dialogue open, close it
    if (dialogue) {
      setDialogue(null);
      setDialogueHistory([]);
      sound.playDoor();
      return;
    }

    // Priority 1: Talk to nearby NPC (Exclusively on Button A)
    if (nearbyNpc) {
      sound.playInspireChime();
      let quote = '';
      if (nearbyNpc.socialState && nearbyNpc.socialState.partnerName) {
        quote = `¡Hola, Ari! Justo estaba hablando con ${nearbyNpc.socialState.partnerName}. Decíamos: "${nearbyNpc.socialState.text}"`;
      } else {
        const pool = nearbyNpc.dialoguePool;
        quote = pool[Math.floor(Math.random() * pool.length)];
      }
      setDialogueHistory([]);
      setDialogue({
        speaker: nearbyNpc.name,
        avatar:
          nearbyNpc.id === 'snoopy'
            ? '🐾'
            : nearbyNpc.id === 'woodstock'
            ? '🐤'
            : nearbyNpc.id === 'lucy'
            ? '🎀'
            : nearbyNpc.id === 'linus'
            ? '🧣'
            : nearbyNpc.id === 'charlie_brown'
            ? '🧢'
            : nearbyNpc.id === 'schroeder'
            ? '🎹'
            : nearbyNpc.id === 'sally'
            ? '🎀'
            : nearbyNpc.id === 'peppermint_patty'
            ? '⚾'
            : nearbyNpc.id === 'marcie'
            ? '👓'
            : nearbyNpc.id === 'franklin'
            ? '📘'
            : nearbyNpc.id === 'pig_pen'
            ? '☁️'
            : '👦',
        text: quote,
        hint: 'Escribe en el teclado para responderle lo que quieras',
        characterId: nearbyNpc.id,
        isInteractiveNpc: true
      });
      return;
    }

    // Priority 2: Triggers specifically assigned to Button A
    if (activeTrigger) {
      const { actionType, targetLocation, targetPosition } = activeTrigger;

      // Baseball on A
      if (
        actionType === 'baseball_bat' ||
        activeTrigger.id === 'baseball_field_trigger' ||
        activeTrigger.id === 'mound_pitch'
      ) {
        sound.playBatHit();
        setIsBaseballOpen(true);
        return;
      }

      // Skating on A
      if (
        actionType === 'skate' ||
        activeTrigger.id === 'ice_rink_trigger' ||
        activeTrigger.id === 'ice_skate_action'
      ) {
        sound.playFootstep('ice');
        setIsSkatingOpen(true);
        return;
      }

      // Pumpkin farm on A
      if (
        actionType === 'pumpkin_farm' ||
        activeTrigger.id === 'neighborhood_pumpkin_garden_trigger' ||
        activeTrigger.id === 'great_pumpkin_spot'
      ) {
        sound.playInspireChime();
        setIsPumpkinPatchOpen(true);
        return;
      }

      // Door transitions on A (Except doghouse entrance which is B)
      if ((actionType === 'door_enter' || actionType === 'door_exit') && targetLocation && activeTrigger.id !== 'doghouse_door') {
        sound.playDoor();
        setCurrentLocationId(targetLocation);
        const targetData = LOCATIONS_DATA[targetLocation];
        setPlayerPos(targetPosition || targetData.spawnPoint);
        return;
      }

      // Lucy's booth on A
      if (actionType === 'lucy_booth') {
        sound.playDoor();
        setIsLucyBoothOpen(true);
        return;
      }

      // Fridge / Sink / Record player / Bookshelf on A
      if (actionType === 'fridge' || actionType === 'sink' || actionType === 'record_player' || actionType === 'bookshelf') {
        sound.playDoor();
        if (activeTrigger.examineText) {
          setDialogue({
            speaker: activeTrigger.examineTitle || activeTrigger.name,
            avatar: actionType === 'fridge' ? '🍎' : actionType === 'sink' ? '💧' : actionType === 'record_player' ? '🎵' : '📚',
            text: activeTrigger.examineText,
            hint: 'Presiona Espacio o E para continuar'
          });
        }
        return;
      }

      // Examine on A (only if trigger has promptA or no promptB)
      if (activeTrigger.examineText && !activeTrigger.promptB) {
        sound.playDoor();
        setDialogue({
          speaker: activeTrigger.examineTitle || activeTrigger.name,
          avatar: '🔍',
          text: activeTrigger.examineText,
          hint: 'Presiona Espacio o E para continuar'
        });
        return;
      }
    }
  }, [
    isBaseballOpen,
    isSkatingOpen,
    isPumpkinPatchOpen,
    dialogue,
    nearbyNpc,
    activeTrigger
  ]);

  // Real-time keyboard communication with character
  const handleNpcSendMessage = useCallback(async (userMessage: string) => {
    if (!dialogue || !dialogue.speaker || isNpcReplying) return;
    setIsNpcReplying(true);
    sound.playTypewriterClick();

    const previousSpeaker = dialogue.speaker;
    const previousText = dialogue.text;
    const currentLocName = currentLocation.name;

    // Save the previous turn into conversation history
    setDialogueHistory((prev) => [
      ...prev,
      {
        id: `npc-${Date.now()}-prev`,
        sender: 'npc',
        speakerName: previousSpeaker,
        text: previousText
      },
      {
        id: `user-${Date.now()}`,
        sender: 'user',
        speakerName: 'Ari',
        text: userMessage
      }
    ]);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: getAiHeaders(),
        body: JSON.stringify({
          character: previousSpeaker,
          message: userMessage,
          locationName: currentLocName,
          thoughtContext: previousText,
          history: dialogueHistory
        })
      });
      const data = await res.json();
      if (data && data.reply) {
        sound.playInspireChime();
        setDialogue((prev) =>
          prev
            ? {
                ...prev,
                text: data.reply,
                hint: 'Escribe para responder de nuevo o pulsa Cerrar [Esc]'
              }
            : null
        );
      } else {
        throw new Error('Empty response from /api/chat');
      }
    } catch (err) {
      console.warn('Chat API error, using direct contextual engine:', err);
      // Coherent, contextual fallback guaranteed to answer what the user asked
      const coherentReply = getContextualReply(previousSpeaker, userMessage, currentLocName, previousText);
      sound.playInspireChime();
      setDialogue((prev) =>
        prev
          ? {
              ...prev,
              text: coherentReply,
              hint: 'Escribe para responder de nuevo o pulsa Cerrar [Esc]'
            }
          : null
      );
    } finally {
      setIsNpcReplying(false);
    }
  }, [dialogue, isNpcReplying, currentLocation.name]);

  // Action B (Sit / Desk Write / Play Schroeder Piano / Sleep in Bed / Thinking Wall / Enter Doghouse / Kite Tree)
  // Strictly separated: Will NOT trigger doors, NPCs, baseball, skating, or pumpkin patch!
  const handleActionB = useCallback(() => {
    if (dialogue) {
      setDialogue(null);
      setDialogueHistory([]);
      return;
    }

    if (activeTrigger) {
      const { actionType, targetLocation, targetPosition } = activeTrigger;

      // If at bed, sleeping until morning on B
      if (actionType === 'bed_rest' || activeTrigger.id === 'ari_bed') {
        handleSleepUntilDawn();
        return;
      }

      // Thinking wall exclusively on B
      if (actionType === 'think_wall' || activeTrigger.id === 'think_wall_trigger') {
        sound.playInspireChime();
        setIsThinkingWallOpen(true);
        return;
      }

      // Desk write (Ari's desk, Snoopy's typewriter, park benches, pumpkin log) exclusively on B
      if (actionType === 'desk_write') {
        sound.playTypewriterClick();
        setIsNotebookOpen(true);
        return;
      }

      // Sit down to relax exclusively on B
      if (actionType === 'sit') {
        sound.playFootstep('grass');
        showToast('Te sientas a contemplar el tranquilo paisaje del vecindario... 🍂');
        return;
      }

      // Schroeder toy piano exclusively on B
      if (actionType === 'schroeder_piano' || activeTrigger.id === 'schroeder_toy_piano') {
        sound.playDoor();
        setIsSchroederPianoOpen(true);
        return;
      }

      // Doghouse interior secret entrance on B
      if (activeTrigger.id === 'doghouse_door' || (actionType === 'door_enter' && targetLocation === 'doghouse_interior')) {
        sound.playPeanutsJingle();
        setCurrentLocationId('doghouse_interior');
        const targetData = LOCATIONS_DATA.doghouse_interior;
        setPlayerPos(targetPosition || targetData.spawnPoint);
        return;
      }

      // Kite tree on B
      if (actionType === 'kite_tree' || activeTrigger.id === 'kite_tree_trigger') {
        sound.playDoor();
        setDialogue({
          speaker: activeTrigger.examineTitle || activeTrigger.name,
          avatar: '🪁',
          text: activeTrigger.examineText || 'El árbol sostiene las cometas con paciencia...',
          hint: 'Presiona A para continuar'
        });
        return;
      }

      // Triggers explicitly marked with promptB
      if (activeTrigger.promptB && activeTrigger.examineText) {
        sound.playDoor();
        setDialogue({
          speaker: activeTrigger.examineTitle || activeTrigger.name,
          avatar: '📖',
          text: activeTrigger.examineText,
          hint: 'Presiona A para continuar'
        });
        return;
      }
    }
  }, [dialogue, activeTrigger, handleSleepUntilDawn, showToast]);

  // Keyboard events listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't capture keys if typing in an input or textarea
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement
      ) {
        return;
      }

      keysPressed.current[e.code] = true;

      // Interaction shortcuts (Action A: Space, Enter, or E)
      if (e.code === 'Space' || e.code === 'Enter' || e.code === 'KeyE') {
        e.preventDefault();
        if (isBaseballOpen) {
          setIsBaseballOpen(false);
          return;
        }
        if (isSkatingOpen) {
          setIsSkatingOpen(false);
          return;
        }
        if (dialogue) {
          setDialogue(null);
          sound.playDoor();
          return;
        }
        handleActionA();
      } else if (e.code === 'KeyB' || e.code === 'KeyQ' || e.code === 'ShiftLeft' || e.code === 'ShiftRight') {
        e.preventDefault();
        handleActionB();
      } else if (e.code === 'KeyN') {
        e.preventDefault();
        setIsNotebookOpen((prev) => !prev);
        sound.playTypewriterClick();
      } else if (e.code === 'KeyM') {
        e.preventDefault();
        setIsWorldMapOpen((prev) => !prev);
        sound.playDoor();
      } else if (e.code === 'KeyG') {
        e.preventDefault();
        setSaveModalMode('save');
        setIsSaveModalOpen((prev) => !prev);
        sound.playTypewriterClick();
      } else if (e.code === 'Escape') {
        setDialogue(null);
        setIsNotebookOpen(false);
        setIsThinkingWallOpen(false);
        setIsLucyBoothOpen(false);
        setIsSchroederPianoOpen(false);
        setIsWorldMapOpen(false);
        setIsSaveModalOpen(false);
        setIsBaseballOpen(false);
        setIsSkatingOpen(false);
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
  }, [handleActionA, handleActionB, isInterior, handleExitCurrentLocation, isBaseballOpen, isSkatingOpen, dialogue]);

  // Fast Travel from World Map
  const handleFastTravel = (targetId: LocationId) => {
    const targetData = LOCATIONS_DATA[targetId];
    if (targetData) {
      setCurrentLocationId(targetId);
      setPlayerPos(targetData.spawnPoint);
    }
  };

  // Cycle day / night phases manually
  const handleCycleTime = () => {
    const sequence: TimeOfDay[] = ['dawn', 'day', 'sunset', 'night'];
    const nextIdx = (sequence.indexOf(timeOfDay) + 1) % sequence.length;
    const nextPhase = sequence[nextIdx];
    setTimeOfDay(nextPhase);
    setInGameMinutes(getMinutesForTimeOfDay(nextPhase));
    sound.playDoor();
    showToast(`Fase del día cambiada a: ${nextPhase.toUpperCase()}`);
  };

  // Toggle time progression speed
  const handleToggleTimeSpeed = () => {
    setTimeSpeed((curr) => {
      const next = curr === 'normal' ? 'fast' : curr === 'fast' ? 'paused' : 'normal';
      const label = next === 'paused' ? 'Pausado' : next === 'fast' ? '4x Rápido' : '1x Normal';
      showToast(`Velocidad del tiempo: ${label}`);
      return next;
    });
  };

  // Load Saved Game Slot Handler
  const handleLoadGameSlot = (slot: SaveSlot) => {
    setCurrentLocationId(slot.locationId as LocationId);
    setPlayerPos(slot.playerPos);
    setPlayerDir(slot.playerDir);
    setTimeOfDay(slot.timeOfDay);
    setInGameMinutes(slot.inGameMinutes || getMinutesForTimeOfDay(slot.timeOfDay));
    setDayNumber(slot.dayNumber || 1);
    setIsSaveModalOpen(false);
    showToast(`¡Partida cargada con éxito! (Día ${slot.dayNumber || 1})`);
  };

  // Prompt texts for bottom overlay
  const promptA = nearbyNpc
    ? `A - Conversar con ${nearbyNpc.name} (Escribir)`
    : activeTrigger?.promptA
    ? activeTrigger.promptA
    : isInterior
    ? 'A - Salir al exterior'
    : undefined;

  const promptB = activeTrigger?.promptB;

  return (
    <main className="fixed inset-0 w-full h-full overflow-hidden font-['Nunito',sans-serif] bg-stone-900 select-none touch-none">
      {/* 2D GAME CANVAS */}
      <GameCanvas
        location={currentLocation}
        playerPos={playerPos}
        playerDir={playerDir}
        isMoving={isMoving}
        timeOfDay={timeOfDay}
        activeTrigger={activeTrigger}
        onInteractA={handleActionA}
        characters={characters}
      />

      {/* ON-SCREEN UI & TOUCH CONTROLS */}
      <ControlOverlay
        locationName={currentLocation.name}
        isInterior={isInterior}
        onExitLocation={handleExitCurrentLocation}
        timeOfDay={timeOfDay}
        inGameClockStr={formatInGameClock(inGameMinutes).timeStr}
        dayNumber={dayNumber}
        timeSpeed={timeSpeed}
        onCycleTimeOfDay={handleCycleTime}
        onToggleTimeSpeed={handleToggleTimeSpeed}
        onOpenSaveLoad={(mode = 'save') => {
          setSaveModalMode(mode);
          setIsSaveModalOpen(true);
        }}
        onOpenNotebook={() => {
          setNotebookInitialThought(undefined);
          setIsNotebookOpen(true);
        }}
        onOpenMap={() => setIsWorldMapOpen(true)}
        onOpenAiConfig={() => setIsAiConfigOpen(true)}
        hasAiKey={Boolean(aiConfig.apiKey)}
        onActionA={handleActionA}
        onActionB={handleActionB}
        promptA={promptA}
        promptB={promptB}
        isMuted={isMuted}
        onToggleMute={() => setIsMuted(sound.toggleMute())}
        onMoveDirection={(dir) => {
          mobileDirRef.current = dir;
        }}
        onJoystickVector={(vec) => {
          joystickVectorRef.current = vec;
        }}
      />

      {/* TOAST NOTIFICATION BANNER */}
      {toastMessage && (
        <div className="fixed top-16 left-1/2 -translate-x-1/2 z-50 bg-stone-900/90 backdrop-blur-md text-amber-100 px-4 py-2 rounded-xl border border-amber-500/40 shadow-xl font-bold text-xs flex items-center gap-2 animate-in fade-in slide-in-from-top-2 duration-200">
          <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* SLEEPING SCREEN OVERLAY */}
      {isSleeping && (
        <div className="fixed inset-0 z-50 bg-stone-950/95 flex flex-col items-center justify-center text-amber-100 transition-opacity duration-700 animate-in fade-in">
          <div className="text-4xl font-['Lora',serif] font-black text-amber-300 tracking-wider animate-pulse mb-3">
            Zzz...
          </div>
          <p className="text-sm font-semibold text-stone-300">
            Ari descansa tranquilamente bajo las sábanas abrigadas...
          </p>
        </div>
      )}

      {/* COMIC DIALOGUE BOX (with free typing chat support) */}
      {dialogue && (
        <DialogueBox
          speakerName={dialogue.speaker}
          avatarIcon={dialogue.avatar}
          characterId={dialogue.characterId}
          text={dialogue.text}
          onClose={() => {
            setDialogue(null);
            setDialogueHistory([]);
          }}
          actionHint={dialogue.hint}
          onSendMessage={dialogue.isInteractiveNpc ? handleNpcSendMessage : undefined}
          isReplying={isNpcReplying}
          history={dialogueHistory}
          onOpenAiConfig={() => setIsAiConfigOpen(true)}
          aiProviderName={
            aiConfig.provider === 'lucia'
              ? 'Certainty Companion'
              : aiConfig.provider === 'gemini'
              ? 'Gemini 3.8'
              : 'Motor Schulz'
          }
        />
      )}

      {/* SAVE / LOAD GAME MODAL */}
      <SaveLoadModal
        isOpen={isSaveModalOpen}
        onClose={() => setIsSaveModalOpen(false)}
        mode={saveModalMode}
        currentLocationId={currentLocationId}
        currentLocationName={currentLocation.name}
        playerPos={playerPos}
        playerDir={playerDir}
        timeOfDay={timeOfDay}
        inGameMinutes={inGameMinutes}
        dayNumber={dayNumber}
        notebookEntriesCount={3}
        thoughtsCount={4}
        onLoadSave={handleLoadGameSlot}
        onSaveSuccess={(slot) => {
          showToast(`¡Partida guardada en ${slot.label}!`);
        }}
      />

      {/* NOTEBOOK MODAL */}
      <NotebookModal
        isOpen={isNotebookOpen}
        onClose={() => {
          setIsNotebookOpen(false);
          setNotebookInitialThought(undefined);
        }}
        currentLocationName={currentLocation.name}
        initialThought={notebookInitialThought}
      />

      {/* EL MURO DE PENSAR MODAL */}
      <ThinkingWallModal
        isOpen={isThinkingWallOpen}
        onClose={() => setIsThinkingWallOpen(false)}
        onOpenNotebookWithThought={(thought) => {
          setIsThinkingWallOpen(false);
          setNotebookInitialThought(thought);
          setIsNotebookOpen(true);
        }}
      />

      {/* LUCY'S 5¢ PSYCHIATRIC BOOTH MODAL */}
      <LucyBoothModal
        isOpen={isLucyBoothOpen}
        onClose={() => setIsLucyBoothOpen(false)}
      />

      {/* SCHROEDER'S TOY PIANO MODAL */}
      <SchroederPianoModal
        isOpen={isSchroederPianoOpen}
        onClose={() => setIsSchroederPianoOpen(false)}
      />

      {/* BASEBALL INTERACTIVE GAMEPLAY MODAL */}
      <BaseballModal
        isOpen={isBaseballOpen}
        onClose={() => setIsBaseballOpen(false)}
        timeOfDay={timeOfDay}
      />

      {/* ICE SKATING INTERACTIVE GAMEPLAY MODAL */}
      <SkatingModal
        isOpen={isSkatingOpen}
        onClose={() => setIsSkatingOpen(false)}
        timeOfDay={timeOfDay}
      />

      {/* PUMPKIN PATCH FARMING & GIFTING MODAL */}
      <PumpkinPatchModal
        isOpen={isPumpkinPatchOpen}
        onClose={() => setIsPumpkinPatchOpen(false)}
        onGiveGift={(characterId: string, giftName: string) => {
          showToast(`¡Le regalaste una ${giftName} a ${characterId}! 🎃`);
        }}
      />

      {/* WORLD MAP / FAST TRAVEL MODAL */}
      <WorldMapModal
        isOpen={isWorldMapOpen}
        onClose={() => setIsWorldMapOpen(false)}
        currentLocationId={currentLocationId}
        onTravelTo={handleFastTravel}
      />

      {/* AI CONFIGURATION MODAL (CERTAINTY COMPANION / LUCIA AI) */}
      <AiConfigModal
        isOpen={isAiConfigOpen}
        onClose={() => setIsAiConfigOpen(false)}
        onConfigUpdated={(updated) => {
          setAiConfig(updated);
          const name =
            updated.provider === 'lucia'
              ? 'Certainty Companion (Lucia AI)'
              : updated.provider === 'gemini'
              ? 'Google Gemini 3.8'
              : 'Motor Schulz Clásico';
          showToast(`✨ IA activa: ${name}`);
        }}
      />
    </main>
  );
}

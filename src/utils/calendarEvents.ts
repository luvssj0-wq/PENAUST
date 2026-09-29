/**
 * Real Calendar & Time System for Peanuts: El Barrio
 * Automatically syncs with the player's device clock and calendar:
 * - Real-time hours: morning, afternoon, sunset, night
 * - Seasonal cycles: Autumn, Winter, Spring, Summer
 * - Special holiday events:
 *   - San Valentín (14 de Febrero): corazones, cartas de amistad y lazos
 *   - Halloween (31 de Octubre, con preparativos en Octubre): calabazas talladas, telarañas, faroles
 *   - Navidad (24-25 de Diciembre, con luces todo el mes): árboles con luces, coronas, escarcha
 *   - Año Nuevo (31 de Diciembre - 1 de Enero): guirnaldas, brindis, relojes
 */

export type Season = 'autumn' | 'winter' | 'spring' | 'summer';

export type HolidayEvent = 'none' | 'valentines' | 'halloween' | 'christmas' | 'new_year';

export interface CalendarState {
  currentDate: Date;
  season: Season;
  holiday: HolidayEvent;
  holidayName: string;
  isHalloweenWeek: boolean;
  isChristmasMonth: boolean;
  isValentinesWeek: boolean;
  dayOfMonth: number;
  month: number; // 0-11
  hour: number;
  formattedDate: string;
  isAutoDeviceTime: boolean;
}

const OVERRIDE_STORAGE_KEY = 'peanuts_calendar_override';

export function getDeviceCalendarState(overrideHoliday?: HolidayEvent, overrideSeason?: Season): CalendarState {
  const now = new Date();

  // Saved manual override if player toggled an event in settings
  let activeHoliday: HolidayEvent = overrideHoliday || 'none';
  let activeSeason: Season = overrideSeason || 'autumn';

  if (!overrideHoliday && !overrideSeason) {
    try {
      const stored = localStorage.getItem(OVERRIDE_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed.holiday && parsed.holiday !== 'none') activeHoliday = parsed.holiday;
        if (parsed.season) activeSeason = parsed.season;
      }
    } catch {
      // fallback to device clock
    }
  }

  const month = now.getMonth(); // 0 = Jan, 1 = Feb, 9 = Oct, 11 = Dec
  const day = now.getDate();
  const hour = now.getHours();

  // If no manual override active, compute based on real device calendar
  if (activeHoliday === 'none' && !overrideHoliday) {
    if (month === 1 && day >= 10 && day <= 16) {
      activeHoliday = 'valentines';
    } else if (month === 9 && day >= 20) {
      // Late October / Halloween
      activeHoliday = 'halloween';
    } else if (month === 11 && day >= 10 && day <= 27) {
      // Christmas season
      activeHoliday = 'christmas';
    } else if ((month === 11 && day >= 30) || (month === 0 && day <= 2)) {
      // New Year
      activeHoliday = 'new_year';
    }
  }

  if (!overrideSeason) {
    // Northern hemisphere default for Peanuts setting
    if (month === 2 || month === 3 || month === 4) activeSeason = 'spring';
    else if (month === 5 || month === 6 || month === 7) activeSeason = 'summer';
    else if (month === 8 || month === 9 || month === 10) activeSeason = 'autumn';
    else activeSeason = 'winter';
  }

  let holidayName = '';
  if (activeHoliday === 'valentines') holidayName = 'San Valentín';
  else if (activeHoliday === 'halloween') holidayName = 'Noche de Brujas (Halloween)';
  else if (activeHoliday === 'christmas') holidayName = 'Navidad';
  else if (activeHoliday === 'new_year') holidayName = 'Año Nuevo';

  const monthsEs = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ];

  const formattedDate = `${day} de ${monthsEs[month]}`;

  return {
    currentDate: now,
    season: activeSeason,
    holiday: activeHoliday,
    holidayName,
    isHalloweenWeek: activeHoliday === 'halloween' || (month === 9 && day >= 24),
    isChristmasMonth: activeHoliday === 'christmas' || month === 11,
    isValentinesWeek: activeHoliday === 'valentines' || (month === 1 && day >= 12 && day <= 15),
    dayOfMonth: day,
    month,
    hour,
    formattedDate,
    isAutoDeviceTime: activeHoliday === 'none' && !overrideSeason
  };
}

export function saveCalendarOverride(holiday: HolidayEvent, season?: Season) {
  try {
    localStorage.setItem(
      OVERRIDE_STORAGE_KEY,
      JSON.stringify({ holiday, season: season || 'autumn' })
    );
  } catch (e) {
    console.error(e);
  }
}

export function clearCalendarOverride() {
  try {
    localStorage.removeItem(OVERRIDE_STORAGE_KEY);
  } catch (e) {
    console.error(e);
  }
}

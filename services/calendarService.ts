
import { CalendarType } from "../types";

/**
 * Standard Year-based conversion formulas:
 * M = H + 622 - (H / 33)
 * H = (M - 622) * (33 / 32)
 */

export const convertYear = (year: number, from: CalendarType): number => {
  if (isNaN(year) || year < 0) return 0;
  if (from === CalendarType.HIJRI) {
    // Hicri to Miladi
    return Math.floor(year + 622 - (year / 33));
  } else {
    // Miladi to Hicri
    return Math.floor((year - 622) * (33 / 32));
  }
};

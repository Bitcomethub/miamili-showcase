/**
 * Yarı saydam marka renkleri.
 *
 * `rgba(244,241,234,0.32)` yazmak marka rengini ikinci bir yere KOPYALAR;
 * token değişince bu kopyalar sessizce eskir. Bunun yerine token'ın kendisi
 * seyreltilir. oklab uzayında karıştırmak, sRGB'de görülen gri fringe'i
 * (özellikle degrade duraklarında) engeller.
 */
export function saydam(token: string, yuzde: number): string {
  return `color-mix(in oklab, var(${token}) ${yuzde}%, transparent)`;
}

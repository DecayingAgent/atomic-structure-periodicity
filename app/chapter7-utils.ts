export const SPEED_OF_LIGHT = 2.9979e8;
export const PLANCK_CONSTANT = 6.626e-34;
export const HYDROGEN_ENERGY_CONSTANT = -2.178e-18;

export type VisibleColor = "violet" | "blue" | "cyan" | "green" | "yellow" | "orange" | "red";

export const VISIBLE_SPECTRUM_GRADIENT =
  "linear-gradient(90deg, #6b46ff 0%, #6b46ff 18.4%, #2e6cff 18.4%, #2e6cff 27.6%, #20cfe2 27.6%, #20cfe2 31.6%, #20d978 31.6%, #20d978 48.7%, #f4e83f 48.7%, #f4e83f 55.3%, #ff963b 55.3%, #ff963b 64.5%, #ff4f58 64.5%, #ff4f58 97.4%, #d83e4b 97.4%, #d83e4b 100%)";

const VISIBLE_SPECTRUM_BANDS: Array<{ minNm: number; maxNm: number; color: VisibleColor }> = [
  { minNm: 380, maxNm: 450, color: "violet" },
  { minNm: 450, maxNm: 485, color: "blue" },
  { minNm: 485, maxNm: 500, color: "cyan" },
  { minNm: 500, maxNm: 565, color: "green" },
  { minNm: 565, maxNm: 590, color: "yellow" },
  { minNm: 590, maxNm: 625, color: "orange" },
  { minNm: 625, maxNm: 760, color: "red" },
];

export function visibleColorAtWavelength(wavelengthNm: number): VisibleColor {
  const band = VISIBLE_SPECTRUM_BANDS.find(
    ({ minNm, maxNm }) => wavelengthNm >= minNm && wavelengthNm < maxNm,
  );
  return band?.color ?? (wavelengthNm < 380 ? "violet" : "red");
}

export function wavelengthToFrequency(wavelengthNm: number): number {
  return SPEED_OF_LIGHT / (wavelengthNm * 1e-9);
}

export function photonEnergy(wavelengthNm: number): number {
  return PLANCK_CONSTANT * wavelengthToFrequency(wavelengthNm);
}

export function hydrogenEnergy(n: number, nuclearCharge = 1): number {
  return HYDROGEN_ENERGY_CONSTANT * (nuclearCharge ** 2 / n ** 2);
}

export function hydrogenTransition(initial: number, final: number) {
  const deltaEnergy = hydrogenEnergy(final) - hydrogenEnergy(initial);
  const energy = Math.abs(deltaEnergy);
  return {
    deltaEnergy,
    photonEnergy: energy,
    wavelengthNm: (PLANCK_CONSTANT * SPEED_OF_LIGHT) / energy / 1e-9,
  };
}

export function quantumNumbersAreValid(n: number, l: number, ml: number): boolean {
  return (
    Number.isInteger(n) &&
    n >= 1 &&
    Number.isInteger(l) &&
    l >= 0 &&
    l < n &&
    Number.isInteger(ml) &&
    ml >= -l &&
    ml <= l
  );
}

export function formatScientific(value: number, digits = 3): string {
  if (!Number.isFinite(value)) return "—";
  const [mantissa, exponent] = value.toExponential(digits - 1).split("e");
  return `${Number(mantissa).toFixed(digits - 1)} × 10^${Number(exponent)}`;
}

export function orbitalCapacity(l: number): number {
  return 2 * (2 * l + 1);
}

export const SPEED_OF_LIGHT = 2.9979e8;
export const PLANCK_CONSTANT = 6.626e-34;
export const HYDROGEN_ENERGY_CONSTANT = -2.178e-18;

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

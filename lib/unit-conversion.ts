// lib/unit-conversion.ts

export type UnitType = "UN" | "KG" | "G" | "L" | "ML" | "M" | "CM";

export interface UnitOption {
  code: UnitType;
  label: string;
  category: "count" | "mass" | "volume" | "length";
  factorToBase: number; // Factor to convert to category base unit
}

export const UNITS: Record<UnitType, UnitOption> = {
  UN: { code: "UN", label: "UN (Unidade)", category: "count", factorToBase: 1 },
  KG: { code: "KG", label: "KG (Quilograma)", category: "mass", factorToBase: 1 },
  G:  { code: "G",  label: "G (Grama)", category: "mass", factorToBase: 0.001 },
  L:  { code: "L",  label: "L (Litro)", category: "volume", factorToBase: 1 },
  ML: { code: "ML", label: "ML (Mililitro)", category: "volume", factorToBase: 0.001 },
  M:  { code: "M",  label: "M (Metro)", category: "length", factorToBase: 1 },
  CM: { code: "CM", label: "CM (Centímetro)", category: "length", factorToBase: 0.01 },
};

/**
 * Returns available display units for a given base unit.
 * E.g. For base unit "L", returns ["L", "ML"].
 * For base unit "KG", returns ["KG", "G"].
 * For base unit "M", returns ["M", "CM"].
 * For base unit "UN", returns ["UN"].
 */
export function getCompatibleUnits(baseUnit: string = "UN"): UnitType[] {
  const base = (baseUnit.toUpperCase() as UnitType) in UNITS 
    ? (baseUnit.toUpperCase() as UnitType) 
    : "UN";

  const category = UNITS[base].category;

  return (Object.keys(UNITS) as UnitType[]).filter(
    u => UNITS[u].category === category
  );
}

/**
 * Converts a quantity from one unit to another compatible unit.
 * E.g. convertUnit(200, "ML", "L") => 0.2
 * E.g. convertUnit(0.5, "UN", "UN") => 0.5
 * E.g. convertUnit(500, "G", "KG") => 0.5
 */
export function convertUnit(
  amount: number,
  fromUnit: string = "UN",
  toUnit: string = "UN"
): number {
  if (isNaN(amount) || amount === 0) return 0;

  const from = (fromUnit.toUpperCase() as UnitType) in UNITS ? (fromUnit.toUpperCase() as UnitType) : "UN";
  const to = (toUnit.toUpperCase() as UnitType) in UNITS ? (toUnit.toUpperCase() as UnitType) : "UN";

  if (from === to) return amount;

  const fromInfo = UNITS[from];
  const toInfo = UNITS[to];

  // If different categories, cannot convert directly, return original amount
  if (fromInfo.category !== toInfo.category) {
    return amount;
  }

  // Convert to base unit first, then to target unit
  const baseAmount = amount * fromInfo.factorToBase;
  const targetAmount = baseAmount / toInfo.factorToBase;

  return Math.round(targetAmount * 100000) / 100000;
}

/**
 * Formats a unit quantity gracefully (e.g. 0.2 L or 200 ML)
 */
export function formatUnitQuantity(amount: number, unit: string = "UN"): string {
  const cleanUnit = unit.toUpperCase();
  const formattedNumber = amount.toLocaleString("pt-BR", {
    maximumFractionDigits: 3
  });

  return `${formattedNumber} ${cleanUnit}`;
}

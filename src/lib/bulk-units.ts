// Generator 10 blok x 100 rumah = 1000 unit. Skip yang sudah ada.
// Security code 4 angka acak, unik global.

export const BLOCKS = ["A","B","C","D","E","F","G","H","I","J"] as const;
export const PER_BLOCK = 100;

export type GeneratedUnit = {
  unit: string;
  block: string;
  securityCode: string;
};

function randomCode(): string {
  return Math.floor(1000 + Math.random() * 9000).toString();
}

export function generateAllUnits(existingUnits: Set<string>): GeneratedUnit[] {
  const usedCodes = new Set<string>();
  const result: GeneratedUnit[] = [];
  for (const block of BLOCKS) {
    for (let n = 1; n <= PER_BLOCK; n++) {
      const unit = `${block}-${String(n).padStart(3, "0")}`;
      if (existingUnits.has(unit)) continue;
      let code = randomCode();
      while (usedCodes.has(code)) code = randomCode();
      usedCodes.add(code);
      result.push({ unit, block, securityCode: code });
    }
  }
  return result;
}

export function toCsv(rows: GeneratedUnit[]): string {
  const header = "Unit,Block,Security Code\n";
  const body = rows.map((r) => `${r.unit},${r.block},${r.securityCode}`).join("\n");
  return header + body + "\n";
}

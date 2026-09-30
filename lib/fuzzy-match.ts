// lib/fuzzy-match.ts

export interface MatchResult<T> {
  item: T;
  score: number; // 0 to 1
}

/**
 * Calculates Levenshtein Distance between two strings.
 */
export function levenshteinDistance(a: string, b: string): number {
  const matrix: number[][] = [];

  for (let i = 0; i <= b.length; i++) {
    matrix[i] = [i];
  }
  for (let j = 0; j <= a.length; j++) {
    matrix[0][j] = j;
  }

  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      if (b.charAt(i - 1) === a.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1, // substitution
          matrix[i][j - 1] + 1,     // insertion
          matrix[i - 1][j] + 1      // deletion
        );
      }
    }
  }

  return matrix[b.length][a.length];
}

/**
 * Normalizes text for comparison (lowercase, removes accents, special chars)
 */
export function normalizeText(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // Remove accents
    .replace(/[^a-z0-9\s]/g, " ")    // Keep only alphanumeric and spaces
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Calculates token similarity (Dice coefficient) between two normalized strings.
 */
export function tokenSimilarity(str1: string, str2: string): number {
  const tokens1 = new Set(normalizeText(str1).split(" ").filter(t => t.length > 1));
  const tokens2 = new Set(normalizeText(str2).split(" ").filter(t => t.length > 1));

  if (tokens1.size === 0 || tokens2.size === 0) return 0;

  let intersection = 0;
  for (const token of tokens1) {
    if (tokens2.has(token)) {
      intersection++;
    } else {
      // Partial token match (e.g. "farin" in "farinha")
      for (const t2 of tokens2) {
        if (t2.includes(token) || token.includes(t2)) {
          intersection += 0.5;
          break;
        }
      }
    }
  }

  return (2 * intersection) / (tokens1.size + tokens2.size);
}

/**
 * Combined similarity score (0 to 1) using normalized Levenshtein + Token similarity.
 */
export function stringSimilarity(str1: string, str2: string): number {
  const norm1 = normalizeText(str1);
  const norm2 = normalizeText(str2);

  if (norm1 === norm2) return 1.0;
  if (!norm1 || !norm2) return 0.0;

  const maxLen = Math.max(norm1.length, norm2.length);
  const levDist = levenshteinDistance(norm1, norm2);
  const levScore = 1 - levDist / maxLen;

  const tokScore = tokenSimilarity(str1, str2);

  return Math.max(levScore * 0.4 + tokScore * 0.6, tokScore);
}

/**
 * Finds the best match in list of items based on a target text.
 */
export function findBestMatch<T>(
  targetText: string,
  items: T[],
  getName: (item: T) => string,
  minThreshold = 0.25
): MatchResult<T> | null {
  if (!targetText || items.length === 0) return null;

  let bestItem: T | null = null;
  let bestScore = 0;

  for (const item of items) {
    const itemName = getName(item);
    const score = stringSimilarity(targetText, itemName);

    if (score > bestScore) {
      bestScore = score;
      bestItem = item;
    }
  }

  if (bestItem && bestScore >= minThreshold) {
    return { item: bestItem, score: bestScore };
  }

  return null;
}

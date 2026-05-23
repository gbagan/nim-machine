export function pseudoRandom(n: number) {
  const m = 100 * Math.sin(n + 1);
  return m - Math.floor(m);
}

export function pseudoShuffle<A>(array: A[], seed = 0): A[] {
  const result = [...array];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(pseudoRandom(i + seed * 1000) * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}
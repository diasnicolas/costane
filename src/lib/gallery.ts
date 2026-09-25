export type TileSize = 'xl' | 's' | 'tall' | 'wide' | 'full';

/** Padrão de tamanhos que sempre fecha as linhas do mosaico (4 colunas no desktop, 2 no mobile). */
export function galleryPattern(n: number): TileSize[] {
  const cycles: TileSize[][] = [
    ['xl', 's', 'tall', 's', 'wide', 'wide'],
    ['tall', 's', 'xl', 's', 'wide', 'wide'],
  ];
  const rests: Record<number, TileSize[]> = {
    0: [],
    1: ['full'],
    2: ['wide', 'wide'],
    3: ['xl', 'tall', 'tall'],
    4: ['xl', 's', 'tall', 's'],
    5: ['xl', 's', 'tall', 's', 'full'],
  };
  const out: TileSize[] = [];
  const full = Math.floor(n / 6);
  for (let c = 0; c < full; c++) out.push(...cycles[c % 2]);
  return out.concat(rests[n % 6] ?? []);
}

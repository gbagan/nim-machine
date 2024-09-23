type Edge = {edge: number, dest: number};

export type Graph = {
  nodes: Edge[][],
}

export type Legend = {edge: number, name: string}[];

export type GraphDisplayer = {
  width: number,
  height: number,
  position: (v: number) => {x: number, y: number} | null,
  legend: Legend,
  vertexLabel: (v: number) => string | null, 
}

export type MachineBox = {edge: number, dest: number, nbBalls: number}[];

export type Machine = MachineBox[];

export function graphToMachine(graph: Graph, nbBalls: number): Machine {
  return graph.nodes.map(node => node.map(({edge, dest}) => ({edge, dest, nbBalls})))
}

export function nimGraph(n: number, moves: number[]): Graph {
  const nodes: Edge[][] = new Array(n+1);
  for (let i = 0; i <= n; i++) {
    const node: Edge[] = [];
    for (const j of moves) {
      if (i - j >= 0) {
        node.push({edge: j-1, dest: i-j});
      }
    }
    nodes[i] = node;
  }
  return {nodes};
}

export function kingGraph(width: number, height: number): Graph {
  const nodes: Edge[][] = new Array(width * height);
  for (let x = 0; x < width; x++) {
    for (let y = 0; y <  height; y++) {
      const node: Edge[] = [];
      if (x > 0)
        node.push({edge: 0, dest: y * width + x - 1});
      if (x > 0 && y > 0)
        node.push({edge: 1, dest: (y-1) * width + x - 1});
      if (y > 0)
        node.push({edge: 2, dest: (y-1) * width + x});
      nodes[y * width + x] = node;
    }
  }
  return {nodes};
}

export function nimDisplayer(moves: number[]): GraphDisplayer {
  return ({
    width: 800.0,
    height: 400.0,
    position: v => 
      v == 0
        ? null
        : v <= 8
        ? { x: (v - 1) * 100.0, y: 0.0 }
        : { x: (v - 9) * 100.0, y: 200.0 },
    legend: moves.map(move => ({ edge: move - 1, name: "" + move })),
    vertexLabel: v => "" + v
  })
}

export function kingDisplayer(width: number, height: number): GraphDisplayer {
  const maxdim = Math.max(width, height);
  return ({
    width: 180 * maxdim,
    height: 180 * maxdim,
    position: v => 
      v == 0
        ? null
        : { x: 50 + 180 * (v % width), y: 20 + 180 * (height - 1 - (v / width | 0))},
    legend: [{edge: 0, name: "⇐"}, {edge: 1, name: "⇙"}, {edge: 2, name: "⇓"}],
    vertexLabel: v => null
  })
}

// joue un coup aléatoire, renvoit null si aucun coup n'existe
export function randomPlays(machine: Machine, v: number): Edge | null {
  const edges = machine[v];
  if (edges.length === 0) {
    return null;
  } else {
    return edges[Math.random() * edges.length | 0]
  }
}

// joue le coup optimal si il existe, sinon joue un coup aléatoire
export function expertPlays(machine: Machine, losing: boolean[], v: number): Edge | null {
  if (losing[v]) {
    return randomPlays(machine, v);
  } else {
    return machine[v].find(({dest}) => losing[dest]) ?? null;
  }
}

// joue au hasard en fonction du nombre de balles de chaque couleur dans le casier
export function machinePlays(machine: Machine, v: number): Edge | null {
  const box = machine[v];
  let sum = 0;
  const psums = [];
  for (let i = 0; i < box.length; i++) {
    sum += box[i].nbBalls;
    psums.push(sum);
  }
  if (sum == 0) {
    return null;
  }
  let rnd = Math.random() * sum | 0
  let idx = psums.findIndex(s => rnd < s);
  return {dest: box[idx].dest, edge: box[idx].edge};
}
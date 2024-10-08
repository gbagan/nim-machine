import { Graph, graphToMachine, Machine, kingGraph, nimGraph } from "./graph";

export type Adversary = "random" | "expert" | "machine";

export type NimType = {
  type: "nim",
  size: number,
  moves: number[] 
}

export type KingType = {
  type: "king",
  width: number,
  height: number
}

export type GraphType = NimType | KingType;

export type Config = {
  graphType: GraphType,
  adversary: Adversary,
  ballsPerColor: number,
  reward: number,
  penalty: number,
  machineStarts: boolean
}

export type State = {
  config: Config,
  victories: number,
  losses: number,
  machine: Machine,
  colors: string[],
  isRunning: boolean,
  fastMode: boolean,
}

export function getGraph(state: State): Graph {
  const graphType = state.config.graphType;
  if (graphType.type === "nim") {
    return nimGraph(graphType.size, graphType.moves)
  } else {
    return kingGraph(graphType.width, graphType.height)
  }
}
 
export function initMachine(state: State): State {
  const graph = getGraph(state);
  const machine = graphToMachine(graph, state.config.ballsPerColor);
  return { ...state, machine }
}
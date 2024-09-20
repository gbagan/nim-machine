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

export type Model = {
  config: Config,
  nbVictories: number,
  nbLosses: number,
  machine: Machine,
  isRunning: boolean,
  colors: string[],
  fastMode: boolean,
}

function getGraph(model: Model): Graph {
  const graphType = model.config.graphType;
  if (graphType.type === "nim") {
    return nimGraph(graphType.size, graphType.moves)
  } else {
    return kingGraph(graphType.width, graphType.height)
  }
}
 
export function initMachine(model: Model): Model {
  const graph = getGraph(model);
  const machine = graphToMachine(graph, model.config.ballsPerColor);

  return { ...model, machine, nbVictories: 0, nbLosses: 0, isRunning: false }
}
import { type Graph, graphToMachine, type Machine, kingGraph, nimGraph } from "./graph";

export type Adversary = "random" | "expert" | "machine";

export type NimType = {
  type: "nim";
  size: number;
  moves: number[];
}

export type KingType = {
  type: "king";
  width: number;
  height: number;
}

export type GraphType = NimType | KingType;

export type Config = {
  graphType: GraphType;
  adversary: Adversary;
  ballsPerColor: number;
  reward: number;
  penalty: number;
  machineStarts: boolean;
}
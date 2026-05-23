<script lang="ts">
  import { xoroshiro128Plus } from '@gbagan/rng';
  import { nimDisplayer, kingDisplayer, randomPlays, expertPlays, machinePlays,
    graphToMachine, nimGraph, kingGraph } from './lib/graph';
  import type { Config } from './lib/model';
  import Card from './components/Card.svelte';
  import ConfigView from './components/Config.svelte';
  import Legend from './components/Legend.svelte';
  import Score from './components/Score.svelte';
  import MachineView from './components/Machine.svelte';
  import { sleep } from '@gbagan/utils';

  const baseColors: string[] = [
    "#f6b73c", // yellow
    "#ff0000", // red
    "#00ffff", // cyan
    "#90ee90", // light green 
    "#900090", // magenta"
  ];

  let config: Config = $state({
    graphType: {type: "nim", size: 8, moves: [ 1, 2 ]},
    adversary: 'random',
    ballsPerColor: 6,
    reward: 3,
    penalty: -1,
    machineStarts: true,
  });

  let victories = $state(0);
  let losses = $state(0);
  let machine = $state.raw(initMachine());
  let isRunning = $state(false);
  let colors = $state([...baseColors]);
  let fastMode = $state(false);

  const rng = xoroshiro128Plus();

  // derived
  let source = $derived.by(() => {
    const graphType = config.graphType;
    return graphType.type === "nim" 
      ? graphType.size
      : graphType.width * graphType.height - 1
  });

  let displayer = $derived.by(() => {
    const graphType = config.graphType;
    return graphType.type === "nim"
      ? nimDisplayer(graphType.moves)
      : kingDisplayer(graphType.width, graphType.height)
  });

  let losingPositions = $derived.by(() => {
    const n = machine.length;
    const positions: boolean[] = new Array(n);
    for (let i = 0; i < n; i++) {
      positions[i] = machine[i].every(({dest}) => !positions[dest]);
    }
    return positions;
  });

  function initMachine() {
    const graphType = config.graphType;
    const graph = graphType.type === "nim"
      ? nimGraph(graphType.size, graphType.moves)
      : kingGraph(graphType.width, graphType.height);
    return graphToMachine(graph, config.ballsPerColor);
  }

  function adversaryPlays(pos: number) {
    switch(config.adversary) {
      case "random": return randomPlays(machine, pos, rng);
      case "expert": return expertPlays(machine, losingPositions, pos, rng);
      case "machine": return machinePlays(machine, pos, rng);
    }
  }

  function step() {
    const machine2 = machine.map(box => box.map(x => ({...x}))); 
    let isMachineTurn = config.machineStarts;
    let pos = source;
    // simule une partie et place la liste des coups joués dans moves
    const moves: {pos: number, edge: number, isMachineTurn: boolean}[] = [];
    while(true) {
      const move = isMachineTurn ? machinePlays(machine2, pos, rng) : adversaryPlays(pos);
      if (move === undefined) break;
      moves.push({pos, edge: move.edge, isMachineTurn});
      isMachineTurn = !isMachineTurn;
      pos = move.dest;
    }
    const win = isMachineTurn;
    if(win) { victories++ } else { losses++ };

    // ajuste les billes
    for (const {pos, edge, isMachineTurn} of moves) {
      const box = machine2[pos];
      const i = box.findIndex(b => b.edge === edge);
      box[i].nbBalls = Math.max(0,
        box[i].nbBalls + (
        !isMachineTurn && config.adversary !== "machine"
        ? 0
        : win === isMachineTurn
        ? config.reward
        : config.penalty
        ) 
      )
    }
    // si il n'y a plus de billes dans un casier, on en remet
    const n = machine2.length;
    for (let i = 0; i < n; i++) {
      if (machine2[i].every(({nbBalls}) => nbBalls === 0)) {
        const m = machine2[i].length;
        for (let j = 0; j < m; j++) {
          machine2[i][j].nbBalls = config.ballsPerColor
        }
      }
    }
    machine = machine2;
  }

  function changeConfig(fn: (conf: Config) => void): void {
    fn(config);
    victories = 0;
    losses = 0;
    isRunning = false;
    machine = initMachine();
  }

  function setColor(idx: number, color: string) {
    colors[idx] = color;
  }

  async function startMachine() {
    isRunning = true;
    while (isRunning) {
      step();
      await sleep(fastMode ? 100 : 500);
    }
  }

  function stopMachine() {
    isRunning = false;
  }

  function setFastMode(m: boolean) {
    fastMode = m
  }
</script>

<div class="main-container">
  <Card title="Visualisation de la machine">
    <div class="machine-container">
      <MachineView {displayer} {colors} {machine} />
      <Score {victories} {losses} />
    </div>
  </Card>
  <Legend legend={displayer.legend} {colors} {setColor} />
  <ConfigView {config} {isRunning} {changeConfig} {startMachine} {stopMachine} {setFastMode} />
</div>

<style>
  .main-container {
    width: 100vw;
    display: flex;
    flex-direction: row;
    justify-content: space-around;
    align-items: flex-start;  
  }

  .machine-container {
    display: flex;
    flex-direction: column;
  }
</style>
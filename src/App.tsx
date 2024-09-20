import { createMemo, Component } from 'solid-js';
import { createStore, produce } from "solid-js/store";
import { nimDisplayer, kingDisplayer, randomPlays, expertPlays, machinePlays } from './graph';
import { Config, initMachine, State } from './model';
import { Card } from './UI';
import ConfigView from './Config';
import LegendView from './Legend';
import Score from './Score';
import MachineView from './Machine';
import { createTimer } from '@solid-primitives/timer';

const baseColors: string [] = [
  "#f6b73c", // yellow
  "#ff0000", // red
  "#00ffff", // cyan
  "#90ee90", // light green 
  "#900090", // magenta" 
]

const initConfig: Config = {
  graphType: {type: "nim", size: 8, moves: [ 1, 2 ]},
  adversary: 'random',
  ballsPerColor: 6,
  reward: 3,
  penalty: -1,
  machineStarts: true,
}

const initState: State = initMachine({
  config: initConfig,
  victories: 0,
  losses: 0,
  machine: [],
  isRunning: false,
  colors: baseColors,
  fastMode: false
});


const App: Component = () => {
  // model
  const [state, setState] = createStore(initState);

  // derived
  const machine = () => state.machine;

  const source = () => {
    const graphType = state.config.graphType;
    if (graphType.type === "nim") {
      return graphType.size;
    } else {
      return graphType.width * graphType.height - 1;
    }
  }

  const displayer = createMemo(() => {
    const graphType = state.config.graphType;
    if (graphType.type === "nim") {
      return nimDisplayer(graphType.moves)
    } else {
      return kingDisplayer(graphType.width, graphType.height);
    }
  })

  const losingPositions = createMemo(() => {
    const n = machine().length;
    const positions: boolean[] = new Array(n);
    for (let i = 0; i < n; i++) {
      positions[i] = machine()[i].every(({dest}) => !positions[dest])
    }
    return positions;
  });

  const adversaryPlays = (pos: number) => {
    switch(state.config.adversary) {
      case "random": return randomPlays(machine(), pos);
      case "expert": return expertPlays(machine(), losingPositions(), pos);
      case "machine": return machinePlays(machine(), pos);
    }
  }

  const runGame = () => {
    let isMachineTurn = state.config.machineStarts;
    let pos = source();
    // simule une partie et place la liste des coups joués dans moves
    const moves: {pos: number, edge: number, isMachineTurn: boolean}[] = [];
    while(true) {
      const move = isMachineTurn ? machinePlays(machine(), pos) : adversaryPlays(pos);
      if (move === undefined) {
        break;
      }
      moves.push({pos, edge: move.edge, isMachineTurn})
      isMachineTurn = !isMachineTurn;
      pos = move.dest;
    }
    const win = isMachineTurn;
    
    setState(produce(state => {
      if (win) {
        state.victories++;
      } else {
        state.losses++;
      }
      // ajuste les billes
      for (const {pos, edge, isMachineTurn} of moves) {
        state.machine[pos][edge].nbBalls = Math.max(0, 
          state.machine[pos][edge].nbBalls + (
            !isMachineTurn && state.config.adversary !== "machine"
            ? 0
            : win === isMachineTurn
            ? state.config.reward
            : state.config.penalty
          ) 
        );
      }
      // si il n'y a plus de balles dans un casier, on en remet
      const n = state.machine.length;
      for (let i = 0; i < n; i++) {
        if (state.machine[i].every(({nbBalls}) => nbBalls === 0)) {
          const m = state.machine[i].length;
          for (let j = 0; j < m; j++) {
            state.machine[i][j].nbBalls = state.config.ballsPerColor;
          }
        }
      }
    }));
  }
  
  createTimer(runGame, () => state.isRunning && (state.fastMode ? 100 : 500), setInterval);

  // actions
  const changeConfig = (fn: (c: Config) => Config) => {
    const newConfig = fn(state.config);
    const newModel = initMachine({...state, config: newConfig});
    setState(newModel);
  }

  const setColor = (idx: number, color: string) => {
    setState("colors", idx, color);
  }

  const startMachine = () => {
    setState("isRunning", true)
  }

  const stopMachine = () => {
    setState("isRunning", false)
  }

  const setFastMode = (fastMode: boolean) => {
    setState("fastMode", fastMode)
  }

  const actions = {
    changeConfig,
    startMachine,
    stopMachine,
    setFastMode,
  }

  // view
  return (
    <div class="w-screen flex flex-row justify-around items-start">
      <Card title="Visualisation de la machine">
        <div class="flex flex-col">
          <MachineView
            displayer={displayer()}
            colors={state.colors}
            machine={state.machine}
          />
          <Score victories={state.victories} losses={state.losses}/>
        </div>
      </Card>
      <LegendView legend={displayer().legend} colors={state.colors} setColor={setColor}/>
      <ConfigView config={state.config} isRunning={state.isRunning} actions={actions}/>
    </div>
  )
}

export default App;
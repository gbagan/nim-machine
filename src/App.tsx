import { createMemo, Component, createSignal } from 'solid-js';
import { createStore, produce } from "solid-js/store";
import { Card } from './UI';
import { nimDisplayer, kingDisplayer, randomPlays, expertPlays, machinePlays } from './graph';
import { Config, initMachine, Model } from './model';
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

const initModel: Model = initMachine({
  config: initConfig,
  nbVictories: 0,
  nbLosses: 0,
  machine: [],
  isRunning: false,
  colors: baseColors,
  fastMode: false
});


const App: Component = () => {
  // model
  const [model, setModel] = createStore(initModel);

  // derived
  const machine = () => model.machine;

  const source = () => {
    const graphType = model.config.graphType;
    if (graphType.type === "nim") {
      return graphType.size;
    } else {
      return graphType.width * graphType.height - 1;
    }
  } 

  const displayer = createMemo(() => {
    const graphType = model.config.graphType;
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
    switch(model.config.adversary) {
      case "random": return randomPlays(machine(), pos);
      case "expert": return expertPlays(machine(), losingPositions(), pos);
      case "machine": return machinePlays(machine(), pos);
    }
  }

  const runGame = () => {
    let isMachineTurn = model.config.machineStarts;
    let pos = source();
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
    
    setModel(produce(model => {
      if (win) {
        model.nbVictories++;
      } else {
        model.nbLosses++;
      }
      // ajuste les billes
      for (const {pos, edge, isMachineTurn} of moves) {
        model.machine[pos][edge].nbBalls = Math.max(0, 
          model.machine[pos][edge].nbBalls + (
            !isMachineTurn && model.config.adversary !== "machine"
            ? 0
            : win === isMachineTurn
            ? model.config.reward
            : model.config.penalty
          ) 
        );
      }
      // si il n'y a plus de balles dans un casier, on en remet
      const n = model.machine.length;
      for (let i = 0; i < n; i++) {
        if (model.machine[i].every(({nbBalls}) => nbBalls === 0)) {
          const m = model.machine[i].length;
          for (let j = 0; j < m; j++) {
            model.machine[i][j].nbBalls = model.config.ballsPerColor;
          }
        }
      }
    }));
  }
  
  createTimer(runGame, () => model.isRunning && (model.fastMode ? 100 : 500), setInterval);

  // actions
  const changeConfig = (f: (c: Config) => Config) => {
    const newConfig = f(model.config);
    const newModel = initMachine({...model, config: newConfig});
    setModel(newModel);
  }

  const setColor = (idx: number, color: string) => {
    setModel("colors", idx, color);
  }

  const startMachine = () => {
    setModel("isRunning", true)
  }

  const stopMachine = () => {
    setModel("isRunning", false)
  }

  const setFastMode = (fastMode: boolean) => {
    setModel("fastMode", fastMode)
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
            colors={model.colors}
            machine={model.machine}
          />
          <Score nbVictories={model.nbVictories} nbLosses={model.nbLosses}/>
        </div>
      </Card>
      <LegendView legend={displayer().legend} colors={model.colors} setColor={setColor}/>
      <ConfigView config={model.config} isRunning={model.isRunning} actions={actions}/>
    </div>
  )
}

export default App;
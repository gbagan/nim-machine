import range from 'lodash.range';
import { Component, For, Match, Switch } from 'solid-js';
import { SetStoreFunction } from "solid-js/store";
import { Adversary, GraphType, Config, KingType, NimType } from '../model';
import Card from './Card';

function changeMoves(moves: number[], elem: number, b: boolean): number[] {
  return b ? [...moves, elem].toSorted() : moves.filter(i => i !== elem);
}

type ConfigComponent = Component<{
  config: Config,
  isRunning: boolean,
  changeConfig: SetStoreFunction<Config>,
  startMachine: () => void,
  stopMachine: () => void,
  setFastMode: (fastMode: boolean) => void,
}>

const ConfigView: ConfigComponent = props => {
  function graphType(type: string): GraphType {
    return type === "nim"
      ? { type: "nim", size: 8, moves: [1, 2] }
      : { type: "king", width: 3, height: 3 };
  }

  return (
    <Card title="Choix des paramètres">
      <div class="grid grid-cols-2 gap-4">
        <div>type de jeu</div>
        <select
          class="select"
          value={props.config.graphType.type}
          onChange={e => props.changeConfig("graphType", graphType(e.currentTarget.value))}
        >
          <option value="nim">Nim</option>
          <option value="king">Roi</option>
        </select>
        <Switch>
          <Match when={props.config.graphType.type === "nim"}>
            <div>Nombre de casiers</div>
            <select
              class="select"
              value={(props.config.graphType as NimType).size}
              onChange={e => (props.changeConfig as any)("graphType", "size", Number(e.currentTarget.value))}
            >
              <For each={range(8, 17)}>
                {i => <option value={i}>{i}</option>}
              </For>
            </select>
            <div>Coups possibles</div>
            <div class="flex flex-row justify-between">
              <For each={range(1, 6)}>
                {i => (
                  <label>
                    <input
                      type="checkbox"
                      checked={(props.config.graphType as NimType).moves.includes(i)}
                      onChange={e => (props.changeConfig as any)("graphType", "moves",
                        (moves: number[]) => changeMoves(moves, i, e.currentTarget.checked)
                      )}
                      class="checkbox"
                    />
                    <span class="ml-2 text-sm font-medium text-gray-900">{i}</span>
                  </label>
                )}
              </For>
            </div>
          </Match>
          <Match when={props.config.graphType.type === "king"}>
            <div>Hauteur de la grille</div>
            <select
              class="select"
              value={(props.config.graphType as KingType).height}
              onChange={e => (props.changeConfig as any)("graphType", "height", Number(e.currentTarget.value))}
            >
              <For each={range(3, 7)}>
                {i => <option value={i}>{i}</option>}
              </For>
            </select>
            <div>Largeur de la grille</div>
            <select
              class="select"
              value={(props.config.graphType as KingType).width}
              onChange={e => (props.changeConfig as any)("graphType", "width", Number(e.currentTarget.value))}
            >
              <For each={range(3, 7)}>
                {i => <option value={i}>{i}</option>}
              </For>
            </select>
          </Match>
        </Switch>
        <div>Adversaire</div>
        <select
          class="select"
          value={props.config.adversary}
          onChange={e => props.changeConfig("adversary", e.currentTarget.value as Adversary)}
        >
          <option value="random">Aléatoire</option>
          <option value="expert">Expert</option>
          <option value="machine">Machine</option>
        </select>
        <div>Billes par couleur</div>
        <input
          type="number"
          class="input-number"
          min="2"
          max="10"
          value={props.config.ballsPerColor}
          onChange={e => props.changeConfig("ballsPerColor", e.currentTarget.valueAsNumber)}
        />
        <div>Récompense</div>
        <input
          type="number"
          class="input-number"
          min="1"
          value={props.config.reward}
          onChange={e => props.changeConfig("reward", e.currentTarget.valueAsNumber)}
        />
        <div>Pénalité</div>
        <input
          type="number"
          class="input-number"
          max="0"
          value={props.config.penalty}
          onChange={e => props.changeConfig("penalty", e.currentTarget.valueAsNumber)}
        />
        <div>La machine commence</div>
        <select
          class="select"
          value={props.config.machineStarts ? "y" : "n"}
          onChange={e => props.changeConfig("machineStarts", e.currentTarget.value === "y")}
        >
          <option value="y">Oui</option>
          <option value="n">Non</option>
        </select>
        <Switch>
          <Match when={props.isRunning}>
            <button
              class="btn"
              onClick={props.stopMachine}
            >
              Arrêter la machine
            </button>
          </Match>
          <Match when={!props.isRunning}>
            <button
              class="btn"
              onClick={props.startMachine}
            >
              Lancer la machine
            </button>
          </Match>
        </Switch>
        <button
          class="btn"
          onPointerDown={() => props.setFastMode(true)}
          onPointerUp={() => props.setFastMode(false)}
          onPointerLeave={() => props.setFastMode(false)}
        >
          Accélerer
        </button>
      </div>
    </Card>
  )
}

export default ConfigView;
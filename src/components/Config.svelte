<script lang="ts">
  import { clamp, range } from '@gbagan/utils';
  import type { Adversary, GraphType, Config, KingType, NimType } from '../lib/model'
  import Card from './Card.svelte'

  type Props = {
    config: Config,
    isRunning: boolean,
    changeConfig: (fn: (conf: Config) => void) => void,
    startMachine: () => void,
    stopMachine: () => void,
    setFastMode: (fastMode: boolean) => void,
  }

  let { config, isRunning, changeConfig, startMachine, stopMachine, setFastMode }: Props = $props();


  function changeMoves(moves: number[], elem: number, b: boolean): number[] {
    return b ? [...moves, elem].toSorted() : moves.filter(i => i !== elem)
  }

  function graphType(type: string): GraphType {
    return type === "nim"
      ? { type: "nim", size: 8, moves: [1, 2] }
      : { type: "king", width: 3, height: 3 };
  }
</script>

<Card title="Choix des paramètres">
  <div class="body">
      <div>Type de jeu</div>
      <select
        class="select"
        value={config.graphType.type}
        onchange={e => changeConfig(c => c.graphType = graphType(e.currentTarget.value))}
      >
        <option value="nim">Nim</option>
        <option value="king">Roi</option>
      </select>
      {#if config.graphType.type === "nim"}
        <div>Nombre de casiers</div>
        <select
          class="select"
          value={config.graphType.size}
          onchange={e => changeConfig(c => (c.graphType as NimType).size = Number(e.currentTarget.value))}
        >
          {#each range(8, 17) as i}
            <option value={i}>{i}</option>
          {/each}
        </select>
        <div>Coups possibles</div>
        <div class="checkboxes">
          {#each range(1, 6) as i}
            <label>
              <input
                type="checkbox"
                checked={config.graphType.moves.includes(i)}
                onchange={e => changeConfig(c => (c.graphType as NimType).moves = 
                  changeMoves((c.graphType as NimType).moves, i, e.currentTarget.checked)
                )}
                class="checkbox"
              />
              <span class="checkbox-label">{i}</span>
            </label>
          {/each}
        </div>
      {:else}
        <div>Hauteur de la grille</div>
        <select
          class="select"
          value={config.graphType.height}
          onchange={e => changeConfig(c => (c.graphType as KingType).height = Number(e.currentTarget.value))}
        >
          {#each range(3, 7) as i}
            <option value={i}>{i}</option>
          {/each}
        </select>
        <div>Largeur de la grille</div>
        <select
          class="select"
          value={config.graphType.width}
          onchange={e => changeConfig(c => (c.graphType as KingType).width = Number(e.currentTarget.value))}
        >
          {#each range(3, 7) as i}
            <option value={i}>{i}</option>
          {/each}
        </select>
      {/if}
      <div>Adversaire</div>
      <select
        class="select"
        value={config.adversary}
        onchange={e => changeConfig(c => c.adversary = e.currentTarget.value as Adversary)}
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
        value={config.ballsPerColor}
        onchange={e => changeConfig(c =>
          c.ballsPerColor = clamp(Math.floor(e.currentTarget.valueAsNumber), 2, 10)
        )}
      />
      <div>Récompense</div>
      <input
        type="number"
        class="input-number"
        min="1"
        max="10"
        value={config.reward}
        onchange={e => changeConfig(c =>
          c.reward = clamp(Math.floor(e.currentTarget.valueAsNumber), 1, 10)
        )}
      />
      <div>Pénalité</div>
      <input
        type="number"
        class="input-number"
        min="-10"
        max="0"
        value={config.penalty}
        onchange={e => changeConfig(c =>
          c.penalty = clamp(Math.floor(e.currentTarget.valueAsNumber), -10, 0)
        )}
      />
      <div>La machine commence</div>
      <select
        class="select"
        value={config.machineStarts ? "y" : "n"}
        onchange={e => changeConfig(c => c.machineStarts = e.currentTarget.value === "y")}
      >
        <option value="y">Oui</option>
        <option value="n">Non</option>
      </select>
      {#if isRunning}
        <button class="btn" onclick={stopMachine}>Arrêter la machine</button>
      {:else}
        <button class="btn" onclick={startMachine}>Lancer la machine</button>
      {/if}
      <button class="btn"
        onpointerdown={() => setFastMode(true)}
        onpointerup={() => setFastMode(false)}
        onpointerleave={() => setFastMode(false)}
      >
        Accélerer
      </button>
    </div>
</Card>

<style>
  .body {
    width: 32rem;
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 1rem;
  }

  .checkboxes {
    display: flex;
    flex-direction: row;
    justify-content: space-between;
  }
</style>
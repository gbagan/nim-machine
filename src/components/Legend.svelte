<script lang="ts">
  import Card from "./Card.svelte";
  import type { Legend } from "../lib/graph";

  type Props = {
    legend: Legend;
    colors: string[];
    setColor: (idx: number, color: string) => void;
  }

  let { legend, colors, setColor }: Props = $props();
</script>

<Card title="Légende">
  <div class="body">
    {#each legend as {edge, name}}
      <input
        type="color"
        class="color"
        value={colors[edge] ?? "#000000"}
        onchange={e => setColor(edge, e.currentTarget.value)}
      />
      <span class="name"> : {name}</span>
    {/each}
  </div>
</Card>

<style>
  .body {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 1rem;
  }

  .color {
    margin: none;
    padding: none;
    border: none;
    display: inline;
    width: 3rem;
    height: 3rem;
    cursor: pointer;
  }

  .name {
    font-size: 1.5rem;
    line-height: 2rem;
  }
</style>
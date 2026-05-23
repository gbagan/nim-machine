<script lang="ts">
  import type { GraphDisplayer, Machine } from "../lib/graph";
  import Box from "./Box.svelte";

  type Props = {
    displayer: GraphDisplayer;
    colors: string[];
    machine: Machine;
  }

  let { displayer, colors, machine}: Props = $props();
</script>

<div class="container">
  <svg viewBox="0 0 {displayer.width} {displayer.height}">
    {#each machine as box, idx}
      <Box {displayer} {colors} {idx} {box} />
    {/each}
  </svg>
</div>

<style>
  .container {
    width: 40rem;
  }
</style>
<script lang="ts">
  import { arrayOf, sumBy } from '@gbagan/utils';
  import type { GraphDisplayer, MachineBox } from '../lib/graph';
  import { pseudoRandom, pseudoShuffle } from '../lib/util';

  type Props = {
    displayer: GraphDisplayer;
    colors: string[];
    idx: number;
    box: MachineBox;
  }

  let {displayer, colors, idx, box}: Props = $props();

  let position = $derived(displayer.position(idx));
  let label = $derived(displayer.vertexLabel(idx));
  let balls = $derived(pseudoShuffle(
    box.flatMap(({nbBalls, edge}) => arrayOf(nbBalls, edge))
  ));
  let segments = $derived.by(() => {
    let total = sumBy(box, b => b.nbBalls);
    const segs = [];
    let psum = 0;
    for (const {nbBalls, edge} of box) {
      segs.push({ begin: psum / total, end: (psum + nbBalls) / total, edge });
      psum += nbBalls;
    }
    return segs;
  });
</script>

{#if position !== null}
  {@const height = Math.min(95, balls.length)}
  <g style:transform="translate({position.x}px, {position.y}px)">
    <path
      d="M1 1 L10 109 L90 109 L99 1"
      stroke-width="3.0"
      stroke="#000"
      fill="transparent"
    />
    {#each balls as color, i}
      <circle
        cx={15 + pseudoRandom(idx + i) * 71}
        cy={100 - pseudoRandom(10 + idx + i) * height}
        r="5"
        fill={colors[color]}
      />
    {/each}
    {#each segments as {begin, end, edge}}
      <rect
        x={3 + 94 * begin}
        y="115"
        width={94 * (end - begin)}
        height="20"
        stroke="black"
        fill={colors[edge]}
      />
    {/each}
    {#if label !== null}
      <text x="50" y="150">{label}</text>
    {/if}
  </g>
{/if}
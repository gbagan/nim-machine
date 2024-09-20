import { Component, createMemo, Index, Show } from "solid-js";
import { GraphDisplayer, MachineBox } from "./graph";
import { pseudoRandom, replicate } from "./util";
import { shuffle } from "lodash";

type BoxComponent = Component <{
  displayer: GraphDisplayer,
  colors: string[],
  idx: number,
  box: MachineBox,
}>

const Box: BoxComponent = props => {
  const position = createMemo(() => props.displayer.position(props.idx));
  const balls = createMemo(() => shuffle(props.box.flatMap(({nbBalls, edge}) => replicate(nbBalls, edge))));
  const height = () =>  Math.min(95, balls().length);
  const segments = () => {
    const segs = [];
    const total = props.box.reduce((acc, {nbBalls}) => acc+nbBalls, 0); 
    let psum = 0;
    for (const {nbBalls, edge} of props.box) {
      segs.push({begin: psum / total, end: (psum+nbBalls)/total, edge});
      psum += nbBalls;
    }
    return segs;
  }

  return (
    <Show when={position()}>
      <g style={{
        transform: `translate(${position()!.x}px, ${position()!.y}px)`
      }}>
        <path
          d="M1 1 L10 109 L90 109 L99 1"
          stroke-width="3.0"
          stroke="#000"
          fill="transparent"
        />
        { balls().map((color, i) => (
          <circle
            cx={15 + pseudoRandom(props.idx + i) * 71}
            cy={100 - pseudoRandom(10 + props.idx + i) * height()}
            r="5"
            fill={props.colors[color]}
          />
        ))}
        <Index each={segments()}>
          {seg => (
            <rect
              x={3.0 + 94.0 * seg().begin}
              y="115"
              width={94.0 * (seg().end - seg().begin)}
              height="20"
              stroke="black"
              fill={props.colors[seg().edge]}
            />
          )}
        </Index>
      </g>
    </Show>
  )
}

export default Box;
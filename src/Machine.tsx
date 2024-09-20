import { Component, For } from "solid-js"
import { GraphDisplayer, Machine } from "./graph"
import Box from "./Box"

type MachineComponent = Component <{
  displayer: GraphDisplayer,
  colors: string[],
  machine: Machine,
}>

const MachineView: MachineComponent = props => (
  <div class="w-[42vw]">
    <svg viewBox={`0 0 ${props.displayer.width} ${props.displayer.height}`}>
      <For each={props.machine}>
        {(box, idx) => <Box displayer={props.displayer} colors={props.colors} idx={idx()} box={box}/>}
      </For>
    </svg>
  </div>
)

export default MachineView
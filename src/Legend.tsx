import { Component } from "solid-js";
import { Card } from "./UI";
import { Legend } from "./graph";

type LegendComponent = Component <{
  legend: Legend,
  colors: string[],
  setColor: (idx: number, color: string) => void;
}>

const LegendView: LegendComponent = props => (
  <Card title="Légende">
    <div class="grid grid-cols-2 gap-4">
      {props.legend.map(({edge, name}, idx) => (
        <>
          <input
            type="color"
            class="inline w-12 h-12"
            value={props.colors[edge] ?? "#000000"}
            onChange={e => props.setColor(idx, e.currentTarget.value)}
          />
          <span class="text-2xl"> : {name}</span>
        </>
      ))}
    </div>
  </Card>
)

export default LegendView;
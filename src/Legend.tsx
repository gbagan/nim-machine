import { Component, For } from "solid-js";
import Card from "./Card";
import { Legend } from "./graph";

type LegendComponent = Component <{
  legend: Legend,
  colors: string[],
  setColor: (idx: number, color: string) => void;
}>

const LegendView: LegendComponent = props => (
  <Card title="Légende">
    <div class="grid grid-cols-2 gap-4">
      <For each={props.legend}>
        {({edge, name}) => (
          <>
            <input
              type="color"
              class="inline w-12 h-12"
              value={props.colors[edge] ?? "#000000"}
              onChange={e => props.setColor(edge, e.currentTarget.value)}
            />
          <span class="text-2xl"> : {name}</span>
        </>
        )}
      </For>
    </div>
  </Card>
)

export default LegendView;
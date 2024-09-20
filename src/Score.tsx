import { Component } from "solid-js"

type ScoreComponent = Component<{
  victories: number,
  losses: number,
}>

const Score: ScoreComponent = props => { 
  const total = () => props.victories + props.losses;

  return (
    <div class="flex flex-row justify-between mt-4 mb-2">
      <span class="text-blue-600 font-bold">Victoires: {props.victories}</span>
      <div class="w-full bg-red-600 rounded-full h-6">
        <div
          class="h-6 bg-blue-600 rounded-l-full"
          style={{
            width: total() === 0 ? "50%" : `${100 * props.victories / total()}%`
          }}
        />
      </div>
      <span class="text-red-600 font-bold">Défaites: {props.losses}</span>
    </div>
  )
}

export default Score
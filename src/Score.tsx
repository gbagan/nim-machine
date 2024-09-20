import { Component } from "solid-js"

type ScoreComponent = Component<{
  nbVictories: number,
  nbLosses: number,
}>

const Score: ScoreComponent = props => { 
  const total = () => props.nbVictories + props.nbLosses;

  return (
    <div class="flex flex-row justify-between mt-4 mb-2">
      <span class="text-blue-600 font-bold">Victoires: {props.nbVictories}</span>
      <div class="w-full bg-red-600 rounded-full h-6">
        <div
          class="h-6 bg-blue-600 rounded-l-full"
          style={{
            width: total() === 0 ? "50%" : `${100 * props.nbVictories / total()}%`
          }}
        />
      </div>
      <span class="text-red-600 font-bold">Défaites: {props.nbLosses}</span>
    </div>
  )
}

export default Score
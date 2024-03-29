module NimMachine.View (view) where

import Relude

import Data.Map as Map
import Pha.Html (Html)
import Pha.Html as H
import Pha.Html.Attributes as P
import Pha.Html.Events as E
import Pha.Html.Util (pc, px, translate)
import Pha.Svg as S
import Pha.Svg.Attributes as SA
import NimMachine.Graph (GraphDisplayer, Machine, MachineBox, Legend)
import NimMachine.Model (Config, Model, GraphType(..), adversaryToString, getDisplayer)
import NimMachine.Msg (Msg(..))
import NimMachine.Helpers (pseudoRandom, pseudoShuffle)

buttonClass ∷ String
buttonClass = "py-2.5 px-5 mr-2 mb-2 text-sm font-medium text-gray-900 focus:outline-none bg-white rounded-lg border border-gray-200 hover:bg-gray-100 hover:text-blue-700 focus:z-10 focus:ring-4 focus:ring-gray-200"

checkboxClass ∷ String
checkboxClass = "w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"

selectClass ∷ String
selectClass = "bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"

inputNumberClass ∷ String
inputNumberClass = "block w-full px-3 py-1.5 text-base font-normal text-gray-700 bg-white bg-clip-padding border border-solid border-gray-300 rounded transition ease-in-out m-0 focus:text-gray-700 focus:bg-white focus:border-blue-600 focus:outline-none"

cardClass ∷ String
cardClass = "rounded overflow-hidden shadow-lg p-4"

card ∷ ∀ a. String → Array (Html a) → Html a
card title body =
  H.div [ H.class_ cardClass ]
    $ [ H.div [ H.class_ "font-bold text-xl mb-2" ] [ H.text title ] ]
    <> body

drawPigeonhole
  ∷ ∀ a
  . GraphDisplayer Int Int
  → Array String
  → Int
  → MachineBox Int Int
  → Html a
drawPigeonhole displayer colors i box =
  H.maybe (displayer.position i) \{ x, y } →
    S.g [ H.style "transform" $ translate (px x) (px y) ]
      [ S.path
          [ SA.d "M1 1 L10 109 L90 109 L99 1"
          , SA.strokeWidth 3.0
          , SA.stroke "#000"
          , SA.fill "transparent"
          ]
      , S.g []
          ( let
              allBalls = box >>= \{ nbBalls, edge } → replicate nbBalls edge
              height = toNumber $ min 95 (length allBalls)
            in
              pseudoShuffle
                $ allBalls
                # mapWithIndex \j color →
                    S.circle
                      [ SA.cx $ 15.0 + pseudoRandom (i + j) * 71.0
                      , SA.cy $ 100.0 - pseudoRandom (10 + i + j) * height
                      , SA.r 5.0
                      , SA.fill $ colors !! color ?: "black"
                      ]
          )
      , S.g []
          ( let
              total = toNumber $ sum (_.nbBalls <$> box)
            in
              box
                # scanl
                    (\{ end } { nbBalls, edge } → { begin: end, end: end + toNumber nbBalls / total, edge })
                    { begin: 0.0, end: 0.0, edge: -1 }
                <#> \{ begin, end, edge } →
                  S.rect
                    [ SA.x $ 3.0 + 94.0 * begin
                    , SA.y 115.0
                    , SA.width $ 94.0 * (end - begin)
                    , SA.height 20
                    , SA.stroke "black"
                    , SA.fill $ colors !! edge ?: "black"
                    ]
          )
      , H.maybe (displayer.vertexLabel i) \label →
          S.text [ SA.x 50, SA.y 150 ] [ H.text label ]
      ]

scoreView ∷ ∀ a. Int → Int → Html a
scoreView nbVictories nbLosses =
  H.div [ H.class_ "flex flex-row justify-between mt-4 mb-2" ]
    [ H.span [ H.class_ "text-blue-600 font-bold" ] [ H.text $ "Victoires: " <> show nbVictories ]
    , H.div [ H.class_ "w-full bg-red-600 rounded-full h-6" ]
        [ H.div
            [ H.class_ "h-6 bg-blue-600 rounded-l-full"
            , H.style "width" $ pc $
                let
                  n = nbVictories + nbLosses
                in
                  if n == 0 then
                    0.5
                  else
                    toNumber nbVictories / toNumber n
            ]
            []
        ]
    , H.span [ H.class_ "text-red-600 font-bold" ] [ H.text $ "Défaites: " <> show nbLosses ]
    ]

machineView ∷ ∀ a. GraphDisplayer Int Int → Array String → Machine Int Int → Html a
machineView displayer colors machine =
  H.div [ H.class_ "w-[42vw]" ]
    [ S.svg [ SA.viewBox 0.0 0.0 displayer.width displayer.height ]
        $ machine
        # Map.toUnfoldable
        <#> uncurry (drawPigeonhole displayer colors)
    ]

legendView ∷ Legend Int → Array String → Html Msg
legendView legend colors =
  card "Légende"
    [ H.div [ H.class_ "grid grid-cols-2 gap-4" ]
        $ legend
        >>= \{ edge, name } →
          [ H.input
              [ P.type_ "color"
              , H.class_ "inline w-12 h-12"
              , P.value $ colors !! edge ?: "#000000"
              , E.onValueChange (ColorChange edge)
              ]
          , H.span [ H.class_ "text-2xl" ] [ H.text $ " : " <> name ]
          ]
    ]

configView ∷ Config → Boolean → Html Msg
configView conf isRunning =
  card "Choix des paramètres"
    [ H.div [ H.class_ "grid grid-cols-2 gap-4" ]
        $
          [ H.div [] [ H.text "type de jeu" ]
          , H.select
              [ H.class_ selectClass
              , P.value $ case conf.graphType of
                  Nim _ _ → "nim"
                  King _ _ → "king"
              , E.onValueChange SetGraphType
              ]
              [ H.option [ P.value "nim" ] [ H.text "Nim" ]
              , H.option [ P.value "king" ] [ H.text "Roi" ]
              ]
          ]
        <>
          ( case conf.graphType of
              Nim nbBoxes possibleMoves →
                [ H.div [] [ H.text "Nombre de casiers" ]
                , H.select
                    [ H.class_ selectClass
                    , P.value $ show nbBoxes
                    , E.onValueChange SetNbBoxes
                    ] $ (8 .. 16) <#> \i →
                    H.option [ P.value (show i) ] [ H.text (show i) ]
                , H.div [] [ H.text "Coups possibles" ]
                , H.div [ H.class_ "flex flex-row justify-between" ]
                    $ (1 .. 5)
                    <#> \i →
                      H.label []
                        [ H.input
                            [ P.type_ "checkbox"
                            , P.checked (elem i possibleMoves)
                            , H.class_ checkboxClass
                            , E.onChecked \_ → TogglePossibleMove i
                            ]
                        , H.span [ H.class_ "ml-2 text-sm font-medium text-gray-900" ] [ H.text $ show i ]
                        ]
                ]
              King width height →
                [ H.div [] [ H.text "Hauteur de la grille" ]
                , H.select
                    [ H.class_ selectClass
                    , P.value $ show height
                    , E.onValueChange SetKingHeight
                    ] $ (3 .. 6) <#> \i →
                    H.option [ P.value (show i) ] [ H.text (show i) ]
                , H.div [] [ H.text "Largeur de la grille" ]
                , H.select
                    [ H.class_ selectClass
                    , P.value $ show width
                    , E.onValueChange SetKingWidth
                    ] $ (3 .. 6) <#> \i →
                    H.option [ P.value (show i) ] [ H.text (show i) ]
                ]
          )
        <>
          [ H.div [] [ H.text "Adversaire" ]
          , H.elem "select"
              [ H.class_ selectClass
              , P.value (adversaryToString conf.adversary)
              , E.onValueChange SetAdversary
              ]
              [ H.elem "option" [ P.value "random" ] [ H.text "Aléatoire" ]
              , H.elem "option" [ P.value "expert" ] [ H.text "Expert" ]
              , H.elem "option" [ P.value "machine" ] [ H.text "Machine" ]
              ]
          , H.div [] [ H.text "Billes par couleur" ]
          , H.input
              [ P.type_ "number"
              , H.class_ inputNumberClass
              , P.min 2
              , P.max 10
              , P.value $ show conf.ballsPerColor
              , E.onValueChange SetBallsPerColor
              ]
          , H.div [] [ H.text "Récompense" ]
          , H.input
              [ P.type_ "number"
              , H.class_ inputNumberClass
              , P.min 1
              , P.value (show conf.reward)
              , E.onValueChange SetReward
              ]
          , H.div [] [ H.text "Pénalité" ]
          , H.input
              [ P.type_ "number"
              , H.class_ inputNumberClass
              , P.max 0
              , P.value (show conf.penalty)
              , E.onValueChange SetPenalty
              ]
          , H.div [] [ H.text "La machine commence" ]
          , H.select
              [ H.class_ selectClass
              , P.value (if conf.machineStarts then "y" else "n")
              , E.onValueChange SetMachineStarts
              ]
              [ H.option [ P.value "y" ] [ H.text "Oui" ]
              , H.option [ P.value "n" ] [ H.text "Non" ]
              ]
          , if isRunning then
              H.button [ H.class_ buttonClass, E.onClick \_ → StopMachine ] [ H.text "Arrêter la machine" ]
            else
              H.button [ H.class_ buttonClass, E.onClick \_ → RunMachine ] [ H.text "Lancer la machine" ]
          , H.button
              [ H.class_ buttonClass
              , E.onPointerDown \_ → SetFastMode true
              , E.onPointerUp \_ → SetFastMode false
              , E.onPointerLeave \_ → SetFastMode false
              ]
              [ H.text "Accélerer" ]
          ]
    ]

view ∷ Model → Html Msg
view model =
  H.div [ H.class_ "w-screen flex flex-row justify-around items-start" ]
    [ card "Visualisation de la machine"
        [ H.div [ H.class_ "flex flex-col" ]
            [ machineView displayer model.colors model.machine
            , scoreView model.nbVictories model.nbLosses
            ]
        ]
    , H.lazy2 legendView displayer.legend model.colors
    , H.lazy2 configView model.config model.isRunning
    ]
  where
  displayer = getDisplayer model
module NimMachine.Helpers where

import Relude

import Control.Monad.Gen.Trans (chooseInt)
import Data.Number as Number
import Data.Map as Map
import Data.Set as Set

randomPick ∷ ∀ a. Array a → Gen (Maybe a)
randomPick [] = pure Nothing
randomPick t = (t !! _) <$> chooseInt 0 (length t - 1)

pseudoRandom ∷ Int → Number
pseudoRandom n = m - Number.floor m
  where
  m = 100.0 * sin (toNumber (n + 1))

pseudoShuffle ∷ ∀ a. Array a → Array a
pseudoShuffle =
  mapWithIndex (\i x → pseudoRandom i /\ x)
    >>> sortWith fst
    >>> map snd

booleanMapToSet ∷ ∀ v. Ord v ⇒ Map v Boolean → Set v
booleanMapToSet = Map.filter identity >>> map (const unit) >>> Set.fromMap

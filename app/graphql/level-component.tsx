import { gql } from "@apollo/client"
import * as React from "react"
import { PropsWithChildren } from "react"
import { useLevelQuery } from "./generated"
import { useIsAuthed } from "./is-authed-context"
import { LevelContextProvider } from "./level-context"

gql`
  query network {
    globals {
      network
    }
  }

  query level {
    me {
      id
      defaultAccount {
        id
        level
      }
    }
  }
`

export const LevelContainer: React.FC<PropsWithChildren> = ({ children }) => {
  const isAuthed = useIsAuthed()
  const isAtLeastLevelZero = isAuthed

  const { data } = useLevelQuery({ fetchPolicy: "cache-only" })
  const level = data?.me?.defaultAccount?.level
  const isAtLeastLevelOne = level === "ONE" || level === "TWO"
  const isAtLeastLevelTwo = level === "TWO"

  const currentLevel = isAuthed && level ? level : "NonAuth"

  return (
    <LevelContextProvider
      value={{ isAtLeastLevelZero, isAtLeastLevelOne, isAtLeastLevelTwo, currentLevel }}
    >
      {children}
    </LevelContextProvider>
  )
}

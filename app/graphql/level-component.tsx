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
  const isAtLeaseLevelZero = isAuthed

  const { data } = useLevelQuery({ fetchPolicy: "cache-only" })

  const level = data?.me?.defaultAccount?.level
  const isAtLeaseLevelOne = level === "ONE"

  const currentLevel = isAuthed && level ? level : "NonAuth"

  return (
    <LevelContextProvider value={{ isAtLeaseLevelZero, isAtLeaseLevelOne, currentLevel }}>
      {children}
    </LevelContextProvider>
  )
}

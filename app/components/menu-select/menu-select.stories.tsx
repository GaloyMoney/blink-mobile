import * as React from "react"
import { Story, UseCase } from "../../../.storybook/views"
import { MenuSelect, MenuSelectItem } from "."

export default {
  title: "MenuSelect",
  component: MenuSelect,
}

export const Normal = () => {
  const [opt, setOpt] = React.useState("A")

  return (
    <Story>
      <UseCase text="Select Basic">
        <MenuSelect
          value={opt}
          onChange={async (x) => {
            setOpt(x)
          }}
        >
          <MenuSelectItem value="A">Option A</MenuSelectItem>
          <MenuSelectItem value="B">Option B</MenuSelectItem>
          <MenuSelectItem value="C">Option C</MenuSelectItem>
        </MenuSelect>
      </UseCase>
    </Story>
  )
}

export const Lazy = () => {
  const [opt1, setOpt1] = React.useState("A")
  const [opt2, setOpt2] = React.useState("A")

  return (
    <Story>
      <UseCase
        text="Select Lazy that Resolves"
        usage="For network calls or things that need time to execute to actually get selected"
      >
        <MenuSelect
          value={opt1}
          onChange={async (x) => {
            await new Promise((r) => {
              setTimeout(r, 1000)
            })
            setOpt1(x)
          }}
        >
          <MenuSelectItem value="A">Option A</MenuSelectItem>
          <MenuSelectItem value="B">Option B</MenuSelectItem>
          <MenuSelectItem value="C">Option C</MenuSelectItem>
        </MenuSelect>
      </UseCase>

      <UseCase
        text="Select Lazy that Rejects"
        usage="For network calls or things that failed"
      >
        <MenuSelect
          value={opt2}
          onChange={async (x) => {
            await new Promise((_, r) => {
              setTimeout(r, 1000)
            })
            setOpt2(x)
          }}
        >
          <MenuSelectItem value="A">Option A</MenuSelectItem>
          <MenuSelectItem value="B">Option B</MenuSelectItem>
          <MenuSelectItem value="C">Option C</MenuSelectItem>
        </MenuSelect>
      </UseCase>
    </Story>
  )
}

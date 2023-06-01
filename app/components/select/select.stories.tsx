import * as React from "react"
import { Story, UseCase } from "../../../.storybook/views"
import { Select, SelectItem } from "."

export default {
  title: "Select",
  component: Select,
}

export const Normal = () => {
  const [opt, setOpt] = React.useState("A")

  return (
    <Story>
      <UseCase text="Select Basic">
        <Select
          value={opt}
          onChange={(x) => {
            setOpt(x)
          }}
        >
          <SelectItem value="A">Option A</SelectItem>
          <SelectItem value="B">Option B</SelectItem>
          <SelectItem value="C">Option C</SelectItem>
        </Select>
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
        <Select
          value={opt1}
          onChange={async (x) => {
            await new Promise((r) => {
              setTimeout(r, 1000)
            })
            setOpt1(x)
          }}
        >
          <SelectItem value="A">Option A</SelectItem>
          <SelectItem value="B">Option B</SelectItem>
          <SelectItem value="C">Option C</SelectItem>
        </Select>
      </UseCase>

      <UseCase
        text="Select Lazy that Rejects"
        usage="For network calls or things that failed"
      >
        <Select
          value={opt2}
          onChange={async (x) => {
            await new Promise((_, r) => {
              setTimeout(r, 1000)
            })
            setOpt2(x)
          }}
        >
          <SelectItem value="A">Option A</SelectItem>
          <SelectItem value="B">Option B</SelectItem>
          <SelectItem value="C">Option C</SelectItem>
        </Select>
      </UseCase>
    </Story>
  )
}

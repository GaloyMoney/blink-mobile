import * as React from "react"
import { Story, UseCase } from "../../../.storybook/views"
import { ButtonGroup } from "."

export default {
  title: "ButtonGroup",
  component: ButtonGroup,
}

export const Default = () => {
  return (
    <Story>
      <UseCase text="Default">
        <ButtonGroup
          buttons={[
            { text: "Invoice", icon: "md-flash" },
            { text: "Paycode", icon: "md-at" },
            { text: "On-chain", icon: "logo-bitcoin" },
          ]}
        />
      </UseCase>
    </Story>
  )
}

import React from "react"
import { GaloyButtonField } from "."
import { Meta } from "@storybook/react"
import { Story, UseCase } from "../../../../.storybook/views"

export default {
  title: "Button/Field",
  component: GaloyButtonField,
} as Meta<typeof GaloyButtonField>

const defaultProps = {
  placeholder: "Tap to select amount",
  iconName: "pencil" as const,
}

const disabledProps = {
  ...defaultProps,
  disabled: true,
}

const lnInvoiceProps = {
  ...defaultProps,
  value:
    "lntb1u1pwz5w78pp5e8w8cr5c30xzws92v36sk45znhjn098rtc4pea6ertnmvu25ng3sdpywd6hyetyvf5hgueqv3jk6meqd9h8vmmfvdjsxqrrssy29mzkzjfq27u67evzu893heqex737dhcapvcuantkztg6pnk77nrm72y7z0rs47wzc09vcnugk2ve6sr2ewvcrtqnh3yttv847qqvqpvv398",
  iconName: "info" as const,
  highlightEnding: true,
}

const secondaryValueProps = {
  ...defaultProps,
  value: "Bitcoin Account",
  secondaryValue: "13,079,508 sats  (~$2,500.00 USD)",
  iconName: "pencil" as const,
}

const errorProps = {
  ...secondaryValueProps,
  error: true,
}

export const Default = () => (
  <Story>
    <UseCase text="Default">
      <GaloyButtonField {...defaultProps} />
    </UseCase>
    <UseCase text="Disabled">
      <GaloyButtonField {...disabledProps} />
    </UseCase>
    <UseCase text="LN Invoice">
      <GaloyButtonField {...lnInvoiceProps} />
    </UseCase>
    <UseCase text="Secondary Value">
      <GaloyButtonField {...secondaryValueProps} />
    </UseCase>
    <UseCase text="Error">
      <GaloyButtonField {...errorProps} />
    </UseCase>
  </Story>
)

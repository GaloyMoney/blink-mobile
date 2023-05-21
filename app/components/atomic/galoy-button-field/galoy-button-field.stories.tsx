import React from "react"
import { GaloyButtonField } from "."
import { StyleSheet, View } from "react-native"
import { Meta } from "@storybook/react"
import { Text } from "@rneui/base"
import { light } from "../../../rne-theme/colors"

const styles = StyleSheet.create({
  view: { padding: 10, margin: 10, backgroundColor: light._white },
  wrapper: { marginBottom: 10, marginTop: 5 },
  wrapperOutside: { marginVertical: 10 },
})

export default {
  title: "Button/Field",
  component: GaloyButtonField,
  decorators: [(Story) => <View style={styles.view}>{Story()}</View>],
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

const Wrapper = ({ children, text }) => (
  <View style={styles.wrapperOutside}>
    <Text style={styles.wrapper}>{text}</Text>
    {children}
  </View>
)

export const Default = () => (
  <View>
    <Wrapper text="Default">
      <GaloyButtonField {...defaultProps} />
    </Wrapper>
    <Wrapper text="Disabled">
      <GaloyButtonField {...disabledProps} />
    </Wrapper>
    <Wrapper text="LN Invoice">
      <GaloyButtonField {...lnInvoiceProps} />
    </Wrapper>
    <Wrapper text="Secondary Value">
      <GaloyButtonField {...secondaryValueProps} />
    </Wrapper>
    <Wrapper text="Error">
      <GaloyButtonField {...errorProps} />
    </Wrapper>
  </View>
)

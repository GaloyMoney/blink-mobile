import { storiesOf } from "@storybook/react-native"
import * as React from "react"
import { View } from "react-native"
import EStyleSheet from "react-native-extended-stylesheet"
import { InputPayment } from "."
import { StoryScreen } from "../../../storybook/views"

declare let module

const noop = () => {}

const props = {
  currencyPreference:"USD",
  price: 0.00011,
  prefCurrency: "sats", nextPrefCurrency: noop, 
}

const styles = EStyleSheet.create({
  section: {
    paddingHorizontal: 24,
    // flex: 1,
    // width: "100%"
  },
})

storiesOf("InputPayment", module)
  .addDecorator((fn) => <StoryScreen>{fn()}</StoryScreen>)
  .add("Editable True", () => (
    <View style={styles.section}>
      <InputPayment {...props} onUpdateAmount={noop} editable={true}/>
    </View>
  )) 
  .add("Editable False", () => (
    <View style={styles.section}>
      <InputPayment {...props} initAmount={12345} onUpdateAmount={noop} editable={false}/>
    </View>
  ))
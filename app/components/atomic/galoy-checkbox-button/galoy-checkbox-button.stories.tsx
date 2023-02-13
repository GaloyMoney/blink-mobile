import React from "react"

import { storiesOf } from "@storybook/react-native"

import { Story, StoryScreen, UseCase } from "../../../../.storybook/views"
import { GaloyCheckboxButton } from "./galoy-checkbox-button"

const onPress = () => {
  console.log("pressed")
}

storiesOf("Galoy Checkbox Button", module)
  .addDecorator((fn) => <StoryScreen>{fn()}</StoryScreen>)
  .add("Style Presets", () => (
    <Story>
      <UseCase text="Radio unchecked">
        <GaloyCheckboxButton checked={false} buttonType={"radio"} onPress={onPress} />
      </UseCase>
      <UseCase text="Radio">
        <GaloyCheckboxButton checked buttonType={"radio"} onPress={onPress} />
      </UseCase>
      <UseCase text="Checkbox unchecked">
        <GaloyCheckboxButton checked={false} onPress={onPress} buttonType={"checkbox"} />
      </UseCase>
      <UseCase text="Checkbox checked">
        <GaloyCheckboxButton checked buttonType={"checkbox"} onPress={onPress} />
      </UseCase>
      <UseCase text="Disabled Checkbox">
        <GaloyCheckboxButton
          checked={false}
          buttonType={"checkbox"}
          disabled={true}
          title={"disabled"}
        />
      </UseCase>
    </Story>
  ))


// import React from "react"
// import { View } from "react-native"
// import { palette } from "@app/theme"
// import { ComponentMeta } from "@storybook/react"
// import { Text } from "@rneui/base"
// import { GaloyCheckboxButton } from "./galoy-checkbox-button";

// export default {
//   title: "Button/Checkbox",
//   component: GaloyCheckboxButton,
//   decorators: [
//     (Story) =>  <View style={{ padding: 10, margin: 10, width: 100, height: 100, backgroundColor: palette.white }}>{Story()}</View>
//   ]
// } as ComponentMeta<typeof GaloyCheckboxButton>

// const onPress = () => {
//   console.log("pressed");
// };

// const Wrapper = ({children, text}) => <View style={{ marginVertical: 10 }}>
//   <Text style={{marginBottom: 10, marginTop: 5}}>{text}</Text>
//   {children}
// </View>

// const radioUnchecked = {
//   onPress,
//   checked: false,
//   buttonType: "radio",
// } as const

// const radioChecked = {
//   onPress,
//   checked: true,
//   buttonType: "radio",
// } as const

// const checkboxUnchecked = {
//   onPress,
//   checked: false,
//   buttonType: "checkbox",
// } as const

// const checkboxChecked = {
//   onPress,
//   checked: true,
//   buttonType: "checkbox",
// } as const

// const checkboxDisabled = {
//   onPress,
//   checked: false,
//   buttonType: "checkbox",
//   disabled: true,
// } as const

// export const All = () => {
//   <View >
//     <Wrapper text="RadioUnchecked">
//       <GaloyCheckboxButton {...radioUnchecked} />
//       </Wrapper>
//     <Wrapper text="RadioChecked"><GaloyCheckboxButton {...radioChecked} /></Wrapper>
//     <Wrapper text="CheckboxUnchecked"><GaloyCheckboxButton {...checkboxUnchecked} /></Wrapper>
//     <Wrapper text="CheckboxChecked"><GaloyCheckboxButton {...checkboxChecked} /></Wrapper>
//     <Wrapper text="CheckboxDisabled"><GaloyCheckboxButton {...checkboxDisabled} /></Wrapper> */}
//   </View>
// }

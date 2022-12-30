import React from "react"
import { storiesOf } from "@storybook/react-native"
import { Story, StoryScreen, UseCase } from "../../../../storybook/views"
import { GaloyButtonField } from "."
import { View } from "react-native"

const useCases = [
  {
    name: "Default",
    props: {
      placeholder: "Tap to select amount",
      iconName: "pencil" as "pencil",
    },
  },
  {
    name: "Disabled",
    props: {
      placeholder: "Tap to select amount",
      iconName: "pencil" as "pencil",
      disabled: true,
    },
  },
  {
    name: "LN Invoice",
    props: {
      placeholder: "Tap to select amount",
      value:
        "lntb1u1pwz5w78pp5e8w8cr5c30xzws92v36sk45znhjn098rtc4pea6ertnmvu25ng3sdpywd6hyetyvf5hgueqv3jk6meqd9h8vmmfvdjsxqrrssy29mzkzjfq27u67evzu893heqex737dhcapvcuantkztg6pnk77nrm72y7z0rs47wzc09vcnugk2ve6sr2ewvcrtqnh3yttv847qqvqpvv398",
      iconName: "info" as "info",
      highlightEnding: true,
    },
  },
  {
    name: "Secondary Value",
    props: {
      placeholder: "Tap to select amount",
      value: "Bitcoin Account",
      secondaryValue: "13,079,508 sats  (~$2,500.00 USD)",
      iconName: "pencil" as "pencil",
    },
  },
  {
    name: "Error",
    props: {
      placeholder: "Tap to select amount",
      value: "Bitcoin Account",
      secondaryValue: "13,079,508 sats  (~$2,500.00 USD)",
      iconName: "pencil" as "pencil",
      error: true,
    },
  },
]

storiesOf("Galoy Button Field", module)
  .addDecorator((fn) => <StoryScreen>{fn()}</StoryScreen>)
  .add("Style Presets", () => (
    <Story>
      {useCases.map(({ name, props }) => (
        <UseCase text={name}>
          <View style={{ width: 300 }}>
            <GaloyButtonField {...props} />
          </View>
        </UseCase>
      ))}
    </Story>
  ))

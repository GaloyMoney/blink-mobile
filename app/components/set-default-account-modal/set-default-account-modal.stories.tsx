import React, { useState } from "react"
import { View } from "react-native"

import { MockedProvider } from "@apollo/client/testing"

import { StoryScreen } from "../../../.storybook/views"
import { createCache } from "../../graphql/cache"
import { IsAuthedContextProvider } from "../../graphql/is-authed-context"
import mocks from "../../graphql/mocks"
import {
  SetDefaultAccountModalUI,
  SetDefaultAccountModalUIProps,
} from "./set-default-account-modal"
import { GaloyPrimaryButton } from "../atomic/galoy-primary-button"

const SetDefaultAccountModalWithToggle: React.FC<SetDefaultAccountModalUIProps> = (
  props,
) => {
  const [isVisible, setIsVisible] = useState(true)
  const toggleModal = () => setIsVisible(!isVisible)

  return (
    <View>
      <SetDefaultAccountModalUI
        {...props}
        isVisible={isVisible}
        toggleModal={toggleModal}
      />
      <GaloyPrimaryButton title={"Open modal"} onPress={toggleModal} />
    </View>
  )
}

export default {
  title: "Set Default Account Modal",
  component: SetDefaultAccountModalUI,
  decorators: [
    (Story) => (
      <MockedProvider mocks={mocks} cache={createCache()}>
        <StoryScreen>{Story()}</StoryScreen>
      </MockedProvider>
    ),
  ],
}

export const Default = () => {
  return (
    <IsAuthedContextProvider value={true}>
      <SetDefaultAccountModalWithToggle
        isVisible={true}
        toggleModal={() => {}}
        onPressBtcAccount={console.log}
        onPressUsdAccount={console.log}
      />
    </IsAuthedContextProvider>
  )
}

export const Loading = () => {
  return (
    <IsAuthedContextProvider value={true}>
      <SetDefaultAccountModalWithToggle
        isVisible={true}
        toggleModal={() => {}}
        onPressBtcAccount={console.log}
        onPressUsdAccount={console.log}
        loadingUsdAccount={true}
      />
    </IsAuthedContextProvider>
  )
}

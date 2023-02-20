import React from "react"
import { ComponentMeta } from "@storybook/react"
import { MockedProvider } from "@apollo/client/testing"
import { createCache } from "../../graphql/cache"
import { StoryScreen } from "../../../.storybook/views"
import { PersistentStateContext } from "../../store/persistent-state"
import { PhoneValidationScreen } from "./phone-validation"

const mocks = []

const PersistentStateWrapper = ({ children }) => (<PersistentStateContext.Provider
value={{ persistentState: {
    schemaVersion: 4,
    hasShownStableSatsWelcome: true,
    isUsdDisabled: false,
    galoyInstance: {
        name: "Local",
        graphqlUri: "",
        graphqlWsUri: "",
        posUrl: "",
        lnAddressHostname: ""
      },
    galoyAuthToken: "",
    isAnalyticsEnabled: true,
  }, updateState: () => {},
    resetState: () => {} }} >
    <>{children}</>
    </PersistentStateContext.Provider>)

const route = {
  key: "PhoneValidationScreen",
  name: "phoneValidation",
  params: {
    phone: "+50365055543",
  },
} as const

export default {
    title: "PhoneValidationScreen",
    component: PhoneValidationScreen,
    decorators: [
      (Story) => <PersistentStateWrapper><MockedProvider mocks={mocks} cache={createCache()}><StoryScreen>{Story()}</StoryScreen></MockedProvider></PersistentStateWrapper>
    ]
  } as ComponentMeta<typeof PhoneValidationScreen>
  
export const Main = () => <PhoneValidationScreen route={route} />

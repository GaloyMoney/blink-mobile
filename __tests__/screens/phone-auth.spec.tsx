import * as React from "react"
import { MockedProvider } from "@apollo/client/testing"
import { InMemoryCache } from "@apollo/client"
import { act, cleanup, fireEvent, render } from "@testing-library/react-native"
import "@testing-library/jest-native/extend-expect"
import "react-native-gesture-handler/jestSetup.js"

import "@mocks/react-navigation-native"
import "@mocks/react-native-geetest-module"
import { WelcomePhoneInputScreen } from "../../app/screens/phone-auth-screen"
import {
  AppConfiguration,
  AppConfigurationContext,
  defaultConfiguration,
} from "../../app/store/app-configuration-context"
import { PriceContextProvider } from "../../app/store/price-context"
import { i18nObject } from "../../app/i18n/i18n-util"
import { loadLocale } from "../../app/i18n/i18n-util.sync"

jest.mock("react-native/Libraries/EventEmitter/NativeEventEmitter")
jest.mock("react-native-fingerprint-scanner", () => ({}))
jest.mock("../../app/i18n/i18n-react", () => ({
  useI18nContext: () => {
    loadLocale("en")
    return { LL: i18nObject("en") }
  },
}))
const cache = new InMemoryCache()

describe("WelcomePhoneInputScreen", () => {
  afterEach(cleanup)
  it("render matches snapshot", () => {
    const tree = render(
      <AppConfigurationContext.Provider
        value={{
          appConfig: defaultConfiguration,
          setAppConfig: (config: AppConfiguration) => {},
        }}
      >
        <MockedProvider cache={cache}>
          <PriceContextProvider>
            <WelcomePhoneInputScreen />
          </PriceContextProvider>
        </MockedProvider>
      </AppConfigurationContext.Provider>,
    )
    expect(tree).toMatchSnapshot()
  })
  it("has TextInput", () => {
    const { queryByA11yLabel, queryByPlaceholderText } = render(
      <AppConfigurationContext.Provider
        value={{
          appConfig: defaultConfiguration,
          setAppConfig: (config: AppConfiguration) => {},
        }}
      >
        <MockedProvider cache={cache}>
          <PriceContextProvider>
            <WelcomePhoneInputScreen />
          </PriceContextProvider>
        </MockedProvider>
      </AppConfigurationContext.Provider>,
    )
    expect(queryByA11yLabel("Input phone number")).not.toBeNull()
    expect(queryByPlaceholderText("Phone Number")).not.toBeNull()
  })
  it("country picker is visible on press", async () => {
    const { getByTestId } = render(
      <AppConfigurationContext.Provider
        value={{
          appConfig: defaultConfiguration,
          setAppConfig: (config: AppConfiguration) => {},
        }}
      >
        <MockedProvider cache={cache}>
          <PriceContextProvider>
            <WelcomePhoneInputScreen />
          </PriceContextProvider>
        </MockedProvider>
      </AppConfigurationContext.Provider>,
    )

    const DropDownButton = getByTestId("DropDownButton")
    await act(() => {
      fireEvent.press(DropDownButton)
    })
    const countryPicker = getByTestId("country-picker")
    expect(countryPicker).toHaveProp("visible", true)
  })
})

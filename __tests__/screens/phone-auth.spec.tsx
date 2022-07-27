import * as React from "react"
import { MockedProvider } from "@apollo/client/testing"
import { InMemoryCache } from "@apollo/client"
import { act, cleanup, fireEvent, render } from "@testing-library/react-native"
import "@testing-library/jest-native/extend-expect"
import "react-native-gesture-handler/jestSetup.js"
import { translateUnknown as translate } from "@galoymoney/client"
import "@mocks/react-navigation-native"
import "@mocks/react-native-geetest-module"
import { WelcomePhoneInputScreen } from "@app/screens/phone-auth-screen"
import {
  AppConfiguration,
  AppConfigurationContext,
  defaultConfiguration,
} from "../../app/context/app-configuration"

jest.mock("react-native/Libraries/EventEmitter/NativeEventEmitter")
jest.mock("react-native-fingerprint-scanner", () => ({}))

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
          <WelcomePhoneInputScreen />
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
          <WelcomePhoneInputScreen />
        </MockedProvider>
      </AppConfigurationContext.Provider>,
    )
    expect(queryByA11yLabel("Input phone number")).not.toBeNull()
    expect(
      queryByPlaceholderText(translate("WelcomePhoneInputScreen.placeholder")),
    ).not.toBeNull()
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
          <WelcomePhoneInputScreen />
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

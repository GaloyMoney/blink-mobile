import { MockedProvider } from "@apollo/client/testing"
import "@mocks/react-native-iphone-x-helper"
import "@mocks/react-navigation-stack"
import { render } from "@testing-library/react-native"
import * as React from "react"
import { NetworkStatus } from "react-apollo-network-status"
import { UseApolloNetworkStatusOptions } from "react-apollo-network-status/dist/src/useApolloNetworkStatus"
import Toast from "react-native-toast-message"
import { GlobalErrorToast } from "../../app/components/global-error"
import { NetworkErrorCode } from "../../app/components/global-error/network-error-code"
import { useApolloNetworkStatus } from "../../app/graphql/client"
import { i18nObject } from "../../app/i18n/i18n-util"
import { loadLocale } from "../../app/i18n/i18n-util.sync"
import {
  PersistentStateContext,
  PersistentStateContextType,
} from "../../app/store/persistent-state"
import { createMock } from "ts-auto-mock"

jest.mock("../../app/graphql/client")
jest.mock("react-native/Libraries/EventEmitter/NativeEventEmitter")
jest.mock("react-native-version-number", () => ({}))
jest.mock("react-native-walkthrough-tooltip", () => ({}))
jest.mock("react-native-fingerprint-scanner", () => ({}))
jest.mock("react-native-markdown-display", () => ({}))
jest.mock("react-native-maps", () => ({}))
jest.mock("react-native-phone-number-input", () => ({}))
jest.mock("victory-native", () => ({}))
jest.mock("react-native-qrcode-svg", () => ({}))
jest.mock("react-native-share", () => ({}))
jest.mock("react-native-gesture-handler", () => ({}))
jest.mock("@app/i18n/i18n-react", () => ({}))
jest.mock("@react-native-firebase/analytics", () => () => ({ logEvent: () => null }))
jest.mock("@app/i18n/i18n-react", () => ({
  useI18nContext: () => {
    loadLocale("en")
    return { LL: i18nObject("en") }
  },
}))
jest.mock("react-native-image-crop-picker", () => ({}))
jest.mock("rn-qr-generator", () => ({}))

const persistentStateContextMock = createMock<PersistentStateContextType>()

describe("GlobalError tests", () => {
  afterEach(() => {
    jest.clearAllMocks()
  })

  const toastSpy = jest.spyOn(Toast, "show")

  const useApolloNetworkStatusMock = useApolloNetworkStatus as jest.MockedFunction<
    (options?: UseApolloNetworkStatusOptions) => NetworkStatus | unknown
  >

  const renderGlobalErrorToast = (status: NetworkStatus | unknown) => {
    useApolloNetworkStatusMock.mockReturnValue(status)
    const tree = render(
      <PersistentStateContext.Provider value={persistentStateContextMock}>
        <MockedProvider>
          <GlobalErrorToast />
        </MockedProvider>
      </PersistentStateContext.Provider>,
    ).toJSON()

    expect(tree).toBeNull()
  }

  it(`should not show a toast when status is from "prices" polled query`, () => {
    renderGlobalErrorToast({
      queryError: { operation: { operationName: "prices" } },
    })

    expect(toastSpy).toHaveBeenCalledTimes(0)
  })

  it(`should not show a toast when status doesn't contain a NetworkError`, () => {
    renderGlobalErrorToast({
      queryError: { mockField: "mock value" },
    })

    expect(toastSpy).toHaveBeenCalledTimes(0)
  })

  it(`should show a toast with "Server Error. Please try again later" when statusCode >= 500`, () => {
    renderGlobalErrorToast({
      queryError: { networkError: { statusCode: 500 } },
    })

    expect(toastSpy).toHaveBeenCalledTimes(1)
    expect(toastSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        text2: "Server Error. Please try again later",
      }),
    )
  })

  it(`should show a toast with "Your session has expired. Please log in again." 
      when statusCode >= 400 and < 500; and errorCode is "INVALID_AUTHENTICATION"`, () => {
    renderGlobalErrorToast({
      queryError: {
        networkError: {
          statusCode: 400,
          result: { errors: [{ code: NetworkErrorCode.InvalidAuthentication }] },
        },
      },
    })

    expect(toastSpy).toHaveBeenCalledTimes(1)
    expect(toastSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        text2: "Your session has expired. Please log in again.",
        onHide: expect.any(Function),
      }),
    )
  })

  it(`should show a toast with "Request issue.\nContact support if the problem persists" 
      when statusCode >= 400 and < 500; and errorCode is DIFFERENT FROM "INVALID_AUTHENTICATION"`, () => {
    renderGlobalErrorToast({
      queryError: { networkError: { statusCode: 400 } },
    })

    expect(toastSpy).toHaveBeenCalledTimes(1)
    expect(toastSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        text2: "Request issue.\nContact support if the problem persists",
      }),
    )
  })

  it(`should show a toast with "Connection issue.\nVerify your internet connection" 
      when text2 is "Network request failed"`, () => {
    renderGlobalErrorToast({
      queryError: {
        networkError: { message: "Network request failed" },
      },
    })

    expect(toastSpy).toHaveBeenCalledTimes(1)
    expect(toastSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        text2: "Connection issue.\nVerify your internet connection",
      }),
    )
  })
})

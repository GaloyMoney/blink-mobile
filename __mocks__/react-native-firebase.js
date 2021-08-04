/* eslint-disable no-undef */
jest.mock("react-native-firebase", () => {
  return {
    default: {
      messaging: jest.fn(() => ({
        hasPermission: jest.fn(() => Promise.resolve(true)),
        subscribeToTopic: jest.fn(),
        unsubscribeFromTopic: jest.fn(),
        requestPermission: jest.fn(() => Promise.resolve(true)),
        getToken: jest.fn(() => Promise.resolve("myMockToken")),
      })),
      notifications: jest.fn(() => ({
        onNotification: jest.fn(),
        onNotificationDisplayed: jest.fn(),
      })),
      analytics: jest.fn(() => ({
        logEvent: jest.fn(),
      })),
      functions: jest.fn(() => ({
        httpsCallable: jest.fn(),
      })),
    },
  }
})

jest.mock("react-native/Libraries/EventEmitter/NativeEventEmitter")

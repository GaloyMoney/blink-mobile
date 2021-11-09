/* eslint-disable no-undef */
jest.mock("react-native-push-notification", () => ({
  configure: jest.fn(),
  onRegister: jest.fn(),
  onNotification: jest.fn(),
  addEventListener: jest.fn(),
  requestPermissions: jest.fn(),
}))

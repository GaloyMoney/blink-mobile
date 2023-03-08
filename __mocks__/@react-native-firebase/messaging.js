const messaging = {
  requestPermission: jest.fn(() => Promise.resolve()),
  getToken: jest.fn(() => Promise.resolve("mocked_token")),
  onMessage: jest.fn(() => () => {}),
  onNotificationOpenedApp: jest.fn(() => () => {}),
  setBackgroundMessageHandler: jest.fn(),
}

export default messaging

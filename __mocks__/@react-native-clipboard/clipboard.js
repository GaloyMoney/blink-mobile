const mockedClipboard = {
  setString: jest.fn(),
  getString: jest.fn().mockResolvedValue(""),
}

export default mockedClipboard

jest.mock("@react-navigation/native", () => {
  const actualNav = jest.requireActual("@react-navigation/native")
  return {
    ...actualNav,
    useNavigation: () => ({
      addListener: jest.fn(),
      navigate: jest.fn(),
    }),
  }
})

import { act } from "@testing-library/react-native"

export const waitForNextRender = async () => {
  await new Promise((resolve) => setTimeout(resolve, 0))
}

export const waitForNextRender = (): Promise<void> => {
  return new Promise((resolve) => setTimeout(resolve, 50))
}

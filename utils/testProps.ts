import { Platform } from "react-native"

// This is used for E2E tests to apply id's to a <Component/>
// Usage:
//  <Button {...testProps("testID")} />
export const testProps = (testID: string) => {
  if (Platform.OS === "ios") {
    return {
      testID,
    }
  }
  return {
    accessible: true,
    accessibilityLabel: testID,
  }
}

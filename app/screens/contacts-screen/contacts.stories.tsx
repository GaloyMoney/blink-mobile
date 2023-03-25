import * as React from "react"
import { MockedProvider } from "@apollo/client/testing"
import { createCache } from "../../graphql/cache"
import { ContactsScreen } from "./contacts"
import { StoryScreen } from "../../../.storybook/views"
import { ComponentMeta } from "@storybook/react-native"
import { useThemeMode } from "@rneui/themed"

export default {
  title: "Contacts Screen",
  component: ContactsScreen,
  decorators: [(Story) => <StoryScreen>{Story()}</StoryScreen>],
} as ComponentMeta<typeof ContactsScreen>

const mocks = []

const SetDarkMode: React.FC = () => {
  const { mode, setMode } = useThemeMode()
  React.useEffect(() => {
    console.log("mode", mode)
    if (mode === "dark") return
    setMode("dark")
  }, [setMode, mode])
  return null
}

export const Empty = () => (
  <MockedProvider mocks={mocks} cache={createCache()}>
    <>
      <ContactsScreen />
      <SetDarkMode />
    </>
  </MockedProvider>
)

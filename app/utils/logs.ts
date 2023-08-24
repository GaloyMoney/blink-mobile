import { LogBox } from "react-native"

// Interferes in tests
LogBox.ignoreLogs(["[GraphQL error]: Message: Not authenticated"])

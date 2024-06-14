import { ScrollView } from "react-native-gesture-handler"

import { Screen } from "@app/components/screen"
import { makeStyles } from "@rneui/themed"

export const ProfileScreen: React.FC = () => {
  const styles = useStyles()

  return (
    <Screen keyboardShouldPersistTaps="handled">
      <ScrollView contentContainerStyle={styles.outer}></ScrollView>
    </Screen>
  )
}

const useStyles = makeStyles(() => ({
  outer: {
    marginTop: 4,
    paddingHorizontal: 12,
    paddingBottom: 20,
    display: "flex",
    flexDirection: "column",
    rowGap: 12,
  },
}))

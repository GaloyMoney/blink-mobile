import { View } from "react-native"
import { Text, makeStyles } from "@rneui/themed"

import { useI18nContext } from "@app/i18n/i18n-react"

import { AccountLevel, useLevel } from "@app/graphql/level-context"
import { LogOut } from "./logout"
import { Delete } from "./delete"

export const DangerZoneSettings: React.FC = () => {
  const { LL } = useI18nContext()
  const styles = useStyles()

  const { currentLevel, isAtLeastLevelOne } = useLevel()

  return (
    <View style={styles.verticalSpacing}>
      <Text type="p2" bold>
        {LL.AccountScreen.dangerZone()}
      </Text>
      {isAtLeastLevelOne && <LogOut />}
      {currentLevel !== AccountLevel.NonAuth && <Delete />}
    </View>
  )
}

const useStyles = makeStyles(() => ({
  verticalSpacing: {
    marginTop: 10,
    display: "flex",
    flexDirection: "column",
    rowGap: 10,
  },
}))

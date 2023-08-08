import { View } from "react-native"

import { makeStyles, Text } from "@rneui/themed"
import { GaloyIconButton } from "@app/components/atomic/galoy-icon-button"

export const InviteFriendsCard = () => {
  const styles = useStyles()

  return (
    <View style={styles.container}>
      <Text type="p1">Invite Friends</Text>
      <View style={styles.iconContainer}>
        <GaloyIconButton name="copy-paste" size="medium" iconOnly />
        <GaloyIconButton name="share" size="medium" iconOnly />
        <GaloyIconButton name="qr-code" size="medium" iconOnly />
      </View>
    </View>
  )
}

const useStyles = makeStyles(({ colors }) => ({
  container: {
    backgroundColor: colors.grey5,
    display: "flex",
    flexDirection: "row",
    marginBottom: 20,
    borderRadius: 12,
    padding: 12,
    columnGap: 4,
    alignItems: "center",
    justifyContent: "space-between",
  },
  iconContainer: {
    display: "flex",
    flexDirection: "row",
    columnGap: 2,
  },
}))

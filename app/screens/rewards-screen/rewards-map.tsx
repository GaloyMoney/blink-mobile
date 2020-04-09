import { useNavigation } from "@react-navigation/native"
import { inject, observer } from "mobx-react"
import * as React from "react"
import { StyleSheet, View } from "react-native"
import { ListItem } from "react-native-elements"
import { FlatList } from "react-native-gesture-handler"
import Icon from "react-native-vector-icons/Ionicons"
import { Screen } from "../../components/screen"
import { translate } from "../../i18n"
import { color } from "../../theme"
import { palette } from "../../theme/palette"
import { getRemainingRewards } from "./rewards-utils"

const styles = StyleSheet.create({
  accountView: {
    borderColor: color.line,
    borderRadius: 4,
    borderWidth: 1,
    marginBottom: 15,
    marginHorizontal: 15,
  },
})

export const RewardsMap = inject("dataStore")(
  observer(({ dataStore }) => {
    const { navigate } = useNavigation()

    const CategoryItem = ({ item }) => {
      const enabled = !(translate(`RewardsScreen.rewards\.${item}.meta.enabled`) === false)
      const remainingRewards = getRemainingRewards({ dataStore, section: item })

      return (
        <ListItem
          style={styles.accountView}
          rightElement={
            enabled ? (
              remainingRewards == 0 ? (
                <Icon name={"ios-checkmark-circle-outline"} color={color.primary} size={28} />
              ) : undefined
            ) : (
              <Icon name={"ios-lock"} color={palette.lightGrey} size={28} />
            )
          }
          disabled={!enabled}
          badge={
            enabled && remainingRewards != 0
              ? {
                  value: `+${remainingRewards} sats`,
                  textStyle: { fontSize: 14 },
                  // containerStyle: { marginTop: -20 }
                  badgeStyle: {
                    backgroundColor: color.primary,
                    minWidth: 24,
                    height: 24,
                    borderRadius: 15,
                  },
                }
              : undefined
          }
          title={translate(`RewardsScreen.rewards\.${item}.meta.title`)}
          onPress={() => navigate("rewardsSection", { section: item })}
          leftAvatar={
            <Icon
              name={translate(`RewardsScreen.rewards\.${item}.meta.icon`)}
              color={enabled ? color.primary : palette.lightGrey}
              size={28}
            />
          }
        />
      )
    }

    return (
      <Screen>
        {/* {dataStore.onboarding.stage.length === 1 && <Overlay screen="rewards" />} */}
        <View style={{height: 100}}/>
        <FlatList
          data={Object.keys(translate("RewardsScreen.rewards"))}
          renderItem={CategoryItem}
          keyExtractor={(item, index) => `${item}_${index}`}
        />
      </Screen>
    )
  }),
)

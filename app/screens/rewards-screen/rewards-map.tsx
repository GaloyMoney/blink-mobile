import { useNavigation } from "@react-navigation/native"
import { inject, observer } from "mobx-react"
import * as React from "react"
import { Platform, StyleSheet } from "react-native"
import { ListItem } from "react-native-elements"
import { FlatList } from "react-native-gesture-handler"
import Icon from "react-native-vector-icons/Ionicons"
import { Overlay } from "../../components/overlay"
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
    padding: 6,
  },

  bottomItem: {
    backgroundColor: palette.white,
    // shadowOpacity: 0.3,
    // shadowRadius: 3,
    borderColor: palette.lightGrey,
    borderWidth: 0.25,
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
  },

  buttonStyleDisabled: {
    backgroundColor: palette.offWhite,
    borderRadius: 24,
    bottom: -18,
    marginHorizontal: 60,
  },

  header: {
    alignItems: "center",
    marginVertical: 10,
  },

  image: {
    ...StyleSheet.absoluteFillObject,
    resizeMode: "cover",
  },

  imageContainerRewardsClosed: {
    height: 200,
    marginBottom: Platform.select({ ios: 0, android: 1 }), // Prevent a random Android rendering issue
    backgroundColor: "white",
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
  },

  imageContainerRewardsOpen: {
    height: 120,
    marginBottom: Platform.select({ ios: 0, android: 1 }), // Prevent a random Android rendering issue
    backgroundColor: "white",
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
  },

  itemTitle: {
    color: palette.darkGrey,
    fontSize: 20,
    fontWeight: "bold",
    marginVertical: 12,
    textAlign: "center",
  },

  satsButton: {
    color: palette.darkGrey,
    fontSize: 18,
    textAlign: "center",
  },

  smallText: {
    color: palette.darkGrey,
    fontSize: 18,
    marginBottom: 40,
    marginHorizontal: 40,
    textAlign: "center",
  },

  text: {
    color: palette.darkGrey,
    fontSize: 22,
    marginHorizontal: 20,
    textAlign: "center",
  },

  textButton: {
    backgroundColor: color.primary,
    borderRadius: 24,
    bottom: -18,
    marginHorizontal: 60,
  },

  textButtonClose: {
    backgroundColor: palette.darkGrey,
    marginTop: 10,
    paddingHorizontal: 60,
  },

  title: {
    color: palette.darkGrey,
    fontWeight: "bold",
    marginHorizontal: 40,
    textAlign: "center",
  },

  titleSats: {
    color: color.primary,
    fontSize: 32,
    fontWeight: "bold",
    marginHorizontal: 40,
    textAlign: "center",
  },

  titleStyleDisabled: {
    color: palette.lightGrey,
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
        {dataStore.onboarding.stage.length === 1 && <Overlay screen="rewards" />}
        <FlatList
          data={Object.keys(translate("RewardsScreen.rewards"))}
          renderItem={CategoryItem}
          keyExtractor={(item, index) => `${item}_${index}`}
        />
      </Screen>
    )
  }),
)

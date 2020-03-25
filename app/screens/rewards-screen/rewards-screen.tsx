import * as React from "react"
import { useState, useEffect, useRef } from "react"
import { Screen } from "../../components/screen"
import { StyleSheet, Alert, View, Dimensions, Platform, Animated } from "react-native"
import { Text } from "../../components/text"
import { color } from "../../theme"
import Icon from "react-native-vector-icons/Ionicons"
import { palette } from "../../theme/palette"
import { observer, inject } from "mobx-react"
import { Onboarding, OnboardingRewards } from "types"
import Carousel, { ParallaxImage } from "react-native-snap-carousel"
import { translate } from "../../i18n"
import { AccountType, CurrencyType, FirstChannelStatus } from "../../utils/enum"
import { Button, ListItem } from "react-native-elements"
import { sleep } from "../../utils/sleep"
import { Notifications, RegistrationError } from "react-native-notifications"
import functions from "@react-native-firebase/functions"
import { YouTubeStandaloneIOS } from "react-native-youtube"
import { Overlay } from "../../components/overlay"
import { Quizz } from "../../components/quizz"
import { TouchableOpacity, FlatList } from "react-native-gesture-handler"
import { RewardsHeader } from "../../components/rewards-header"
import { plusSats } from "../../utils/helper"
import { useNavigation } from '@react-navigation/native';


const walletDownloadedImage = require("./GreenPhone.jpg")
const firstSurveyImage = require("./GreenPhone.jpg")
const scalabilityImage = require("./GreenPhone.jpg")
const lightningImage = require("./GreenPhone.jpg")
const buyFirstSatsImage = require("./GreenPhone.jpg")
const dollarCostAveragingImage = require("./GreenPhone.jpg")

const satImage = require("./Sat.png")
const freeMoneyImage = require("./freeMoney.jpg")
const custodyImage = require("./SafeBank.jpg")
const digitalKeysImage = require("./digitalKeys.jpg")
const backupWalletImage = require("./backupWallet.jpg")
const fiatMoneyImage = require("./fiatMoney.jpeg")
const bitcoinUniqueImage = require("./GreenPhone.jpg")
const moneySupplyImage = require("./MoneySupply.jpg")
const newBitcoinImage = require("./newBitcoin.jpg")
const volatilityImage = require("./volatility.jpg")
const activateNotificationsImage = require("./GlobalCommunications.jpg")
const phoneVerificationImage = require("./GreenPhone.jpg")
const lightningNetworkConnectionImage = require("./LittleDipper.jpg")
const firstLnPaymentImage = require("./LightningPayment.jpg")
const transactionImage = require("./transaction.png")
const paymentProcessingImage = require("./paymentProcessing.jpg")
const privacyImage = require("./privacy.png")
const creatorImage = require("./Creator.jpg")
const decentralizationImage = require("./decentralization.jpeg")
const bankOnboardedImage = require("./BankAccount.jpg")
const debitCardActivationImage = require("./Password1234.jpg")
const firstCardSpendingImage = require("./PointOfSale.jpg")
const inviteAFriendImage = require("./InviteFriends.jpg")
const activateDirectDepositImage = require("./GreenPhone.jpg")
const energyImage = require("./energy.jpeg")
const doubleSpendImage = require("./doubleSpend.jpg")
const exchangeHackImage = require("./exchangeHack.jpg")
const moneyLaunderingImage = require("./moneyLaundering.jpeg")
const difficultyAdjustmentImage = require("./difficultyAdjustment.png")

const { width: screenWidth } = Dimensions.get("window")
const { height: screenHeight } = Dimensions.get("window")

const styles = StyleSheet.create({
  item: {
    width: screenWidth - 60,
    // height: screenWidth - 90,
    borderRadius: 32,
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

  imageContainerRewardsOpen: {
    height: 120,
    marginBottom: Platform.select({ ios: 0, android: 1 }), // Prevent a random Android rendering issue
    backgroundColor: "white",
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
  },

  imageContainerRewardsClosed: {
    height: 200,
    marginBottom: Platform.select({ ios: 0, android: 1 }), // Prevent a random Android rendering issue
    backgroundColor: "white",
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
  },

  image: {
    ...StyleSheet.absoluteFillObject,
    resizeMode: "cover",
  },

  header: {
    marginVertical: 10,
    alignItems: "center",
  },

  title: {
    fontWeight: "bold",
    marginHorizontal: 40,
    textAlign: "center",
    color: palette.darkGrey,
  },

  text: {
    marginHorizontal: 20,
    textAlign: "center",
    fontSize: 22,
    color: palette.darkGrey,
  },

  titleSats: {
    fontWeight: "bold",
    fontSize: 32,
    marginHorizontal: 40,
    textAlign: "center",
    color: color.primary,
  },

  textButton: {
    backgroundColor: color.primary,
    marginHorizontal: 60,
    borderRadius: 24,
    bottom: -18,
  },

  buttonStyleDisabled: {
    backgroundColor: palette.offWhite,
    marginHorizontal: 60,
    borderRadius: 24,
    bottom: -18,
  },

  textButtonClose: {
    backgroundColor: palette.darkGrey,
    paddingHorizontal: 60,
    marginTop: 10,
  },

  satsButton: {
    fontSize: 18,
    color: palette.darkGrey,
    textAlign: "center",
  },

  titleStyleDisabled: {
    color: palette.lightGrey,
  },

  itemTitle: {
    fontSize: 20,
    fontWeight: "bold",
    textAlign: "center",
    marginVertical: 12,
    color: palette.darkGrey,
  },

  smallText: {
    fontSize: 18,
    color: palette.darkGrey,
    marginHorizontal: 40,
    marginBottom: 40,
    textAlign: "center",
  },

  accountView: {
    borderColor: color.line,
    borderRadius: 4,
    borderWidth: 1,
    marginBottom: 15,
    marginHorizontal: 15,
    padding: 6,
  },
})

const getRewardsFromSection = ({ dataStore, section, rewardsMeta = undefined }) => {
  const rewards_obj = translate(`RewardsScreen.rewards\.${section}`)
  const rewards = Object.entries(rewards_obj).filter(id => id[0] !== "meta")

  rewards.forEach(item => (item[1]["fullfilled"] = dataStore.onboarding.has(Onboarding[item[0]])))

  if (rewardsMeta) { // FIXME
    rewards.forEach(item => (item[1]["enabled"] = rewardsMeta[item[0]]?.enabled ?? true ))
    rewards.forEach(item => (item[1]["enabledMessage"] = rewardsMeta[item[0]]?.enabledMessage ?? translate(`common.soon`) ))
  }

  return rewards
}

const getRemainingRewards = ({section, dataStore}) => (
  getRewardsFromSection({section, dataStore})
  .filter(item => !item[1].fullfilled)
  .reduce((acc, item) => OnboardingRewards[item[0]] + acc, 0)
)

const getSections = () => {
  const all_rewards_obj = translate(`RewardsScreen.rewards`)
  const sections = Object.keys(all_rewards_obj)
  return sections
}

// TODO optimize
const getCompletedSection = ({ dataStore }) => {
  let count = 0
  const sections = getSections()
  for (let section of sections) {
    if (getRemainingRewards({dataStore, section}) === 0) {
      count++
    }
  }
  return count
}


export const RewardsScreen = inject("dataStore")(
  observer(({ dataStore, route, navigation }) => {
    const { navigate, setParams } = useNavigation()

    React.useLayoutEffect(() => {
      const section = route.params.section
      const title = route.params.title ?? translate(`RewardsScreen.rewards\.${section}.meta.title`)
      navigation.setOptions({title});
    }, [route]);

    const rewardsMeta = {
      "walletDownloaded": {
        onComplete: null,
      },
      "sat": {
        onComplete: async () => dataStore.onboarding.add(Onboarding.sat),
      },
      "freeMoney": {
        onComplete: async () => dataStore.onboarding.add(Onboarding.freeMoney),
      },
      "custody": {
        onComplete: async () => dataStore.onboarding.add(Onboarding.custody),
      },
      "digitalKeys": {
        onComplete: async () => dataStore.onboarding.add(Onboarding.digitalKeys),
      },
      "backupWallet": {
        onAction: async () => {
          setLoading(true)
          await sleep(2000)
          // TODO
        },
        onComplete: async () => {
          await dataStore.onboarding.add(Onboarding.backupWallet)
        },
      },
      "fiatMoney": {
        onComplete: async () => dataStore.onboarding.add(Onboarding.fiatMoney),
      },
      "bitcoinUnique": {
        onComplete: async () => dataStore.onboarding.add(Onboarding.bitcoinUnique),
      },
      "moneySupply": {
        onComplete: async () => dataStore.onboarding.add(Onboarding.moneySupply),
      },
      "newBitcoin": {
        onComplete: async () => dataStore.onboarding.add(Onboarding.newBitcoin),
      },
      "activateNotifications": {
        onComplete: async () => {
          Notifications.events().registerRemoteNotificationsRegistered(
            async (event: Registered) => {
              console.tron.log("Registered For Remote Push", `Device Token: ${event.deviceToken}`)

              try {
                setLoading(true)
                await functions().httpsCallable("sendDeviceToken")({
                  deviceToken: event.deviceToken,
                })
                await dataStore.onboarding.add(Onboarding.activateNotifications)
                close("Notification succesfully activated")
              } catch (err) {
                console.tron.log(err.toString())
                setErr(err.toString())
              }
            },
          )

          Notifications.events().registerRemoteNotificationsRegistrationFailed(
            (event: RegistrationError) => {
              Alert.alert("Failed To Register For Remote Push", `Error (${event})`)
            },
          )

          Notifications.registerRemoteNotifications()
        },
      },
      "phoneVerification": {
        onComplete: () => navigate("welcomePhoneInput"),
      },
      'firstLnPayment': {
          onComplete: () => navigate('scanningQRCode'),
          enabled: dataStore.lnd.statusFirstChannel == FirstChannelStatus.opened,
          enabledMessage: translate(`RewardsScreen.channelNeeded`)
      },
      "transaction": {
        onComplete: async () => dataStore.onboarding.add(Onboarding.transaction),
      },
      "paymentProcessing": {
        onComplete: async () => dataStore.onboarding.add(Onboarding.paymentProcessing),
      },
      "creator": {
        onComplete: async () => dataStore.onboarding.add(Onboarding.creator),
      },
      "decentralization": {
        onComplete: () => {},
        enabled: false,
      },
      "inviteAFriend": {
        onComplete: () => Alert.alert("TODO"),
        enabled: dataStore.lnd.statusFirstChannel == FirstChannelStatus.opened,
        enabledMessage: translate(`RewardsScreen.channelNeeded`),
      },
      "bankOnboarded": {
        onComplete: () => navigate("openBankAccount"),
      },
      "debitCardActivation": {
        onComplete: () => Alert.alert("TODO"),
        enabled: dataStore.onboarding.has(Onboarding["bankOnboarded"]),
        enabledMessage: translate(`RewardsScreen.bankingNeeded`),
      },
      "firstCardSpending": {
        onComplete: () => Alert.alert("TODO"),
        enabled: dataStore.onboarding.has(Onboarding["bankOnboarded"]),
        enabledMessage: translate(`RewardsScreen.bankingNeeded`),
      },
      "activateDirectDeposit": {
        rewards: "1% card rewards!",
        onComplete: () => Alert.alert("TODO"),
        enabled: dataStore.onboarding.has(Onboarding["bankOnboarded"]),
        enabledMessage: translate(`RewardsScreen.bankingNeeded`),
      },
      "energy": {
        onComplete: async () => {},
        enabled: false,
      },
      "doubleSpend": {
        onComplete: () => {},
        enabled: false,
      },
      "exchangeHack": {
        onComplete: () => {},
        enabled: false,
      },
      "moneyLaundering": {
        onComplete: () => {},
        enabled: false,
      },
      "privacy": {
        onComplete: () => {},
        enabled: false,
      },
      "difficultyAdjustment": {
        onComplete: () => {},
        enabled: false,
      },
      "volatility": {
        onComplete: async () => dataStore.onboarding.add(Onboarding.volatility),
      },
      "buyFirstSats": {
        onComplete: async () => dataStore.onboarding.add(Onboarding.buyFirstSats),
      },
      "dollarCostAveragingImage": {
        onComplete: async () => dataStore.onboarding.add(Onboarding.dollarCostAveragingImage),
      },
    }

    const [isRewardOpen, setRewardOpen] = useState(false)
    const [quizzVisible, setQuizzVisible] = useState(false)
    const [quizzData, setQuizzData] = useState({})
    const [currRewardIndex, setCurrRewardIndex] = useState(0)
    const [loading, setLoading] = useState(false)
    const [err, setErr] = useState("")
    const [animation] = useState(new Animated.Value(0))

    const section = route.params.section
    const rewards = getRewardsFromSection({ section, rewardsMeta, dataStore})

    const [initialRemainingRewards] = useState(getRemainingRewards({section, dataStore}))
    const currentRemainingRewards = getRemainingRewards({section, dataStore})

    if (initialRemainingRewards !== 0 && currentRemainingRewards === 0) {
      Alert.alert("You have succesfully completed this section!", "", [
        {
          text: translate("common.ok"),
          onPress: () => {
            navigation.goBack()
          },
        },
      ])
    }

    // helper
    const [currRewardId, currRewardInfo] = rewards[currRewardIndex]

    const open = async index => {
      setParams({ title: translate(`RewardsScreen.rewards\.${section}\.${currRewardId}.title`) })
      setRewardOpen(!isRewardOpen)
    }

    const close = async (msg = "") => {
      setQuizzVisible(false)
      setRewardOpen(false)
      setParams({ title: null })
      setLoading(false)
      if (msg !== "") {
        // FIXME msg set is not the best way to handle the callback 
        await sleep(800) // FIXME may bug on slow decive
        Alert.alert(msg, "", [
          {
            text: translate("common.ok"),
            onPress: async () => {
              await rewardsMeta[currRewardId].onComplete()
            },
          },
        ])
      }
    }

    useEffect(() => {
      Animated.timing(animation, {
        toValue: isRewardOpen,
        duration: 500,
        useNativeDriver: false,
      }).start()
    }, [isRewardOpen])

    useEffect(() => {
      if (err !== "") {
        setErr("")
        Alert.alert("error", err, [
          {
            text: "OK",
            onPress: () => {
              setLoading(false)
              setRewardOpen(false)
            },
          },
        ])
      }
    }, [err])

    enum RewardType {
      Text = "Text",
      Video = "Video",
      Action = "Action",
    }

    const action = async () => {
      const type = currRewardInfo.type as RewardType

      const feedback = currRewardInfo.feedback ?? ""

      if ([RewardType.Text, RewardType.Video].includes(RewardType[type])) {
        setQuizzData({
          feedback,
          question: currRewardInfo.question,
          answers: currRewardInfo.answers,
        })
      }

      switch (RewardType[type]) {
        case RewardType.Text:
          setQuizzVisible(true)
          break
        case RewardType.Video:
          try {
            console.tron.log({videoid: currRewardInfo.videoid})
            await YouTubeStandaloneIOS.playVideo(
              currRewardInfo.videoid,
            )
            await sleep(500) // FIXME why await for playVideo doesn't work?
            console.tron.log("finish video")
            setQuizzVisible(true)
          } catch (err) {
            console.tron.log("error video", err.toString())
            setQuizzVisible(false)
          }
          break
        case RewardType.Action:
          await rewardsMeta[currRewardId].onAction()
          close(feedback)
          break
      }
    }

    const CardItem = ({ item, index }, parallaxProps) => {
      const itemId = item[0]
      const itemInfo = item[1]

      return (
        <Animated.View style={styles.item}>
          <TouchableOpacity onPress={() => open(index)} disabled={isRewardOpen} activeOpacity={0.9}>
            <ParallaxImage
              source={eval(`${itemId}Image`)} // FIXME
              containerStyle={
                isRewardOpen ? styles.imageContainerRewardsOpen : styles.imageContainerRewardsClosed
              }
              {...parallaxProps}
            />
          </TouchableOpacity>
          <View style={styles.bottomItem}>
            {!isRewardOpen && (
              <Text style={styles.itemTitle}>{itemInfo.title}</Text>
            )}
            <Animated.ScrollView
              contentContainerStyle={{ flexGrow: 1 }}
              style={[
                {
                  height: animation.interpolate({
                    inputRange: [0, 1],
                    outputRange: ["0%", screenHeight < 800 ? "56%" : "65%"],
                  }), // FIXME hack for iphone 8?
                  opacity: animation,
                },
              ]}
              persistentScrollbar={true}
              bouncesZoom={true}
              showsVerticalScrollIndicator={true}
              bounces={false}
            >
              <View style={{ flex: 1, minHeight: 15 }} />
              {item.component || (
                <Animated.View
                  style={{
                    alignSelf: "center",
                  }}
                >
                  <Animated.Text style={[styles.text]} >{itemInfo.text}</Animated.Text>
                </Animated.View>
              )}
              <View style={{ flex: 1 }} />
            </Animated.ScrollView>
            {!isRewardOpen && (
              <Animated.Text style={[styles.satsButton]}>
                {itemInfo.rewards || (OnboardingRewards[itemId] && plusSats(OnboardingRewards[itemId]))}
              </Animated.Text>
            )}
            <Button
              onPress={async () => {
                isRewardOpen ? (itemInfo.fullfilled ? close() : await action()) : open(index)
              }}
              disabled={!itemInfo.enabled}
              buttonStyle={itemInfo.fullfilled ? styles.buttonStyleDisabled : styles.textButton}
              titleStyle={itemInfo.fullfilled ? styles.titleStyleDisabled : null}
              // containerStyle={styles.}
              title={
                isRewardOpen
                  ? itemInfo.fullfilled
                    ? translate("common.close")
                    : translate("RewardsScreen.getRewardNow")
                  : itemInfo.enabled
                  ? itemInfo.fullfilled
                    ? translate("RewardsScreen.rewardEarned")
                    : translate("common.learnMore")
                  : itemInfo.enabledMessage
              }
              loading={loading}
            />
          </View>
        </Animated.View>
      )
    }

    const carouselRef = useRef(null)
    const card = route.params.card

    const itemIndex = card ? 
      rewards.findIndex(item => item[0] === card) : 
      rewards.findIndex(item => !item[1].fullfilled)

    const [firstItem] = useState(itemIndex) 

    // this is used for when calling the card from another view
    if (card && carouselRef.current) {
      carouselRef.current.snapToItem(itemIndex, false)
    }

    return (
      <Screen>
        <Quizz
          quizzVisible={quizzVisible}
          setQuizzVisible={setQuizzVisible}
          quizzData={quizzData}
          close={close}
        />
        <RewardsHeader 
          isRewardOpen={isRewardOpen} 
          balance={isRewardOpen ? 
            OnboardingRewards[currRewardId]
            : dataStore.balances({
            currency: CurrencyType.BTC,
            account: AccountType.VirtualBitcoin,
          })}
          close={close}
          numTrophee={getCompletedSection({dataStore})}
        />
        <View style={{ flex: 1 }} />
        <Carousel
          ref={carouselRef}
          data={rewards}
          renderItem={CardItem}
          sliderWidth={screenWidth}
          scrollEnabled={!isRewardOpen}
          itemWidth={screenWidth - 60}
          hasParallaxImages={true}
          firstItem={firstItem}
          inactiveSlideOpacity={isRewardOpen ? 0 : 0.7}
          removeClippedSubviews={false}
          onBeforeSnapToItem={(index) => setCurrRewardIndex(index)}
        />
        <View style={{ flex: 1 }} />
      </Screen>
    )
  }),
)

export const RewardsHome = inject("dataStore")(
  observer(({ dataStore }) => {

  const { navigate } = useNavigation()

  const CategoryItem = ({ item }) => {
    const enabled = !(translate(`RewardsScreen.rewards\.${item}.meta.enabled`) === false)
    const remainingRewards = getRemainingRewards({dataStore, section: item})

    return (
      <ListItem
        style={styles.accountView}
        rightElement={enabled ? 
          remainingRewards == 0 ?
            <Icon name={"ios-checkmark-circle-outline"} color={color.primary} size={28} /> :
            undefined :
          <Icon name={"ios-lock"} color={palette.lightGrey} size={28} />
        }
        disabled={!enabled}
        badge={enabled && remainingRewards != 0 ? { 
            value: `+${remainingRewards} sats`, 
            textStyle: { fontSize: 14 },
            // containerStyle: { marginTop: -20 }
            badgeStyle: { backgroundColor: color.primary, 
              minWidth: 24,
              height: 24,
              borderRadius: 15
            }
         } : undefined}
        title={translate(`RewardsScreen.rewards\.${item}.meta.title`)}
        onPress={() => navigate("rewardsDetail", {section: item})}
        leftAvatar={<Icon 
          name={translate(`RewardsScreen.rewards\.${item}.meta.icon`)} 
          color={enabled ? color.primary : palette.lightGrey}
          size={28}
          />}
      />
  )}

  return (
  <Screen>
    {dataStore.onboarding.stage.length === 1 && <Overlay screen="rewards" />}
    <RewardsHeader 
      isRewardOpen={false}
      balance={dataStore.balances({
        currency: CurrencyType.BTC,
        account: AccountType.VirtualBitcoin,
      })}
      numTrophee={getCompletedSection({dataStore})}
    />
    <FlatList
      data={Object.keys(translate("RewardsScreen.rewards"))}
      renderItem={CategoryItem}
      keyExtractor={(item, index) => `${item}_${index}`}
    />
  </Screen>
)}))
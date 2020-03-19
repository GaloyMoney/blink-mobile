import * as React from "react"
import { useState, useEffect, useRef } from "react"
import { Screen } from "../../components/screen"
import { StyleSheet, Alert, View, Dimensions, Platform, Animated } from "react-native"
import { Text } from "../../components/text"
import { color } from "../../theme"
import Icon from "react-native-vector-icons/Ionicons"
import { useNavigation, useNavigationParam } from "react-navigation-hooks"
import { palette } from "../../theme/palette"
import { observer, inject } from "mobx-react"
import { Onboarding, OnboardingRewards } from "types"
import Carousel, { ParallaxImage } from "react-native-snap-carousel"
import { translate } from "../../i18n"
import I18n from "i18n-js"
import { AccountType, CurrencyType, FirstChannelStatus } from "../../utils/enum"
import { Button, ListItem } from "react-native-elements"
import { sleep } from "../../utils/sleep"
import { Notifications, RegistrationError } from "react-native-notifications"
import functions from "@react-native-firebase/functions"
import { YouTubeStandaloneIOS } from "react-native-youtube"
import { Overlay } from "../../components/overlay"
import Svg, { Path } from "react-native-svg"
import { Quizz } from "../../components/quizz"
import { TouchableOpacity, FlatList } from "react-native-gesture-handler"

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

const RewardsGraphic = props => (
  <Svg viewBox="0 0 392.551 392.551" height={70} width={70} {...props} fill={color.primary}>
    <Path d="M278.635 255.871c35.62-25.665 58.893-67.491 58.893-114.618C337.528 63.354 274.174 0 196.275 0S55.023 63.354 55.023 141.253c0 47.127 23.273 88.953 58.893 114.618l-45.77 92.251c-1.939 3.879-1.422 8.469 1.422 11.83 2.78 3.297 7.176 4.719 11.378 3.491l32.388-9.244 12.218 31.354c1.552 4.008 5.301 6.853 9.632 6.982 2.069 0 7.24 0 10.279-6.012l50.812-102.529 50.877 102.529c1.875 3.685 5.624 6.012 9.762 6.012.129 0 7.758.711 10.149-6.982l12.218-31.354 32.388 9.244c4.202 1.164 8.598-.129 11.378-3.491 2.78-3.297 3.297-7.952 1.422-11.83l-45.834-92.251zm-141.77 98.78l-6.853-17.648c-2.004-5.236-7.822-8.016-13.123-6.465l-18.166 5.172 33.939-68.461c12.671 6.4 26.44 11.055 40.986 13.382l-36.783 74.02zM76.873 141.253c0-65.875 53.592-119.402 119.402-119.402s119.402 53.527 119.402 119.402-53.592 119.402-119.402 119.402S76.873 207.127 76.873 141.253zm198.853 189.22c-5.43-1.552-11.119 1.293-13.123 6.465l-6.853 17.648-36.719-74.085c14.545-2.327 28.251-6.982 40.986-13.382l33.875 68.461-18.166-5.107z" />
    <Path d="M277.924 114.036c-1.358-4.008-4.784-6.917-8.857-7.499l-43.507-6.335-19.459-39.434c-1.875-3.685-5.624-6.077-9.826-6.077s-7.952 2.392-9.826 6.077l-19.459 39.434-43.507 6.335c-4.073.646-7.499 3.491-8.792 7.434-1.293 3.943-.259 8.275 2.78 11.184l31.547 30.707-7.434 43.378c-.711 4.073.776 8.469 4.331 10.667 3.426 2.069 8.469 2.651 11.507.84l38.917-20.493 38.917 20.493c4.267 2.327 17.648-.711 15.515-12.994l-7.176-41.826 31.547-30.707c2.911-2.844 4.01-7.24 2.782-11.184zm-53.657 30.126c-2.521 2.457-3.685 6.077-3.168 9.632l4.655 27.216-24.436-12.8a10.843 10.843 0 00-10.149 0l-24.436 12.8 4.655-27.216c.646-3.556-.517-7.111-3.168-9.632l-19.782-19.265 27.345-3.943c3.556-.517 6.659-2.78 8.21-5.948l12.218-24.824 12.218 24.824c1.616 3.232 4.655 5.495 8.21 5.948l27.345 3.943-19.717 19.265z" />
  </Svg>
)

const RewardsHeader = ({isRewardOpen, dataStore,
  animation = null, plusSats = (a) => {}, rewardId = 0, close = () => {}}) => (
<>
  <View style={{ flex: 1 }} />
  <Animated.View style={styles.header}>
    {!isRewardOpen && <RewardsGraphic />}
    <Animated.Text
      style={[
        styles.title,
        {
          fontSize: animation?.interpolate({
            inputRange: [0, 1],
            outputRange: [28, 0.1],
          }) ?? 28,
        },
      ]}
    >
      {translate("RewardsScreen.satAccumulated")}
    </Animated.Text>
    <Animated.Text style={[styles.titleSats]}>
      {isRewardOpen
        ? `${plusSats(rewardId)}`
        : I18n.toNumber(
            dataStore.balances({
              currency: CurrencyType.BTC,
              account: AccountType.VirtualBitcoin,
            }),
            { precision: 0 },
          )}
    </Animated.Text>
    {isRewardOpen && (
      <Button
        title={translate("common.close")}
        buttonStyle={styles.textButtonClose}
        onPress={() => close()}
      />
    )}
  </Animated.View>
  <View style={{ flex: 1 }} />
  {/* <View style={{ flex: 1, minHeight: 20 }} /> */}
</>
)

export const RewardsScreen = inject("dataStore")(
  observer(({ dataStore }) => {
    const { navigate, setParams, getParam } = useNavigation()

    const [isRewardOpen, setRewardOpen] = useState(false)
    const [quizzVisible, setQuizzVisible] = useState(false)
    const [quizzData, setQuizzData] = useState({})
    const [currRewardIndex, setCurrRewardIndex] = useState(0)
    const [loading, setLoading] = useState(false)
    const [err, setErr] = useState("")
    const [animation] = useState(new Animated.Value(0))

    const section = getParam('section')

    const rewards_obj = translate(`RewardsScreen.rewards\.${section}`)
    
    // we are cloning because we are modifing the object shared with translate()
    const rewards_obj_copy = {...rewards_obj}
    delete rewards_obj_copy.title

    const rewards = Object.entries(rewards_obj_copy)
    const [rewardId, rewardInfo] = rewards[currRewardIndex]

    const open = async index => {
      setCurrRewardIndex(index)
      setParams({ title: translate(`RewardsScreen.rewards\.${section}\.${rewardId}.title`) })
      setRewardOpen(!isRewardOpen)
    }

    const close = (msg = "") => {
      setQuizzVisible(false)
      setRewardOpen(false)
      setParams({ title: null })
      setLoading(false)
      if (msg !== "") {
        Alert.alert(msg)
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
      const type = rewardInfo.type as RewardType

      const feedback = rewardInfo.feedback ?? ""
      const correct = rewardInfo.correct ?? false
      const onComplete = rewardInfo.onComplete

      if ([RewardType.Text, RewardType.Video].includes(RewardType[type])) {
        setQuizzData({
          feedback,
          correct,
          onComplete,
          question: rewardInfo.question,
          answers: rewardInfo.answers,
        })
      }

      switch (RewardType[type]) {
        case RewardType.Text:
          setQuizzVisible(true)
          break
        case RewardType.Video:
          try {
            await YouTubeStandaloneIOS.playVideo(
              rewardInfo.videoid,
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
          await onComplete()
          close(feedback)
          break
      }
    }

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
        onComplete: async () => {
          setLoading(true)
          await sleep(2000)
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

    rewards.forEach(item => (item[1]["onComplete"] = rewardsMeta[rewardId].onComplete))
    rewards.forEach(item => (item[1]["fullfilled"] = dataStore.onboarding.has(Onboarding[item[0]])))
    rewards.forEach(item => (item[1]["enabled"] = rewardsMeta[rewardId].enabled ?? true ))
    rewards.forEach(item => (item[1]["enabledMessage"] = rewardsMeta[rewardId].enabledMessage ?? translate(`common.soon`) ))

    console.tron.log({rewards})

    const plusSats = id =>
      `+${I18n.t("sat", {
        count: OnboardingRewards[id],
        formatted_number: I18n.toNumber(OnboardingRewards[id], { precision: 0 }),
      })}`

    const renderItem = ({ item, index }, parallaxProps) => {
      const itemId = item[0]
      const itemInfo = item[1]

      return (
        <Animated.View style={styles.item}>
          <TouchableOpacity onPress={() => open(index)} disabled={isRewardOpen} activeOpacity={0.9}>
            <ParallaxImage
              source={eval(`${itemId}Image`)}
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
                {itemInfo.rewards || (OnboardingRewards[itemId] && plusSats(itemId))}
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
    const card = useNavigationParam("card")

    const itemIndex = card ? 
      rewards.findIndex(item => item[0] === card) : 
      rewards.findIndex(item => !item[1].fullfilled)

    const [firstItem] = useState(itemIndex) 

    if (card && carouselRef.current) {
      carouselRef.current.snapToItem(itemIndex, false)
    }

    return (
      <Screen>
        <Quizz
          quizzVisible={quizzVisible}
          setQuizzVisible={setQuizzVisible}
          quizzData={quizzData}
          setRewardOpen={setRewardOpen}
        />
        <RewardsHeader 
          isRewardOpen={isRewardOpen} 
          dataStore={dataStore}
          animation={animation}
          plusSats={plusSats}
          rewardId={rewardId}
          close={close}
        />
        <Carousel
          ref={carouselRef}
          data={rewards}
          renderItem={renderItem}
          sliderWidth={screenWidth}
          scrollEnabled={!isRewardOpen}
          itemWidth={screenWidth - 60}
          hasParallaxImages={true}
          firstItem={firstItem}
          inactiveSlideOpacity={isRewardOpen ? 0 : 0.7}
        />
      </Screen>
    )
  }),
)

RewardsScreen.navigationOptions = screenProps => {
  const section = screenProps.navigation.getParam("section")
  const title = screenProps.navigation.getParam("title") ?? translate(`RewardsScreen.rewards\.${section}.title`)
  return { title }
}

export const RewardsHome = inject("dataStore")(
  observer(({ dataStore }) => {

  const { navigate } = useNavigation()

  return (
  <Screen>
    {dataStore.onboarding.stage.length === 1 && <Overlay screen="rewards" />}
    <RewardsHeader 
      isRewardOpen={false}
      dataStore={dataStore}
    />
    <View style={{ flex: 1 }} />
    <FlatList
      data={Object.keys(translate("RewardsScreen.rewards"))}
      renderItem={({ item }) => 
        <ListItem
          style={styles.accountView}
          chevron
          title={translate(`RewardsScreen.rewards\.${item}.title`)}
          onPress={() => navigate("rewardsDetail", {section: item})}
          leftAvatar={<Icon name={"logo-bitcoin"} color={color.primary} size={28} style={styles.icon} />}
        />}
    />
  </Screen>
)}))

RewardsHome.navigationOptions = screenProps => {
  const title = translate("RewardsScreen.title")
  return { title }
}
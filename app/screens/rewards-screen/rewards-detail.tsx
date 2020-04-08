import { useNavigation } from "@react-navigation/native"
import { inject, observer } from "mobx-react"
import * as React from "react"
import { useEffect, useRef, useState } from "react"
import { Alert, Animated, Dimensions, Platform, StyleSheet, View } from "react-native"
import { Button } from "react-native-elements"
import { TouchableOpacity } from "react-native-gesture-handler"
import Carousel, { ParallaxImage } from "react-native-snap-carousel"
import { YouTubeStandaloneIOS } from "react-native-youtube"
import { OnboardingRewards } from "types"
import { Quizz } from "../../components/quizz"
import { RewardsHeader } from "../../components/rewards-header"
import { Screen } from "../../components/screen"
import { Text } from "../../components/text"
import { translate } from "../../i18n"
import { color } from "../../theme"
import { palette } from "../../theme/palette"
import { AccountType, CurrencyType } from "../../utils/enum"
import { plusSats } from "../../utils/helper"
import { sleep } from "../../utils/sleep"
import {
  getCompletedSection,
  getRemainingRewards,
  getRewardsFromSection,
  rewardsMeta,
} from "./rewards-utils"

// TODO do something like this to avoid loading everything upfront
// const EXAMPLES = [
//   makeExample('Hamburger Arrow', () => require('./animations/HamburgerArrow.json')),
// ]

const walletDownloadedImage = require("./GreenPhone.jpg")
const firstSurveyImage = require("./GreenPhone.jpg")
const scalabilityImage = require("./GreenPhone.jpg")
const lightningImage = require("./GreenPhone.jpg")
const buyFirstSatsImage = require("./GreenPhone.jpg")
const dollarCostAveragingImage = require("./GreenPhone.jpg")
const tweetImage = require("./GreenPhone.jpg")

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

  item: {
    width: screenWidth - 60,
    // height: screenWidth - 90,
    borderRadius: 32,
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

export const RewardsDetail = inject("dataStore")(
  observer(({ dataStore, route, navigation }) => {
    const { navigate, setParams } = useNavigation()

    const [isRewardOpen, setRewardOpen] = useState(false)
    const [quizzVisible, setQuizzVisible] = useState(false)
    const [quizzData, setQuizzData] = useState({})
    const [currRewardIndex, setCurrRewardIndex] = useState(0)
    const [loading, setLoading] = useState(false)
    const [err, setErr] = useState("")
    const [animation] = useState(new Animated.Value(0))

    const section = route.params.section
    const rewards = getRewardsFromSection({ section, rewardsMeta, dataStore })

    const [initialRemainingRewards] = useState(getRemainingRewards({ section, dataStore }))
    const currentRemainingRewards = getRemainingRewards({ section, dataStore })

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

    const open = async (index) => {
      setRewardOpen(!isRewardOpen)
    }

    const close = async (msg = "") => {
      setQuizzVisible(false)
      setRewardOpen(false)
      setLoading(false)
      if (msg !== "") {
        // FIXME msg set is not the best way to handle the callback
        await sleep(800) // FIXME may bug on slow decive
        Alert.alert(msg, "", [
          {
            text: translate("common.ok"),
            onPress: async () => {
              await rewardsMeta[currRewardId].onComplete({ dataStore })
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
            console.tron.log({ videoid: currRewardInfo.videoid })
            await YouTubeStandaloneIOS.playVideo(currRewardInfo.videoid)
            await sleep(500) // FIXME why await for playVideo doesn't work?
            console.tron.log("finish video")
            setQuizzVisible(true)
          } catch (err) {
            console.tron.log("error video", err.toString())
            setQuizzVisible(false)
          }
          break
        case RewardType.Action:
          await rewardsMeta[currRewardId].onAction({ dataStore, setLoading, navigate })
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
            {!isRewardOpen && <Text style={styles.itemTitle}>{itemInfo.title}</Text>}
            <Animated.ScrollView
              contentContainerStyle={{ flexGrow: 1 }}
              style={{
                height: animation.interpolate({
                  inputRange: [0, 1],
                  outputRange: ["0%", screenHeight < 800 ? "56%" : "65%"],
                }), // FIXME hack for iphone 8?
                opacity: animation,
              }}
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
                  <Animated.Text style={styles.text}>{itemInfo.text}</Animated.Text>
                </Animated.View>
              )}
              <View style={{ flex: 1 }} />
            </Animated.ScrollView>
            {!isRewardOpen && (
              <Animated.Text style={styles.satsButton}>
                {itemInfo.rewards ||
                  (OnboardingRewards[itemId] && plusSats(OnboardingRewards[itemId]))}
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

    const itemIndex = card
      ? rewards.findIndex((item) => item[0] === card)
      : rewards.findIndex((item) => !item[1].fullfilled)

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
          balance={
            isRewardOpen
              ? OnboardingRewards[currRewardId]
              : dataStore.balances({
                  currency: CurrencyType.BTC,
                  account: AccountType.VirtualBitcoin,
                })
          }
          title={translate(`RewardsScreen.rewards\.${section}\.${currRewardId}.title`)}
          close={close}
          numTrophee={getCompletedSection({ dataStore })}
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

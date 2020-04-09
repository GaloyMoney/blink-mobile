import { useNavigation } from "@react-navigation/native"
import I18n from "i18n-js"
import { inject, observer } from "mobx-react"
import * as React from "react"
import { useState } from "react"
import { Alert, Dimensions, Image, Platform, StyleSheet, View, Text } from "react-native"
import { Button } from "react-native-elements"
import { TouchableOpacity } from "react-native-gesture-handler"
import Carousel, { Pagination } from "react-native-snap-carousel"
import Icon from "react-native-vector-icons/Ionicons"
import { OnboardingRewards } from "types"
import { Screen } from "../../components/screen"
import { translate } from "../../i18n"
import { color } from "../../theme"
import { palette } from "../../theme/palette"
import { getRemainingRewards, getRewardsFromSection, rewardsMeta } from "./rewards-utils"


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

  header: {
    alignItems: "center",
    marginVertical: 10,
  },

  image: {
    ...StyleSheet.absoluteFillObject,
    resizeMode: "cover",
  },

  imageContainerRewards: {
    height: 200,
    marginBottom: Platform.select({ ios: 0, android: 1 }), // Prevent a random Android rendering issue
    backgroundColor: "white",
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
  },

  item: {
    width: screenWidth - 60,
    // height: screenWidth - 90,
    borderRadius: 16,
    backgroundColor: palette.lightBlue
  },

  itemTitle: {
    color: palette.white,
    fontSize: 20,
    fontWeight: "bold",
    marginVertical: 12,
    textAlign: "center",
  },

  satsButton: {
    color: palette.white,
    fontSize: 18,
    textAlign: "center",
  },

  smallText: {
    color: palette.white,
    fontSize: 18,
    marginBottom: 40,
    marginHorizontal: 40,
    textAlign: "center",
  },

  text: {
    color: palette.white,
    fontSize: 22,
    marginHorizontal: 20,
    textAlign: "center",
  },

  textButton: {
    backgroundColor: color.primary,
    borderRadius: 24,
    marginHorizontal: 60,
    marginVertical: 32,
  },

  buttonStyleFullfilled: {
    // backgroundColor: palette.offWhite,
    borderRadius: 24,
    marginHorizontal: 60,
    marginVertical: 32,
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

  titleStyleFullfilled: {
    color: palette.white,
  },
})

export const RewardsSection = inject("dataStore")(
  observer(({ dataStore, route, navigation }) => {
    const { navigate } = useNavigation()

    const section = route.params.section
    const rewards = getRewardsFromSection({ section, rewardsMeta, dataStore })

    const itemIndex = rewards.findIndex((item) => !item[1].fullfilled)
    const [firstItem] = useState(itemIndex)

    const [currRewardIndex, setCurrRewardIndex] = useState(firstItem)

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

    navigation.setOptions({ title: translate(`RewardsScreen.rewards\.${section}\.meta.title`) })

    const open = async (index) => {
      // TODO use index

      navigate('rewardsQuizz', { 
        title: currRewardInfo.title, 
        text: currRewardInfo.text, 
        amount: OnboardingRewards[currRewardId],
        question: currRewardInfo.question,
        answers: currRewardInfo.answers, 
        feedback: currRewardInfo.feedback,
        onComplete: () => rewardsMeta[currRewardId].onComplete({ dataStore }),
      })
    }

    // enum RewardType {
    //   Text = "Text",
    //   Video = "Video",
    //   Action = "Action",
    // }

    // const action = async () => {
    //   const type = currRewardInfo.type as RewardType

    //   const feedback = currRewardInfo.feedback ?? ""

    //   if ([RewardType.Text, RewardType.Video].includes(RewardType[type])) {
    //     setQuizzData({
    //       feedback,
    //       question: currRewardInfo.question,
    //       answers: currRewardInfo.answers,
    //     })
    //   }

    //   switch (RewardType[type]) {
    //     case RewardType.Text:
    //       setQuizzVisible(true)
    //       break
    //     case RewardType.Video:
    //       try {
    //         console.tron.log({ videoid: currRewardInfo.videoid })
    //         await YouTubeStandaloneIOS.playVideo(currRewardInfo.videoid)
    //         await sleep(500) // FIXME why await for playVideo doesn't work?
    //         console.tron.log("finish video")
    //         setQuizzVisible(true)
    //       } catch (err) {
    //         console.tron.log("error video", err.toString())
    //         setQuizzVisible(false)
    //       }
    //       break
    //     case RewardType.Action:
    //       await rewardsMeta[currRewardId].onAction({ dataStore, setLoading, navigate })
    //       close(feedback)
    //       break
    //   }
    // }

    const CardItem = ({ item, index }) => {
      const itemId = item[0]
      const itemInfo = item[1]

      return (
        <View style={styles.item}>
          <TouchableOpacity onPress={() => open(index)} activeOpacity={0.9}>
            <Image
              source={eval(`${itemId}Image`)} // FIXME
              style={{width: screenWidth - 60, height: 300, resizeMode: 'contain',}}
              containerStyle={styles.imageContainerRewards}
            />
          </TouchableOpacity>
          <View>
            <Text style={styles.itemTitle}>{itemInfo.title}</Text>
            <Button
              onPress={async () => open(index)}
              disabled={!itemInfo.enabled}
              type={itemInfo.fullfilled ? "clear" : "solid"}
              buttonStyle={itemInfo.fullfilled ? styles.buttonStyleFullfilled : styles.textButton}
              titleStyle={itemInfo.fullfilled ? styles.titleStyleFullfilled : null}
              // containerStyle={styles.}
              title={
                  itemInfo.enabled
                  ? itemInfo.fullfilled
                    ? I18n.t("RewardsScreen.rewardEarned", {
                      count: OnboardingRewards[itemId],
                      formatted_number: I18n.toNumber(OnboardingRewards[itemId], { precision: 0 }),
                    })
                    : I18n.t("RewardsScreen.earnSats", {
                        count: OnboardingRewards[itemId],
                        formatted_number: I18n.toNumber(OnboardingRewards[itemId], { precision: 0 }),
                      })
                    // : translate("common.learnMore")
                  : itemInfo.enabledMessage
              }
              icon={itemInfo.fullfilled ? <Icon 
                name={"ios-checkmark-circle-outline"}
                size={36}
                color={palette.white}
                style={{paddingRight: 12, paddingTop: 3}}
                />
                : undefined}
            />
          </View>
        </View>
      )
    }

    return (
      <Screen>
        <View style={{ flex: 1 }} />
        <Carousel
          data={rewards}
          renderItem={CardItem}
          sliderWidth={screenWidth}
          // scrollEnabled={!isRewardOpen}
          itemWidth={screenWidth - 60}
          hasParallaxImages={true}
          firstItem={firstItem}
          // inactiveSlideOpacity={isRewardOpen ? 0 : 0.7}
          removeClippedSubviews={false}
          onBeforeSnapToItem={(index) => setCurrRewardIndex(index)}
        />
        <View style={{ flex: 1 }} />
        <Pagination
          dotsLength={rewards.length}
          activeDotIndex={currRewardIndex}
          dotStyle={{
              width: 10,
              height: 10,
              borderRadius: 5,
              marginHorizontal: 0,
              backgroundColor: 'rgba(255, 255, 255, 0.92)'
          }}
          inactiveDotStyle={{
              // Define styles for inactive dots here
          }}
          inactiveDotOpacity={0.4}
          inactiveDotScale={0.6}
        />
      </Screen>
    )
  }),
)

import I18n from "i18n-js"
import { inject, observer } from "mobx-react"
import * as React from "react"
import { useState } from "react"
import { Alert, Dimensions, Image, Platform, StyleSheet, Text, View } from "react-native"
import { Button } from "react-native-elements"
import { TouchableOpacity } from "react-native-gesture-handler"
import Carousel, { Pagination } from "react-native-snap-carousel"
import Icon from "react-native-vector-icons/Ionicons"
import { OnboardingRewards } from "types"
import { Screen } from "../../components/screen"
import { translate } from "../../i18n"
import { color } from "../../theme"
import { palette } from "../../theme/palette"
import { getRemainingRewardsSats, getRewardsFromSection, rewardsMeta } from "./rewards-utils"


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

const sat2Image = require("./Sat.png")
const satImage = require("./Sat.png")
const freeMoneyImage = require("./freeMoney.jpg")
const whatIsBitcoinImage = require("./SafeBank.jpg")
const whereBitcoinExistImage = require("./SafeBank.jpg")
const whoControlsBitcoinImage = require("./digitalKeys.jpg")
const digitalKeysImage = require("./digitalKeys.jpg")
const backupWalletImage = require("./backupWallet.jpg")
const fiatMoneyImage = require("./fiatMoney.jpeg")
const moneySupplyImage = require("./fiatMoney.jpeg")
const bitcoinUniqueImage = require("./GreenPhone.jpg")
const copyDigitalMoneyImage = require("./MoneySupply.jpg")
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
  screenStyle: {
    backgroundColor: palette.blue
  },

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
    backgroundColor: palette.white,
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

    const section = route.params.section
    const rewards = getRewardsFromSection({ section, rewardsMeta, dataStore })

    const itemIndex = rewards.findIndex(item => !item.fullfilled)
    const [firstItem] = useState(itemIndex >= 0 ? itemIndex : 0)

    const [currRewardIndex, setCurrRewardIndex] = useState(firstItem)

    const [initialRemainingRewards] = useState(getRemainingRewardsSats({ section, dataStore }))
    const currentRemainingRewards = getRemainingRewardsSats({ section, dataStore })

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
    
    const currReward = rewards[currRewardIndex]

    // TODO
    // navigation.setOptions({ title: translate(`RewardsScreen.rewards\.${section}\.meta.title`) })

    enum RewardType {
      Text = "Text",
      Video = "Video",
      Action = "Action",
    }

    const open = async () => {

      const type = currReward.type as RewardType

      switch (RewardType[type]) {
        case RewardType.Text:
          navigation.navigate('rewardsQuiz', { 
            title: currReward.title, 
            text: currReward.text, 
            amount: OnboardingRewards[currReward.id],
            question: currReward.question,
            answers: currReward.answers, 
            feedback: currReward.feedback,
            onComplete: () => rewardsMeta[currReward.id].onComplete({ dataStore }),
          })
          break
        //     case RewardType.Video:
        //       try {
        //         console.tron.log({ videoid: currReward.videoid })
        //         await YouTubeStandaloneIOS.playVideo(currReward.videoid)
        //         await sleep(500) // FIXME why await for playVideo doesn't work?
        //         console.tron.log("finish video")
        //         setQuizVisible(true)
        //       } catch (err) {
        //         console.tron.log("error video", err.toString())
        //         setQuizVisible(false)
        //       }
        //       break
        case RewardType.Action:
          // TODO
          // await rewardsMeta[currReward.id].onAction({ dataStore, navigate })
          break
      }
    }

    const CardItem = ({ item, index }) => {
      console.tron.log({item})

      return (
        <View style={styles.item}>
          <TouchableOpacity onPress={open} activeOpacity={0.9}>
            <Image
              source={eval(`${item.id}Image`)} // FIXME
              style={{width: screenWidth - 60, height: 300, resizeMode: 'contain'}}
              containerStyle={styles.imageContainerRewards}
            />
          </TouchableOpacity>
          <View>
            <Text style={styles.itemTitle}>{item.title}</Text>
            <Button
              onPress={open}
              disabled={!item.enabled}
              type={item.fullfilled ? "clear" : "solid"}
              buttonStyle={item.fullfilled ? styles.buttonStyleFullfilled : styles.textButton}
              titleStyle={item.fullfilled ? styles.titleStyleFullfilled : null}
              // containerStyle={styles.}
              title={
                  item.enabled
                  ? item.fullfilled
                    ? I18n.t("RewardsScreen.rewardEarned", {
                      count: OnboardingRewards[item.id],
                      formatted_number: I18n.toNumber(OnboardingRewards[item.id], { precision: 0 }),
                    })
                    : I18n.t("RewardsScreen.earnSats", {
                        count: OnboardingRewards[item.id],
                        formatted_number: I18n.toNumber(OnboardingRewards[item.id], { precision: 0 }),
                      })
                    // : translate("common.learnMore")
                  : item.enabledMessage
              }
              icon={item.fullfilled ? <Icon 
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
      <Screen style={styles.screenStyle}>
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

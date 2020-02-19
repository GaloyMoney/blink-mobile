import * as React from "react"
import { useState, useEffect } from "react"
import { Screen } from "../../components/screen"
import { StyleSheet, Alert, View, Dimensions, Platform, Animated } from "react-native"
import { Text } from "../../components/text"
import { color } from "../../theme"
import { useNavigation } from "react-navigation-hooks"
import { palette } from "../../theme/palette"
import { observer, inject } from "mobx-react"
import { Onboarding, OnboardingRewards } from "types"
import Carousel, { ParallaxImage } from 'react-native-snap-carousel'
import { translate } from "../../i18n"
import I18n from 'i18n-js'
import { AccountType, CurrencyType, FirstChannelStatus } from "../../utils/enum"
import { Button } from "react-native-elements"
import { sleep } from "../../utils/sleep"
import { Notifications, RegistrationError } from "react-native-notifications"
import functions from "@react-native-firebase/functions"
import { YouTubeStandaloneIOS } from "react-native-youtube"
import { Overlay } from "../../components/overlay"
import Svg, { Path } from "react-native-svg"
import { Quizz } from "../../components/quizz"
import { TouchableOpacity } from "react-native-gesture-handler"


const walletDownloadedImage = require("./GreenPhone.jpg")
const satImage = require("./Sat.png")
const freeMoneyImage = require("./freeMoney.jpg")
const custodyImage = require("./SafeBank.jpg")
const digitalKeysImage = require("./digitalKeys.jpg")
const backupWalletImage = require("./backupWallet.jpg")
const fiatMoneyImage = require("./fiatMoney.jpeg")
const bitcoinUniqueImage = require("./GreenPhone.jpg")
const moneySupplyImage = require("./MoneySupply.png")
const newBitcoinImage = require("./newBitcoin.jpg")
const volatilityImage = require("./volatility.jpeg")
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
const moneyLaunderingImage = require("./moneyLaundering.jpeg")

const { width: screenWidth } = Dimensions.get('window')
const { height: screenHeight } = Dimensions.get('window')

const styles = StyleSheet.create({
    item: {
        width: screenWidth - 60,
        // height: screenWidth - 90,
        borderRadius: 32,
    },

    bottomItem: {
        backgroundColor: palette.white,
        shadowOpacity: 0.3,
        shadowRadius: 3,
        borderColor: palette.lightGrey,
        borderWidth: .25,
        borderBottomLeftRadius: 32,
        borderBottomRightRadius: 32,
    },
    
    imageContainerRewardsOpen: {
        height: 120,
        marginBottom: Platform.select({ ios: 0, android: 1 }), // Prevent a random Android rendering issue
        backgroundColor: 'white',
        borderTopLeftRadius: 32,
        borderTopRightRadius: 32,
    },

    imageContainerRewardsClosed: {
        height: 200,
        marginBottom: Platform.select({ ios: 0, android: 1 }), // Prevent a random Android rendering issue
        backgroundColor: 'white',
        borderTopLeftRadius: 32,
        borderTopRightRadius: 32,
    },

    image: {
        ...StyleSheet.absoluteFillObject,
        resizeMode: 'cover',
    },

    header: {
        marginVertical: 10,
        alignItems: "center"
    },

    title: {
        fontWeight: 'bold',
        marginHorizontal: 40,
        textAlign: 'center',
        color: palette.darkGrey
    },

    text: {
        marginHorizontal: 20,
        textAlign: 'center',
        fontSize: 22,
        color: palette.darkGrey
    },

    titleSats: {
        fontWeight: 'bold',
        fontSize: 32,
        marginHorizontal: 40,
        textAlign: 'center',
        color: color.primary
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
        color: palette.darkGrey
    },

    smallText: {
        fontSize: 18,
        color: palette.darkGrey,
        marginHorizontal: 40,
        marginBottom: 40,
        textAlign: 'center',
    }
})


const RewardsHeader = (props) => (
    <Svg viewBox="0 0 392.551 392.551" height={70} width={70} {...props} fill={color.primary}>
      <Path d="M278.635 255.871c35.62-25.665 58.893-67.491 58.893-114.618C337.528 63.354 274.174 0 196.275 0S55.023 63.354 55.023 141.253c0 47.127 23.273 88.953 58.893 114.618l-45.77 92.251c-1.939 3.879-1.422 8.469 1.422 11.83 2.78 3.297 7.176 4.719 11.378 3.491l32.388-9.244 12.218 31.354c1.552 4.008 5.301 6.853 9.632 6.982 2.069 0 7.24 0 10.279-6.012l50.812-102.529 50.877 102.529c1.875 3.685 5.624 6.012 9.762 6.012.129 0 7.758.711 10.149-6.982l12.218-31.354 32.388 9.244c4.202 1.164 8.598-.129 11.378-3.491 2.78-3.297 3.297-7.952 1.422-11.83l-45.834-92.251zm-141.77 98.78l-6.853-17.648c-2.004-5.236-7.822-8.016-13.123-6.465l-18.166 5.172 33.939-68.461c12.671 6.4 26.44 11.055 40.986 13.382l-36.783 74.02zM76.873 141.253c0-65.875 53.592-119.402 119.402-119.402s119.402 53.527 119.402 119.402-53.592 119.402-119.402 119.402S76.873 207.127 76.873 141.253zm198.853 189.22c-5.43-1.552-11.119 1.293-13.123 6.465l-6.853 17.648-36.719-74.085c14.545-2.327 28.251-6.982 40.986-13.382l33.875 68.461-18.166-5.107z" />
      <Path d="M277.924 114.036c-1.358-4.008-4.784-6.917-8.857-7.499l-43.507-6.335-19.459-39.434c-1.875-3.685-5.624-6.077-9.826-6.077s-7.952 2.392-9.826 6.077l-19.459 39.434-43.507 6.335c-4.073.646-7.499 3.491-8.792 7.434-1.293 3.943-.259 8.275 2.78 11.184l31.547 30.707-7.434 43.378c-.711 4.073.776 8.469 4.331 10.667 3.426 2.069 8.469 2.651 11.507.84l38.917-20.493 38.917 20.493c4.267 2.327 17.648-.711 15.515-12.994l-7.176-41.826 31.547-30.707c2.911-2.844 4.01-7.24 2.782-11.184zm-53.657 30.126c-2.521 2.457-3.685 6.077-3.168 9.632l4.655 27.216-24.436-12.8a10.843 10.843 0 00-10.149 0l-24.436 12.8 4.655-27.216c.646-3.556-.517-7.111-3.168-9.632l-19.782-19.265 27.345-3.943c3.556-.517 6.659-2.78 8.21-5.948l12.218-24.824 12.218 24.824c1.616 3.232 4.655 5.495 8.21 5.948l27.345 3.943-19.717 19.265z" />
    </Svg>
)

export const RewardsScreen = inject("dataStore")(
    observer(({ dataStore }) => {

    const { navigate, setParams } = useNavigation()

    const [ isRewardOpen, setRewardOpen ] = useState(false)
    const [ quizzVisible, setQuizzVisible ] = useState(false)
    const [ quizzData, setQuizzData ] = useState({})
    const [ currReward, setCurrReward ] = useState("")
    const [ loading, setLoading ] = useState(false)
    const [ err, setErr ] = useState("")
    const [ animation ] = useState(new Animated.Value(0))

    const open = (index) => {
        setCurrReward(index)
        setParams({title: translate(`RewardsScreen\.${rewards[index].id}.title`)})
        setRewardOpen(!isRewardOpen)
    }
    
    const close = (msg = "") => {
        setRewardOpen(false)
        setParams({title: null})
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
        const type = translate(`RewardsScreen\.${rewards[currReward].id}.type`) as RewardType

        const feedback = translate(`RewardsScreen\.${rewards[currReward].id}.feedback`, {defaultValue: ""})
        const correct = translate(`RewardsScreen\.${rewards[currReward].id}.correct`, {defaultValue: false})
        const onComplete = rewards[currReward].onComplete

        if ([RewardType.Text, RewardType.Video].includes(RewardType[type])) {
            setQuizzData({
                feedback,
                correct,
                onComplete,
                question: translate(`RewardsScreen\.${rewards[currReward].id}.question`),
                answers: translate(`RewardsScreen\.${rewards[currReward].id}.answers`),
            })
        }

        switch (RewardType[type]) {
            case RewardType.Text:
                setQuizzVisible(true)
                break
            case RewardType.Video:
                try {
                    await YouTubeStandaloneIOS.playVideo(translate(`RewardsScreen\.${rewards[currReward].id}.videoid`))
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

    const quizzClosing = () => {
        setQuizzVisible(false)
    }

    const rewards = 
    [
        {
            id: "walletDownloaded",
            onComplete: null,
            enabled: true,
        },
        {
            id: 'sat',
            onComplete: async () => dataStore.onboarding.add(Onboarding.sat),
            enabled: true,
        },
        {
            id: 'freeMoney',
            onComplete: async () => dataStore.onboarding.add(Onboarding.freeMoney),
            enabled: true,
        },
        {
            id: 'custody',
            onComplete: async () => dataStore.onboarding.add(Onboarding.custody),
            enabled: true,
        },
        {
            id: 'digitalKeys',
            onComplete: async () => dataStore.onboarding.add(Onboarding.digitalKeys),
            enabled: true,
        },
        {
            id: "backupWallet",
            onComplete: async () => {
                setLoading(true)
                await sleep(2000)
                await dataStore.onboarding.add(Onboarding.backupWallet)
            },
            enabled: true,
        },
        {
            id: 'fiatMoney',
            onComplete: async () => dataStore.onboarding.add(Onboarding.fiatMoney),
            enabled: true,
        },
        {
            id: 'bitcoinUnique',
            onComplete: async () => dataStore.onboarding.add(Onboarding.bitcoinUnique),
            enabled: true,
        },
        {
            id: 'moneySupply',
            onComplete: async () => dataStore.onboarding.add(Onboarding.moneySupply),
            enabled: true,
        },
        {
            id: 'newBitcoin',
            onComplete: () => {},
            enabled: false,
            enabledMessage: translate(`common.soon`),
        },
        {
            id: 'volatility',
            onComplete: async () => dataStore.onboarding.add(Onboarding.volatility),
            enabled: true,
        },
        {
            id: "activateNotifications",
            onComplete: async () => {

                Notifications.events().registerRemoteNotificationsRegistered(async (event: Registered) => {
                    console.tron.log("Registered For Remote Push", `Device Token: ${event.deviceToken}`)
            
                    try {
                        setLoading(true)
                        await functions().httpsCallable("sendDeviceToken")({deviceToken: event.deviceToken})
                        await dataStore.onboarding.add(Onboarding.activateNotifications)
                        close("Notification succesfully activated")
                    } catch (err) {
                        console.tron.log(err.toString())
                        setErr(err.toString())
                    }
                })
                
                Notifications.events().registerRemoteNotificationsRegistrationFailed((event: RegistrationError) => {
                    Alert.alert("Failed To Register For Remote Push", `Error (${event})`)
                })

                Notifications.registerRemoteNotifications()
                
            },
            enabled: true,
        },
        {
            id: 'phoneVerification',
            onComplete: () => navigate('welcomePhoneInput'),
            enabled: true,
        },
        // {
        //     id: 'firstLnPayment',
        //     onComplete: () => navigate('scanningQRCode'),
        //     enabled: dataStore.lnd.statusFirstChannel == FirstChannelStatus.opened,
        //     enabledMessage: translate(`RewardsScreen.channelNeeded`)
        // },
        {
            id: 'transaction',
            onComplete: () => {},
            enabled: false,
            enabledMessage: translate(`common.soon`)
        },
        {
            id: 'paymentProcessing',
            onComplete: () => {},
            enabled: false,
            enabledMessage: translate(`common.soon`)
        },
        {
            id: 'privacy',
            onComplete: () => {},
            enabled: false,
            enabledMessage: translate(`common.soon`)
        },
        {
            id: 'creator',
            onComplete: async () => dataStore.onboarding.add(Onboarding.creator),
            enabled: true,
        },
        {
            id: 'decentralization',
            onComplete: () => {},
            enabled: false,
            enabledMessage: translate(`common.soon`)
        },
        {
            id: "inviteAFriend",
            onComplete: () => Alert.alert('TODO'),
            enabled: dataStore.lnd.statusFirstChannel == FirstChannelStatus.opened,
            enabledMessage: translate(`RewardsScreen.channelNeeded`)
        },
        {
            id: 'bankOnboarded',
            onComplete: () => navigate('openBankAccount'),
            enabled: true,
        },
        {
            id: "debitCardActivation",
            onComplete: () => Alert.alert('TODO'),
            enabled: dataStore.onboarding.has(Onboarding["bankOnboarded"]),
            enabledMessage: translate(`RewardsScreen.bankingNeeded`)
        },
        {
            id: "firstCardSpending",
            onComplete: () => Alert.alert('TODO'),
            enabled: dataStore.onboarding.has(Onboarding["bankOnboarded"]),
            enabledMessage: translate(`RewardsScreen.bankingNeeded`)
        },
        {
            id: "activateDirectDeposit",
            rewards: "1% card rewards!",
            onComplete: () => Alert.alert('TODO'),
            enabled: dataStore.onboarding.has(Onboarding["bankOnboarded"]),
            enabledMessage: translate(`RewardsScreen.bankingNeeded`)
        },
        {
            id: 'energy',
            onComplete: async () => {},
            enabled: false,
            enabledMessage: translate(`common.soon`)
        },
        {
            id: 'moneyLaundering',
            onComplete: () => {},
            enabled: false,
            enabledMessage: translate(`common.soon`)
        },
    ]
    
    rewards.forEach(item => item['fullfilled'] = dataStore.onboarding.has(Onboarding[item.id]))
    const [ firstItem ] = useState(rewards.findIndex(item => !item.fullfilled))

    const inverse = animation.interpolate({
        inputRange: [0, 1],
        outputRange: [1, 0],
    })

    const plusSats = (id) => (
         `+${I18n.t('sat', 
            { count: OnboardingRewards[id], 
              formatted_number: I18n.toNumber(OnboardingRewards[id], {precision: 0})
        })}`)

    const renderItem = ({item, index}, parallaxProps) => {
        return (
            <Animated.View style={styles.item}>
                <TouchableOpacity 
                    onPress={() => open(index)}
                    disabled={isRewardOpen}
                    activeOpacity={0.9}
                    >
                    <ParallaxImage 
                        source={eval(`${item.id}Image`)} 
                        containerStyle={isRewardOpen ? 
                            styles.imageContainerRewardsOpen: styles.imageContainerRewardsClosed
                        }
                        {...parallaxProps}
                        />
                </TouchableOpacity>
                <View style={styles.bottomItem}>
                    {   !isRewardOpen &&
                        <Text style={styles.itemTitle}>
                            { translate(`RewardsScreen\.${item.id}.title`) }
                        </Text>
                    }
                    <Animated.ScrollView
                        contentContainerStyle={{flexGrow: 1}}
                        style={[{
                            height: animation.interpolate({
                                inputRange: [0, 1],
                                outputRange: ["0%", (screenHeight < 850) ? "52%": "65%"],
                        }), // FIXME hack for iphone 8?
                            opacity: animation,
                        }]}>
                        <View style={{flex: 1}} />
                        { item.component ||
                        <Animated.View style={{
                            alignSelf: "center"}}
                          >
                            <Animated.Text 
                            persistentScrollbar={true}
                            style={[ styles.text]}>
                                { translate(`RewardsScreen\.${item.id}.text`) }
                            </Animated.Text>
                        </Animated.View>
                        }
                        <View style={{flex: 1}} />
                    </Animated.ScrollView>
                    <Animated.Text style={[styles.satsButton, {opacity: inverse}]}>
                        { item.rewards 
                        || OnboardingRewards[item.id] && 
                          plusSats(item.id)
                        }
                    </Animated.Text>
                    <Button 
                        onPress={() => {isRewardOpen ?
                            item.fullfilled ?
                                close() :
                                action() :
                            open(index)}} 
                        disabled={!item.enabled}
                        buttonStyle={item.fullfilled ? styles.buttonStyleDisabled : styles.textButton}
                        titleStyle={item.fullfilled ? styles.titleStyleDisabled : null}
                        // containerStyle={styles.}
                        title={ isRewardOpen ?
                                    item.fullfilled ?
                                        translate("common.close") :
                                        translate("RewardsScreen.getRewardNow") :
                                    item.enabled ?
                                        item.fullfilled ?
                                            translate("RewardsScreen.rewardEarned") :
                                            translate("common.learnMore") :
                                        item.enabledMessage
                            }
                        loading={loading}
                        />
                </View>
            </Animated.View>
        )
    }

    return (
        <Screen>
            {
                (dataStore.onboarding.stage.length === 1) &&
                <Overlay screen="rewards" />
            }
            <Quizz 
                quizzVisible={quizzVisible}
                quizzClosing={quizzClosing}
                quizzData={quizzData}
            />
            <View style={{flex: 1}} />
            <Animated.View style={[styles.header]} >
                { !isRewardOpen &&
                  <RewardsHeader /> 
                }
                <Animated.Text style={[styles.title,
                    {
                        fontSize: animation.interpolate({
                            inputRange: [0, 1],
                            outputRange: [28, 0.1],
                        }),
                    }]}>
                    {translate('RewardsScreen.satAccumulated')}
                </Animated.Text>
                    <Animated.Text style={[
                        styles.titleSats,
                    ]}>
                    {isRewardOpen ? 
                        `${plusSats(rewards[currReward].id)}` :
                        I18n.toNumber(dataStore.balances({ 
                            currency: CurrencyType.BTC, 
                            account: AccountType.VirtualBitcoin
                        }), {precision: 0})
                    }
                </Animated.Text>
                { isRewardOpen &&
                    <Button 
                    title={translate("common.close")} 
                    buttonStyle={styles.textButtonClose}
                    onPress={() => close()}
                    />
                }
            </Animated.View>
            <View style={{flex: 1}} />
            <Carousel
                //   ref={(c) => { this._carousel = c; }}
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
}))

RewardsScreen.navigationOptions = screenProps => {
    const title = screenProps.navigation.getParam("title") ?? translate("RewardsScreen.title")
    return { title }
}

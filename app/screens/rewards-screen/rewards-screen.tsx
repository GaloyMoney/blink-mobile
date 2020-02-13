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


const walletDownloadedImage = require("./GreenPhone.jpg")
const satImage = require("./GreenPhone.jpg")
const custodyImage = require("./GreenPhone.jpg")
const backupWalletImage = require("./SafeBank.jpg")
const activateNotificationsImage = require("./GlobalCommunications.jpg")
const rewardsVideoImage = require("./Asterix.jpeg")
const phoneVerificationImage = require("./GreenPhone.jpg")
const lightningNetworkConnectionImage = require("./LittleDipper.jpg")
const firstLightningPaymentImage = require("./LightningPayment.jpg")
const inviteAFriendImage = require("./InviteFriends.jpg")
const bankOnboardedImage = require("./BankAccount.jpg")
const debitCardActivationImage = require("./Password1234.jpg")
const firstCardSpendingImage = require("./PointOfSale.jpg")
const activateDirectDepositImage = require("./GreenPhone.jpg")


const rewardsHeader = require("./RewardsHeader.png")


const { width: screenWidth } = Dimensions.get('window')

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
    
    imageContainer: {
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

export const RewardsScreen = inject("dataStore")(
    observer(({ dataStore }) => {

    const { navigate } = useNavigation()

    const [ isRewardOpen, setRewardOpen ] = useState(false)
    const [ currReward, setCurrReward ] = useState("")
    const [ loading, setLoading ] = useState(false)
    const [ err, setErr ] = useState("")
    const [ animation ] = useState(new Animated.Value(0))

    const open = (index) => {
        setCurrReward(rewards[index].id)
        setRewardOpen(!isRewardOpen)
    }

    const close = (msg = "") => {
        setRewardOpen(false)
        setLoading(false)
        if (msg !== "") {
            Alert.alert(msg)
        }
    }

    React.useEffect(() => {
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
              },
            },
          ])
        }
    }, [err])

    const actionWrapper = async (fn, msg = "") => {
        await fn()
        close(msg)
    }

    const rewards = 
    [
        {
            id: "walletDownloaded",
            action: null,
        },
        {
            id: 'sat',
            action: () => dataStore.onboarding.add(Onboarding.sat),
            closingMsg: "You earn 1 sat, the small unit of Bitcoin. Congrats!",
            enabled: true,
        },
        {
            id: 'custody',
            action: () => dataStore.onboarding.add(Onboarding.custody),
            closingMsg: "You've learn one of the important property of Bitcoin, it can be self custodied!",
            enabled: true,
        },
        {
            id: "backupWallet",
            action: async () => {
                setLoading(true)
                await sleep(2000)
                await dataStore.onboarding.add(Onboarding.backupWallet)
            },
            closingMsg: "Backup keys saved to iCloud",
            enabled: true,
        },
        {
            id: "activateNotifications",
            action: () => {

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
            id: 'rewardsVideo',
            action: async () => {
                try {
                    await YouTubeStandaloneIOS.playVideo("XNu5ppFZbHo")
                    await dataStore.onboarding.add(Onboarding.rewardsVideo)
                } catch (err) {
                    console.tron.error(err)
                    Alert.alert(err.toString())
                }
            },
            enabled: true,
        },
        {
            id: 'phoneVerification',
            action: () => navigate('welcomePhoneInput'),
            enabled: true,
        },
        {
            id: 'lightningNetworkConnection',
            action: () => Alert.alert('TODO'),
            enabled: dataStore.onboarding.has(Onboarding.phoneVerification),
            enabledMessage: translate(`RewardsScreen.phoneNumberNeeded`)
        },
        {
            id: 'firstLightningPayment',
            action: () => navigate('sendBitcoin'),
            enabled: dataStore.lnd.statusFirstChannel == FirstChannelStatus.opened,
            enabledMessage: translate(`RewardsScreen.channelNeeded`)
        },
        {
            id: "inviteAFriend",
            action: () => Alert.alert('TODO'),
            enabled: dataStore.lnd.statusFirstChannel == FirstChannelStatus.opened,
            enabledMessage: translate(`RewardsScreen.channelNeeded`)
        },
        {
            id: 'bankOnboarded',
            action: () => navigate('openBankAccount'),
            enabled: true,
        },
        {
            id: "debitCardActivation",
            action: () => Alert.alert('TODO'),
            enabled: dataStore.onboarding.has(Onboarding["bankOnboarded"]),
            enabledMessage: translate(`RewardsScreen.bankingNeeded`)
        },
        {
            id: "firstCardSpending",
            action: () => Alert.alert('TODO'),
            enabled: dataStore.onboarding.has(Onboarding["bankOnboarded"]),
            enabledMessage: translate(`RewardsScreen.bankingNeeded`)
        },
        {
            id: "activateDirectDeposit",
            rewards: "1% card rewards!",
            action: () => Alert.alert('TODO'),
            enabled: dataStore.onboarding.has(Onboarding["bankOnboarded"]),
            enabledMessage: translate(`RewardsScreen.bankingNeeded`)
        },
    ]
    
    rewards.forEach(item => item['fullfilled'] = dataStore.onboarding.has(Onboarding[item.id]))
    const [ firstItem ] = useState(rewards.findIndex(item => !item.fullfilled))

    const inverse = animation.interpolate({
        inputRange: [0, 1],
        outputRange: [1, 0],
    })

    const sats = (id) => `+${I18n.toNumber(OnboardingRewards[id], {precision: 0})} sats`

    const renderItem = ({item, index}, parallaxProps) => {
        return (
            <Animated.View style={styles.item}>
                <ParallaxImage 
                    source={eval(`${item.id}Image`)} // FIXME security issue?
                    containerStyle={styles.imageContainer} 
                    {...parallaxProps}
                />
                <View style={styles.bottomItem}>
                    <Text style={styles.itemTitle}>
                        { translate(`RewardsScreen\.${item.id}.title`) }
                    </Text>
                    <Animated.ScrollView
                        style={[{
                            height: animation.interpolate({
                                inputRange: [0, 1],
                                outputRange: [0, 140],
                        }),
                            opacity: animation,
                        }]}>
                        { item.component ||
                            <Animated.Text 
                                persistentScrollbar={true}
                                style={[ styles.text, ]}>
                                { translate(`RewardsScreen\.${item.id}.text`) }
                            </Animated.Text>
                        }
                    </Animated.ScrollView>
                    <Animated.Text style={[styles.satsButton, {opacity: inverse}]}>
                        { item.rewards 
                        || OnboardingRewards[item.id] && 
                          sats(item.id)
                        }
                    </Animated.Text>
                    <Button 
                        onPress={ () => {
                            isRewardOpen ?
                                actionWrapper(item.action, item.closingMsg) :
                                open(index)
                        }} 
                        disabled={item.fullfilled || !item.enabled}
                        buttonStyle={styles.textButton}
                        // containerStyle={styles.}
                        title={item.fullfilled ? 
                            'Rewards received' :
                            item.enabled ? 
                                isRewardOpen ?
                                    'Get Rewards Now!' :
                                    'Learn More' :
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
            <Animated.View style={[styles.header]} >
                <Animated.Image source={rewardsHeader} 
                    style={[{
                            height: animation.interpolate({
                                inputRange: [0, 1],
                                outputRange: [120, 0],
                            }),
                        }]} />
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
                        `${sats(currReward)}` :
                        I18n.toNumber(dataStore.balances({ 
                            currency: CurrencyType.BTC, 
                            account: AccountType.VirtualBitcoin
                        }), {precision: 0})
                    }
                </Animated.Text>
                { isRewardOpen &&
                    <Button 
                        title="Close" 
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
            />
        </Screen>
    )
}))

RewardsScreen.navigationOptions = () => ({
    title: translate("RewardsScreen.title")
})

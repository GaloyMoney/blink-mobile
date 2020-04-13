import functions from "@react-native-firebase/functions"
import { Alert } from "react-native"
import { Notifications, RegistrationError } from "react-native-notifications"
import { Onboarding, OnboardingRewards } from "types"
import { translate } from "../../i18n"
import { sleep } from "../../utils/sleep"


export const getRewardsFromSection = ({ dataStore, section, rewardsMeta = undefined }) => {
  const rewards_obj = translate(`RewardsScreen.rewards\.${section}`)
  const rewards = Object.entries(rewards_obj).filter((id) => id[0] !== "meta")

  rewards.forEach((item) => (item[1].fullfilled = dataStore.onboarding.has(Onboarding[item[0]])))

  if (rewardsMeta) {
    // FIXME
    rewards.forEach((item) => (item[1].enabled = rewardsMeta[item[0]]?.enabled ?? true))
    rewards.forEach(
      (item) =>
        (item[1].enabledMessage = rewardsMeta[item[0]]?.enabledMessage ?? translate(`common.soon`)),
    )
  }

  return rewards
}

export const isSectionComplete = ({section, dataStore}) => 
  getRemainingRewardsSats({section, dataStore}) === 0

export const getRemainingRewardsItems = ({ section, dataStore }) => {
  const rewards = getRewardsFromSection({ section, dataStore })
  return rewards.filter((item) => item[1].fullfilled).length / rewards.length
}
  
export const getRemainingRewardsSats = ({ section, dataStore }) =>
  getRewardsFromSection({ section, dataStore })
    .filter((item) => !item[1].fullfilled)
    .reduce((acc, item) => OnboardingRewards[item[0]] + acc, 0)

export const getSections = () => {
  const all_rewards_obj = translate(`RewardsScreen.rewards`)
  const sections = Object.keys(all_rewards_obj)
  return sections
}

// TODO optimize
export const getCompletedSection = ({ dataStore }) => {
  let count = 0
  const sections = getSections()
  for (const section of sections) {
    if (getRemainingRewardsSats({ dataStore, section }) === 0) {
      count++
    }
  }
  return count
}

export const rewardsMeta = {
  walletDownloaded: {
    onComplete: null,
  },
  sat: {
    onComplete: async ({ dataStore }) => dataStore.onboarding.add(Onboarding.sat),
  },
  freeMoney: {
    onComplete: async ({ dataStore }) => dataStore.onboarding.add(Onboarding.freeMoney),
  },
  custody: {
    onComplete: async ({ dataStore }) => dataStore.onboarding.add(Onboarding.custody),
  },
  digitalKeys: {
    onComplete: async ({ dataStore }) => dataStore.onboarding.add(Onboarding.digitalKeys),
  },
  backupWallet: {
    onAction: async ({ setLoading }) => {
      setLoading(true)
      await sleep(2000)
      // TODO
    },
    onComplete: async ({ dataStore }) => {
      await dataStore.onboarding.add(Onboarding.backupWallet)
    },
  },
  fiatMoney: {
    onComplete: async ({ dataStore }) => dataStore.onboarding.add(Onboarding.fiatMoney),
  },
  bitcoinUnique: {
    onComplete: async ({ dataStore }) => dataStore.onboarding.add(Onboarding.bitcoinUnique),
  },
  moneySupply: {
    onComplete: async ({ dataStore }) => dataStore.onboarding.add(Onboarding.moneySupply),
  },
  newBitcoin: {
    onComplete: async ({ dataStore }) => dataStore.onboarding.add(Onboarding.newBitcoin),
  },
  activateNotifications: {
    onAction: async ({ dataStore, setLoading }) => {
      // FIXME
      Notifications.events().registerRemoteNotificationsRegistered(async (event: Registered) => {
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
      })

      Notifications.events().registerRemoteNotificationsRegistrationFailed(
        (event: RegistrationError) => {
          Alert.alert("Failed To Register For Remote Push", `Error (${event})`)
        },
      )

      Notifications.registerRemoteNotifications()
    },
  },
  phoneVerification: {
    onAction: ({ navigate }) => navigate("welcomePhoneInput"),
  },
  firstLnPayment: {
    onAction: ({ navigate }) => navigate("scanningQRCode"),
    enabled: true,
    // FIXME
    // enabled: dataStore.lnd.statusFirstChannel == FirstChannelStatus.opened,
    enabledMessage: translate(`RewardsScreen.channelNeeded`),
  },
  transaction: {
    onComplete: async ({ dataStore }) => dataStore.onboarding.add(Onboarding.transaction),
  },
  paymentProcessing: {
    onComplete: async ({ dataStore }) => dataStore.onboarding.add(Onboarding.paymentProcessing),
  },
  creator: {
    onComplete: async ({ dataStore }) => dataStore.onboarding.add(Onboarding.creator),
  },
  decentralization: {
    onComplete: () => {},
    enabled: false,
  },
  inviteAFriend: {
    onComplete: () => Alert.alert("TODO"),
    enabled: false,
    //   enabled: dataStore.lnd.statusFirstChannel == FirstChannelStatus.opened,
    enabledMessage: translate(`RewardsScreen.channelNeeded`),
  },
  bankOnboarded: {
    onComplete: () => navigate("openBankAccount"),
  },
  debitCardActivation: {
    onComplete: () => Alert.alert("TODO"),
    enabled: false,
    //   enabled: dataStore.onboarding.has(Onboarding["bankOnboarded"]),
    enabledMessage: translate(`RewardsScreen.bankingNeeded`),
  },
  firstCardSpending: {
    onComplete: () => Alert.alert("TODO"),
    enabled: false,
    //   enabled: dataStore.onboarding.has(Onboarding["bankOnboarded"]),
    enabledMessage: translate(`RewardsScreen.bankingNeeded`),
  },
  activateDirectDeposit: {
    rewards: "1% card rewards!",
    onComplete: () => Alert.alert("TODO"),
    enabled: false,
    //   enabled: dataStore.onboarding.has(Onboarding["bankOnboarded"]),
    enabledMessage: translate(`RewardsScreen.bankingNeeded`),
  },
  energy: {
    onComplete: async ({ dataStore }) => {},
    enabled: false,
  },
  doubleSpend: {
    onComplete: () => {},
    enabled: false,
  },
  exchangeHack: {
    onComplete: () => {},
    enabled: false,
  },
  moneyLaundering: {
    onComplete: () => {},
    enabled: false,
  },
  privacy: {
    onComplete: () => {},
    enabled: false,
  },
  difficultyAdjustment: {
    onComplete: () => {},
    enabled: false,
  },
  volatility: {
    onComplete: async ({ dataStore }) => dataStore.onboarding.add(Onboarding.volatility),
  },
  buyFirstSats: {
    onComplete: async ({ dataStore }) => dataStore.onboarding.add(Onboarding.buyFirstSats),
  },
  dollarCostAveragingImage: {
    onComplete: async ({ dataStore }) =>
      dataStore.onboarding.add(Onboarding.dollarCostAveragingImage),
  },
}

import functions from "@react-native-firebase/functions"
import { Alert } from "react-native"
import { Notifications, RegistrationError } from "react-native-notifications"
import { Onboarding, OnboardingEarn } from "types"
import { translate } from "../../i18n"
import { sleep } from "../../utils/sleep"

export const getEarnFromSection = ({ dataStore, sectionIndex, earnsMeta = undefined }) => {
  const earns_all = translate(`EarnScreen.earns`)
  console.tron.log({sectionIndex})
  const cards = earns_all[sectionIndex].content

  cards.forEach(item => item.fullfilled = dataStore.onboarding.has(Onboarding[item.id]))
  
  let allPreviousFullfilled = true
  let enabledMessage = ""
  
  cards.forEach(item => {
    console.tron.log({enabledMessage, id: item.id})
    
    item.enabled = true
    
    if (allPreviousFullfilled === false) {
      item.enabled = false
      item.enabledMessage = enabledMessage
    }
    
    if (!item.fullfilled && allPreviousFullfilled) {
      allPreviousFullfilled = false
      enabledMessage = item.title
    }
  })

  if (earnsMeta) {
    // FIXME
    // earns.forEach(item => item.enabled = earnsMeta[item.id]?.enabled ?? true)
    // earns.forEach(
    //   (item) =>
    //     (item.enabledMessage = earnsMeta[item.id]?.enabledMessage ?? translate(`common.soon`)),
    // )
  }

  console.tron.log({earns: cards})

  return cards
}

export const isSectionComplete = ({sectionIndex, dataStore}) => 
  getRemainingEarnSats({sectionIndex, dataStore}) === 0

export const getRemainingEarnItems = ({ sectionIndex, dataStore }) => {
  const earns = getEarnFromSection({ sectionIndex, dataStore })
  return earns.filter((item) => item.fullfilled).length / earns.length
}
  
export const getRemainingEarnSats = ({ sectionIndex, dataStore }) =>
  getEarnFromSection({ sectionIndex, dataStore })
    .filter((item) => !item.fullfilled)
    .reduce((acc, item) => OnboardingEarn[item.id] + acc, 0)

export const getSections = () => {
  const all_earns_obj = translate(`EarnScreen.earns`)
  const sections = Object.keys(all_earns_obj)
  return sections
}

// TODO optimize
export const getCompletedSection = ({ dataStore }) => {
  let count = 0
  const sections = getSections()
  for (const sectionIndex of sections) {
    if (getRemainingEarnSats({ dataStore, sectionIndex }) === 0) {
      count++
    }
  }
  return count
}

export const earnsMeta = {
  walletDownloaded: {
    onComplete: null,
  },
  whatIsBitcoin: {
    onComplete: async ({ dataStore }) => dataStore.onboarding.add(Onboarding.whatIsBitcoin),
  },
  sat: {
    onComplete: async ({ dataStore }) => dataStore.onboarding.add(Onboarding.sat),
  },
  whereBitcoinExist: {
    onComplete: async ({ dataStore }) => dataStore.onboarding.add(Onboarding.whereBitcoinExist),
  },
  whoControlsBitcoin: {
    onComplete: async ({ dataStore }) => dataStore.onboarding.add(Onboarding.whoControlsBitcoin),
  },
  copyBitcoin: {
    onComplete: async ({ dataStore }) => dataStore.onboarding.add(Onboarding.copyBitcoin),
  },
  moneySocialAggrement: {
    onComplete: async ({ dataStore }) => dataStore.onboarding.add(Onboarding.moneySocialAggrement),
  },
  coincidenceOfWants: {
    onComplete: async ({ dataStore }) => dataStore.onboarding.add(Onboarding.coincidenceOfWants),
  },
  moneyEvolution: {
    onComplete: async ({ dataStore }) => dataStore.onboarding.add(Onboarding.moneyEvolution),
  },
  whyStonesShellGold: {
    onComplete: async ({ dataStore }) => dataStore.onboarding.add(Onboarding.whyStonesShellGold),
  },
  moneyIsImportant: {
    onComplete: async ({ dataStore }) => dataStore.onboarding.add(Onboarding.moneyIsImportant),
  },
  moneyImportantGovernement: {
    onComplete: async ({ dataStore }) => dataStore.onboarding.add(Onboarding.moneyImportantGovernement),
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
    enabledMessage: translate(`EarnScreen.channelNeeded`),
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
    enabledMessage: translate(`EarnScreen.channelNeeded`),
  },
  bankOnboarded: {
    onComplete: () => navigate("openBankAccount"),
  },
  debitCardActivation: {
    onComplete: () => Alert.alert("TODO"),
    enabled: false,
    //   enabled: dataStore.onboarding.has(Onboarding["bankOnboarded"]),
    enabledMessage: translate(`EarnScreen.bankingNeeded`),
  },
  firstCardSpending: {
    onComplete: () => Alert.alert("TODO"),
    enabled: false,
    //   enabled: dataStore.onboarding.has(Onboarding["bankOnboarded"]),
    enabledMessage: translate(`EarnScreen.bankingNeeded`),
  },
  activateDirectDeposit: {
    earns: "1% card earns!",
    onComplete: () => Alert.alert("TODO"),
    enabled: false,
    //   enabled: dataStore.onboarding.has(Onboarding["bankOnboarded"]),
    enabledMessage: translate(`EarnScreen.bankingNeeded`),
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

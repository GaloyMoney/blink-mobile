import { Alert } from "react-native"
import { Notifications, RegistrationError } from "react-native-notifications"
import { translate } from "../../i18n"
import { sleep } from "../../utils/sleep"
import { StoreContext } from "../../models"

export const getEarnFromSection = ({ earnsArray, sectionIndex, earnsMeta = undefined }) => {
  const earns_all = translate(`EarnScreen.earns`)
  const cards = earns_all[sectionIndex].content

  // FIXME O(N^2)
  cards.filter(item => item.fullfilled = earnsArray.find(e => e.id == item.id).completed)
  
  let allPreviousFullfilled = true
  let enabledMessage = ""
  
  cards.forEach(item => {    
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

  return cards
}


// TODO this is smelly, refactor
export const isSectionComplete = ({sectionIndex, earnsArray, store}) => 
  getRemainingSatsOnSection({sectionIndex, earnsArray, store}) === 0

export const getRemainingEarnItems = ({ sectionIndex, earnsArray }) => {
  const earns = getEarnFromSection({ sectionIndex, earnsArray })
  return earns.filter((item) => item.fullfilled).length / earns.length
}
  
export const getRemainingSatsOnSection = ({ sectionIndex, earnsArray, store }) =>
  getEarnFromSection({ sectionIndex, earnsArray })
    .filter((item) => !item.fullfilled)
    .reduce((acc, item) => store.earnReward(item.id) + acc, 0)

export const getSections = () => {
  const all_earns_obj = translate(`EarnScreen.earns`)
  const sections = Object.keys(all_earns_obj)
  return sections
}

// TODO optimize
export const getCompletedSection = ({ earnsArray, store }) => {
  let count = 0
  const sections = getSections()
  for (const sectionIndex of sections) {
    if (getRemainingSatsOnSection({ earnsArray, sectionIndex, store }) === 0) {
      count++
    }
  }
  return count
}

const _earnsMeta = {
  walletDownloaded: {
    onComplete: null,
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
  activateNotifications: {
    onAction: async ({ setLoading }) => {
      const store = React.useContext(StoreContext)

      // FIXME
      Notifications.events().registerRemoteNotificationsRegistered(async (event: Registered) => {
        console.tron.log("Registered For Remote Push", `Device Token: ${event.deviceToken}`)

        try {
          setLoading(true)
          store.user.updateDeviceToken(event.deviceToken)

          // close("Notification succesfully activated")
        } catch (err) {
          console.tron.log(err.toString())
          // setErr(err.toString())
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

  dollarCostAveragingImage: {
    onComplete: async ({ dataStore }) =>
      dataStore.onboarding.add(Onboarding.dollarCostAveragingImage),
  },
}

const handler = {
  get: function(obj, prop) {
    return prop in obj ?
      obj[prop] : {
        onComplete: async ({ dataStore }) => dataStore.onboarding.add(Onboarding[prop])
      }
  }
};

export const earnsMeta = new Proxy(_earnsMeta, handler);


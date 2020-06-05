import { filter, find, sumBy } from "lodash"
import { Alert } from "react-native"
import { Notifications, RegistrationError } from "react-native-notifications"
import { translate } from "../../i18n"
import { StoreContext } from "../../models"

export const getCardsFromSection = ({ earnsArray, sectionIndex }) => {
  const earns_all = translate(`EarnScreen.earns`)
  const cards = earns_all[sectionIndex].content

  cards.forEach(card => card.value = find(earnsArray, { id: card.id }).value)

  // FIXME O(N^2)
  // add fullfilled property to each card 
  cards.filter(item => item.fullfilled = earnsArray.find(e => e.id == item.id).completed)
  
  let allPreviousFullfilled = true
  let nonEnabledMessage = ""
  
  // add enabled and nonEnabledMessage property
  cards.forEach(item => {    
    item.enabled = true
    
    if (allPreviousFullfilled === false) {
      item.enabled = false
      item.nonEnabledMessage = nonEnabledMessage
    }
    
    if (!item.fullfilled && allPreviousFullfilled) {
      allPreviousFullfilled = false
      nonEnabledMessage = item.title
    }
  })

  return cards
}

export const sectionCompletedPct = ({ sectionIndex, earnsArray }) => {
  const earns = getCardsFromSection({ sectionIndex, earnsArray })
  return earns.filter((item) => item.fullfilled).length / earns.length
}
  
export const remainingSatsOnSection = ({ sectionIndex, earnsArray }) =>
  sumBy(filter(getCardsFromSection({ sectionIndex, earnsArray }), {fullfilled: false}), "value")


// TODO optimize
export const getCompletedSection = ({ earnsArray }) => {
  let count = 0
  const all_earns = translate(`EarnScreen.earns`)
  const sectionIndexes = Object.keys(all_earns)
  for (const sectionIndex of sectionIndexes) {
    if (remainingSatsOnSection({ earnsArray, sectionIndex }) === 0) {
      count++
    }
  }
  return count
}

// TODO: get back a way to ask for peermission for Notification tokens
const _earnsMeta = {
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
}

import { filter, find, sumBy } from "lodash"
import { Alert } from "react-native"
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
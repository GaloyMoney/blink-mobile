import { filter, find, sumBy } from "lodash"
import { translate } from "../../i18n"

export const getCardsFromSection = ({ earnList, sectionIndex }) => {
  const earns_all = translate("EarnScreen.earns")
  const cards = earns_all[sectionIndex].content

  cards.forEach((card) => (card.value = find(earnList, { id: card.id }).value))

  // FIXME O(N^2)
  // add fullfilled property to each card
  cards.filter(
    (item) => (item.fullfilled = earnList.find((e) => e.id == item.id).completed),
  )

  let allPreviousFullfilled = true
  let nonEnabledMessage = ""

  // add enabled and nonEnabledMessage property
  cards.forEach((item) => {
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

export const sectionCompletedPct = ({ sectionIndex, earnList }) => {
  // there is a recurring crash. from crashlytics:
  // using try catch until this is fixed
  //
  // Fatal Exception: com.facebook.react.common.JavascriptException: TypeError: undefined is not an object (evaluating '(0,n.find)(o,{id:t.id}).value')
  // <unknown>@2707:336
  // forEach@-1
  // l@2707:285
  // sectionCompletedPct@2707:675
  try {
    const earns = getCardsFromSection({ sectionIndex, earnList })
    return earns.filter((item) => item.fullfilled).length / earns.length
  } catch (err) {
    return 0
  }
}

export const remainingSatsOnSection = ({ sectionIndex, earnList }) =>
  sumBy(
    filter(getCardsFromSection({ sectionIndex, earnList }), { fullfilled: false }),
    "value",
  )

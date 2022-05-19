import filter from "lodash.filter"
import sumBy from "lodash.sumby"
import { translateUnknown as translate } from "@galoymoney/client"
import type { QuizQuestion, QuizSectionContent } from "../../types/quiz"

export const getCardsFromSection = ({ quizQuestions, sectionIndex }): QuizQuestion[] => {
  const quizQuestionsContent = translate(
    "EarnScreen.earns",
  ) as unknown as QuizSectionContent[]

  const { allQuestions, myCompletedQuestions } = quizQuestions

  const cards = quizQuestionsContent[sectionIndex].content.map((card) => {
    card.value = allQuestions[card.id]
    return card
  })

  // add fullfilled property to each card
  // eslint-disable-next-line array-callback-return
  cards.filter((card) => {
    card.fullfilled = myCompletedQuestions && Boolean(myCompletedQuestions[card.id])
  })

  let allPreviousFullfilled = true
  let nonEnabledMessage = ""

  // add enabled and nonEnabledMessage property
  cards.forEach((card) => {
    card.enabled = true

    if (allPreviousFullfilled === false) {
      card.enabled = false
      card.nonEnabledMessage = nonEnabledMessage
    }

    if (!card.fullfilled && allPreviousFullfilled) {
      allPreviousFullfilled = false
      nonEnabledMessage = card.title
    }
  })

  return cards
}

export const sectionCompletedPct = ({ quizQuestions, sectionIndex }): number => {
  // there is a recurring crash. from crashlytics:
  // using try catch until this is fixed
  //
  // Fatal Exception: com.facebook.react.common.JavascriptException: TypeError: undefined is not an object (evaluating '(0,n.find)(o,{id:t.id}).value')
  // <unknown>@2707:336
  // forEach@-1
  // l@2707:285
  // sectionCompletedPct@2707:675
  try {
    const earns = getCardsFromSection({ quizQuestions, sectionIndex })
    return earns.filter((item) => item.fullfilled).length / earns.length
  } catch (err) {
    return 0
  }
}

export const remainingSatsOnSection = ({ quizQuestions, sectionIndex }): number =>
  sumBy(
    filter(getCardsFromSection({ quizQuestions, sectionIndex }), { fullfilled: false }),
    "value",
  )

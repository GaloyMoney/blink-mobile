import { TranslationFunctions } from "@app/i18n/i18n-types"
import filter from "lodash.filter"
import sumBy from "lodash.sumby"
import { LocalizedString } from "typesafe-i18n"
import type { QuizQuestion, QuizSectionContent } from "../../types/quiz"
import { earnSections } from "./sections"
import crashlytics from "@react-native-firebase/crashlytics"

export const getCardsFromSection = ({
  quizQuestions,
  sectionIndex,
  quizQuestionsContent,
}): QuizQuestion[] => {
  const { allQuestions, myCompletedQuestions } = quizQuestions

  const cards = quizQuestionsContent
    .find((content) => sectionIndex === content.meta.id)
    .content.map((card) => {
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

export const sectionCompletedPct = ({
  quizQuestions,
  sectionIndex,
  quizQuestionsContent,
}): number => {
  // there is a recurring crash. from crashlytics:
  // using try catch until this is fixed
  //
  // Fatal Exception: com.facebook.react.common.JavascriptException: TypeError: undefined is not an object (evaluating '(0,n.find)(o,{id:t.id}).value')
  // <unknown>@2707:336
  // forEach@-1
  // l@2707:285
  // sectionCompletedPct@2707:675
  try {
    const earns = getCardsFromSection({
      quizQuestions,
      sectionIndex,
      quizQuestionsContent,
    })
    return earns.filter((item) => item.fullfilled).length / earns.length
  } catch (err) {
    crashlytics().recordError(err)
    return 0
  }
}

export const remainingSatsOnSection = ({
  quizQuestions,
  sectionIndex,
  quizQuestionsContent,
}): number =>
  sumBy(
    filter(getCardsFromSection({ quizQuestions, sectionIndex, quizQuestionsContent }), {
      fullfilled: false,
    }),
    "value",
  )

export const getQuizQuestionsContent = ({
  LL,
}: {
  LL: TranslationFunctions
}): QuizSectionContent[] => {
  const quizSectionContent = Object.keys(earnSections).map((sectionId) => {
    return {
      meta: {
        id: sectionId,
        title: LL.EarnScreen.earnSections[sectionId].title(),
      },
      content: earnSections[sectionId].questions.map((question) => {
        return {
          id: question,
          type: LL.EarnScreen.earnSections[sectionId].questions[question].type(),
          title: LL.EarnScreen.earnSections[sectionId].questions[question].title(),
          text: LL.EarnScreen.earnSections[sectionId].questions[question].text(),
          question: LL.EarnScreen.earnSections[sectionId].questions[question].question(),
          answers: Object.values(
            LL.EarnScreen.earnSections[sectionId].questions[question].answers,
          ).map((answer: () => LocalizedString) => answer()),
          feedback: Object.values(
            LL.EarnScreen.earnSections[sectionId].questions[question].feedback,
          ).map((feedback: () => LocalizedString) => feedback()),
        }
      }),
    }
  })
  return quizSectionContent
}

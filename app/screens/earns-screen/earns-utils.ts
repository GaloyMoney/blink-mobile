import { TranslationFunctions } from "@app/i18n/i18n-types"
import filter from "lodash.filter"
import sumBy from "lodash.sumby"
import { LocalizedString } from "typesafe-i18n"
import { EarnSectionType, earnSections } from "./sections"
import { QuizQuestion, QuizSectionContent } from "./earns-section"

export const getCardsFromSection = ({
  quizQuestions,
  section,
  quizQuestionsContent,
}: {
  section: EarnSectionType
  quizQuestions: {
    allQuestions: Record<string, number>
    myCompletedQuestions: Record<string, number>
  }
  quizQuestionsContent: QuizSectionContent[]
}): QuizQuestion[] => {
  const { allQuestions, myCompletedQuestions } = quizQuestions

  const cards = quizQuestionsContent
    .find((content) => section === content.meta.id)
    ?.content.map((card) => {
      card.value = allQuestions[card.id]
      return card
    })

  // add fullfilled property to each card
  // eslint-disable-next-line array-callback-return
  cards?.filter((card) => {
    card.fullfilled = myCompletedQuestions && Boolean(myCompletedQuestions[card.id])
  })

  let allPreviousFullfilled = true
  let nonEnabledMessage = ""

  // add enabled and nonEnabledMessage property
  cards?.forEach((card) => {
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

  return cards || []
}

export const sectionCompletedPct = ({
  quizQuestions,
  section,
  quizQuestionsContent,
}: {
  section: EarnSectionType
  quizQuestions: {
    allQuestions: Record<string, number>
    myCompletedQuestions: Record<string, number>
  }
  quizQuestionsContent: QuizSectionContent[]
}): number => {
  const earns = getCardsFromSection({
    quizQuestions,
    section,
    quizQuestionsContent,
  })
  return earns.filter((item) => item.fullfilled).length / earns.length
}

export const remainingSatsOnSection = ({
  quizQuestions,
  section,
  quizQuestionsContent,
}: {
  section: EarnSectionType
  quizQuestions: {
    allQuestions: Record<string, number>
    myCompletedQuestions: Record<string, number>
  }
  quizQuestionsContent: QuizSectionContent[]
}): number =>
  sumBy(
    filter(getCardsFromSection({ quizQuestions, section, quizQuestionsContent }), {
      fullfilled: false,
    }),
    "value",
  )

export const getQuizQuestionsContent = ({
  LL,
}: {
  LL: TranslationFunctions
}): QuizSectionContent[] => {
  const LLEarn = LL.EarnScreen.earnSections

  const quizSectionContent = (Object.keys(earnSections) as EarnSectionType[]).map(
    (sectionId) => {
      return {
        meta: {
          id: sectionId,
          title: LLEarn[sectionId].title(),
        },
        content: earnSections[sectionId].questions.map((question) => ({
          id: question,
          type: LLEarn[sectionId].questions[question].type(),
          title: LLEarn[sectionId].questions[question].title(),
          text: LLEarn[sectionId].questions[question].text(),
          question: LLEarn[sectionId].questions[question].question(),
          answers: Object.values(LLEarn[sectionId].questions[question].answers).map(
            (answer: () => LocalizedString) => answer(),
          ),
          feedback: Object.values(LLEarn[sectionId].questions[question].feedback).map(
            (feedback: () => LocalizedString) => feedback(),
          ),
          value: NaN, // doesn't matter?
          fullfilled: null,
          enabled: null,
          nonEnabledMessage: null,
        })),
      }
    },
  )
  return quizSectionContent
}

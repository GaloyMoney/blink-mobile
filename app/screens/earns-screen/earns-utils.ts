import { TranslationFunctions } from "@app/i18n/i18n-types"
import { LocalizedString } from "typesafe-i18n"
import { EarnSectionType, earnSections } from "./sections"
import { QuizQuestion, QuizSectionContent } from "./earns-section"
import { QuizQuestionGQL } from "../earns-map-screen"

export const getCardsFromSection = ({
  quizQuestions,
  section,
  quizQuestionsContent,
}: {
  section: EarnSectionType
  quizQuestions: QuizQuestionGQL
  quizQuestionsContent: QuizSectionContent[]
}): QuizQuestion[] => {
  const cards = quizQuestionsContent
    .find((content) => section === content.meta.id)
    ?.content.map(
      (card): QuizQuestion => ({
        ...card,
        value:
          quizQuestions.find((quiz) => quiz.question.id === card.id)?.question
            .earnAmount || 0,
        fullfilled:
          quizQuestions.find((quiz) => quiz.question.id === card.id)?.completed || false,
      }),
    )

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
  quizQuestions: QuizQuestionGQL
  section: EarnSectionType
  quizQuestionsContent: QuizSectionContent[]
}): number => {
  const earns = getCardsFromSection({
    quizQuestions,
    section,
    quizQuestionsContent,
  })
  return earns.filter((item) => item.fullfilled).length / earns.length
}

export const getQuizQuestionsContent = ({
  LL,
}: {
  LL: TranslationFunctions
}): QuizSectionContent[] => {
  const LLEarn = LL.EarnScreen.earnSections

  const quizSectionContent = (Object.keys(earnSections) as EarnSectionType[]).map(
    (sectionId) => ({
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
      })),
    }),
  )
  return quizSectionContent
}

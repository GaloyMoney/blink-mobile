import { TranslationFunctions } from "@app/i18n/i18n-types"
import { LocalizedString } from "typesafe-i18n"
import { EarnSectionType, earnSections } from "./sections"
import { QuizQuestion, QuizSectionContent } from "./earns-section"
import { QuizQuestions } from "../earns-map-screen"

export const getCardsFromSection = ({
  quizQuestions,
  section,
  quizQuestionsContent,
}: {
  section: EarnSectionType
  quizQuestions: QuizQuestions
  quizQuestionsContent: QuizSectionContent[]
}): QuizQuestion[] => {
  const cards = quizQuestionsContent
    .find((content) => section === content.meta.id)
    ?.content.map(
      (card): QuizQuestion => ({
        ...card,
        value: quizQuestions.find((quiz) => quiz.id === card.id)?.amount || 0,
        completed: quizQuestions.find((quiz) => quiz.id === card.id)?.completed || false,
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

    if (!card.completed && allPreviousFullfilled) {
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
  quizQuestions: QuizQuestions
  section: EarnSectionType
  quizQuestionsContent: QuizSectionContent[]
}): number => {
  const earns = getCardsFromSection({
    quizQuestions,
    section,
    quizQuestionsContent,
  })
  return earns.filter((item) => item.completed).length / earns.length
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
      content: earnSections[sectionId].questions.map((question) => {
        // we would need more precise type to infer correctly the type here
        // because we are filtering with EarnSectionType, we are only looking through one section
        // at a time. but the questions are from all the types, so typescript
        // cant infer the type correctly
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const questions = (LLEarn[sectionId].questions as any)[question] as {
          answers: {
            "0": () => LocalizedString
            "1": () => LocalizedString
            "2": () => LocalizedString
          }
          feedback: {
            "0": () => LocalizedString
            "1": () => LocalizedString
            "2": () => LocalizedString
          }
          question: () => LocalizedString
          text: () => LocalizedString
          title: () => LocalizedString
          type: () => LocalizedString
        }

        return {
          id: question,
          title: questions.title(),
          text: questions.text(),
          question: questions.question(),
          answers: Object.values(questions.answers).map(
            // need to execute the function to get the value
            (answer) => (answer as () => LocalizedString)(),
          ),
          feedback: Object.values(questions.feedback).map(
            // need to execute the function to get the value
            (feedback) => (feedback as () => LocalizedString)(),
          ),
        }
      }),
    }),
  )
  return quizSectionContent
}

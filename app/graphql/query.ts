import { MockableApolloClient } from "../types/mockable"
import { MainQueryDocument } from "./generated"

export const getQuizQuestions = (client: MockableApolloClient, { hasToken }) => {
  const data = client.readQuery({
    query: MainQueryDocument,
    variables: { hasToken },
  })

  const allQuestions: Record<string, number> | null = data?.quizQuestions
    ? data.quizQuestions.reduce((acc, curr) => {
        acc[curr.id] = curr.earnAmount
        return acc
      }, {})
    : null

  const myCompletedQuestions: Record<string, number> | null = data?.me?.quizQuestions
    ? data?.me?.quizQuestions.reduce((acc, curr) => {
        if (curr.completed) {
          acc[curr.question.id] = curr.question.earnAmount
        }
        return acc
      }, {})
    : null

  return {
    allQuestions,
    myCompletedQuestions,
  }
}

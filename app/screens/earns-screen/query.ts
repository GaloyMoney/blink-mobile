import { ApolloClient, gql } from "@apollo/client"
import { QuizQuestionsDocument, QuizQuestionsQuery } from "../../graphql/generated"

gql`
  query quizQuestions($hasToken: Boolean!) {
    quizQuestions {
      id
      earnAmount
    }
    me @include(if: $hasToken) {
      quizQuestions {
        completed
        question {
          id
          earnAmount
        }
      }
    }
  }
`

export const getQuizQuestions = (client: ApolloClient<unknown>, hasToken: boolean) => {
  const data = client.readQuery<QuizQuestionsQuery>({
    query: QuizQuestionsDocument,
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
  } as {
    // FIXME: could be null but will be deleted shortly
    allQuestions: Record<string, number>
    myCompletedQuestions: Record<string, number>
  }
}

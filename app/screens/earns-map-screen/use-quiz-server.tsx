import { useMyQuizQuestionsQuery } from "@app/graphql/generated"
import { useIsAuthed } from "@app/graphql/is-authed-context"
import { gql, WatchQueryFetchPolicy } from "@apollo/client"

gql`
  query myQuizQuestions {
    me {
      id
      defaultAccount {
        id
        ... on ConsumerAccount {
          quiz {
            id
            amount
            completed
          }
        }
      }
    }
  }
`

export const useQuizServer = (
  { fetchPolicy }: { fetchPolicy: WatchQueryFetchPolicy } = {
    fetchPolicy: "cache-first",
  },
) => {
  const isAuthed = useIsAuthed()

  const { data, loading } = useMyQuizQuestionsQuery({
    fetchPolicy,
    skip: !isAuthed,
  })

  let quizServerData: {
    readonly __typename: "Quiz"
    readonly id: string
    readonly amount: number
    readonly completed: boolean
  }[]

  if (isAuthed) {
    quizServerData = data?.me?.defaultAccount.quiz.slice() ?? []
  } else {
    quizServerData = [
      {
        __typename: "Quiz",
        id: "whatIsBitcoin",
        amount: 1,
        completed: false,
      },
      {
        __typename: "Quiz",
        id: "sat",
        amount: 1,
        completed: false,
      },
      {
        __typename: "Quiz",
        id: "whereBitcoinExist",
        amount: 1,
        completed: false,
      },
      {
        __typename: "Quiz",
        id: "whoControlsBitcoin",
        amount: 1,
        completed: false,
      },
      {
        __typename: "Quiz",
        id: "copyBitcoin",
        amount: 1,
        completed: false,
      },
    ]
  }

  return { loading, quizServerData }
}

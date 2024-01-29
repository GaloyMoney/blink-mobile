import { gql, WatchQueryFetchPolicy } from "@apollo/client"
import { Quiz, useMyQuizQuestionsQuery } from "@app/graphql/generated"
import { useIsAuthed } from "@app/graphql/is-authed-context"

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
            notBefore
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

  let quizServerData: Quiz[]

  if (isAuthed) {
    quizServerData = data?.me?.defaultAccount.quiz.slice() ?? []
  } else {
    quizServerData = [
      {
        __typename: "Quiz",
        id: "whatIsBitcoin",
        amount: 1,
        completed: false,
        notBefore: undefined,
      },
      {
        __typename: "Quiz",
        id: "sat",
        amount: 1,
        completed: false,
        notBefore: undefined,
      },
      {
        __typename: "Quiz",
        id: "whereBitcoinExist",
        amount: 1,
        completed: false,
        notBefore: undefined,
      },
      {
        __typename: "Quiz",
        id: "whoControlsBitcoin",
        amount: 1,
        completed: false,
        notBefore: undefined,
      },
      {
        __typename: "Quiz",
        id: "copyBitcoin",
        amount: 1,
        completed: false,
        notBefore: undefined,
      },
    ]
  }

  const earnedSats = quizServerData
    .filter((quiz) => quiz.completed)
    .reduce((acc, { amount }) => acc + amount, 0)

  return { loading, quizServerData, earnedSats }
}

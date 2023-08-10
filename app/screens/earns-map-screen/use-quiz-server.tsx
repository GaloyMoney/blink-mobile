import { useMyQuizQuestionsQuery, useQuizSatsQuery } from "@app/graphql/generated"
import { useIsAuthed } from "@app/graphql/is-authed-context"
import { gql, WatchQueryFetchPolicy } from "@apollo/client"

gql`
  query quizSats {
    quizQuestions {
      id
      earnAmount
    }
  }

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

  const { data: dataAuth, loading: loadingAuth } = useMyQuizQuestionsQuery({
    fetchPolicy,
    skip: !isAuthed,
  })

  const { data: dataUnauth, loading: loadingUnauth } = useQuizSatsQuery({
    fetchPolicy,
    skip: isAuthed,
  })

  const loading = loadingAuth || loadingUnauth

  let quizServerData: {
    readonly __typename: "Quiz"
    readonly id: string
    readonly amount: number
    readonly completed: boolean
  }[]

  if (isAuthed) {
    quizServerData = dataAuth?.me?.defaultAccount.quiz.slice() ?? []
  } else {
    quizServerData =
      dataUnauth?.quizQuestions?.map((quiz) => ({
        __typename: "Quiz",
        id: quiz?.id ?? "id", // type issue, should be non-nullable
        amount: quiz?.earnAmount ?? 0,
        completed: false,
      })) ?? []
  }

  return { loading, quizServerData }
}

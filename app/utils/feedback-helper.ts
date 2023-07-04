import { ApolloClient, gql } from "@apollo/client"
import crashlytics from "@react-native-firebase/crashlytics"
import { FeedbackSubmitDocument } from "@app/graphql/generated"

gql`
  mutation feedbackSubmit($input: FeedbackSubmitInput!) {
    feedbackSubmit(input: $input) {
      errors {
        message
      }
      success
    }
  }
`

export const sendFeedback = async (
  client: ApolloClient<unknown>,
  feedback: string,
): Promise<void> => {
  try {
    await client.mutate({
      mutation: FeedbackSubmitDocument,
      variables: { input: { feedback } },
    })
  } catch (err: unknown) {
    if (err instanceof Error) {
      crashlytics().recordError(err)
    }
    console.error(err, "unable to submit feedback")
  }
}

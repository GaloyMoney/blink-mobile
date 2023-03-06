import { useApolloClient } from "@apollo/client"
import { useEffect } from "react"
import messaging from "@react-native-firebase/messaging"
import { MainAuthedDocument } from "./generated"

// refetch when we receive an OS notification
export const MessagingContainer = () => {
  const client = useApolloClient()

  useEffect(() => {
    const unsubscribe = messaging().onMessage(async (_remoteMessage) => {
      client.refetchQueries({ include: [MainAuthedDocument] })
    })

    return unsubscribe
  }, [client])

  return null
}

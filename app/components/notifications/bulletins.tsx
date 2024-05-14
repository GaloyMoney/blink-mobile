import { Linking } from "react-native"
import { gql } from "@apollo/client"

import { useNotifications } from "."
import { NotificationCardUI } from "./notification-card-ui"
import {
  StatefulNotificationsDocument,
  UnacknowledgedNotificationCountDocument,
  useBulletinsQuery,
  useStatefulNotificationAcknowledgeMutation,
} from "@app/graphql/generated"

gql`
  query Bulletins($first: Int!, $after: String) {
    me {
      unacknowledgedStatefulNotificationsWithBulletinEnabled(
        first: $first
        after: $after
      ) {
        pageInfo {
          endCursor
          hasNextPage
          hasPreviousPage
          startCursor
        }
        edges {
          node {
            id
            title
            body
            deepLink
            createdAt
            acknowledgedAt
            bulletinEnabled
          }
          cursor
        }
      }
    }
  }
`

export const BulletinsCard = () => {
  const { cardInfo } = useNotifications()

  const [ack, _] = useStatefulNotificationAcknowledgeMutation({
    refetchQueries: [
      UnacknowledgedNotificationCountDocument,
      StatefulNotificationsDocument,
    ],
  })

  const { data: bulletins, loading } = useBulletinsQuery({ variables: { first: 2 } })
  if (loading) return null

  if (
    bulletins &&
    bulletins.me?.unacknowledgedStatefulNotificationsWithBulletinEnabled?.edges &&
    bulletins.me?.unacknowledgedStatefulNotificationsWithBulletinEnabled?.edges.length > 0
  ) {
    return (
      <>
        {bulletins.me?.unacknowledgedStatefulNotificationsWithBulletinEnabled?.edges.map(
          ({ node: bulletin }) => (
            <NotificationCardUI
              key={bulletin.id}
              title={bulletin.title}
              text={bulletin.body}
              action={async () => {
                ack({ variables: { input: { notificationId: bulletin.id } } })
                if (bulletin.deepLink) Linking.openURL("blink:" + bulletin.deepLink)
              }}
              dismissAction={() =>
                ack({ variables: { input: { notificationId: bulletin.id } } })
              }
            />
          ),
        )}
      </>
    )
  }

  if (!cardInfo) {
    return null
  }

  return (
    <NotificationCardUI
      title={cardInfo.title}
      text={cardInfo.text}
      icon={cardInfo.icon}
      action={cardInfo.action}
      loading={cardInfo.loading}
      dismissAction={cardInfo.dismissAction}
    />
  )
}

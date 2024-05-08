import { gql } from "@apollo/client"

import { useNotifications } from "."
import { NotificationCardUI } from "./notification-card-ui"
import {
  StatefulNotificationsDocument,
  UnacknowledgedNotificationCountDocument,
  useBulletinsQuery,
  useStatefulNotificationAcknowledgeMutation,
} from "@app/graphql/generated"
import { useLinkTo } from "@react-navigation/native"

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
        nodes {
          id
          title
          body
          deepLink
          createdAt
          acknowledgedAt
          bulletinEnabled
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
  const linkTo = useLinkTo()

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
    bulletins.me?.unacknowledgedStatefulNotificationsWithBulletinEnabled?.nodes &&
    bulletins.me?.unacknowledgedStatefulNotificationsWithBulletinEnabled?.nodes.length > 0
  ) {
    return (
      <>
        {bulletins.me?.unacknowledgedStatefulNotificationsWithBulletinEnabled?.nodes.map(
          (bulletin) => (
            <NotificationCardUI
              key={bulletin.id}
              title={bulletin.title}
              text={bulletin.body}
              action={async () => {
                ack({ variables: { input: { notificationId: bulletin.id } } })
                if (bulletin.deepLink) linkTo(bulletin.deepLink)
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

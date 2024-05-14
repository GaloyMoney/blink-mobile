import { Linking } from "react-native"
import { gql } from "@apollo/client"

import { useNotifications } from "."
import { NotificationCardUI } from "./notification-card-ui"
import {
  BulletinsDocument,
  useBulletinsQuery,
  useStatefulNotificationAcknowledgeMutation,
} from "@app/graphql/generated"
import { BLINK_DEEP_LINK_PREFIX } from "@app/config"

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
            createdAt
            acknowledgedAt
            bulletinEnabled
            action {
              ... on OpenDeepLinkAction {
                deepLink
              }
              ... on OpenExternalLinkAction {
                url
              }
            }
          }
          cursor
        }
      }
    }
  }
`

export const BulletinsCard: React.FC = () => {
  const { cardInfo } = useNotifications()

  const [ack, { loading: ackLoading }] = useStatefulNotificationAcknowledgeMutation({
    refetchQueries: [BulletinsDocument],
  })

  const { data: bulletins, loading } = useBulletinsQuery({
    fetchPolicy: "cache-and-network",
    variables: { first: 1 },
    pollInterval: 30000,
  })

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
                if (bulletin.action?.__typename === "OpenDeepLinkAction")
                  Linking.openURL(BLINK_DEEP_LINK_PREFIX + bulletin.action.deepLink)
                else if (bulletin.action?.__typename === "OpenExternalLinkAction")
                  Linking.openURL(bulletin.action.url)
              }}
              dismissAction={() =>
                ack({ variables: { input: { notificationId: bulletin.id } } })
              }
              loading={ackLoading}
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

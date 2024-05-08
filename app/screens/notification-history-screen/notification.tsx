import {
  StatefulNotification,
  StatefulNotificationsDocument,
  useStatefulNotificationAcknowledgeMutation,
} from "@app/graphql/generated"
import { Text, makeStyles } from "@rneui/themed"
import { View, Linking } from "react-native"
import { timeAgo } from "./utils"
import { gql } from "@apollo/client"
import { TouchableWithoutFeedback } from "react-native-gesture-handler"
import { useState } from "react"

const BLINK_DEEP_LINK_PREFIX = "blink:/"

gql`
  mutation StatefulNotificationAcknowledge(
    $input: StatefulNotificationAcknowledgeInput!
  ) {
    statefulNotificationAcknowledge(input: $input) {
      notification {
        acknowledgedAt
      }
    }
  }
`

export const Notification: React.FC<StatefulNotification> = ({
  id,
  title,
  body,
  createdAt,
  acknowledgedAt,
  deepLink,
}) => {
  const [isAcknowledged, setIsAcknowledged] = useState(Boolean(acknowledgedAt))
  const styles = useStyles({ isAcknowledged })

  const [ack, _] = useStatefulNotificationAcknowledgeMutation({
    variables: { input: { notificationId: id } },
    refetchQueries: [StatefulNotificationsDocument],
  })
  const prefixedDeepLink = deepLink ? `${BLINK_DEEP_LINK_PREFIX}${deepLink}` : undefined
  return (
    <TouchableWithoutFeedback
      onPress={() => {
        setIsAcknowledged(true)
        !isAcknowledged && ack()
        prefixedDeepLink && Linking.openURL(prefixedDeepLink)
      }}
    >
      <View style={styles.container}>
        <Text type="p2" style={styles.text}>
          {title}
        </Text>
        <Text type="p3" style={styles.text}>
          {body}
        </Text>
        <Text type="p4" style={styles.text}>
          {timeAgo(createdAt)}
        </Text>
      </View>
    </TouchableWithoutFeedback>
  )
}

const useStyles = makeStyles(
  ({ colors }, { isAcknowledged }: { isAcknowledged: boolean }) => ({
    container: {
      padding: 10,
      borderBottomWidth: 1,
      borderBottomColor: colors.grey5,
    },
    text: {
      color: isAcknowledged ? colors.grey3 : colors.black,
    },
  }),
)

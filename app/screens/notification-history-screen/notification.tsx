import {
  StatefulNotification,
  StatefulNotificationsDocument,
  useStatefulNotificationAcknowledgeMutation,
} from "@app/graphql/generated"
import { Text, makeStyles } from "@rneui/themed"
import { View } from "react-native"
import { timeAgo } from "./utils"
import { gql } from "@apollo/client"
import { TouchableWithoutFeedback } from "react-native-gesture-handler"
import { useLinkTo } from "@react-navigation/native"
import { useState } from "react"

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

  const linkTo = useLinkTo()

  return (
    <TouchableWithoutFeedback
      onPress={() => {
        setIsAcknowledged(true)
        !isAcknowledged && ack()
        deepLink && linkTo(deepLink)
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

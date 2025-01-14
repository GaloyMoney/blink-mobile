import { useChatContext } from "@app/screens/nip17-chat/chatContext"
import { getUnreadChatsCount } from "@app/screens/nip17-chat/utils"
import { convertRumorsToGroups } from "@app/utils/nostr"
import React, { useEffect, useState } from "react"
import { View, Text, StyleSheet } from "react-native"

const NotificationBadge: React.FC = () => {
  const { rumors } = useChatContext()
  const [count, setCount] = useState(0)
  useEffect(() => {
    async function initialize() {
      let fetchedCount = await getUnreadChatsCount(convertRumorsToGroups(rumors))
      setCount(fetchedCount)
    }
    initialize()
  })

  if (count <= 0) return null

  return (
    <View style={styles.container}>
      <Text style={styles.text}>{count}</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    right: -10,
    top: -5,
    backgroundColor: "green",
    borderRadius: 10,
    width: 20,
    height: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  text: {
    color: "white",
    fontWeight: "bold",
    fontSize: 12,
  },
})

export default NotificationBadge

import { Rumor } from "@app/utils/nostr"
import AsyncStorage from "@react-native-async-storage/async-storage"

export const updateLastSeen = async (groupId: string, timestamp: number) => {
  try {
    await AsyncStorage.setItem(`lastSeen_${groupId}`, timestamp.toString())
  } catch (error) {
    console.error("Error saving last seen timestamp:", error)
  }
}

export const getLastSeen = async (groupId: string) => {
  try {
    const lastSeen = await AsyncStorage.getItem(`lastSeen_${groupId}`)
    return lastSeen ? parseInt(lastSeen) : 0
  } catch (error) {
    console.error("Error getting last seen timestamp:", error)
    return 0
  }
}

export const getAllLastSeen = async () => {
  try {
    const keys = await AsyncStorage.getAllKeys()
    const lastSeenKeys = keys.filter((key) => key.startsWith("lastSeen_"))
    const lastSeenPairs = await AsyncStorage.multiGet(lastSeenKeys)
    return Object.fromEntries(
      lastSeenPairs.map(([key, value]) => [
        key.replace("lastSeen_", ""),
        parseInt(value || "0"),
      ]),
    )
  } catch (error) {
    console.error("Error getting last seen timestamps:", error)
    return {}
  }
}

export const getUnreadChatsCount = async (groups: Map<string, Rumor[]>) => {
  const lastSeenMap = await getAllLastSeen()
  let unreadCount = 0

  groups.forEach((messages, groupId) => {
    const lastMessage = messages.sort((a, b) => b.created_at - a.created_at)[0]
    const lastSeen = lastSeenMap[groupId] || 0
    if (lastMessage && lastMessage.created_at > lastSeen) {
      unreadCount++
    }
  })

  return unreadCount
}

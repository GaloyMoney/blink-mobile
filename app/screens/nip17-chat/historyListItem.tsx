import { ListItem } from "@rneui/themed"
import { useStyles } from "./style"
import { Image, Text, View } from "react-native"
import { nip19, Event, SubCloser, getPublicKey } from "nostr-tools"
import { useFocusEffect, useNavigation } from "@react-navigation/native"
import { StackNavigationProp } from "@react-navigation/stack"
import { ChatStackParamList } from "@app/navigation/stack-param-lists"
import { useEffect, useState } from "react"
import { useChatContext } from "./chatContext"
import { Rumor, fetchNostrUsers } from "@app/utils/nostr"
import { getLastSeen } from "./utils"
import { bytesToHex } from "@noble/hashes/utils"

interface HistoryListItemProps {
  item: string
  userPrivateKey: Uint8Array
  groups: Map<string, Rumor[]>
}
export const HistoryListItem: React.FC<HistoryListItemProps> = ({
  item,
  userPrivateKey,
  groups,
}) => {
  const { poolRef, profileMap, addEventToProfiles } = useChatContext()
  const [hasUnread, setHasUnread] = useState(false)

  const userPublicKey = userPrivateKey ? getPublicKey(userPrivateKey) : ""

  function handleProfileEvent(event: Event) {
    addEventToProfiles(event)
  }

  useEffect(() => {
    let closer: SubCloser | null = null
    if (poolRef?.current && !closer) {
      let fetchPubkeys: string[] = []
      item.split(",").forEach((p) => {
        if (!profileMap?.get(p)) {
          fetchPubkeys.push(p)
        }
      })
      if (fetchPubkeys.length !== 0)
        closer = fetchNostrUsers(fetchPubkeys, poolRef?.current, handleProfileEvent)
    }

    return () => {
      if (closer) {
        closer.close()
      }
    }
  }, [poolRef, profileMap])

  useFocusEffect(() => {
    const checkUnreadStatus = async () => {
      const lastSeen = await getLastSeen(item)
      const lastRumor = (groups.get(item) || []).sort(
        (a, b) => b.created_at - a.created_at,
      )[0]
      if (lastRumor && (!lastSeen || lastSeen < lastRumor.created_at)) {
        setHasUnread(true)
      } else {
        setHasUnread(false)
      }
    }
    checkUnreadStatus()
  })

  const styles = useStyles()
  const navigation = useNavigation<StackNavigationProp<ChatStackParamList, "chatList">>()
  const lastRumor = (groups.get(item) || []).sort(
    (a, b) => b.created_at - a.created_at,
  )[0]
  return (
    <ListItem
      key={item}
      style={styles.item}
      containerStyle={styles.itemContainer}
      onPress={() =>
        navigation.navigate("messages", {
          groupId: item,
          userPrivateKey: bytesToHex(userPrivateKey),
        })
      }
    >
      {item
        .split(",")
        .filter((p) => p !== userPublicKey)
        .map((p: any) => {
          return (
            <Image
              source={{
                uri:
                  profileMap?.get(p)?.picture ||
                  "https://pfp.nostr.build/520649f789e06c2a3912765c0081584951e91e3b5f3366d2ae08501162a5083b.jpg",
              }}
              style={styles.profilePicture}
              key={p}
            />
          )
        })}
      <View style={{ flexDirection: "column", maxWidth: "80%" }}>
        <ListItem.Content key="heading">
          <ListItem.Subtitle style={styles.itemText} key="subheading">
            {" "}
            {item
              .split(",")
              .filter((p) => p !== userPublicKey)
              .map((pubkey) => {
                return (
                  (profileMap?.get(pubkey) as NostrProfile)?.nip05 ||
                  (profileMap?.get(pubkey) as NostrProfile)?.name ||
                  (profileMap?.get(pubkey) as NostrProfile)?.username ||
                  nip19.npubEncode(pubkey).slice(0, 9) + ".."
                )
              })
              .join(", ")}
          </ListItem.Subtitle>
        </ListItem.Content>
        <ListItem.Content key="last message">
          <View
            style={{
              flexWrap: "wrap",
              flexDirection: "row",
            }}
          >
            <Text style={{ ...styles.itemText }}>
              {(profileMap?.get(lastRumor.pubkey) as NostrProfile)?.name ||
                (profileMap?.get(lastRumor.pubkey) as NostrProfile)?.nip05 ||
                (profileMap?.get(lastRumor.pubkey) as NostrProfile)?.username ||
                nip19.npubEncode(lastRumor.pubkey).slice(0, 9) + "..."}
              {": "}
              {lastRumor.content.replace(/\s+/g, " ").slice(0, 55)}
              {lastRumor.content.length > 45 ? "..." : ""}
            </Text>
          </View>
        </ListItem.Content>
      </View>
      {hasUnread && <View style={styles.unreadIndicator} />}
    </ListItem>
  )
}

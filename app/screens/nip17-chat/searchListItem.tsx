import { ListItem, useTheme } from "@rneui/themed"
import { useStyles } from "./style"
import { Image } from "react-native"
import { useNavigation } from "@react-navigation/native"
import { StackNavigationProp } from "@react-navigation/stack"
import { ChatStackParamList } from "@app/navigation/stack-param-lists"
import { nip19 } from "nostr-tools"
import { bytesToHex } from "@noble/hashes/utils"

interface SearchListItemProps {
  item: Chat
  userPrivateKey: Uint8Array
}
export const SearchListItem: React.FC<SearchListItemProps> = ({
  item,
  userPrivateKey,
}) => {
  const styles = useStyles()
  const {
    theme: { colors },
  } = useTheme()
  const navigation = useNavigation<StackNavigationProp<ChatStackParamList, "chatList">>()
  return (
    <ListItem
      key={item.id}
      style={styles.item}
      containerStyle={styles.itemContainer}
      onPress={() => {
        navigation.navigate("messages", {
          groupId: item.groupId,
          userPrivateKey: bytesToHex(userPrivateKey),
        })
      }}
    >
      <Image
        source={{
          uri:
            item.picture ||
            "https://pfp.nostr.build/520649f789e06c2a3912765c0081584951e91e3b5f3366d2ae08501162a5083b.jpg",
        }}
        style={styles.profilePicture}
      />
      <ListItem.Content>
        <ListItem.Title style={styles.itemText}>
          {item.alias ||
            item.username ||
            item.name ||
            item.lud16 ||
            nip19.npubEncode(item.id)}
        </ListItem.Title>
      </ListItem.Content>
    </ListItem>
  )
}

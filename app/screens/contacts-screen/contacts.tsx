import * as React from "react"
import { Text, View } from "react-native"
import { ListItem } from "react-native-elements"
import EStyleSheet from "react-native-extended-stylesheet"
import { FlatList } from "react-native-gesture-handler"
import Icon from "react-native-vector-icons/Ionicons"
import { useQuery, gql } from "@apollo/client"
import { Screen } from "../../components/screen"
import { palette } from "../../theme/palette"

const styles = EStyleSheet.create({
  emptyList: { marginHorizontal: 12, marginTop: 32 },

  emptyListTitle: { fontSize: 18 },

  item: { marginHorizontal: 32, marginVertical: 8 },

  itemContainer: { borderRadius: 8 },

  list: { paddingTop: 18 },
})

type Props = {
  navigation: Record<string, any>
}

export const ContactsScreen = ({ navigation }: Props) => {
  const { data } = useQuery(gql`
    query contacts {
      me {
        contacts {
          id
          name
          prettyName @client
          transactionsCount
        }
      }
    }
  `)

  const contacts = data?.me?.contacts ?? []

  return (
    <Screen backgroundColor={palette.lighterGrey}>
      <FlatList
        style={styles.list}
        data={contacts}
        ListEmptyComponent={() => (
          <View style={styles.emptyList}>
            <Text style={styles.emptyListTitle}>
              {
                "No contact yet.\n\nSend or receive payment with a username. Usernames will automatically be added here."
              }
            </Text>
          </View>
        )}
        renderItem={({ item }) => (
          <ListItem
            underlayColor={palette.lighterGrey}
            activeOpacity={0.7}
            style={styles.item}
            containerStyle={styles.itemContainer}
            onPress={() => navigation.navigate("contactDetail", { contact: item })}
          >
            {/* <Avatar source={{uri: .avatar_url}} /> */}
            <Icon name="ios-person-outline" size={24} color={palette.green} />
            <ListItem.Content>
              <ListItem.Title>{item.prettyName}</ListItem.Title>
            </ListItem.Content>
          </ListItem>
        )}
        keyExtractor={(item) => item.id}
      />
    </Screen>
  )
}

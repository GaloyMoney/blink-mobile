import { gql, useMutation, useQuery } from "@apollo/client"
import * as React from "react"
import { ListItem } from "react-native-elements"
import EStyleSheet from "react-native-extended-stylesheet"
import Icon from "react-native-vector-icons/Ionicons"

import { Screen } from "../../components/screen"
import { GET_LANGUAGE } from "../../graphql/query"
import { language } from "@app/graphql/__generated__/language"
import { palette } from "../../theme/palette"
import type { ScreenType } from "../../types/jsx"
import { Token } from "../../utils/token"

const styles = EStyleSheet.create({
  screenStyle: {
    marginHorizontal: 48,
    // marginVertical: 24,
  },
})

export const language_mapping = {
  "": "Default (OS)",
  "en": "English",
  "es": "Español",
}

export const LanguageScreen: ScreenType = () => {
  const { data } = useQuery<language>(GET_LANGUAGE, { fetchPolicy: "cache-only" })
  const language = data?.me?.language ?? ""

  const [updateLanguage] = useMutation(gql`
    mutation updateLanguage($language: String!) {
      updateUser {
        updateLanguage(language: $language) {
          id
          language
        }
      }
    }
  `)

  const list = ["", "en", "es"]

  return (
    <Screen preset="scroll" style={styles.screenStyle}>
      {list.map((l, i) => (
        <ListItem
          key={i}
          bottomDivider
          onPress={() =>
            updateLanguage({
              variables: { language: l },
              optimisticResponse: {
                __typename: "Mutation",
                updateUser: {
                  __typename: "UpdateUser",
                  updateLanguage: {
                    __typename: "User",
                    id: Token.getInstance().uid,
                    language: l,
                  },
                },
              },
            })
          }
        >
          <ListItem.Title>{language_mapping[l]}</ListItem.Title>
          {language === l && (
            <Icon name="ios-checkmark-circle" size={18} color={palette.green} />
          )}
        </ListItem>
      ))}
    </Screen>
  )
}

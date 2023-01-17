import * as React from "react"
import { ListItem } from "@rneui/base"
import EStyleSheet from "react-native-extended-stylesheet"
import Icon from "react-native-vector-icons/Ionicons"
import { Screen } from "../../components/screen"
import { palette } from "../../theme/palette"
import type { ScreenType } from "../../types/jsx"
import { useI18nContext } from "@app/i18n/i18n-react"
import {
  useLanguageScreenQuery,
  useUserUpdateLanguageMutation,
} from "@app/graphql/generated"
import { testProps } from "../../../utils/testProps"
import { gql } from "@apollo/client"

const styles = EStyleSheet.create({
  screenStyle: {
    marginHorizontal: 48,
  },
})

gql`
  query languageScreen {
    me {
      language
      id
    }
  }

  mutation userUpdateLanguage($input: UserUpdateLanguageInput!) {
    userUpdateLanguage(input: $input) {
      errors {
        message
      }
      user {
        id
        language
      }
    }
  }
`

export const LanguageScreen: ScreenType = () => {
  const { data } = useLanguageScreenQuery({ fetchPolicy: "cache-only" })

  const languageServer = data?.me?.language
  const userId = data?.me?.id

  const [updateLanguage] = useUserUpdateLanguageMutation()
  const { LL } = useI18nContext()

  const list = ["DEFAULT", "en-US", "es-SV", "pt-BR", "fr-CA", "de-DE", "cs"]

  return (
    <Screen preset="scroll" style={styles.screenStyle}>
      {list.map((language) => (
        <ListItem
          key={language}
          bottomDivider
          onPress={() => {
            if (language !== languageServer && userId) {
              updateLanguage({
                variables: { input: { language } },
                optimisticResponse: {
                  __typename: "Mutation",
                  userUpdateLanguage: {
                    __typename: "UserUpdateLanguagePayload",
                    errors: [],
                    user: {
                      __typename: "User",
                      id: userId,
                      language,
                    },
                  },
                },
              })
            }
          }}
        >
          <ListItem.Title {...testProps(LL.Languages[language]())}>
            {LL.Languages[language]()}
          </ListItem.Title>
          {languageServer === language && (
            <Icon name="ios-checkmark-circle" size={18} color={palette.green} />
          )}
        </ListItem>
      ))}
    </Screen>
  )
}

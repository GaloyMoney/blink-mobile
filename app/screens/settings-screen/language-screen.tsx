import * as React from "react"
import { ListItem } from "@rneui/base"
import EStyleSheet from "react-native-extended-stylesheet"
import Icon from "react-native-vector-icons/Ionicons"
import { Screen } from "../../components/screen"
import { palette } from "../../theme/palette"
import { useI18nContext } from "@app/i18n/i18n-react"
import { useLanguageQuery, useUserUpdateLanguageMutation } from "@app/graphql/generated"
import { testProps } from "../../utils/testProps"
import { gql } from "@apollo/client"
import { useIsAuthed } from "@app/graphql/is-authed-context"
import { getLanguageFromString, Languages } from "@app/utils/locale-detector"

const styles = EStyleSheet.create({
  screenStyle: {},
})

gql`
  query language {
    me {
      id
      language
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

export const LanguageScreen: React.FC = () => {
  const isAuthed = useIsAuthed()

  const { data } = useLanguageQuery({ fetchPolicy: "cache-first", skip: !isAuthed })

  const languageFromServer = getLanguageFromString(data?.me?.language)
  const userId = data?.me?.id

  const [updateLanguage] = useUserUpdateLanguageMutation()
  const { LL } = useI18nContext()

  return (
    <Screen preset="scroll" style={styles.screenStyle}>
      {Languages.map((language) => (
        <ListItem
          key={language}
          bottomDivider
          onPress={() => {
            if (language !== languageFromServer && userId) {
              updateLanguage({
                variables: { input: { language } },
              })
            }
          }}
        >
          <ListItem.Title {...testProps(LL.Languages[language]())}>
            {LL.Languages[language]()}
          </ListItem.Title>
          {languageFromServer === language && (
            <Icon name="ios-checkmark-circle" size={18} color={palette.green} />
          )}
        </ListItem>
      ))}
    </Screen>
  )
}

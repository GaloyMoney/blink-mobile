import { gql } from "@apollo/client"
import { useLanguageQuery, useUserUpdateLanguageMutation } from "@app/graphql/generated"
import { useIsAuthed } from "@app/graphql/is-authed-context"
import { useI18nContext } from "@app/i18n/i18n-react"
import { LocaleToTranslateLanguageSelector } from "@app/i18n/mapping"
import { getLanguageFromString, Languages } from "@app/utils/locale-detector"
import * as React from "react"
import { Screen } from "../../components/screen"
import { MenuSelect, MenuSelectItem } from "@app/components/menu-select"

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

  const { data } = useLanguageQuery({
    fetchPolicy: "cache-first",
    skip: !isAuthed,
  })

  const languageFromServer = getLanguageFromString(data?.me?.language)

  const [updateLanguage, { loading }] = useUserUpdateLanguageMutation()
  const { LL } = useI18nContext()

  const [newLanguage, setNewLanguage] = React.useState("")

  const handleUpdateLanguage = async (language: string) => {
    if (loading) return
    await updateLanguage({ variables: { input: { language } } })
    setNewLanguage(language)
  }

  return (
    <Screen preset="scroll">
      <MenuSelect
        value={newLanguage || languageFromServer}
        onChange={handleUpdateLanguage}
      >
        {Languages.map((language) => {
          let languageTranslated: string
          if (language === "DEFAULT") {
            languageTranslated = LL.Languages[language]()
          } else {
            languageTranslated = LocaleToTranslateLanguageSelector[language]
          }

          return (
            <MenuSelectItem
              key={language}
              value={language}
              testPropId={languageTranslated}
            >
              {languageTranslated}
            </MenuSelectItem>
          )
        })}
      </MenuSelect>
    </Screen>
  )
}

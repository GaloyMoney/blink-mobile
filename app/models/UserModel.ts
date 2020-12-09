import { Instance } from "mobx-state-tree"
import { UserModelBase } from "./UserModel.base"
import i18n from "i18n-js"
import * as RNLocalize from "react-native-localize"

/* The TypeScript type of an instance of UserModel */
export interface UserModelType extends Instance<typeof UserModel.Type> {}

/* A graphql query fragment builders for UserModel */
export { selectFromUser, userModelPrimitives, UserModelSelector } from "./UserModel.base"

/**
 * UserModel
 */
export const UserModel = UserModelBase
  .actions(self => ({
    // This is an auto-generated example action.
    log() {
      console.log(JSON.stringify(self))
    },

    setLanguage({language}) {
      self.language = language

      // FIXME: duplicate from app.tsx
      const fallback = { languageTag: "es", isRTL: false }
      const { languageTag } = RNLocalize.findBestAvailableLanguage(Object.keys(i18n.translations)) || fallback
      i18n.locale = language ? language : languageTag
    }
  })
)

import { Instance } from "mobx-state-tree"
import { UserModelBase } from "./UserModel.base"

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
    updateLevel(level: number) {
      self.store.mutateUpdateUser(
      {user: {id: "1234", level}}, 
      user => user.level,
      () => {
        self.level = level
      }
    )},
    updateDeviceToken(deviceToken: string) {
      self.store.mutateUpdateUser({
        user: {id: "1234", deviceToken}
      },
    )},
  }
))

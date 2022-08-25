import { detectLocale, i18nObject } from "@app/i18n/i18n-util"

export class InvalidUsernameError extends Error {
  constructor(message) {
    super(message)
    this.name = this.constructor.name
  }
}

export const validateUsername = (username: string) => {
  const usernameRegex = /(?!^(1|3|bc1|lnbc1))^[0-9a-z_]{3,50}$/i
  const LL = i18nObject(detectLocale())
  if (!username.match(usernameRegex)) {
    switch (false) {
      case hasValidLength(username):
        return username.length > 3
          ? new InvalidUsernameError(LL.UsernameScreen["50CharactersMaximum"]())
          : new InvalidUsernameError(LL.UsernameScreen["3CharactersMinimum"]())
      case hasValidCharacters(username):
        if (isEmailAddress(username)) {
          return new InvalidUsernameError(
            LL.UsernameScreen.emailAddress() + ". " + LL.UsernameScreen.letterAndNumber(),
          )
        }
        return new InvalidUsernameError(LL.UsernameScreen.letterAndNumber())
      case hasNoRestictedStartCharacters(username):
        return new InvalidUsernameError(LL.UsernameScreen.forbiddenStart())
      default:
        return new InvalidUsernameError(LL.errors.unexpectedError())
    }
  }
  return username
}

export const hasValidLength = (username: string): boolean => {
  return username.length >= 3 && username.length <= 50
}

export const isEmailAddress = (username: string): boolean => {
  return new RegExp(
    /* eslint-disable no-useless-escape */
    /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
  ).test(username)
}

export const hasValidCharacters = (username: string): boolean => {
  return new RegExp(/^[0-9a-z_]+$/i).test(username)
}

export const hasNoRestictedStartCharacters = (username: string): boolean => {
  return new RegExp(/^(?!bc1|1|3|lnbc1).+$/i).test(username)
}

export const isValid = (username: string): boolean => {
  const checkedUsername = validateUsername(username)
  return !(checkedUsername instanceof InvalidUsernameError)
}

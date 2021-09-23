export class UsernameValidation {
  public static hasValidLength = (username: string): boolean => {
    return username.length >= 3
  }

  public static hasValidCharacters = (username: string): boolean => {
    return new RegExp(/^[0-9a-z_]+$/i).test(username)
  }

  public static hasNoRestictedStartCharacters = (username: string): boolean => {
    return new RegExp(/^(?!bc1|1|3).+$/i).test(username)
  }

  public static isValid = (username: string): boolean => {
    return (
      UsernameValidation.hasValidLength(username) &&
      UsernameValidation.hasValidCharacters(username) &&
      UsernameValidation.hasNoRestictedStartCharacters(username)
    )
  }
}

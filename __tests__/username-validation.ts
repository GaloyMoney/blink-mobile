import { UsernameValidation } from "../app/utils/validation"

it ("empty", () => {
    const username = ""

    const hasValidLength = UsernameValidation.hasValidLength(username)
    const hasValidCharacters = UsernameValidation.hasValidCharacters(username)
    const isValid = UsernameValidation.isValid(username)
    
    expect(hasValidLength).toBeFalsy()
    expect(hasValidCharacters).toBeFalsy()
    expect(isValid).toBeFalsy()
})

it ("short username", () => {
    const username = "ab"

    const hasValidLength = UsernameValidation.hasValidLength(username)
    const hasValidCharacters = UsernameValidation.hasValidCharacters(username)
    const isValid = UsernameValidation.isValid(username)
    
    expect(hasValidLength).toBeFalsy()
    expect(hasValidCharacters).toBeTruthy()
    expect(isValid).toBeFalsy()
})

it ("normal username", () => {
    const username = "Bitcoin"

    const hasValidLength = UsernameValidation.hasValidLength(username)
    const hasValidCharacters = UsernameValidation.hasValidCharacters(username)
    const isValid = UsernameValidation.isValid(username)
    
    expect(hasValidLength).toBeTruthy()
    expect(hasValidCharacters).toBeTruthy()
    expect(isValid).toBeTruthy()
})

it ("_ username", () => {
    const username = "Bit_Coin"

    const hasValidLength = UsernameValidation.hasValidLength(username)
    const hasValidCharacters = UsernameValidation.hasValidCharacters(username)
    const isValid = UsernameValidation.isValid(username)
    
    expect(hasValidLength).toBeTruthy()
    expect(hasValidCharacters).toBeTruthy()
    expect(isValid).toBeTruthy()
})

it (". username", () => {
    const username = "Bit.Coin"

    const hasValidLength = UsernameValidation.hasValidLength(username)
    const hasValidCharacters = UsernameValidation.hasValidCharacters(username)
    const isValid = UsernameValidation.isValid(username)
    
    expect(hasValidLength).toBeTruthy()
    expect(hasValidCharacters).toBeFalsy()
    expect(isValid).toBeFalsy()
})

it (": username", () => {
    const username = "Bitcoin:"

    const hasValidLength = UsernameValidation.hasValidLength(username)
    const hasValidCharacters = UsernameValidation.hasValidCharacters(username)
    const isValid = UsernameValidation.isValid(username)
    
    expect(hasValidLength).toBeTruthy()
    expect(hasValidCharacters).toBeFalsy()
    expect(isValid).toBeFalsy()
})
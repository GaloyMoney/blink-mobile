import { Linking } from "react-native"

export const openWhatsApp: (number: string, message: string) => Promise<void> = async (
  number: string,
  message: string,
) =>
  Linking.openURL(
    `whatsapp://send?phone=${encodeURIComponent(number)}&text=${encodeURIComponent(
      message,
    )}`,
  )

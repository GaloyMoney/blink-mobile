import { Linking } from "react-native"

export const openWhatsApp: (number: string, message: string) => void = (
  number: string,
  message: string,
) => Linking.openURL(`whatsapp://send?phone=${number}&text=${message}`)

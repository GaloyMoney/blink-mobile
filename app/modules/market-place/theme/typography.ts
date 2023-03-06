import { Platform } from "react-native"

export const fontSize = {
  font8: 8,
  font12: 12,
  font13: 13,
  font14: 14,
  font16: 16,
  font15: 15,
  font18: 18,
  font20: 20,
  font22: 22,
  font24: 24,
}/**
 * Just the font names.
 *
 * The various styles of fonts are defined in the <Text /> component.
 */
export const typography = {
  /**
   * The primary font.  Used in most places.
   */
  primary: Platform.select({ ios: "SourceSansPro", android: "SourceSansPro" }),

  /**
   * An alternate font used for perhaps titles and stuff.
   */
  secondary: Platform.select({ ios: "SourceSansPro", android: "SourceSansPro" }),
}

import { Platform } from "react-native"

/**
 * Just the font names.
 *
 * The various styles of fonts are defined in the <Text /> component.
 */
export const typography = {
  /**
   * The primary font.  Used in most places.
   */
  primary: Platform.select({ ios: "DMSans-Regular", android: "DMSans-Regular" }),

  /**
   * An alternate font used for perhaps titles and stuff.
   */
  secondary: Platform.select({ ios: "DMSans-Regular", android: "DMSans-Regular" }),

  italic: Platform.select({ ios: "DMSans-Italic", android: "DMSans-Italic" }),
  regular: Platform.select({ ios: "DMSans-Regular", android: "DMSans-Regular" }),
  medium: Platform.select({ ios: "DMSans-Medium", android: "DMSans-Medium" }),
  mediumItalic: Platform.select({
    ios: "DMSans-MediumItalic",
    android: "DMSans-MediumItalic",
  }),
  bold: Platform.select({ ios: "DMSans-Bold", android: "DMSans-Bold" }),
  boldItalic: Platform.select({ ios: "DMSans-BoldItalic", android: "DMSans-BoldItalic" }),
}

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
}

import { StyleSheet, Dimensions } from "react-native";
import { color, palette } from "@app/theme"
import { fontSize } from "../../theme/typography";

const { width, height } = Dimensions.get("window")

export const styles = StyleSheet.create({
  submitButton: {
    backgroundColor: color.primary,
    alignSelf: "flex-end",
    paddingHorizontal: 15,
    paddingVertical: 5,
    marginVertical: 15,
    borderRadius: 22,
  },
  contentContainer: {
    flex: 1,
    paddingHorizontal: 30,
    width: "100%",
    backgroundColor: palette.lighterGrey,
  },
  locationSvgContainer: {
    borderRadius: 100,
    padding: 6,
    backgroundColor: "white",
    marginLeft: 7,
  },
  imageBackground: {
    width,
    height: height * 0.3,
    borderRadius: 8,
    marginTop: 10,
    zIndex: 1,
  },
  value: {
    color: "#9499A5",
    fontSize: fontSize.font13,
    marginTop: 5,
  },
  headerRow: {
    backgroundColor: color.primary,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 15,
    alignItems: "center",
  },
  headerText: {
    color: "white",
    fontSize: fontSize.font14,
  },
  addressText: {
    color: "#211414",
    fontSize: fontSize.font12,
    marginLeft: 5,
  },
  locationText: {
    color: "white",
    fontSize: fontSize.font14,
  },
  locationButtonContainer: {
    backgroundColor: color.primary,
    paddingHorizontal: 15,
    paddingVertical: 5,
    borderRadius: 15,
    alignSelf: "flex-start",
    alignItems: "center",
  },
  titleRow: { alignItems: "center", justifyContent: "space-between", marginTop: 30 },
  editButtonContainer: {
    position: "absolute",
    width: 58,
    height: 58,
    bottom: -24,
    right: 20,
    backgroundColor: "white",
    borderRadius: 54,
    justifyContent: "center",
    alignItems: "center",
  },
  title: { fontWeight: "400", fontSize: fontSize.font20 },
  container: {
    flex: 1,
    backgroundColor: "white",
    alignItems: "center",
  },
})

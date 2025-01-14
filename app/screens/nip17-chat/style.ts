import { makeStyles } from "@rneui/themed"

export const useStyles = makeStyles(({ colors }) => ({
  header: {
    backgroundColor: colors.white,
  },

  activityIndicatorContainer: {
    alignItems: "center",
    flex: 1,
    justifyContent: "center",
  },

  emptyListNoContacts: {
    marginHorizontal: 12,
    marginTop: 32,
  },

  emptyListNoMatching: {
    marginHorizontal: 26,
    marginTop: 8,
  },

  emptyListText: {
    fontSize: 18,
    marginTop: 30,
    textAlign: "center",
    color: colors.black,
  },

  emptyListTitle: {
    color: colors.black,
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
  },

  item: {
    marginHorizontal: 20,
    marginVertical: 4,
  },

  unreadItem: {
    backgroundColor: "#f0f0f0", // or any color to indicate unread status
  },

  unreadIndicator: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "green", // or any color you prefer
    position: "absolute",
    top: 10,
    right: 10,
  },

  itemContainer: {
    borderRadius: 8,
    backgroundColor: colors.grey5,
  },

  listContainer: { flexGrow: 1 },

  searchBarContainer: {
    backgroundColor: colors.white,
    borderBottomColor: colors.white,
    borderTopColor: colors.white,
    marginHorizontal: 26,
    marginVertical: 8,
  },

  searchBarInputContainerStyle: {
    backgroundColor: colors.grey5,
  },

  searchBarRightIconStyle: {
    padding: 8,
  },

  searchBarText: {
    color: colors.primary3,
    textDecorationLine: "none",
  },

  itemText: { color: colors.primary3, flexWrap: "wrap" },

  icon: {
    color: colors.primary3,
  },
  profilePicture: {
    width: 50,
    height: 50,
    borderRadius: 50,
    backgroundColor: colors.black,
  },
}))

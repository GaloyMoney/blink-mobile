import React from "react"
import { View, Text } from "react-native"
import { useI18nContext } from "@app/i18n/i18n-react"
import { makeStyles } from "@rneui/themed"

// utils
import { formatDate } from "@app/utils/transaction-filters"

export const DateRangeDisplay: React.FC<{ from: string; to: string }> = ({
  from,
  to,
}) => {
  const styles = useStyles()
  const { LL } = useI18nContext()

  return (
    <View style={styles.dateContainer}>
      <View style={styles.dateColumn}>
        <Text style={styles.dateLabel}>{LL.reports.fromDate()}</Text>
        <Text style={styles.dateValue}>{formatDate(from)}</Text>
      </View>
      <View style={styles.dateColumn}>
        <Text style={styles.dateLabel}>{LL.reports.toDate()}</Text>
        <Text style={styles.dateValue}>{formatDate(to)}</Text>
      </View>
    </View>
  )
}

const useStyles = makeStyles(({ colors }) => ({
  dateContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 30,
  },
  dateColumn: {
    flex: 1,
    alignItems: "center",
    borderWidth: 2,
    borderColor: colors.grey4,
    padding: 10,
    borderRadius: 10,
    marginHorizontal: 10,
  },
  dateLabel: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 4,
    color: colors.black,
  },
  dateValue: {
    fontSize: 12,
    color: colors.black,
  },
}))

import React, { useState } from "react"
import { View } from "react-native"
import ReactNativeModal from "react-native-modal"
import DatePicker from "react-native-date-picker"
import { useI18nContext } from "@app/i18n/i18n-react"
import { ListItem, makeStyles, useTheme, Button } from "@rneui/themed"
import { useNavigation } from "@react-navigation/native"
import { StackNavigationProp } from "@react-navigation/stack"
import { RootStackParamList } from "@app/navigation/stack-param-lists"

// assets
import ReportsOutline from "@app/assets/icons/report.svg"
import ReportOutlineDark from "@app/assets/icons/report-dark.svg"

export const Reports = {
  Reconciliation: "reconciliation",
} as const

export type ReportsToHide = keyof typeof Reports

interface Props {
  isVisible: boolean
  toggleModal: () => void
  from: number
  to: number
  reportsToHide?: ReportsToHide[]
}

const ReportModal: React.FC<Props> = ({
  isVisible,
  toggleModal,
  from,
  to,
  reportsToHide = [],
}) => {
  const { LL } = useI18nContext()
  const styles = useStyles()
  const {
    theme: { colors },
  } = useTheme()

  const navigation = useNavigation<StackNavigationProp<RootStackParamList, "settings">>()

  const [selectedFrom, setSelectedFrom] = useState<Date>(new Date(from))
  const [selectedTo, setSelectedTo] = useState<Date>(new Date(to))
  const [showFromPicker, setShowFromPicker] = useState<boolean>(false)
  const [showToPicker, setShowToPicker] = useState<boolean>(false)
  const [isFromPicked, setIsFromPicked] = useState<boolean>(false)
  const [isToPicked, setIsToPicked] = useState<boolean>(false)

  const handleDatePicker = (picker: "from" | "to") => {
    if (picker === "from") {
      setShowFromPicker(true)
    } else {
      setShowToPicker(true)
    }
  }

  const handleConfirmDate = (picker: "from" | "to", date: Date) => {
    if (picker === "from") {
      setSelectedFrom(date)
      setIsFromPicked(true)
      setShowFromPicker(false)
    } else {
      setSelectedTo(date)
      setIsToPicked(true)
      setShowToPicker(false)
    }
  }

  const contactOptionList = [
    {
      name: LL.reports.reconciliation(),
      action: () => {
        toggleModal()
        navigation.navigate("Reconciliation", {
          from: selectedFrom.toISOString(),
          to: selectedTo.toISOString(),
        })
      },
      hidden: reportsToHide.includes("Reconciliation"),
    },
  ]

  return (
    <ReactNativeModal
      isVisible={isVisible}
      backdropOpacity={0.3}
      backdropColor={colors.grey3}
      onBackdropPress={toggleModal}
      style={styles.modal}
    >
      <View style={styles.modalContent}>
        <View style={styles.datePickersContainer}>
          <Button
            title={
              isFromPicked ? selectedFrom.toDateString() : LL.reports.selectFromDate()
            }
            onPress={() => handleDatePicker("from")}
          />
          <Button
            title={isToPicked ? selectedTo.toDateString() : LL.reports.selectToDate()}
            onPress={() => handleDatePicker("to")}
          />
        </View>

        <DatePicker
          modal
          open={showFromPicker}
          date={selectedFrom}
          onConfirm={(date) => handleConfirmDate("from", date)}
          onCancel={() => setShowFromPicker(false)}
        />

        <DatePicker
          modal
          open={showToPicker}
          date={selectedTo}
          onConfirm={(date) => handleConfirmDate("to", date)}
          onCancel={() => setShowToPicker(false)}
        />

        {contactOptionList
          .filter((item) => !item.hidden)
          .map((item) => (
            <ListItem
              key={item.name}
              bottomDivider
              onPress={item.action}
              containerStyle={styles.listItemContainer}
            >
              {colors.white === "#FFFFFF" ? (
                <ReportsOutline width={24} height={24} fill={colors.black} />
              ) : (
                <ReportOutlineDark width={24} height={24} fill={colors.black} />
              )}
              <ListItem.Content>
                <ListItem.Title style={styles.listItemTitle}>{item.name}</ListItem.Title>
              </ListItem.Content>
              <ListItem.Chevron name={"chevron-forward"} type="ionicon" />
            </ListItem>
          ))}
      </View>
    </ReactNativeModal>
  )
}

export default ReportModal

const useStyles = makeStyles(({ colors }) => ({
  modal: {
    justifyContent: "flex-end",
    flexGrow: 1,
    marginHorizontal: 0,
    marginVertical: 0,
  },
  modalContent: {
    backgroundColor: colors.white,
    paddingHorizontal: 10,
    paddingBottom: 20,
    paddingTop: 20,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  listItemContainer: {
    backgroundColor: colors.white,
  },
  datePickersContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  listItemTitle: {
    color: colors.black,
  },
}))

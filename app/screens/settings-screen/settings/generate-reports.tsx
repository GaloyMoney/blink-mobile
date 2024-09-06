import { useState } from "react"
import ReportModal from "@app/components/reports-modal/reports-modal"
import { useI18nContext } from "@app/i18n/i18n-react"
import { SettingsRow } from "../row"

export const GenerateReportsSetting: React.FC = () => {
  const { LL } = useI18nContext()
  const [isModalVisible, setIsModalVisible] = useState(false)
  const toggleModal = () => setIsModalVisible((x) => !x)
  const from = new Date(new Date().setHours(0, 0, 0, 0)).getTime()
  const to = new Date(new Date().setHours(23, 59, 59, 999)).getTime()

  return (
    <>
      <SettingsRow
        title={LL.reports.title()}
        leftIcon="download-outline"
        rightIcon={null}
        action={toggleModal}
      />
      <ReportModal
        isVisible={isModalVisible}
        toggleModal={toggleModal}
        from={from}
        to={to}
        reportsToHide={[]}
      />
    </>
  )
}

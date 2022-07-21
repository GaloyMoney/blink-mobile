import * as React from "react"
import { render } from "@testing-library/react-native"
import { TransactionDate } from "../../app/components/transaction-date"
import {
  AppConfiguration,
  AppConfigurationContext,
  defaultConfiguration,
} from "../../app/context/app-configuration"
import { GaloyGQL, translateUnknown } from "@galoymoney/client"
import { createMock } from "ts-auto-mock"
import moment from "moment"
import i18n from "i18n-js"

describe("Display the createdAt date for a transaction", () => {
  it("Displays pending for a pending onchain transaction", () => {
    const mockedTransaction = createMock<GaloyGQL.Transaction>({
      status: "PENDING",
      createdAt: new Date().getDate(),
    })

    const { queryAllByText } = render(
      <AppConfigurationContext.Provider
        value={{
          appConfig: defaultConfiguration,
          setAppConfig: (config: AppConfiguration) => {},
        }}
      >
        <TransactionDate tx={mockedTransaction} />
      </AppConfigurationContext.Provider>,
    )
    expect(queryAllByText(translateUnknown("common.pending"))).not.toBeNull()
  })

  it("Displays non-friendly date which adapts to timezone", () => {
    i18n.locale = "en-GB"
    const testTransactionCreatedAtDate = moment("2022-07-15T14:15:00+00:00")
    const mockedTransaction = createMock<GaloyGQL.Transaction>({
      createdAt: testTransactionCreatedAtDate.unix(),
    })

    const { queryByText } = render(
      <AppConfigurationContext.Provider
        value={{
          appConfig: defaultConfiguration,
          setAppConfig: (config: AppConfiguration) => {},
        }}
      >
        <TransactionDate tx={mockedTransaction} />
      </AppConfigurationContext.Provider>,
    )
    expect(queryByText("15 July 2022 15:15")).not.toBeNull()
  })

  it("Displays friendly date", () => {
    const testTransactionCreatedAtDate = moment().subtract(1, "days")
    const mockedTransaction = createMock<GaloyGQL.Transaction>({
      createdAt: testTransactionCreatedAtDate.unix(),
    })

    const { queryByText } = render(
      <AppConfigurationContext.Provider
        value={{
          appConfig: defaultConfiguration,
          setAppConfig: (config: AppConfiguration) => {},
        }}
      >
        <TransactionDate tx={mockedTransaction} diffDate={true} friendly={true} />
      </AppConfigurationContext.Provider>,
    )
    expect(
      queryByText(
        moment
          .duration(Math.min(0, moment.unix(mockedTransaction.createdAt).diff(moment())))
          .humanize(true),
      ),
    ).not.toBeNull()
  })
})

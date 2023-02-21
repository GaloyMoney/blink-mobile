import { WalletCurrency } from "@app/graphql/generated"
import {
  createInvoiceDetails,
  CreateInvoiceDetailsParams,
} from "@app/screens/receive-bitcoin-screen/invoices"
import { InvoiceType } from "@app/screens/receive-bitcoin-screen/invoices/index.types"
import { PaymentAmount } from "@app/types/amounts"
import {
  btcAmountInvoice,
  mockMutations,
  noAmountInvoice,
  usdAmountInvoice,
} from "./helpers"

describe("create invoice details", () => {
  const defaultParams = {
    memo: "Test",
    convertPaymentAmount: <T extends WalletCurrency>(
      amount: PaymentAmount<WalletCurrency>,
      toCurrency: T,
    ): PaymentAmount<T> => {
      return { amount: amount.amount, currency: toCurrency }
    },
    bitcoinNetwork: "mainnet",
  } as const

  const defaultExpectedInvoiceDetails = {
    convertPaymentAmount: defaultParams.convertPaymentAmount,
    memo: defaultParams.memo,
  }

  describe("with usd receiving wallet", () => {
    const usdWalletParams = {
      ...defaultParams,
      receivingWalletDescriptor: { id: "wallet-id", currency: WalletCurrency.Usd },
    }

    it("creates no amount lightning invoice", async () => {
      const usdNoAmountLightningParams: CreateInvoiceDetailsParams<
        typeof WalletCurrency.Usd
      > = {
        ...usdWalletParams,
        invoiceType: InvoiceType.Lightning,
      }

      const invoiceDetails = createInvoiceDetails(usdNoAmountLightningParams)

      expect(invoiceDetails).toEqual(
        expect.objectContaining({
          ...defaultExpectedInvoiceDetails,
          invoiceType: InvoiceType.Lightning,
        }),
      )

      const invoice = await invoiceDetails.generateInvoice(mockMutations)

      expect(invoice).toEqual(
        expect.objectContaining({
          invoice: expect.objectContaining({
            invoiceDisplay: noAmountInvoice,
          }),
        }),
      )
    })

    it("create amount lightning invoice", async () => {
      const usdAmountLightningParams: CreateInvoiceDetailsParams<
        typeof WalletCurrency.Usd
      > = {
        ...usdWalletParams,
        invoiceType: InvoiceType.Lightning,
        unitOfAccountAmount: { amount: 1, currency: WalletCurrency.Usd },
      }

      const invoiceDetails = createInvoiceDetails(usdAmountLightningParams)

      expect(invoiceDetails).toEqual(
        expect.objectContaining({
          ...defaultExpectedInvoiceDetails,
          invoiceType: InvoiceType.Lightning,
          unitOfAccountAmount: { amount: 1, currency: WalletCurrency.Usd },
          settlementAmount: { amount: 1, currency: WalletCurrency.Usd },
        }),
      )

      const invoice = await invoiceDetails.generateInvoice(mockMutations)

      expect(invoice).toEqual(
        expect.objectContaining({
          invoice: expect.objectContaining({
            expiration: expect.any(Date),
            invoiceDisplay: usdAmountInvoice,
          }),
        }),
      )
    })
  })

  describe("with btc receiving wallet", () => {
    const btcWalletParams = {
      ...defaultParams,
      receivingWalletDescriptor: { id: "wallet-id", currency: WalletCurrency.Btc },
    }

    it("creates no amount lightning invoice", async () => {
      const btcNoAmountLightningParams: CreateInvoiceDetailsParams<
        typeof WalletCurrency.Btc
      > = {
        ...btcWalletParams,
        invoiceType: InvoiceType.Lightning,
      }

      const invoiceDetails = createInvoiceDetails(btcNoAmountLightningParams)

      expect(invoiceDetails).toEqual(
        expect.objectContaining({
          ...defaultExpectedInvoiceDetails,
          invoiceType: InvoiceType.Lightning,
        }),
      )

      const invoice = await invoiceDetails.generateInvoice(mockMutations)

      expect(invoice).toEqual(
        expect.objectContaining({
          invoice: expect.objectContaining({
            invoiceDisplay: noAmountInvoice,
          }),
        }),
      )
    })

    it("create amount lightning invoice", async () => {
      const btcAmountLightningParams: CreateInvoiceDetailsParams<
        typeof WalletCurrency.Btc
      > = {
        ...btcWalletParams,
        invoiceType: InvoiceType.Lightning,
        unitOfAccountAmount: { amount: 1, currency: WalletCurrency.Usd },
      }

      const invoiceDetails = createInvoiceDetails(btcAmountLightningParams)

      expect(invoiceDetails).toEqual(
        expect.objectContaining({
          ...defaultExpectedInvoiceDetails,
          invoiceType: InvoiceType.Lightning,
          unitOfAccountAmount: { amount: 1, currency: WalletCurrency.Usd },
          settlementAmount: { amount: 1, currency: WalletCurrency.Btc },
        }),
      )

      const invoice = await invoiceDetails.generateInvoice(mockMutations)

      expect(invoice).toEqual(
        expect.objectContaining({
          invoice: expect.objectContaining({
            invoiceDisplay: btcAmountInvoice,
          }),
        }),
      )
    })

    it("creates an onchain address", async () => {
      const btcOnchainParams: CreateInvoiceDetailsParams<typeof WalletCurrency.Btc> = {
        ...btcWalletParams,
        invoiceType: InvoiceType.OnChain,
        unitOfAccountAmount: { amount: 1, currency: WalletCurrency.Usd },
      }

      const invoiceDetails = createInvoiceDetails(btcOnchainParams)

      expect(invoiceDetails).toEqual(
        expect.objectContaining({
          ...defaultExpectedInvoiceDetails,
          invoiceType: InvoiceType.OnChain,
          unitOfAccountAmount: { amount: 1, currency: WalletCurrency.Usd },
          settlementAmount: { amount: 1, currency: WalletCurrency.Btc },
        }),
      )

      const invoice = await invoiceDetails.generateInvoice(mockMutations)

      expect(invoice).toEqual(
        expect.objectContaining({
          invoice: expect.objectContaining({
            invoiceDisplay: `bitcoin:tb1qw508d6qejxtdg4y5r3zarvary0c5xw7kxpjzsx?amount=1e-8&message=Test`,
          }),
        }),
      )
    })
  })
})

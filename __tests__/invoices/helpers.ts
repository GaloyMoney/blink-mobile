import { LnInvoice } from "@app/graphql/generated"
import { GqlGenerateInvoiceMutations } from "@app/screens/receive-bitcoin-screen/invoices/index.types"
import { createMock } from "ts-auto-mock"

export const usdAmountInvoice =
  "lnbc49100n1p3l2q6cpp5y8lc3dv7qnplxhc3z9j0sap4n0hu99g39tl3srx6zj0hrqy2snwsdqqcqzpuxqzfvsp5q6t5f3xeruu4k5sk5nlmxx2kzlw2pydmmjk9g4qqmsc9c6ffzldq9qyyssq9lesnumasvvlvwc7yckvuepklttlvwhjqw3539qqqttsyh5s5j246spy9gezng7ng3d40qsrn6dhsrgs7rccaftzulx5auqqd5lz0psqfskeg4"
export const noAmountInvoice =
  "lnbc1p3l2qmfpp5t2ne20k97f3n24el9a792fte4q6n7jqr6x8qjjnklgktrdvpqq2sdqqcqzpuxqyz5vqsp5n23d3as4jxvpaemnsnvyynlpsg6pzsmxhn3tcwxealcyh6566nys9qyyssqce802uft9d44llekxqedzufkeaq7anldzpf64s4hmskwd9h5ppe4xrgq4dpq8rc3ph048066wgexjtgw4fs8032xwuazw9kdjcq8ujgpdk07ht"
export const btcAmountInvoice =
  "lnbc23690n1p3l2qugpp5jeflfqjpxhe0hg3tzttc325j5l6czs9vq9zqx5edpt0yf7k6cypsdqqcqzpuxqyz5vqsp5lteanmnwddszwut839etrgjenfr3dv5tnvz2d2ww2mvggq7zn46q9qyyssqzcz0rvt7r30q7jul79xqqwpr4k2e8mgd23fkjm422sdgpndwql93d4wh3lap9yfwahue9n7ju80ynkqly0lrqqd2978dr8srkrlrjvcq2v5s6k"
export const mockOnChainAddress = "tb1qw508d6qejxtdg4y5r3zarvary0c5xw7kxpjzsx"

const mockLnInvoice = createMock<LnInvoice>({
  paymentRequest: btcAmountInvoice,
})

const mockLnInvoiceCreate = jest.fn().mockResolvedValue({
  data: {
    lnInvoiceCreate: {
      invoice: mockLnInvoice,
      errors: [],
    },
  },
  errors: [],
})

const mockLnUsdInvoice = createMock<LnInvoice>({
  paymentRequest: usdAmountInvoice,
})

const mockLnUsdInvoiceCreate = jest.fn().mockResolvedValue({
  data: {
    lnUsdInvoiceCreate: {
      invoice: mockLnUsdInvoice,
      errors: [],
    },
  },
  errors: [],
})

const mockLnNoAmountInvoice = createMock<LnInvoice>({
  paymentRequest: noAmountInvoice,
})

const mockLnNoAmountInvoiceCreate = jest.fn().mockResolvedValue({
  data: {
    lnNoAmountInvoiceCreate: {
      invoice: mockLnNoAmountInvoice,
      errors: [],
    },
  },
  errors: [],
})

const mockOnChainAddressCurrent = jest.fn().mockResolvedValue({
  data: {
    onChainAddressCurrent: {
      address: mockOnChainAddress,
      errors: [],
    },
  },
  errors: [],
})

export const mockMutations: GqlGenerateInvoiceMutations = {
  lnInvoiceCreate: mockLnInvoiceCreate,
  lnUsdInvoiceCreate: mockLnUsdInvoiceCreate,
  lnNoAmountInvoiceCreate: mockLnNoAmountInvoiceCreate,
  onChainAddressCurrent: mockOnChainAddressCurrent,
}

export const clearMocks = () => {
  mockLnInvoiceCreate.mockClear()
  mockLnUsdInvoiceCreate.mockClear()
  mockLnNoAmountInvoiceCreate.mockClear()
  mockOnChainAddressCurrent.mockClear()
}

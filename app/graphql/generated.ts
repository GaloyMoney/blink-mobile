import { gql } from "@apollo/client"
import * as Apollo from "@apollo/client"
export type Maybe<T> = T | null
export type InputMaybe<T> = Maybe<T>
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] }
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & {
  [SubKey in K]?: Maybe<T[SubKey]>
}
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & {
  [SubKey in K]: Maybe<T[SubKey]>
}
const defaultOptions = {} as const
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: string
  String: string
  Boolean: boolean
  Int: number
  Float: number
  /** An Opaque Bearer token */
  AuthToken: string
  /** (Positive) Cent amount (1/100 of a dollar) */
  CentAmount: number
  /** An alias name that a user can set for a wallet (with which they have transactions) */
  ContactAlias: string
  /** Display currency of an account */
  DisplayCurrency: string
  /** Hex-encoded string of 32 bytes */
  Hex32Bytes: string
  Language: string
  LnPaymentPreImage: string
  /** BOLT11 lightning invoice payment request with the amount included */
  LnPaymentRequest: string
  LnPaymentSecret: string
  /** Text field in a lightning payment transaction */
  Memo: string
  /** An address for an on-chain bitcoin destination */
  OnChainAddress: string
  OnChainTxHash: string
  /** An authentication code valid for a single use */
  OneTimeAuthCode: string
  PaymentHash: string
  /** Phone number which includes country code */
  Phone: string
  /** Non-fractional signed whole numeric value between -(2^53) + 1 and 2^53 - 1 */
  SafeInt: number
  /** (Positive) Satoshi amount */
  SatAmount: number
  /** (Positive) amount of seconds */
  Seconds: number
  /** An amount (of a currency) that can be negative (e.g. in a transaction) */
  SignedAmount: number
  /** (Positive) Number of blocks in which the transaction is expected to be confirmed */
  TargetConfirmations: number
  /** Timestamp field, serialized as Unix time (the number of seconds since the Unix epoch) */
  Timestamp: number
  /** Unique identifier of a user */
  Username: string
  /** Unique identifier of a wallet */
  WalletId: string
}

export type Account = {
  readonly csvTransactions: Scalars["String"]
  readonly defaultWalletId: Scalars["WalletId"]
  readonly displayCurrency: Scalars["DisplayCurrency"]
  readonly id: Scalars["ID"]
  readonly limits: AccountLimits
  readonly transactions?: Maybe<TransactionConnection>
  readonly wallets: ReadonlyArray<Wallet>
}

export type AccountCsvTransactionsArgs = {
  walletIds: ReadonlyArray<Scalars["WalletId"]>
}

export type AccountTransactionsArgs = {
  after?: InputMaybe<Scalars["String"]>
  before?: InputMaybe<Scalars["String"]>
  first?: InputMaybe<Scalars["Int"]>
  last?: InputMaybe<Scalars["Int"]>
  walletIds?: InputMaybe<ReadonlyArray<InputMaybe<Scalars["WalletId"]>>>
}

export type AccountLimit = {
  /** The rolling time interval in seconds that the limits would apply for. */
  readonly interval?: Maybe<Scalars["Seconds"]>
  /** The amount of cents remaining below the limit for the current 24 hour period. */
  readonly remainingLimit?: Maybe<Scalars["CentAmount"]>
  /** The current maximum limit for a given 24 hour period. */
  readonly totalLimit: Scalars["CentAmount"]
}

export type AccountLimits = {
  readonly __typename?: "AccountLimits"
  /** Limits for converting between currencies among a account's own wallets. */
  readonly convert: ReadonlyArray<AccountLimit>
  /** Limits for sending to other internal accounts. */
  readonly internalSend: ReadonlyArray<AccountLimit>
  /** Limits for withdrawing to external onchain or lightning destinations. */
  readonly withdrawal: ReadonlyArray<AccountLimit>
}

export type AccountUpdateDefaultWalletIdInput = {
  readonly walletId: Scalars["WalletId"]
}

export type AccountUpdateDefaultWalletIdPayload = {
  readonly __typename?: "AccountUpdateDefaultWalletIdPayload"
  readonly account?: Maybe<ConsumerAccount>
  readonly errors: ReadonlyArray<Error>
}

export type AccountUpdateDisplayCurrencyInput = {
  readonly currency: Scalars["DisplayCurrency"]
}

export type AccountUpdateDisplayCurrencyPayload = {
  readonly __typename?: "AccountUpdateDisplayCurrencyPayload"
  readonly account?: Maybe<ConsumerAccount>
  readonly errors: ReadonlyArray<Error>
}

export type AuthTokenPayload = {
  readonly __typename?: "AuthTokenPayload"
  readonly authToken?: Maybe<Scalars["AuthToken"]>
  readonly errors: ReadonlyArray<Error>
}

/** A wallet belonging to an account which contains a BTC balance and a list of transactions. */
export type BtcWallet = Wallet & {
  readonly __typename?: "BTCWallet"
  readonly accountId: Scalars["ID"]
  /** A balance stored in BTC. */
  readonly balance: Scalars["SignedAmount"]
  readonly id: Scalars["ID"]
  /** An unconfirmed incoming onchain balance. */
  readonly pendingIncomingBalance: Scalars["SignedAmount"]
  /** A list of BTC transactions associated with this wallet. */
  readonly transactions?: Maybe<TransactionConnection>
  readonly transactionsByAddress?: Maybe<TransactionConnection>
  readonly walletCurrency: WalletCurrency
}

/** A wallet belonging to an account which contains a BTC balance and a list of transactions. */
export type BtcWalletTransactionsArgs = {
  after?: InputMaybe<Scalars["String"]>
  before?: InputMaybe<Scalars["String"]>
  first?: InputMaybe<Scalars["Int"]>
  last?: InputMaybe<Scalars["Int"]>
}

/** A wallet belonging to an account which contains a BTC balance and a list of transactions. */
export type BtcWalletTransactionsByAddressArgs = {
  address: Scalars["OnChainAddress"]
  after?: InputMaybe<Scalars["String"]>
  before?: InputMaybe<Scalars["String"]>
  first?: InputMaybe<Scalars["Int"]>
  last?: InputMaybe<Scalars["Int"]>
}

export type BuildInformation = {
  readonly __typename?: "BuildInformation"
  readonly buildTime?: Maybe<Scalars["Timestamp"]>
  readonly commitHash?: Maybe<Scalars["String"]>
  readonly helmRevision?: Maybe<Scalars["Int"]>
}

export type CaptchaCreateChallengePayload = {
  readonly __typename?: "CaptchaCreateChallengePayload"
  readonly errors: ReadonlyArray<Error>
  readonly result?: Maybe<CaptchaCreateChallengeResult>
}

export type CaptchaCreateChallengeResult = {
  readonly __typename?: "CaptchaCreateChallengeResult"
  readonly challengeCode: Scalars["String"]
  readonly failbackMode: Scalars["Boolean"]
  readonly id: Scalars["String"]
  readonly newCaptcha: Scalars["Boolean"]
}

export type CaptchaRequestAuthCodeInput = {
  readonly challengeCode: Scalars["String"]
  readonly channel?: InputMaybe<PhoneCodeChannelType>
  readonly phone: Scalars["Phone"]
  readonly secCode: Scalars["String"]
  readonly validationCode: Scalars["String"]
}

export type CentAmountPayload = {
  readonly __typename?: "CentAmountPayload"
  readonly amount?: Maybe<Scalars["CentAmount"]>
  readonly errors: ReadonlyArray<Error>
}

export type ConsumerAccount = Account & {
  readonly __typename?: "ConsumerAccount"
  /** return CSV stream, base64 encoded, of the list of transactions in the wallet */
  readonly csvTransactions: Scalars["String"]
  readonly defaultWalletId: Scalars["WalletId"]
  readonly displayCurrency: Scalars["DisplayCurrency"]
  readonly id: Scalars["ID"]
  readonly limits: AccountLimits
  /** A list of all transactions associated with walletIds optionally passed. */
  readonly transactions?: Maybe<TransactionConnection>
  readonly wallets: ReadonlyArray<Wallet>
}

export type ConsumerAccountCsvTransactionsArgs = {
  walletIds: ReadonlyArray<Scalars["WalletId"]>
}

export type ConsumerAccountTransactionsArgs = {
  after?: InputMaybe<Scalars["String"]>
  before?: InputMaybe<Scalars["String"]>
  first?: InputMaybe<Scalars["Int"]>
  last?: InputMaybe<Scalars["Int"]>
  walletIds?: InputMaybe<ReadonlyArray<InputMaybe<Scalars["WalletId"]>>>
}

export type Coordinates = {
  readonly __typename?: "Coordinates"
  readonly latitude: Scalars["Float"]
  readonly longitude: Scalars["Float"]
}

export type Currency = {
  readonly __typename?: "Currency"
  readonly code: Scalars["String"]
  readonly flag: Scalars["String"]
  readonly name: Scalars["String"]
  readonly symbol: Scalars["String"]
}

export type DeviceNotificationTokenCreateInput = {
  readonly deviceToken: Scalars["String"]
}

export type Error = {
  readonly code?: Maybe<Scalars["String"]>
  readonly message: Scalars["String"]
  readonly path?: Maybe<ReadonlyArray<Maybe<Scalars["String"]>>>
}

export type ExchangeCurrencyUnit = "BTCSAT" | "USDCENT"

/** Provides global settings for the application which might have an impact for the user. */
export type Globals = {
  readonly __typename?: "Globals"
  readonly buildInformation: BuildInformation
  /** The domain name for lightning addresses accepted by this Galoy instance */
  readonly lightningAddressDomain: Scalars["String"]
  readonly lightningAddressDomainAliases: ReadonlyArray<Scalars["String"]>
  /** Which network (mainnet, testnet, regtest, signet) this instance is running on. */
  readonly network: Network
  /**
   * A list of public keys for the running lightning nodes.
   * This can be used to know if an invoice belongs to one of our nodes.
   */
  readonly nodesIds: ReadonlyArray<Scalars["String"]>
}

export type GraphQlApplicationError = Error & {
  readonly __typename?: "GraphQLApplicationError"
  readonly code?: Maybe<Scalars["String"]>
  readonly message: Scalars["String"]
  readonly path?: Maybe<ReadonlyArray<Maybe<Scalars["String"]>>>
}

export type InitiationVia =
  | InitiationViaIntraLedger
  | InitiationViaLn
  | InitiationViaOnChain

export type InitiationViaIntraLedger = {
  readonly __typename?: "InitiationViaIntraLedger"
  readonly counterPartyUsername?: Maybe<Scalars["Username"]>
  readonly counterPartyWalletId?: Maybe<Scalars["WalletId"]>
}

export type InitiationViaLn = {
  readonly __typename?: "InitiationViaLn"
  readonly paymentHash: Scalars["PaymentHash"]
}

export type InitiationViaOnChain = {
  readonly __typename?: "InitiationViaOnChain"
  readonly address: Scalars["OnChainAddress"]
}

export type IntraLedgerPaymentSendInput = {
  /** Amount in satoshis. */
  readonly amount: Scalars["SatAmount"]
  /** Optional memo to be attached to the payment. */
  readonly memo?: InputMaybe<Scalars["Memo"]>
  readonly recipientWalletId: Scalars["WalletId"]
  /** The wallet ID of the sender. */
  readonly walletId: Scalars["WalletId"]
}

export type IntraLedgerUpdate = {
  readonly __typename?: "IntraLedgerUpdate"
  readonly amount: Scalars["SatAmount"]
  readonly displayCurrencyPerSat: Scalars["Float"]
  readonly txNotificationType: TxNotificationType
  /** @deprecated updated over displayCurrencyPerSat */
  readonly usdPerSat: Scalars["Float"]
  readonly walletId: Scalars["WalletId"]
}

export type IntraLedgerUsdPaymentSendInput = {
  /** Amount in cents. */
  readonly amount: Scalars["CentAmount"]
  /** Optional memo to be attached to the payment. */
  readonly memo?: InputMaybe<Scalars["Memo"]>
  readonly recipientWalletId: Scalars["WalletId"]
  /** The wallet ID of the sender. */
  readonly walletId: Scalars["WalletId"]
}

export type InvoicePaymentStatus = "PAID" | "PENDING"

export type LnInvoice = {
  readonly __typename?: "LnInvoice"
  readonly paymentHash: Scalars["PaymentHash"]
  readonly paymentRequest: Scalars["LnPaymentRequest"]
  readonly paymentSecret: Scalars["LnPaymentSecret"]
  readonly satoshis?: Maybe<Scalars["SatAmount"]>
}

export type LnInvoiceCreateInput = {
  /** Amount in satoshis. */
  readonly amount: Scalars["SatAmount"]
  /** Optional memo for the lightning invoice. */
  readonly memo?: InputMaybe<Scalars["Memo"]>
  /** Wallet ID for a BTC wallet belonging to the current account. */
  readonly walletId: Scalars["WalletId"]
}

export type LnInvoiceCreateOnBehalfOfRecipientInput = {
  /** Amount in satoshis. */
  readonly amount: Scalars["SatAmount"]
  readonly descriptionHash?: InputMaybe<Scalars["Hex32Bytes"]>
  /** Optional memo for the lightning invoice. */
  readonly memo?: InputMaybe<Scalars["Memo"]>
  /** Wallet ID for a BTC wallet which belongs to any account. */
  readonly recipientWalletId: Scalars["WalletId"]
}

export type LnInvoiceFeeProbeInput = {
  readonly paymentRequest: Scalars["LnPaymentRequest"]
  readonly walletId: Scalars["WalletId"]
}

export type LnInvoicePayload = {
  readonly __typename?: "LnInvoicePayload"
  readonly errors: ReadonlyArray<Error>
  readonly invoice?: Maybe<LnInvoice>
}

export type LnInvoicePaymentInput = {
  /** Optional memo to associate with the lightning invoice. */
  readonly memo?: InputMaybe<Scalars["Memo"]>
  /** Payment request representing the invoice which is being paid. */
  readonly paymentRequest: Scalars["LnPaymentRequest"]
  /** Wallet ID with sufficient balance to cover amount of invoice.  Must belong to the account of the current user. */
  readonly walletId: Scalars["WalletId"]
}

export type LnInvoicePaymentStatusInput = {
  readonly paymentRequest: Scalars["LnPaymentRequest"]
}

export type LnInvoicePaymentStatusPayload = {
  readonly __typename?: "LnInvoicePaymentStatusPayload"
  readonly errors: ReadonlyArray<Error>
  readonly status?: Maybe<InvoicePaymentStatus>
}

export type LnNoAmountInvoice = {
  readonly __typename?: "LnNoAmountInvoice"
  readonly paymentHash: Scalars["PaymentHash"]
  readonly paymentRequest: Scalars["LnPaymentRequest"]
  readonly paymentSecret: Scalars["LnPaymentSecret"]
}

export type LnNoAmountInvoiceCreateInput = {
  /** Optional memo for the lightning invoice. */
  readonly memo?: InputMaybe<Scalars["Memo"]>
  /** ID for either a USD or BTC wallet belonging to the account of the current user. */
  readonly walletId: Scalars["WalletId"]
}

export type LnNoAmountInvoiceCreateOnBehalfOfRecipientInput = {
  /** Optional memo for the lightning invoice. */
  readonly memo?: InputMaybe<Scalars["Memo"]>
  /** ID for either a USD or BTC wallet which belongs to the account of any user. */
  readonly recipientWalletId: Scalars["WalletId"]
}

export type LnNoAmountInvoiceFeeProbeInput = {
  readonly amount: Scalars["SatAmount"]
  readonly paymentRequest: Scalars["LnPaymentRequest"]
  readonly walletId: Scalars["WalletId"]
}

export type LnNoAmountInvoicePayload = {
  readonly __typename?: "LnNoAmountInvoicePayload"
  readonly errors: ReadonlyArray<Error>
  readonly invoice?: Maybe<LnNoAmountInvoice>
}

export type LnNoAmountInvoicePaymentInput = {
  /** Amount to pay in satoshis. */
  readonly amount: Scalars["SatAmount"]
  /** Optional memo to associate with the lightning invoice. */
  readonly memo?: InputMaybe<Scalars["Memo"]>
  /** Payment request representing the invoice which is being paid. */
  readonly paymentRequest: Scalars["LnPaymentRequest"]
  /** Wallet ID with sufficient balance to cover amount defined in mutation request.  Must belong to the account of the current user. */
  readonly walletId: Scalars["WalletId"]
}

export type LnNoAmountUsdInvoiceFeeProbeInput = {
  readonly amount: Scalars["CentAmount"]
  readonly paymentRequest: Scalars["LnPaymentRequest"]
  readonly walletId: Scalars["WalletId"]
}

export type LnNoAmountUsdInvoicePaymentInput = {
  /** Amount to pay in USD cents. */
  readonly amount: Scalars["CentAmount"]
  /** Optional memo to associate with the lightning invoice. */
  readonly memo?: InputMaybe<Scalars["Memo"]>
  /** Payment request representing the invoice which is being paid. */
  readonly paymentRequest: Scalars["LnPaymentRequest"]
  /** Wallet ID with sufficient balance to cover amount defined in mutation request.  Must belong to the account of the current user. */
  readonly walletId: Scalars["WalletId"]
}

export type LnUpdate = {
  readonly __typename?: "LnUpdate"
  readonly paymentHash: Scalars["PaymentHash"]
  readonly status: InvoicePaymentStatus
  readonly walletId: Scalars["WalletId"]
}

export type LnUsdInvoiceCreateInput = {
  /** Amount in USD cents. */
  readonly amount: Scalars["CentAmount"]
  /** Optional memo for the lightning invoice. */
  readonly memo?: InputMaybe<Scalars["Memo"]>
  /** Wallet ID for a USD wallet belonging to the current user. */
  readonly walletId: Scalars["WalletId"]
}

export type LnUsdInvoiceCreateOnBehalfOfRecipientInput = {
  /** Amount in USD cents. */
  readonly amount: Scalars["CentAmount"]
  readonly descriptionHash?: InputMaybe<Scalars["Hex32Bytes"]>
  /** Optional memo for the lightning invoice. Acts as a note to the recipient. */
  readonly memo?: InputMaybe<Scalars["Memo"]>
  /** Wallet ID for a USD wallet which belongs to the account of any user. */
  readonly recipientWalletId: Scalars["WalletId"]
}

export type LnUsdInvoiceFeeProbeInput = {
  readonly paymentRequest: Scalars["LnPaymentRequest"]
  readonly walletId: Scalars["WalletId"]
}

export type MapInfo = {
  readonly __typename?: "MapInfo"
  readonly coordinates: Coordinates
  readonly title: Scalars["String"]
}

export type MapMarker = {
  readonly __typename?: "MapMarker"
  readonly mapInfo: MapInfo
  readonly username?: Maybe<Scalars["Username"]>
}

export type MobileVersions = {
  readonly __typename?: "MobileVersions"
  readonly currentSupported: Scalars["Int"]
  readonly minSupported: Scalars["Int"]
  readonly platform: Scalars["String"]
}

export type Mutation = {
  readonly __typename?: "Mutation"
  readonly accountUpdateDefaultWalletId: AccountUpdateDefaultWalletIdPayload
  readonly accountUpdateDisplayCurrency: AccountUpdateDisplayCurrencyPayload
  readonly captchaCreateChallenge: CaptchaCreateChallengePayload
  readonly captchaRequestAuthCode: SuccessPayload
  readonly deviceNotificationTokenCreate: SuccessPayload
  /**
   * Actions a payment which is internal to the ledger e.g. it does
   * not use onchain/lightning. Returns payment status (success,
   * failed, pending, already_paid).
   */
  readonly intraLedgerPaymentSend: PaymentSendPayload
  /**
   * Actions a payment which is internal to the ledger e.g. it does
   * not use onchain/lightning. Returns payment status (success,
   * failed, pending, already_paid).
   */
  readonly intraLedgerUsdPaymentSend: PaymentSendPayload
  /**
   * Returns a lightning invoice for an associated wallet.
   * When invoice is paid the value will be credited to a BTC wallet.
   * Expires after 24 hours.
   */
  readonly lnInvoiceCreate: LnInvoicePayload
  /**
   * Returns a lightning invoice for an associated wallet.
   * When invoice is paid the value will be credited to a BTC wallet.
   * Expires after 24 hours.
   */
  readonly lnInvoiceCreateOnBehalfOfRecipient: LnInvoicePayload
  readonly lnInvoiceFeeProbe: SatAmountPayload
  /**
   * Pay a lightning invoice using a balance from a wallet which is owned by the account of the current user.
   * Provided wallet can be USD or BTC and must have sufficient balance to cover amount in lightning invoice.
   * Returns payment status (success, failed, pending, already_paid).
   */
  readonly lnInvoicePaymentSend: PaymentSendPayload
  /**
   * Returns a lightning invoice for an associated wallet.
   * Can be used to receive any supported currency value (currently USD or BTC).
   * Expires after 24 hours.
   */
  readonly lnNoAmountInvoiceCreate: LnNoAmountInvoicePayload
  /**
   * Returns a lightning invoice for an associated wallet.
   * Can be used to receive any supported currency value (currently USD or BTC).
   * Expires after 24 hours.
   */
  readonly lnNoAmountInvoiceCreateOnBehalfOfRecipient: LnNoAmountInvoicePayload
  readonly lnNoAmountInvoiceFeeProbe: SatAmountPayload
  /**
   * Pay a lightning invoice using a balance from a wallet which is owned by the account of the current user.
   * Provided wallet must be BTC and must have sufficient balance to cover amount specified in mutation request.
   * Returns payment status (success, failed, pending, already_paid).
   */
  readonly lnNoAmountInvoicePaymentSend: PaymentSendPayload
  readonly lnNoAmountUsdInvoiceFeeProbe: CentAmountPayload
  /**
   * Pay a lightning invoice using a balance from a wallet which is owned by the account of the current user.
   * Provided wallet must be USD and have sufficient balance to cover amount specified in mutation request.
   * Returns payment status (success, failed, pending, already_paid).
   */
  readonly lnNoAmountUsdInvoicePaymentSend: PaymentSendPayload
  /**
   * Returns a lightning invoice denominated in satoshis for an associated wallet.
   * When invoice is paid the equivalent value at invoice creation will be credited to a USD wallet.
   * Expires after 5 minutes (short expiry time because there is a USD/BTC exchange rate
   * associated with the amount).
   */
  readonly lnUsdInvoiceCreate: LnInvoicePayload
  /**
   * Returns a lightning invoice denominated in satoshis for an associated wallet.
   * When invoice is paid the equivalent value at invoice creation will be credited to a USD wallet.
   * Expires after 5 minutes (short expiry time because there is a USD/BTC exchange rate
   *   associated with the amount).
   */
  readonly lnUsdInvoiceCreateOnBehalfOfRecipient: LnInvoicePayload
  readonly lnUsdInvoiceFeeProbe: SatAmountPayload
  readonly onChainAddressCreate: OnChainAddressPayload
  readonly onChainAddressCurrent: OnChainAddressPayload
  readonly onChainPaymentSend: PaymentSendPayload
  readonly onChainPaymentSendAll: PaymentSendPayload
  readonly onChainUsdPaymentSend: PaymentSendPayload
  /** @deprecated will be moved to AccountContact */
  readonly userContactUpdateAlias: UserContactUpdateAliasPayload
  readonly userDeviceAccountCreate: AuthTokenPayload
  readonly userLogin: AuthTokenPayload
  readonly userLoginUpgrade: AuthTokenPayload
  readonly userLogout: AuthTokenPayload
  readonly userQuizQuestionUpdateCompleted: UserQuizQuestionUpdateCompletedPayload
  readonly userRequestAuthCode: SuccessPayload
  readonly userUpdateLanguage: UserUpdateLanguagePayload
  /** @deprecated Username will be moved to @Handle in Accounts. Also SetUsername naming should be used instead of UpdateUsername to reflect the idempotency of Handles */
  readonly userUpdateUsername: UserUpdateUsernamePayload
}

export type MutationAccountUpdateDefaultWalletIdArgs = {
  input: AccountUpdateDefaultWalletIdInput
}

export type MutationAccountUpdateDisplayCurrencyArgs = {
  input: AccountUpdateDisplayCurrencyInput
}

export type MutationCaptchaRequestAuthCodeArgs = {
  input: CaptchaRequestAuthCodeInput
}

export type MutationDeviceNotificationTokenCreateArgs = {
  input: DeviceNotificationTokenCreateInput
}

export type MutationIntraLedgerPaymentSendArgs = {
  input: IntraLedgerPaymentSendInput
}

export type MutationIntraLedgerUsdPaymentSendArgs = {
  input: IntraLedgerUsdPaymentSendInput
}

export type MutationLnInvoiceCreateArgs = {
  input: LnInvoiceCreateInput
}

export type MutationLnInvoiceCreateOnBehalfOfRecipientArgs = {
  input: LnInvoiceCreateOnBehalfOfRecipientInput
}

export type MutationLnInvoiceFeeProbeArgs = {
  input: LnInvoiceFeeProbeInput
}

export type MutationLnInvoicePaymentSendArgs = {
  input: LnInvoicePaymentInput
}

export type MutationLnNoAmountInvoiceCreateArgs = {
  input: LnNoAmountInvoiceCreateInput
}

export type MutationLnNoAmountInvoiceCreateOnBehalfOfRecipientArgs = {
  input: LnNoAmountInvoiceCreateOnBehalfOfRecipientInput
}

export type MutationLnNoAmountInvoiceFeeProbeArgs = {
  input: LnNoAmountInvoiceFeeProbeInput
}

export type MutationLnNoAmountInvoicePaymentSendArgs = {
  input: LnNoAmountInvoicePaymentInput
}

export type MutationLnNoAmountUsdInvoiceFeeProbeArgs = {
  input: LnNoAmountUsdInvoiceFeeProbeInput
}

export type MutationLnNoAmountUsdInvoicePaymentSendArgs = {
  input: LnNoAmountUsdInvoicePaymentInput
}

export type MutationLnUsdInvoiceCreateArgs = {
  input: LnUsdInvoiceCreateInput
}

export type MutationLnUsdInvoiceCreateOnBehalfOfRecipientArgs = {
  input: LnUsdInvoiceCreateOnBehalfOfRecipientInput
}

export type MutationLnUsdInvoiceFeeProbeArgs = {
  input: LnUsdInvoiceFeeProbeInput
}

export type MutationOnChainAddressCreateArgs = {
  input: OnChainAddressCreateInput
}

export type MutationOnChainAddressCurrentArgs = {
  input: OnChainAddressCurrentInput
}

export type MutationOnChainPaymentSendArgs = {
  input: OnChainPaymentSendInput
}

export type MutationOnChainPaymentSendAllArgs = {
  input: OnChainPaymentSendAllInput
}

export type MutationOnChainUsdPaymentSendArgs = {
  input: OnChainUsdPaymentSendInput
}

export type MutationUserContactUpdateAliasArgs = {
  input: UserContactUpdateAliasInput
}

export type MutationUserDeviceAccountCreateArgs = {
  input: UserDeviceAccountCreateInput
}

export type MutationUserLoginArgs = {
  input: UserLoginInput
}

export type MutationUserLoginUpgradeArgs = {
  input: UserLoginUpgrade
}

export type MutationUserLogoutArgs = {
  input: UserLogoutInput
}

export type MutationUserQuizQuestionUpdateCompletedArgs = {
  input: UserQuizQuestionUpdateCompletedInput
}

export type MutationUserRequestAuthCodeArgs = {
  input: UserRequestAuthCodeInput
}

export type MutationUserUpdateLanguageArgs = {
  input: UserUpdateLanguageInput
}

export type MutationUserUpdateUsernameArgs = {
  input: UserUpdateUsernameInput
}

export type MyUpdatesPayload = {
  readonly __typename?: "MyUpdatesPayload"
  readonly errors: ReadonlyArray<Error>
  readonly me?: Maybe<User>
  readonly update?: Maybe<UserUpdate>
}

export type Network = "mainnet" | "regtest" | "signet" | "testnet"

export type OnChainAddressCreateInput = {
  readonly walletId: Scalars["WalletId"]
}

export type OnChainAddressCurrentInput = {
  readonly walletId: Scalars["WalletId"]
}

export type OnChainAddressPayload = {
  readonly __typename?: "OnChainAddressPayload"
  readonly address?: Maybe<Scalars["OnChainAddress"]>
  readonly errors: ReadonlyArray<Error>
}

export type OnChainPaymentSendAllInput = {
  readonly address: Scalars["OnChainAddress"]
  readonly memo?: InputMaybe<Scalars["Memo"]>
  readonly targetConfirmations?: InputMaybe<Scalars["TargetConfirmations"]>
  readonly walletId: Scalars["WalletId"]
}

export type OnChainPaymentSendInput = {
  readonly address: Scalars["OnChainAddress"]
  readonly amount: Scalars["SatAmount"]
  readonly memo?: InputMaybe<Scalars["Memo"]>
  readonly targetConfirmations?: InputMaybe<Scalars["TargetConfirmations"]>
  readonly walletId: Scalars["WalletId"]
}

export type OnChainTxFee = {
  readonly __typename?: "OnChainTxFee"
  readonly amount: Scalars["SatAmount"]
  readonly targetConfirmations: Scalars["TargetConfirmations"]
}

export type OnChainUpdate = {
  readonly __typename?: "OnChainUpdate"
  readonly amount: Scalars["SatAmount"]
  readonly displayCurrencyPerSat: Scalars["Float"]
  readonly txHash: Scalars["OnChainTxHash"]
  readonly txNotificationType: TxNotificationType
  /** @deprecated updated over displayCurrencyPerSat */
  readonly usdPerSat: Scalars["Float"]
  readonly walletId: Scalars["WalletId"]
}

export type OnChainUsdPaymentSendInput = {
  readonly address: Scalars["OnChainAddress"]
  readonly amount: Scalars["CentAmount"]
  readonly memo?: InputMaybe<Scalars["Memo"]>
  readonly targetConfirmations?: InputMaybe<Scalars["TargetConfirmations"]>
  readonly walletId: Scalars["WalletId"]
}

export type OnChainUsdTxFee = {
  readonly __typename?: "OnChainUsdTxFee"
  readonly amount: Scalars["CentAmount"]
  readonly targetConfirmations: Scalars["TargetConfirmations"]
}

export type OneDayAccountLimit = AccountLimit & {
  readonly __typename?: "OneDayAccountLimit"
  /** The rolling time interval value in seconds for the current 24 hour period. */
  readonly interval?: Maybe<Scalars["Seconds"]>
  /** The amount of cents remaining below the limit for the current 24 hour period. */
  readonly remainingLimit?: Maybe<Scalars["CentAmount"]>
  /** The current maximum limit for a given 24 hour period. */
  readonly totalLimit: Scalars["CentAmount"]
}

/** Information about pagination in a connection. */
export type PageInfo = {
  readonly __typename?: "PageInfo"
  /** When paginating forwards, the cursor to continue. */
  readonly endCursor?: Maybe<Scalars["String"]>
  /** When paginating forwards, are there more items? */
  readonly hasNextPage: Scalars["Boolean"]
  /** When paginating backwards, are there more items? */
  readonly hasPreviousPage: Scalars["Boolean"]
  /** When paginating backwards, the cursor to continue. */
  readonly startCursor?: Maybe<Scalars["String"]>
}

export type PaymentSendPayload = {
  readonly __typename?: "PaymentSendPayload"
  readonly errors: ReadonlyArray<Error>
  readonly status?: Maybe<PaymentSendResult>
}

export type PaymentSendResult = "ALREADY_PAID" | "FAILURE" | "PENDING" | "SUCCESS"

export type PhoneCodeChannelType = "SMS" | "WHATSAPP"

/** Price amount expressed in base/offset. To calculate, use: `base / 10^offset` */
export type Price = {
  readonly __typename?: "Price"
  readonly base: Scalars["SafeInt"]
  readonly currencyUnit: ExchangeCurrencyUnit
  readonly formattedAmount: Scalars["String"]
  readonly offset: Scalars["Int"]
}

/** The range for the X axis in the BTC price graph */
export type PriceGraphRange =
  | "FIVE_YEARS"
  | "ONE_DAY"
  | "ONE_MONTH"
  | "ONE_WEEK"
  | "ONE_YEAR"

export type PriceInput = {
  readonly amount: Scalars["SatAmount"]
  readonly amountCurrencyUnit: ExchangeCurrencyUnit
  readonly priceCurrencyUnit: ExchangeCurrencyUnit
}

export type PricePayload = {
  readonly __typename?: "PricePayload"
  readonly errors: ReadonlyArray<Error>
  readonly price?: Maybe<Price>
}

export type PricePoint = {
  readonly __typename?: "PricePoint"
  readonly price: Price
  /** Unix timestamp (number of seconds elapsed since January 1, 1970 00:00:00 UTC) */
  readonly timestamp: Scalars["Timestamp"]
}

/** A public view of a generic wallet which stores value in one of our supported currencies. */
export type PublicWallet = {
  readonly __typename?: "PublicWallet"
  readonly id: Scalars["ID"]
  readonly walletCurrency: WalletCurrency
}

export type Query = {
  readonly __typename?: "Query"
  readonly accountDefaultWallet: PublicWallet
  readonly btcPrice?: Maybe<Price>
  readonly btcPriceList?: Maybe<ReadonlyArray<Maybe<PricePoint>>>
  readonly businessMapMarkers?: Maybe<ReadonlyArray<Maybe<MapMarker>>>
  readonly currencyList?: Maybe<ReadonlyArray<Maybe<Currency>>>
  readonly globals?: Maybe<Globals>
  readonly lnInvoicePaymentStatus: LnInvoicePaymentStatusPayload
  readonly me?: Maybe<User>
  readonly mobileVersions?: Maybe<ReadonlyArray<Maybe<MobileVersions>>>
  readonly onChainTxFee: OnChainTxFee
  readonly onChainUsdTxFee: OnChainUsdTxFee
  readonly quizQuestions?: Maybe<ReadonlyArray<Maybe<QuizQuestion>>>
  /** @deprecated will be migrated to AccountDefaultWalletId */
  readonly userDefaultWalletId: Scalars["WalletId"]
  readonly usernameAvailable?: Maybe<Scalars["Boolean"]>
}

export type QueryAccountDefaultWalletArgs = {
  username: Scalars["Username"]
  walletCurrency?: InputMaybe<WalletCurrency>
}

export type QueryBtcPriceListArgs = {
  range: PriceGraphRange
}

export type QueryLnInvoicePaymentStatusArgs = {
  input: LnInvoicePaymentStatusInput
}

export type QueryOnChainTxFeeArgs = {
  address: Scalars["OnChainAddress"]
  amount: Scalars["SatAmount"]
  targetConfirmations?: InputMaybe<Scalars["TargetConfirmations"]>
  walletId: Scalars["WalletId"]
}

export type QueryOnChainUsdTxFeeArgs = {
  address: Scalars["OnChainAddress"]
  amount: Scalars["CentAmount"]
  targetConfirmations?: InputMaybe<Scalars["TargetConfirmations"]>
  walletId: Scalars["WalletId"]
}

export type QueryUserDefaultWalletIdArgs = {
  username: Scalars["Username"]
}

export type QueryUsernameAvailableArgs = {
  username: Scalars["Username"]
}

export type QuizQuestion = {
  readonly __typename?: "QuizQuestion"
  /** The earn reward in Satoshis for the quiz question */
  readonly earnAmount: Scalars["SatAmount"]
  readonly id: Scalars["ID"]
}

export type SatAmountPayload = {
  readonly __typename?: "SatAmountPayload"
  readonly amount?: Maybe<Scalars["SatAmount"]>
  readonly errors: ReadonlyArray<Error>
}

export type SettlementVia =
  | SettlementViaIntraLedger
  | SettlementViaLn
  | SettlementViaOnChain

export type SettlementViaIntraLedger = {
  readonly __typename?: "SettlementViaIntraLedger"
  /** Settlement destination: Could be null if the payee does not have a username */
  readonly counterPartyUsername?: Maybe<Scalars["Username"]>
  readonly counterPartyWalletId?: Maybe<Scalars["WalletId"]>
}

export type SettlementViaLn = {
  readonly __typename?: "SettlementViaLn"
  /** @deprecated Shifting property to 'preImage' to improve granularity of the LnPaymentSecret type */
  readonly paymentSecret?: Maybe<Scalars["LnPaymentSecret"]>
  readonly preImage?: Maybe<Scalars["LnPaymentPreImage"]>
}

export type SettlementViaOnChain = {
  readonly __typename?: "SettlementViaOnChain"
  readonly transactionHash: Scalars["OnChainTxHash"]
}

export type Subscription = {
  readonly __typename?: "Subscription"
  readonly lnInvoicePaymentStatus: LnInvoicePaymentStatusPayload
  readonly myUpdates: MyUpdatesPayload
  readonly price: PricePayload
}

export type SubscriptionLnInvoicePaymentStatusArgs = {
  input: LnInvoicePaymentStatusInput
}

export type SubscriptionPriceArgs = {
  input: PriceInput
}

export type SuccessPayload = {
  readonly __typename?: "SuccessPayload"
  readonly errors: ReadonlyArray<Error>
  readonly success?: Maybe<Scalars["Boolean"]>
}

/**
 * Give details about an individual transaction.
 * Galoy have a smart routing system which is automatically
 * settling intraledger when both the payer and payee use the same wallet
 * therefore it's possible the transactions is being initiated onchain
 * or with lightning but settled intraledger.
 */
export type Transaction = {
  readonly __typename?: "Transaction"
  readonly createdAt: Scalars["Timestamp"]
  readonly direction: TxDirection
  readonly id: Scalars["ID"]
  /** From which protocol the payment has been initiated. */
  readonly initiationVia: InitiationVia
  readonly memo?: Maybe<Scalars["Memo"]>
  /** Amount of the settlement currency sent or received. */
  readonly settlementAmount: Scalars["SignedAmount"]
  /** Wallet currency for transaction. */
  readonly settlementCurrency: WalletCurrency
  readonly settlementFee: Scalars["SignedAmount"]
  /** Price in USDCENT/SETTLEMENTUNIT at time of settlement. */
  readonly settlementPrice: Price
  /** To which protocol the payment has settled on. */
  readonly settlementVia: SettlementVia
  readonly status: TxStatus
}

/** A connection to a list of items. */
export type TransactionConnection = {
  readonly __typename?: "TransactionConnection"
  /** A list of edges. */
  readonly edges?: Maybe<ReadonlyArray<TransactionEdge>>
  /** Information to aid in pagination. */
  readonly pageInfo: PageInfo
}

/** An edge in a connection. */
export type TransactionEdge = {
  readonly __typename?: "TransactionEdge"
  /** A cursor for use in pagination */
  readonly cursor: Scalars["String"]
  /** The item at the end of the edge */
  readonly node: Transaction
}

export type TxDirection = "RECEIVE" | "SEND"

export type TxNotificationType =
  | "IntraLedgerPayment"
  | "IntraLedgerReceipt"
  | "LnInvoicePaid"
  | "OnchainPayment"
  | "OnchainReceipt"
  | "OnchainReceiptPending"

export type TxStatus = "FAILURE" | "PENDING" | "SUCCESS"

/** A wallet belonging to an account which contains a USD balance and a list of transactions. */
export type UsdWallet = Wallet & {
  readonly __typename?: "UsdWallet"
  readonly accountId: Scalars["ID"]
  readonly balance: Scalars["SignedAmount"]
  readonly id: Scalars["ID"]
  /** An unconfirmed incoming onchain balance. */
  readonly pendingIncomingBalance: Scalars["SignedAmount"]
  readonly transactions?: Maybe<TransactionConnection>
  readonly transactionsByAddress?: Maybe<TransactionConnection>
  readonly walletCurrency: WalletCurrency
}

/** A wallet belonging to an account which contains a USD balance and a list of transactions. */
export type UsdWalletTransactionsArgs = {
  after?: InputMaybe<Scalars["String"]>
  before?: InputMaybe<Scalars["String"]>
  first?: InputMaybe<Scalars["Int"]>
  last?: InputMaybe<Scalars["Int"]>
}

/** A wallet belonging to an account which contains a USD balance and a list of transactions. */
export type UsdWalletTransactionsByAddressArgs = {
  address: Scalars["OnChainAddress"]
  after?: InputMaybe<Scalars["String"]>
  before?: InputMaybe<Scalars["String"]>
  first?: InputMaybe<Scalars["Int"]>
  last?: InputMaybe<Scalars["Int"]>
}

export type User = {
  readonly __typename?: "User"
  /**
   * Get single contact details.
   * Can include the transactions associated with the contact.
   * @deprecated will be moved to Accounts
   */
  readonly contactByUsername: UserContact
  /**
   * Get full list of contacts.
   * Can include the transactions associated with each contact.
   * @deprecated will be moved to account
   */
  readonly contacts: ReadonlyArray<UserContact>
  readonly createdAt: Scalars["Timestamp"]
  readonly defaultAccount: Account
  readonly id: Scalars["ID"]
  /**
   * Preferred language for user.
   * When value is 'default' the intent is to use preferred language from OS settings.
   */
  readonly language: Scalars["Language"]
  /** Phone number with international calling code. */
  readonly phone?: Maybe<Scalars["Phone"]>
  /**
   * List the quiz questions the user may have completed.
   * @deprecated will be moved to Accounts
   */
  readonly quizQuestions: ReadonlyArray<UserQuizQuestion>
  /**
   * Optional immutable user friendly identifier.
   * @deprecated will be moved to @Handle in Account and Wallet
   */
  readonly username?: Maybe<Scalars["Username"]>
}

export type UserContactByUsernameArgs = {
  username: Scalars["Username"]
}

export type UserContact = {
  readonly __typename?: "UserContact"
  /**
   * Alias the user can set for this contact.
   * Only the user can see the alias attached to their contact.
   */
  readonly alias?: Maybe<Scalars["ContactAlias"]>
  readonly id: Scalars["Username"]
  /** Paginated list of transactions sent to/from this contact. */
  readonly transactions?: Maybe<TransactionConnection>
  readonly transactionsCount: Scalars["Int"]
  /** Actual identifier of the contact. */
  readonly username: Scalars["Username"]
}

export type UserContactTransactionsArgs = {
  after?: InputMaybe<Scalars["String"]>
  before?: InputMaybe<Scalars["String"]>
  first?: InputMaybe<Scalars["Int"]>
  last?: InputMaybe<Scalars["Int"]>
}

export type UserContactUpdateAliasInput = {
  readonly alias: Scalars["ContactAlias"]
  readonly username: Scalars["Username"]
}

export type UserContactUpdateAliasPayload = {
  readonly __typename?: "UserContactUpdateAliasPayload"
  readonly contact?: Maybe<UserContact>
  readonly errors: ReadonlyArray<Error>
}

export type UserDeviceAccountCreateInput = {
  readonly deviceId: Scalars["String"]
}

export type UserLoginInput = {
  readonly code: Scalars["OneTimeAuthCode"]
  readonly phone: Scalars["Phone"]
}

export type UserLoginUpgrade = {
  readonly code: Scalars["OneTimeAuthCode"]
  readonly phone: Scalars["Phone"]
}

export type UserLogoutInput = {
  readonly authToken: Scalars["AuthToken"]
}

export type UserQuizQuestion = {
  readonly __typename?: "UserQuizQuestion"
  readonly completed: Scalars["Boolean"]
  readonly question: QuizQuestion
}

export type UserQuizQuestionUpdateCompletedInput = {
  readonly id: Scalars["ID"]
}

export type UserQuizQuestionUpdateCompletedPayload = {
  readonly __typename?: "UserQuizQuestionUpdateCompletedPayload"
  readonly errors: ReadonlyArray<Error>
  readonly userQuizQuestion?: Maybe<UserQuizQuestion>
}

export type UserRequestAuthCodeInput = {
  readonly channel?: InputMaybe<PhoneCodeChannelType>
  readonly phone: Scalars["Phone"]
}

export type UserUpdate = IntraLedgerUpdate | LnUpdate | OnChainUpdate | Price

export type UserUpdateLanguageInput = {
  readonly language: Scalars["Language"]
}

export type UserUpdateLanguagePayload = {
  readonly __typename?: "UserUpdateLanguagePayload"
  readonly errors: ReadonlyArray<Error>
  readonly user?: Maybe<User>
}

export type UserUpdateUsernameInput = {
  readonly username: Scalars["Username"]
}

export type UserUpdateUsernamePayload = {
  readonly __typename?: "UserUpdateUsernamePayload"
  readonly errors: ReadonlyArray<Error>
  readonly user?: Maybe<User>
}

/** A generic wallet which stores value in one of our supported currencies. */
export type Wallet = {
  readonly accountId: Scalars["ID"]
  readonly balance: Scalars["SignedAmount"]
  readonly id: Scalars["ID"]
  readonly pendingIncomingBalance: Scalars["SignedAmount"]
  /**
   * Transactions are ordered anti-chronologically,
   * ie: the newest transaction will be first
   */
  readonly transactions?: Maybe<TransactionConnection>
  /**
   * Transactions are ordered anti-chronologically,
   * ie: the newest transaction will be first
   */
  readonly transactionsByAddress?: Maybe<TransactionConnection>
  readonly walletCurrency: WalletCurrency
}

/** A generic wallet which stores value in one of our supported currencies. */
export type WalletTransactionsArgs = {
  after?: InputMaybe<Scalars["String"]>
  before?: InputMaybe<Scalars["String"]>
  first?: InputMaybe<Scalars["Int"]>
  last?: InputMaybe<Scalars["Int"]>
}

/** A generic wallet which stores value in one of our supported currencies. */
export type WalletTransactionsByAddressArgs = {
  address: Scalars["OnChainAddress"]
  after?: InputMaybe<Scalars["String"]>
  before?: InputMaybe<Scalars["String"]>
  first?: InputMaybe<Scalars["Int"]>
  last?: InputMaybe<Scalars["Int"]>
}

export type WalletCurrency = "BTC" | "USD"

export type CaptchaCreateChallengeMutationVariables = Exact<{ [key: string]: never }>

export type CaptchaCreateChallengeMutation = {
  readonly __typename?: "Mutation"
  readonly captchaCreateChallenge: {
    readonly __typename?: "CaptchaCreateChallengePayload"
    readonly errors: ReadonlyArray<{
      readonly __typename: "GraphQLApplicationError"
      readonly message: string
    }>
    readonly result?: {
      readonly __typename: "CaptchaCreateChallengeResult"
      readonly id: string
      readonly challengeCode: string
      readonly newCaptcha: boolean
      readonly failbackMode: boolean
    } | null
  }
}

export type UserContactUpdateAliasMutationVariables = Exact<{
  input: UserContactUpdateAliasInput
}>

export type UserContactUpdateAliasMutation = {
  readonly __typename?: "Mutation"
  readonly userContactUpdateAlias: {
    readonly __typename?: "UserContactUpdateAliasPayload"
    readonly errors: ReadonlyArray<{
      readonly __typename: "GraphQLApplicationError"
      readonly message: string
    }>
  }
}

export type DeviceNotificationTokenCreateMutationVariables = Exact<{
  input: DeviceNotificationTokenCreateInput
}>

export type DeviceNotificationTokenCreateMutation = {
  readonly __typename?: "Mutation"
  readonly deviceNotificationTokenCreate: {
    readonly __typename?: "SuccessPayload"
    readonly success?: boolean | null
    readonly errors: ReadonlyArray<{
      readonly __typename: "GraphQLApplicationError"
      readonly message: string
    }>
  }
}

export type IntraLedgerPaymentSendMutationVariables = Exact<{
  input: IntraLedgerPaymentSendInput
}>

export type IntraLedgerPaymentSendMutation = {
  readonly __typename?: "Mutation"
  readonly intraLedgerPaymentSend: {
    readonly __typename?: "PaymentSendPayload"
    readonly status?: PaymentSendResult | null
    readonly errors: ReadonlyArray<{
      readonly __typename: "GraphQLApplicationError"
      readonly message: string
    }>
  }
}

export type IntraLedgerUsdPaymentSendMutationVariables = Exact<{
  input: IntraLedgerUsdPaymentSendInput
}>

export type IntraLedgerUsdPaymentSendMutation = {
  readonly __typename?: "Mutation"
  readonly intraLedgerUsdPaymentSend: {
    readonly __typename?: "PaymentSendPayload"
    readonly status?: PaymentSendResult | null
    readonly errors: ReadonlyArray<{
      readonly __typename: "GraphQLApplicationError"
      readonly message: string
    }>
  }
}

export const CaptchaCreateChallengeDocument = gql`
  mutation captchaCreateChallenge {
    captchaCreateChallenge {
      errors {
        __typename
        message
      }
      result {
        __typename
        id
        challengeCode
        newCaptcha
        failbackMode
      }
    }
  }
`
export type CaptchaCreateChallengeMutationFn = Apollo.MutationFunction<
  CaptchaCreateChallengeMutation,
  CaptchaCreateChallengeMutationVariables
>

/**
 * __useCaptchaCreateChallengeMutation__
 *
 * To run a mutation, you first call `useCaptchaCreateChallengeMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useCaptchaCreateChallengeMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [captchaCreateChallengeMutation, { data, loading, error }] = useCaptchaCreateChallengeMutation({
 *   variables: {
 *   },
 * });
 */
export function useCaptchaCreateChallengeMutation(
  baseOptions?: Apollo.MutationHookOptions<
    CaptchaCreateChallengeMutation,
    CaptchaCreateChallengeMutationVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions }
  return Apollo.useMutation<
    CaptchaCreateChallengeMutation,
    CaptchaCreateChallengeMutationVariables
  >(CaptchaCreateChallengeDocument, options)
}
export type CaptchaCreateChallengeMutationHookResult = ReturnType<
  typeof useCaptchaCreateChallengeMutation
>
export type CaptchaCreateChallengeMutationResult =
  Apollo.MutationResult<CaptchaCreateChallengeMutation>
export type CaptchaCreateChallengeMutationOptions = Apollo.BaseMutationOptions<
  CaptchaCreateChallengeMutation,
  CaptchaCreateChallengeMutationVariables
>
export const UserContactUpdateAliasDocument = gql`
  mutation userContactUpdateAlias($input: UserContactUpdateAliasInput!) {
    userContactUpdateAlias(input: $input) {
      errors {
        __typename
        message
      }
    }
  }
`
export type UserContactUpdateAliasMutationFn = Apollo.MutationFunction<
  UserContactUpdateAliasMutation,
  UserContactUpdateAliasMutationVariables
>

/**
 * __useUserContactUpdateAliasMutation__
 *
 * To run a mutation, you first call `useUserContactUpdateAliasMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useUserContactUpdateAliasMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [userContactUpdateAliasMutation, { data, loading, error }] = useUserContactUpdateAliasMutation({
 *   variables: {
 *      input: // value for 'input'
 *   },
 * });
 */
export function useUserContactUpdateAliasMutation(
  baseOptions?: Apollo.MutationHookOptions<
    UserContactUpdateAliasMutation,
    UserContactUpdateAliasMutationVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions }
  return Apollo.useMutation<
    UserContactUpdateAliasMutation,
    UserContactUpdateAliasMutationVariables
  >(UserContactUpdateAliasDocument, options)
}
export type UserContactUpdateAliasMutationHookResult = ReturnType<
  typeof useUserContactUpdateAliasMutation
>
export type UserContactUpdateAliasMutationResult =
  Apollo.MutationResult<UserContactUpdateAliasMutation>
export type UserContactUpdateAliasMutationOptions = Apollo.BaseMutationOptions<
  UserContactUpdateAliasMutation,
  UserContactUpdateAliasMutationVariables
>
export const DeviceNotificationTokenCreateDocument = gql`
  mutation deviceNotificationTokenCreate($input: DeviceNotificationTokenCreateInput!) {
    deviceNotificationTokenCreate(input: $input) {
      errors {
        __typename
        message
      }
      success
    }
  }
`
export type DeviceNotificationTokenCreateMutationFn = Apollo.MutationFunction<
  DeviceNotificationTokenCreateMutation,
  DeviceNotificationTokenCreateMutationVariables
>

/**
 * __useDeviceNotificationTokenCreateMutation__
 *
 * To run a mutation, you first call `useDeviceNotificationTokenCreateMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useDeviceNotificationTokenCreateMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [deviceNotificationTokenCreateMutation, { data, loading, error }] = useDeviceNotificationTokenCreateMutation({
 *   variables: {
 *      input: // value for 'input'
 *   },
 * });
 */
export function useDeviceNotificationTokenCreateMutation(
  baseOptions?: Apollo.MutationHookOptions<
    DeviceNotificationTokenCreateMutation,
    DeviceNotificationTokenCreateMutationVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions }
  return Apollo.useMutation<
    DeviceNotificationTokenCreateMutation,
    DeviceNotificationTokenCreateMutationVariables
  >(DeviceNotificationTokenCreateDocument, options)
}
export type DeviceNotificationTokenCreateMutationHookResult = ReturnType<
  typeof useDeviceNotificationTokenCreateMutation
>
export type DeviceNotificationTokenCreateMutationResult =
  Apollo.MutationResult<DeviceNotificationTokenCreateMutation>
export type DeviceNotificationTokenCreateMutationOptions = Apollo.BaseMutationOptions<
  DeviceNotificationTokenCreateMutation,
  DeviceNotificationTokenCreateMutationVariables
>
export const IntraLedgerPaymentSendDocument = gql`
  mutation intraLedgerPaymentSend($input: IntraLedgerPaymentSendInput!) {
    intraLedgerPaymentSend(input: $input) {
      errors {
        __typename
        message
      }
      status
    }
  }
`
export type IntraLedgerPaymentSendMutationFn = Apollo.MutationFunction<
  IntraLedgerPaymentSendMutation,
  IntraLedgerPaymentSendMutationVariables
>

/**
 * __useIntraLedgerPaymentSendMutation__
 *
 * To run a mutation, you first call `useIntraLedgerPaymentSendMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useIntraLedgerPaymentSendMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [intraLedgerPaymentSendMutation, { data, loading, error }] = useIntraLedgerPaymentSendMutation({
 *   variables: {
 *      input: // value for 'input'
 *   },
 * });
 */
export function useIntraLedgerPaymentSendMutation(
  baseOptions?: Apollo.MutationHookOptions<
    IntraLedgerPaymentSendMutation,
    IntraLedgerPaymentSendMutationVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions }
  return Apollo.useMutation<
    IntraLedgerPaymentSendMutation,
    IntraLedgerPaymentSendMutationVariables
  >(IntraLedgerPaymentSendDocument, options)
}
export type IntraLedgerPaymentSendMutationHookResult = ReturnType<
  typeof useIntraLedgerPaymentSendMutation
>
export type IntraLedgerPaymentSendMutationResult =
  Apollo.MutationResult<IntraLedgerPaymentSendMutation>
export type IntraLedgerPaymentSendMutationOptions = Apollo.BaseMutationOptions<
  IntraLedgerPaymentSendMutation,
  IntraLedgerPaymentSendMutationVariables
>
export const IntraLedgerUsdPaymentSendDocument = gql`
  mutation intraLedgerUsdPaymentSend($input: IntraLedgerUsdPaymentSendInput!) {
    intraLedgerUsdPaymentSend(input: $input) {
      errors {
        __typename
        message
      }
      status
    }
  }
`
export type IntraLedgerUsdPaymentSendMutationFn = Apollo.MutationFunction<
  IntraLedgerUsdPaymentSendMutation,
  IntraLedgerUsdPaymentSendMutationVariables
>

/**
 * __useIntraLedgerUsdPaymentSendMutation__
 *
 * To run a mutation, you first call `useIntraLedgerUsdPaymentSendMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useIntraLedgerUsdPaymentSendMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [intraLedgerUsdPaymentSendMutation, { data, loading, error }] = useIntraLedgerUsdPaymentSendMutation({
 *   variables: {
 *      input: // value for 'input'
 *   },
 * });
 */
export function useIntraLedgerUsdPaymentSendMutation(
  baseOptions?: Apollo.MutationHookOptions<
    IntraLedgerUsdPaymentSendMutation,
    IntraLedgerUsdPaymentSendMutationVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions }
  return Apollo.useMutation<
    IntraLedgerUsdPaymentSendMutation,
    IntraLedgerUsdPaymentSendMutationVariables
  >(IntraLedgerUsdPaymentSendDocument, options)
}
export type IntraLedgerUsdPaymentSendMutationHookResult = ReturnType<
  typeof useIntraLedgerUsdPaymentSendMutation
>
export type IntraLedgerUsdPaymentSendMutationResult =
  Apollo.MutationResult<IntraLedgerUsdPaymentSendMutation>
export type IntraLedgerUsdPaymentSendMutationOptions = Apollo.BaseMutationOptions<
  IntraLedgerUsdPaymentSendMutation,
  IntraLedgerUsdPaymentSendMutationVariables
>

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

export type TransactionListFragment = {
  readonly __typename?: "TransactionConnection"
  readonly pageInfo: {
    readonly __typename?: "PageInfo"
    readonly hasNextPage: boolean
    readonly hasPreviousPage: boolean
    readonly startCursor?: string | null
    readonly endCursor?: string | null
  }
  readonly edges?: ReadonlyArray<{
    readonly __typename?: "TransactionEdge"
    readonly cursor: string
    readonly node: {
      readonly __typename: "Transaction"
      readonly id: string
      readonly status: TxStatus
      readonly direction: TxDirection
      readonly memo?: string | null
      readonly createdAt: number
      readonly settlementAmount: number
      readonly settlementFee: number
      readonly settlementCurrency: WalletCurrency
      readonly settlementPrice: {
        readonly __typename?: "Price"
        readonly base: number
        readonly offset: number
        readonly currencyUnit: ExchangeCurrencyUnit
        readonly formattedAmount: string
      }
      readonly initiationVia:
        | {
            readonly __typename: "InitiationViaIntraLedger"
            readonly counterPartyWalletId?: string | null
            readonly counterPartyUsername?: string | null
          }
        | { readonly __typename: "InitiationViaLn"; readonly paymentHash: string }
        | { readonly __typename: "InitiationViaOnChain"; readonly address: string }
      readonly settlementVia:
        | {
            readonly __typename: "SettlementViaIntraLedger"
            readonly counterPartyWalletId?: string | null
            readonly counterPartyUsername?: string | null
          }
        | {
            readonly __typename: "SettlementViaLn"
            readonly paymentSecret?: string | null
          }
        | {
            readonly __typename: "SettlementViaOnChain"
            readonly transactionHash: string
          }
    }
  }> | null
}

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

export type UserQuizQuestionUpdateCompletedMutationVariables = Exact<{
  input: UserQuizQuestionUpdateCompletedInput
}>

export type UserQuizQuestionUpdateCompletedMutation = {
  readonly __typename?: "Mutation"
  readonly userQuizQuestionUpdateCompleted: {
    readonly __typename?: "UserQuizQuestionUpdateCompletedPayload"
    readonly errors: ReadonlyArray<{
      readonly __typename: "GraphQLApplicationError"
      readonly message: string
    }>
    readonly userQuizQuestion?: {
      readonly __typename?: "UserQuizQuestion"
      readonly completed: boolean
      readonly question: {
        readonly __typename?: "QuizQuestion"
        readonly id: string
        readonly earnAmount: number
      }
    } | null
  }
}

export type UserUpdateUsernameMutationVariables = Exact<{
  input: UserUpdateUsernameInput
}>

export type UserUpdateUsernameMutation = {
  readonly __typename?: "Mutation"
  readonly userUpdateUsername: {
    readonly __typename?: "UserUpdateUsernamePayload"
    readonly errors: ReadonlyArray<{
      readonly __typename: "GraphQLApplicationError"
      readonly message: string
    }>
    readonly user?: {
      readonly __typename: "User"
      readonly id: string
      readonly username?: string | null
    } | null
  }
}

export type AccountUpdateDefaultWalletIdMutationVariables = Exact<{
  input: AccountUpdateDefaultWalletIdInput
}>

export type AccountUpdateDefaultWalletIdMutation = {
  readonly __typename?: "Mutation"
  readonly accountUpdateDefaultWalletId: {
    readonly __typename?: "AccountUpdateDefaultWalletIdPayload"
    readonly errors: ReadonlyArray<{
      readonly __typename: "GraphQLApplicationError"
      readonly message: string
    }>
    readonly account?: {
      readonly __typename: "ConsumerAccount"
      readonly id: string
      readonly defaultWalletId: string
    } | null
  }
}

export type CaptchaRequestAuthCodeMutationVariables = Exact<{
  input: CaptchaRequestAuthCodeInput
}>

export type CaptchaRequestAuthCodeMutation = {
  readonly __typename?: "Mutation"
  readonly captchaRequestAuthCode: {
    readonly __typename?: "SuccessPayload"
    readonly success?: boolean | null
    readonly errors: ReadonlyArray<{
      readonly __typename: "GraphQLApplicationError"
      readonly message: string
    }>
  }
}

export type LnNoAmountInvoiceFeeProbeMutationVariables = Exact<{
  input: LnNoAmountInvoiceFeeProbeInput
}>

export type LnNoAmountInvoiceFeeProbeMutation = {
  readonly __typename?: "Mutation"
  readonly lnNoAmountInvoiceFeeProbe: {
    readonly __typename?: "SatAmountPayload"
    readonly amount?: number | null
    readonly errors: ReadonlyArray<{
      readonly __typename: "GraphQLApplicationError"
      readonly message: string
    }>
  }
}

export type LnInvoiceFeeProbeMutationVariables = Exact<{
  input: LnInvoiceFeeProbeInput
}>

export type LnInvoiceFeeProbeMutation = {
  readonly __typename?: "Mutation"
  readonly lnInvoiceFeeProbe: {
    readonly __typename?: "SatAmountPayload"
    readonly amount?: number | null
    readonly errors: ReadonlyArray<{
      readonly __typename: "GraphQLApplicationError"
      readonly message: string
    }>
  }
}

export type LnUsdInvoiceFeeProbeMutationVariables = Exact<{
  input: LnUsdInvoiceFeeProbeInput
}>

export type LnUsdInvoiceFeeProbeMutation = {
  readonly __typename?: "Mutation"
  readonly lnUsdInvoiceFeeProbe: {
    readonly __typename?: "SatAmountPayload"
    readonly amount?: number | null
    readonly errors: ReadonlyArray<{
      readonly __typename: "GraphQLApplicationError"
      readonly message: string
    }>
  }
}

export type LnNoAmountUsdInvoiceFeeProbeMutationVariables = Exact<{
  input: LnNoAmountUsdInvoiceFeeProbeInput
}>

export type LnNoAmountUsdInvoiceFeeProbeMutation = {
  readonly __typename?: "Mutation"
  readonly lnNoAmountUsdInvoiceFeeProbe: {
    readonly __typename?: "CentAmountPayload"
    readonly amount?: number | null
    readonly errors: ReadonlyArray<{
      readonly __typename: "GraphQLApplicationError"
      readonly message: string
    }>
  }
}

export type UserUpdateLanguageMutationVariables = Exact<{
  input: UserUpdateLanguageInput
}>

export type UserUpdateLanguageMutation = {
  readonly __typename?: "Mutation"
  readonly userUpdateLanguage: {
    readonly __typename?: "UserUpdateLanguagePayload"
    readonly errors: ReadonlyArray<{
      readonly __typename: "GraphQLApplicationError"
      readonly message: string
    }>
    readonly user?: {
      readonly __typename: "User"
      readonly id: string
      readonly language: string
    } | null
  }
}

export type UserLoginMutationVariables = Exact<{
  input: UserLoginInput
}>

export type UserLoginMutation = {
  readonly __typename?: "Mutation"
  readonly userLogin: {
    readonly __typename?: "AuthTokenPayload"
    readonly authToken?: string | null
    readonly errors: ReadonlyArray<{
      readonly __typename: "GraphQLApplicationError"
      readonly message: string
    }>
  }
}

export type LnNoAmountInvoiceCreateMutationVariables = Exact<{
  input: LnNoAmountInvoiceCreateInput
}>

export type LnNoAmountInvoiceCreateMutation = {
  readonly __typename?: "Mutation"
  readonly lnNoAmountInvoiceCreate: {
    readonly __typename?: "LnNoAmountInvoicePayload"
    readonly errors: ReadonlyArray<{
      readonly __typename: "GraphQLApplicationError"
      readonly message: string
    }>
    readonly invoice?: {
      readonly __typename: "LnNoAmountInvoice"
      readonly paymentHash: string
      readonly paymentRequest: string
      readonly paymentSecret: string
    } | null
  }
}

export type LnInvoiceCreateMutationVariables = Exact<{
  input: LnInvoiceCreateInput
}>

export type LnInvoiceCreateMutation = {
  readonly __typename?: "Mutation"
  readonly lnInvoiceCreate: {
    readonly __typename?: "LnInvoicePayload"
    readonly errors: ReadonlyArray<{
      readonly __typename: "GraphQLApplicationError"
      readonly message: string
    }>
    readonly invoice?: {
      readonly __typename: "LnInvoice"
      readonly paymentHash: string
      readonly paymentRequest: string
      readonly paymentSecret: string
      readonly satoshis?: number | null
    } | null
  }
}

export type OnChainAddressCurrentMutationVariables = Exact<{
  input: OnChainAddressCurrentInput
}>

export type OnChainAddressCurrentMutation = {
  readonly __typename?: "Mutation"
  readonly onChainAddressCurrent: {
    readonly __typename?: "OnChainAddressPayload"
    readonly address?: string | null
    readonly errors: ReadonlyArray<{
      readonly __typename: "GraphQLApplicationError"
      readonly message: string
    }>
  }
}

export type LnUsdInvoiceCreateMutationVariables = Exact<{
  input: LnUsdInvoiceCreateInput
}>

export type LnUsdInvoiceCreateMutation = {
  readonly __typename?: "Mutation"
  readonly lnUsdInvoiceCreate: {
    readonly __typename?: "LnInvoicePayload"
    readonly errors: ReadonlyArray<{
      readonly __typename: "GraphQLApplicationError"
      readonly message: string
    }>
    readonly invoice?: {
      readonly __typename: "LnInvoice"
      readonly paymentHash: string
      readonly paymentRequest: string
      readonly paymentSecret: string
      readonly satoshis?: number | null
    } | null
  }
}

export type LnNoAmountInvoicePaymentSendMutationVariables = Exact<{
  input: LnNoAmountInvoicePaymentInput
}>

export type LnNoAmountInvoicePaymentSendMutation = {
  readonly __typename?: "Mutation"
  readonly lnNoAmountInvoicePaymentSend: {
    readonly __typename?: "PaymentSendPayload"
    readonly status?: PaymentSendResult | null
    readonly errors: ReadonlyArray<{
      readonly __typename: "GraphQLApplicationError"
      readonly message: string
    }>
  }
}

export type LnInvoicePaymentSendMutationVariables = Exact<{
  input: LnInvoicePaymentInput
}>

export type LnInvoicePaymentSendMutation = {
  readonly __typename?: "Mutation"
  readonly lnInvoicePaymentSend: {
    readonly __typename?: "PaymentSendPayload"
    readonly status?: PaymentSendResult | null
    readonly errors: ReadonlyArray<{
      readonly __typename: "GraphQLApplicationError"
      readonly message: string
    }>
  }
}

export type LnNoAmountUsdInvoicePaymentSendMutationVariables = Exact<{
  input: LnNoAmountUsdInvoicePaymentInput
}>

export type LnNoAmountUsdInvoicePaymentSendMutation = {
  readonly __typename?: "Mutation"
  readonly lnNoAmountUsdInvoicePaymentSend: {
    readonly __typename?: "PaymentSendPayload"
    readonly status?: PaymentSendResult | null
    readonly errors: ReadonlyArray<{
      readonly __typename: "GraphQLApplicationError"
      readonly message: string
    }>
  }
}

export type OnChainPaymentSendMutationVariables = Exact<{
  input: OnChainPaymentSendInput
}>

export type OnChainPaymentSendMutation = {
  readonly __typename?: "Mutation"
  readonly onChainPaymentSend: {
    readonly __typename?: "PaymentSendPayload"
    readonly status?: PaymentSendResult | null
    readonly errors: ReadonlyArray<{
      readonly __typename: "GraphQLApplicationError"
      readonly message: string
    }>
  }
}

export type TransactionListForContactQueryVariables = Exact<{
  username: Scalars["Username"]
  first?: InputMaybe<Scalars["Int"]>
  after?: InputMaybe<Scalars["String"]>
  last?: InputMaybe<Scalars["Int"]>
  before?: InputMaybe<Scalars["String"]>
}>

export type TransactionListForContactQuery = {
  readonly __typename?: "Query"
  readonly me?: {
    readonly __typename?: "User"
    readonly id: string
    readonly contactByUsername: {
      readonly __typename?: "UserContact"
      readonly transactions?: {
        readonly __typename?: "TransactionConnection"
        readonly pageInfo: {
          readonly __typename?: "PageInfo"
          readonly hasNextPage: boolean
          readonly hasPreviousPage: boolean
          readonly startCursor?: string | null
          readonly endCursor?: string | null
        }
        readonly edges?: ReadonlyArray<{
          readonly __typename?: "TransactionEdge"
          readonly cursor: string
          readonly node: {
            readonly __typename: "Transaction"
            readonly id: string
            readonly status: TxStatus
            readonly direction: TxDirection
            readonly memo?: string | null
            readonly createdAt: number
            readonly settlementAmount: number
            readonly settlementFee: number
            readonly settlementCurrency: WalletCurrency
            readonly settlementPrice: {
              readonly __typename?: "Price"
              readonly base: number
              readonly offset: number
              readonly currencyUnit: ExchangeCurrencyUnit
              readonly formattedAmount: string
            }
            readonly initiationVia:
              | {
                  readonly __typename: "InitiationViaIntraLedger"
                  readonly counterPartyWalletId?: string | null
                  readonly counterPartyUsername?: string | null
                }
              | { readonly __typename: "InitiationViaLn"; readonly paymentHash: string }
              | { readonly __typename: "InitiationViaOnChain"; readonly address: string }
            readonly settlementVia:
              | {
                  readonly __typename: "SettlementViaIntraLedger"
                  readonly counterPartyWalletId?: string | null
                  readonly counterPartyUsername?: string | null
                }
              | {
                  readonly __typename: "SettlementViaLn"
                  readonly paymentSecret?: string | null
                }
              | {
                  readonly __typename: "SettlementViaOnChain"
                  readonly transactionHash: string
                }
          }
        }> | null
      } | null
    }
  } | null
}

export type ContactsQueryVariables = Exact<{ [key: string]: never }>

export type ContactsQuery = {
  readonly __typename?: "Query"
  readonly me?: {
    readonly __typename?: "User"
    readonly id: string
    readonly contacts: ReadonlyArray<{
      readonly __typename?: "UserContact"
      readonly username: string
      readonly alias?: string | null
      readonly transactionsCount: number
    }>
  } | null
}

export type TransactionListForDefaultAccountQueryVariables = Exact<{
  first?: InputMaybe<Scalars["Int"]>
  after?: InputMaybe<Scalars["String"]>
  last?: InputMaybe<Scalars["Int"]>
  before?: InputMaybe<Scalars["String"]>
}>

export type TransactionListForDefaultAccountQuery = {
  readonly __typename?: "Query"
  readonly me?: {
    readonly __typename?: "User"
    readonly id: string
    readonly defaultAccount: {
      readonly __typename?: "ConsumerAccount"
      readonly id: string
      readonly transactions?: {
        readonly __typename?: "TransactionConnection"
        readonly pageInfo: {
          readonly __typename?: "PageInfo"
          readonly hasNextPage: boolean
          readonly hasPreviousPage: boolean
          readonly startCursor?: string | null
          readonly endCursor?: string | null
        }
        readonly edges?: ReadonlyArray<{
          readonly __typename?: "TransactionEdge"
          readonly cursor: string
          readonly node: {
            readonly __typename: "Transaction"
            readonly id: string
            readonly status: TxStatus
            readonly direction: TxDirection
            readonly memo?: string | null
            readonly createdAt: number
            readonly settlementAmount: number
            readonly settlementFee: number
            readonly settlementCurrency: WalletCurrency
            readonly settlementPrice: {
              readonly __typename?: "Price"
              readonly base: number
              readonly offset: number
              readonly currencyUnit: ExchangeCurrencyUnit
              readonly formattedAmount: string
            }
            readonly initiationVia:
              | {
                  readonly __typename: "InitiationViaIntraLedger"
                  readonly counterPartyWalletId?: string | null
                  readonly counterPartyUsername?: string | null
                }
              | { readonly __typename: "InitiationViaLn"; readonly paymentHash: string }
              | { readonly __typename: "InitiationViaOnChain"; readonly address: string }
            readonly settlementVia:
              | {
                  readonly __typename: "SettlementViaIntraLedger"
                  readonly counterPartyWalletId?: string | null
                  readonly counterPartyUsername?: string | null
                }
              | {
                  readonly __typename: "SettlementViaLn"
                  readonly paymentSecret?: string | null
                }
              | {
                  readonly __typename: "SettlementViaOnChain"
                  readonly transactionHash: string
                }
          }
        }> | null
      } | null
    }
  } | null
}

export type OnChainTxFeeQueryVariables = Exact<{
  walletId: Scalars["WalletId"]
  address: Scalars["OnChainAddress"]
  amount: Scalars["SatAmount"]
  targetConfirmations?: InputMaybe<Scalars["TargetConfirmations"]>
}>

export type OnChainTxFeeQuery = {
  readonly __typename?: "Query"
  readonly onChainTxFee: {
    readonly __typename?: "OnChainTxFee"
    readonly amount: number
    readonly targetConfirmations: number
  }
}

export type BtcPriceListQueryVariables = Exact<{
  range: PriceGraphRange
}>

export type BtcPriceListQuery = {
  readonly __typename?: "Query"
  readonly btcPriceList?: ReadonlyArray<{
    readonly __typename?: "PricePoint"
    readonly timestamp: number
    readonly price: {
      readonly __typename?: "Price"
      readonly base: number
      readonly offset: number
      readonly currencyUnit: ExchangeCurrencyUnit
      readonly formattedAmount: string
    }
  } | null> | null
}

export type MainQueryQueryVariables = Exact<{
  hasToken: Scalars["Boolean"]
}>

export type MainQueryQuery = {
  readonly __typename?: "Query"
  readonly globals?: {
    readonly __typename?: "Globals"
    readonly nodesIds: ReadonlyArray<string>
    readonly network: Network
  } | null
  readonly quizQuestions?: ReadonlyArray<{
    readonly __typename?: "QuizQuestion"
    readonly id: string
    readonly earnAmount: number
  } | null> | null
  readonly btcPrice?: {
    readonly __typename: "Price"
    readonly base: number
    readonly offset: number
    readonly currencyUnit: ExchangeCurrencyUnit
    readonly formattedAmount: string
  } | null
  readonly me?: {
    readonly __typename?: "User"
    readonly id: string
    readonly language: string
    readonly username?: string | null
    readonly phone?: string | null
    readonly quizQuestions: ReadonlyArray<{
      readonly __typename?: "UserQuizQuestion"
      readonly completed: boolean
      readonly question: {
        readonly __typename?: "QuizQuestion"
        readonly id: string
        readonly earnAmount: number
      }
    }>
    readonly defaultAccount: {
      readonly __typename?: "ConsumerAccount"
      readonly id: string
      readonly defaultWalletId: string
      readonly transactions?: {
        readonly __typename?: "TransactionConnection"
        readonly pageInfo: {
          readonly __typename?: "PageInfo"
          readonly hasNextPage: boolean
          readonly hasPreviousPage: boolean
          readonly startCursor?: string | null
          readonly endCursor?: string | null
        }
        readonly edges?: ReadonlyArray<{
          readonly __typename?: "TransactionEdge"
          readonly cursor: string
          readonly node: {
            readonly __typename: "Transaction"
            readonly id: string
            readonly status: TxStatus
            readonly direction: TxDirection
            readonly memo?: string | null
            readonly createdAt: number
            readonly settlementAmount: number
            readonly settlementFee: number
            readonly settlementCurrency: WalletCurrency
            readonly settlementPrice: {
              readonly __typename?: "Price"
              readonly base: number
              readonly offset: number
              readonly currencyUnit: ExchangeCurrencyUnit
              readonly formattedAmount: string
            }
            readonly initiationVia:
              | {
                  readonly __typename: "InitiationViaIntraLedger"
                  readonly counterPartyWalletId?: string | null
                  readonly counterPartyUsername?: string | null
                }
              | { readonly __typename: "InitiationViaLn"; readonly paymentHash: string }
              | { readonly __typename: "InitiationViaOnChain"; readonly address: string }
            readonly settlementVia:
              | {
                  readonly __typename: "SettlementViaIntraLedger"
                  readonly counterPartyWalletId?: string | null
                  readonly counterPartyUsername?: string | null
                }
              | {
                  readonly __typename: "SettlementViaLn"
                  readonly paymentSecret?: string | null
                }
              | {
                  readonly __typename: "SettlementViaOnChain"
                  readonly transactionHash: string
                }
          }
        }> | null
      } | null
      readonly wallets: ReadonlyArray<
        | {
            readonly __typename?: "BTCWallet"
            readonly id: string
            readonly balance: number
            readonly walletCurrency: WalletCurrency
          }
        | {
            readonly __typename?: "UsdWallet"
            readonly id: string
            readonly balance: number
            readonly walletCurrency: WalletCurrency
          }
      >
    }
  } | null
  readonly mobileVersions?: ReadonlyArray<{
    readonly __typename?: "MobileVersions"
    readonly platform: string
    readonly currentSupported: number
    readonly minSupported: number
  } | null> | null
}

export type AccountLimitsQueryVariables = Exact<{ [key: string]: never }>

export type AccountLimitsQuery = {
  readonly __typename?: "Query"
  readonly me?: {
    readonly __typename?: "User"
    readonly defaultAccount: {
      readonly __typename?: "ConsumerAccount"
      readonly limits: {
        readonly __typename?: "AccountLimits"
        readonly withdrawal: ReadonlyArray<{
          readonly __typename: "OneDayAccountLimit"
          readonly totalLimit: number
          readonly remainingLimit?: number | null
          readonly interval?: number | null
        }>
        readonly internalSend: ReadonlyArray<{
          readonly __typename: "OneDayAccountLimit"
          readonly totalLimit: number
          readonly remainingLimit?: number | null
          readonly interval?: number | null
        }>
        readonly convert: ReadonlyArray<{
          readonly __typename: "OneDayAccountLimit"
          readonly totalLimit: number
          readonly remainingLimit?: number | null
          readonly interval?: number | null
        }>
      }
    }
  } | null
}

export type UserDefaultWalletIdQueryVariables = Exact<{
  username: Scalars["Username"]
}>

export type UserDefaultWalletIdQuery = {
  readonly __typename?: "Query"
  readonly userDefaultWalletId: string
}

export type PriceSubscriptionVariables = Exact<{
  input: PriceInput
}>

export type PriceSubscription = {
  readonly __typename?: "Subscription"
  readonly price: {
    readonly __typename?: "PricePayload"
    readonly price?: {
      readonly __typename?: "Price"
      readonly base: number
      readonly offset: number
      readonly currencyUnit: ExchangeCurrencyUnit
      readonly formattedAmount: string
    } | null
    readonly errors: ReadonlyArray<{
      readonly __typename?: "GraphQLApplicationError"
      readonly message: string
    }>
  }
}

export type MyUpdatesSubscriptionVariables = Exact<{ [key: string]: never }>

export type MyUpdatesSubscription = {
  readonly __typename?: "Subscription"
  readonly myUpdates: {
    readonly __typename?: "MyUpdatesPayload"
    readonly errors: ReadonlyArray<{
      readonly __typename?: "GraphQLApplicationError"
      readonly message: string
    }>
    readonly update?:
      | {
          readonly __typename?: "IntraLedgerUpdate"
          readonly txNotificationType: TxNotificationType
          readonly amount: number
          readonly usdPerSat: number
          readonly type: "IntraLedgerUpdate"
        }
      | {
          readonly __typename?: "LnUpdate"
          readonly paymentHash: string
          readonly status: InvoicePaymentStatus
          readonly type: "LnUpdate"
        }
      | {
          readonly __typename?: "OnChainUpdate"
          readonly txNotificationType: TxNotificationType
          readonly txHash: string
          readonly amount: number
          readonly usdPerSat: number
          readonly type: "OnChainUpdate"
        }
      | {
          readonly __typename?: "Price"
          readonly base: number
          readonly offset: number
          readonly currencyUnit: ExchangeCurrencyUnit
          readonly formattedAmount: string
          readonly type: "Price"
        }
      | null
  }
}

export const TransactionListFragmentDoc = gql`
  fragment TransactionList on TransactionConnection {
    pageInfo {
      hasNextPage
      hasPreviousPage
      startCursor
      endCursor
    }
    edges {
      cursor
      node {
        __typename
        id
        status
        direction
        memo
        createdAt
        settlementAmount
        settlementFee
        settlementCurrency
        settlementPrice {
          base
          offset
          currencyUnit
          formattedAmount
        }
        initiationVia {
          __typename
          ... on InitiationViaIntraLedger {
            counterPartyWalletId
            counterPartyUsername
          }
          ... on InitiationViaLn {
            paymentHash
          }
          ... on InitiationViaOnChain {
            address
          }
        }
        settlementVia {
          __typename
          ... on SettlementViaIntraLedger {
            counterPartyWalletId
            counterPartyUsername
          }
          ... on SettlementViaLn {
            paymentSecret
          }
          ... on SettlementViaOnChain {
            transactionHash
          }
        }
      }
    }
  }
`
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
export const UserQuizQuestionUpdateCompletedDocument = gql`
  mutation userQuizQuestionUpdateCompleted(
    $input: UserQuizQuestionUpdateCompletedInput!
  ) {
    userQuizQuestionUpdateCompleted(input: $input) {
      errors {
        __typename
        message
      }
      userQuizQuestion {
        question {
          id
          earnAmount
        }
        completed
      }
    }
  }
`
export type UserQuizQuestionUpdateCompletedMutationFn = Apollo.MutationFunction<
  UserQuizQuestionUpdateCompletedMutation,
  UserQuizQuestionUpdateCompletedMutationVariables
>

/**
 * __useUserQuizQuestionUpdateCompletedMutation__
 *
 * To run a mutation, you first call `useUserQuizQuestionUpdateCompletedMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useUserQuizQuestionUpdateCompletedMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [userQuizQuestionUpdateCompletedMutation, { data, loading, error }] = useUserQuizQuestionUpdateCompletedMutation({
 *   variables: {
 *      input: // value for 'input'
 *   },
 * });
 */
export function useUserQuizQuestionUpdateCompletedMutation(
  baseOptions?: Apollo.MutationHookOptions<
    UserQuizQuestionUpdateCompletedMutation,
    UserQuizQuestionUpdateCompletedMutationVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions }
  return Apollo.useMutation<
    UserQuizQuestionUpdateCompletedMutation,
    UserQuizQuestionUpdateCompletedMutationVariables
  >(UserQuizQuestionUpdateCompletedDocument, options)
}
export type UserQuizQuestionUpdateCompletedMutationHookResult = ReturnType<
  typeof useUserQuizQuestionUpdateCompletedMutation
>
export type UserQuizQuestionUpdateCompletedMutationResult =
  Apollo.MutationResult<UserQuizQuestionUpdateCompletedMutation>
export type UserQuizQuestionUpdateCompletedMutationOptions = Apollo.BaseMutationOptions<
  UserQuizQuestionUpdateCompletedMutation,
  UserQuizQuestionUpdateCompletedMutationVariables
>
export const UserUpdateUsernameDocument = gql`
  mutation userUpdateUsername($input: UserUpdateUsernameInput!) {
    userUpdateUsername(input: $input) {
      errors {
        __typename
        message
      }
      user {
        __typename
        id
        username
      }
    }
  }
`
export type UserUpdateUsernameMutationFn = Apollo.MutationFunction<
  UserUpdateUsernameMutation,
  UserUpdateUsernameMutationVariables
>

/**
 * __useUserUpdateUsernameMutation__
 *
 * To run a mutation, you first call `useUserUpdateUsernameMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useUserUpdateUsernameMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [userUpdateUsernameMutation, { data, loading, error }] = useUserUpdateUsernameMutation({
 *   variables: {
 *      input: // value for 'input'
 *   },
 * });
 */
export function useUserUpdateUsernameMutation(
  baseOptions?: Apollo.MutationHookOptions<
    UserUpdateUsernameMutation,
    UserUpdateUsernameMutationVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions }
  return Apollo.useMutation<
    UserUpdateUsernameMutation,
    UserUpdateUsernameMutationVariables
  >(UserUpdateUsernameDocument, options)
}
export type UserUpdateUsernameMutationHookResult = ReturnType<
  typeof useUserUpdateUsernameMutation
>
export type UserUpdateUsernameMutationResult =
  Apollo.MutationResult<UserUpdateUsernameMutation>
export type UserUpdateUsernameMutationOptions = Apollo.BaseMutationOptions<
  UserUpdateUsernameMutation,
  UserUpdateUsernameMutationVariables
>
export const AccountUpdateDefaultWalletIdDocument = gql`
  mutation accountUpdateDefaultWalletId($input: AccountUpdateDefaultWalletIdInput!) {
    accountUpdateDefaultWalletId(input: $input) {
      errors {
        __typename
        message
      }
      account {
        __typename
        id
        defaultWalletId
      }
    }
  }
`
export type AccountUpdateDefaultWalletIdMutationFn = Apollo.MutationFunction<
  AccountUpdateDefaultWalletIdMutation,
  AccountUpdateDefaultWalletIdMutationVariables
>

/**
 * __useAccountUpdateDefaultWalletIdMutation__
 *
 * To run a mutation, you first call `useAccountUpdateDefaultWalletIdMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useAccountUpdateDefaultWalletIdMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [accountUpdateDefaultWalletIdMutation, { data, loading, error }] = useAccountUpdateDefaultWalletIdMutation({
 *   variables: {
 *      input: // value for 'input'
 *   },
 * });
 */
export function useAccountUpdateDefaultWalletIdMutation(
  baseOptions?: Apollo.MutationHookOptions<
    AccountUpdateDefaultWalletIdMutation,
    AccountUpdateDefaultWalletIdMutationVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions }
  return Apollo.useMutation<
    AccountUpdateDefaultWalletIdMutation,
    AccountUpdateDefaultWalletIdMutationVariables
  >(AccountUpdateDefaultWalletIdDocument, options)
}
export type AccountUpdateDefaultWalletIdMutationHookResult = ReturnType<
  typeof useAccountUpdateDefaultWalletIdMutation
>
export type AccountUpdateDefaultWalletIdMutationResult =
  Apollo.MutationResult<AccountUpdateDefaultWalletIdMutation>
export type AccountUpdateDefaultWalletIdMutationOptions = Apollo.BaseMutationOptions<
  AccountUpdateDefaultWalletIdMutation,
  AccountUpdateDefaultWalletIdMutationVariables
>
export const CaptchaRequestAuthCodeDocument = gql`
  mutation captchaRequestAuthCode($input: CaptchaRequestAuthCodeInput!) {
    captchaRequestAuthCode(input: $input) {
      errors {
        __typename
        message
      }
      success
    }
  }
`
export type CaptchaRequestAuthCodeMutationFn = Apollo.MutationFunction<
  CaptchaRequestAuthCodeMutation,
  CaptchaRequestAuthCodeMutationVariables
>

/**
 * __useCaptchaRequestAuthCodeMutation__
 *
 * To run a mutation, you first call `useCaptchaRequestAuthCodeMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useCaptchaRequestAuthCodeMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [captchaRequestAuthCodeMutation, { data, loading, error }] = useCaptchaRequestAuthCodeMutation({
 *   variables: {
 *      input: // value for 'input'
 *   },
 * });
 */
export function useCaptchaRequestAuthCodeMutation(
  baseOptions?: Apollo.MutationHookOptions<
    CaptchaRequestAuthCodeMutation,
    CaptchaRequestAuthCodeMutationVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions }
  return Apollo.useMutation<
    CaptchaRequestAuthCodeMutation,
    CaptchaRequestAuthCodeMutationVariables
  >(CaptchaRequestAuthCodeDocument, options)
}
export type CaptchaRequestAuthCodeMutationHookResult = ReturnType<
  typeof useCaptchaRequestAuthCodeMutation
>
export type CaptchaRequestAuthCodeMutationResult =
  Apollo.MutationResult<CaptchaRequestAuthCodeMutation>
export type CaptchaRequestAuthCodeMutationOptions = Apollo.BaseMutationOptions<
  CaptchaRequestAuthCodeMutation,
  CaptchaRequestAuthCodeMutationVariables
>
export const LnNoAmountInvoiceFeeProbeDocument = gql`
  mutation lnNoAmountInvoiceFeeProbe($input: LnNoAmountInvoiceFeeProbeInput!) {
    lnNoAmountInvoiceFeeProbe(input: $input) {
      errors {
        __typename
        message
      }
      amount
    }
  }
`
export type LnNoAmountInvoiceFeeProbeMutationFn = Apollo.MutationFunction<
  LnNoAmountInvoiceFeeProbeMutation,
  LnNoAmountInvoiceFeeProbeMutationVariables
>

/**
 * __useLnNoAmountInvoiceFeeProbeMutation__
 *
 * To run a mutation, you first call `useLnNoAmountInvoiceFeeProbeMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useLnNoAmountInvoiceFeeProbeMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [lnNoAmountInvoiceFeeProbeMutation, { data, loading, error }] = useLnNoAmountInvoiceFeeProbeMutation({
 *   variables: {
 *      input: // value for 'input'
 *   },
 * });
 */
export function useLnNoAmountInvoiceFeeProbeMutation(
  baseOptions?: Apollo.MutationHookOptions<
    LnNoAmountInvoiceFeeProbeMutation,
    LnNoAmountInvoiceFeeProbeMutationVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions }
  return Apollo.useMutation<
    LnNoAmountInvoiceFeeProbeMutation,
    LnNoAmountInvoiceFeeProbeMutationVariables
  >(LnNoAmountInvoiceFeeProbeDocument, options)
}
export type LnNoAmountInvoiceFeeProbeMutationHookResult = ReturnType<
  typeof useLnNoAmountInvoiceFeeProbeMutation
>
export type LnNoAmountInvoiceFeeProbeMutationResult =
  Apollo.MutationResult<LnNoAmountInvoiceFeeProbeMutation>
export type LnNoAmountInvoiceFeeProbeMutationOptions = Apollo.BaseMutationOptions<
  LnNoAmountInvoiceFeeProbeMutation,
  LnNoAmountInvoiceFeeProbeMutationVariables
>
export const LnInvoiceFeeProbeDocument = gql`
  mutation lnInvoiceFeeProbe($input: LnInvoiceFeeProbeInput!) {
    lnInvoiceFeeProbe(input: $input) {
      errors {
        __typename
        message
      }
      amount
    }
  }
`
export type LnInvoiceFeeProbeMutationFn = Apollo.MutationFunction<
  LnInvoiceFeeProbeMutation,
  LnInvoiceFeeProbeMutationVariables
>

/**
 * __useLnInvoiceFeeProbeMutation__
 *
 * To run a mutation, you first call `useLnInvoiceFeeProbeMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useLnInvoiceFeeProbeMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [lnInvoiceFeeProbeMutation, { data, loading, error }] = useLnInvoiceFeeProbeMutation({
 *   variables: {
 *      input: // value for 'input'
 *   },
 * });
 */
export function useLnInvoiceFeeProbeMutation(
  baseOptions?: Apollo.MutationHookOptions<
    LnInvoiceFeeProbeMutation,
    LnInvoiceFeeProbeMutationVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions }
  return Apollo.useMutation<
    LnInvoiceFeeProbeMutation,
    LnInvoiceFeeProbeMutationVariables
  >(LnInvoiceFeeProbeDocument, options)
}
export type LnInvoiceFeeProbeMutationHookResult = ReturnType<
  typeof useLnInvoiceFeeProbeMutation
>
export type LnInvoiceFeeProbeMutationResult =
  Apollo.MutationResult<LnInvoiceFeeProbeMutation>
export type LnInvoiceFeeProbeMutationOptions = Apollo.BaseMutationOptions<
  LnInvoiceFeeProbeMutation,
  LnInvoiceFeeProbeMutationVariables
>
export const LnUsdInvoiceFeeProbeDocument = gql`
  mutation lnUsdInvoiceFeeProbe($input: LnUsdInvoiceFeeProbeInput!) {
    lnUsdInvoiceFeeProbe(input: $input) {
      errors {
        __typename
        message
      }
      amount
    }
  }
`
export type LnUsdInvoiceFeeProbeMutationFn = Apollo.MutationFunction<
  LnUsdInvoiceFeeProbeMutation,
  LnUsdInvoiceFeeProbeMutationVariables
>

/**
 * __useLnUsdInvoiceFeeProbeMutation__
 *
 * To run a mutation, you first call `useLnUsdInvoiceFeeProbeMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useLnUsdInvoiceFeeProbeMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [lnUsdInvoiceFeeProbeMutation, { data, loading, error }] = useLnUsdInvoiceFeeProbeMutation({
 *   variables: {
 *      input: // value for 'input'
 *   },
 * });
 */
export function useLnUsdInvoiceFeeProbeMutation(
  baseOptions?: Apollo.MutationHookOptions<
    LnUsdInvoiceFeeProbeMutation,
    LnUsdInvoiceFeeProbeMutationVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions }
  return Apollo.useMutation<
    LnUsdInvoiceFeeProbeMutation,
    LnUsdInvoiceFeeProbeMutationVariables
  >(LnUsdInvoiceFeeProbeDocument, options)
}
export type LnUsdInvoiceFeeProbeMutationHookResult = ReturnType<
  typeof useLnUsdInvoiceFeeProbeMutation
>
export type LnUsdInvoiceFeeProbeMutationResult =
  Apollo.MutationResult<LnUsdInvoiceFeeProbeMutation>
export type LnUsdInvoiceFeeProbeMutationOptions = Apollo.BaseMutationOptions<
  LnUsdInvoiceFeeProbeMutation,
  LnUsdInvoiceFeeProbeMutationVariables
>
export const LnNoAmountUsdInvoiceFeeProbeDocument = gql`
  mutation lnNoAmountUsdInvoiceFeeProbe($input: LnNoAmountUsdInvoiceFeeProbeInput!) {
    lnNoAmountUsdInvoiceFeeProbe(input: $input) {
      errors {
        __typename
        message
      }
      amount
    }
  }
`
export type LnNoAmountUsdInvoiceFeeProbeMutationFn = Apollo.MutationFunction<
  LnNoAmountUsdInvoiceFeeProbeMutation,
  LnNoAmountUsdInvoiceFeeProbeMutationVariables
>

/**
 * __useLnNoAmountUsdInvoiceFeeProbeMutation__
 *
 * To run a mutation, you first call `useLnNoAmountUsdInvoiceFeeProbeMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useLnNoAmountUsdInvoiceFeeProbeMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [lnNoAmountUsdInvoiceFeeProbeMutation, { data, loading, error }] = useLnNoAmountUsdInvoiceFeeProbeMutation({
 *   variables: {
 *      input: // value for 'input'
 *   },
 * });
 */
export function useLnNoAmountUsdInvoiceFeeProbeMutation(
  baseOptions?: Apollo.MutationHookOptions<
    LnNoAmountUsdInvoiceFeeProbeMutation,
    LnNoAmountUsdInvoiceFeeProbeMutationVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions }
  return Apollo.useMutation<
    LnNoAmountUsdInvoiceFeeProbeMutation,
    LnNoAmountUsdInvoiceFeeProbeMutationVariables
  >(LnNoAmountUsdInvoiceFeeProbeDocument, options)
}
export type LnNoAmountUsdInvoiceFeeProbeMutationHookResult = ReturnType<
  typeof useLnNoAmountUsdInvoiceFeeProbeMutation
>
export type LnNoAmountUsdInvoiceFeeProbeMutationResult =
  Apollo.MutationResult<LnNoAmountUsdInvoiceFeeProbeMutation>
export type LnNoAmountUsdInvoiceFeeProbeMutationOptions = Apollo.BaseMutationOptions<
  LnNoAmountUsdInvoiceFeeProbeMutation,
  LnNoAmountUsdInvoiceFeeProbeMutationVariables
>
export const UserUpdateLanguageDocument = gql`
  mutation userUpdateLanguage($input: UserUpdateLanguageInput!) {
    userUpdateLanguage(input: $input) {
      errors {
        __typename
        message
      }
      user {
        __typename
        id
        language
      }
    }
  }
`
export type UserUpdateLanguageMutationFn = Apollo.MutationFunction<
  UserUpdateLanguageMutation,
  UserUpdateLanguageMutationVariables
>

/**
 * __useUserUpdateLanguageMutation__
 *
 * To run a mutation, you first call `useUserUpdateLanguageMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useUserUpdateLanguageMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [userUpdateLanguageMutation, { data, loading, error }] = useUserUpdateLanguageMutation({
 *   variables: {
 *      input: // value for 'input'
 *   },
 * });
 */
export function useUserUpdateLanguageMutation(
  baseOptions?: Apollo.MutationHookOptions<
    UserUpdateLanguageMutation,
    UserUpdateLanguageMutationVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions }
  return Apollo.useMutation<
    UserUpdateLanguageMutation,
    UserUpdateLanguageMutationVariables
  >(UserUpdateLanguageDocument, options)
}
export type UserUpdateLanguageMutationHookResult = ReturnType<
  typeof useUserUpdateLanguageMutation
>
export type UserUpdateLanguageMutationResult =
  Apollo.MutationResult<UserUpdateLanguageMutation>
export type UserUpdateLanguageMutationOptions = Apollo.BaseMutationOptions<
  UserUpdateLanguageMutation,
  UserUpdateLanguageMutationVariables
>
export const UserLoginDocument = gql`
  mutation userLogin($input: UserLoginInput!) {
    userLogin(input: $input) {
      errors {
        __typename
        message
      }
      authToken
    }
  }
`
export type UserLoginMutationFn = Apollo.MutationFunction<
  UserLoginMutation,
  UserLoginMutationVariables
>

/**
 * __useUserLoginMutation__
 *
 * To run a mutation, you first call `useUserLoginMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useUserLoginMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [userLoginMutation, { data, loading, error }] = useUserLoginMutation({
 *   variables: {
 *      input: // value for 'input'
 *   },
 * });
 */
export function useUserLoginMutation(
  baseOptions?: Apollo.MutationHookOptions<UserLoginMutation, UserLoginMutationVariables>,
) {
  const options = { ...defaultOptions, ...baseOptions }
  return Apollo.useMutation<UserLoginMutation, UserLoginMutationVariables>(
    UserLoginDocument,
    options,
  )
}
export type UserLoginMutationHookResult = ReturnType<typeof useUserLoginMutation>
export type UserLoginMutationResult = Apollo.MutationResult<UserLoginMutation>
export type UserLoginMutationOptions = Apollo.BaseMutationOptions<
  UserLoginMutation,
  UserLoginMutationVariables
>
export const LnNoAmountInvoiceCreateDocument = gql`
  mutation lnNoAmountInvoiceCreate($input: LnNoAmountInvoiceCreateInput!) {
    lnNoAmountInvoiceCreate(input: $input) {
      errors {
        __typename
        message
      }
      invoice {
        __typename
        paymentHash
        paymentRequest
        paymentSecret
      }
    }
  }
`
export type LnNoAmountInvoiceCreateMutationFn = Apollo.MutationFunction<
  LnNoAmountInvoiceCreateMutation,
  LnNoAmountInvoiceCreateMutationVariables
>

/**
 * __useLnNoAmountInvoiceCreateMutation__
 *
 * To run a mutation, you first call `useLnNoAmountInvoiceCreateMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useLnNoAmountInvoiceCreateMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [lnNoAmountInvoiceCreateMutation, { data, loading, error }] = useLnNoAmountInvoiceCreateMutation({
 *   variables: {
 *      input: // value for 'input'
 *   },
 * });
 */
export function useLnNoAmountInvoiceCreateMutation(
  baseOptions?: Apollo.MutationHookOptions<
    LnNoAmountInvoiceCreateMutation,
    LnNoAmountInvoiceCreateMutationVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions }
  return Apollo.useMutation<
    LnNoAmountInvoiceCreateMutation,
    LnNoAmountInvoiceCreateMutationVariables
  >(LnNoAmountInvoiceCreateDocument, options)
}
export type LnNoAmountInvoiceCreateMutationHookResult = ReturnType<
  typeof useLnNoAmountInvoiceCreateMutation
>
export type LnNoAmountInvoiceCreateMutationResult =
  Apollo.MutationResult<LnNoAmountInvoiceCreateMutation>
export type LnNoAmountInvoiceCreateMutationOptions = Apollo.BaseMutationOptions<
  LnNoAmountInvoiceCreateMutation,
  LnNoAmountInvoiceCreateMutationVariables
>
export const LnInvoiceCreateDocument = gql`
  mutation lnInvoiceCreate($input: LnInvoiceCreateInput!) {
    lnInvoiceCreate(input: $input) {
      errors {
        __typename
        message
      }
      invoice {
        __typename
        paymentHash
        paymentRequest
        paymentSecret
        satoshis
      }
    }
  }
`
export type LnInvoiceCreateMutationFn = Apollo.MutationFunction<
  LnInvoiceCreateMutation,
  LnInvoiceCreateMutationVariables
>

/**
 * __useLnInvoiceCreateMutation__
 *
 * To run a mutation, you first call `useLnInvoiceCreateMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useLnInvoiceCreateMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [lnInvoiceCreateMutation, { data, loading, error }] = useLnInvoiceCreateMutation({
 *   variables: {
 *      input: // value for 'input'
 *   },
 * });
 */
export function useLnInvoiceCreateMutation(
  baseOptions?: Apollo.MutationHookOptions<
    LnInvoiceCreateMutation,
    LnInvoiceCreateMutationVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions }
  return Apollo.useMutation<LnInvoiceCreateMutation, LnInvoiceCreateMutationVariables>(
    LnInvoiceCreateDocument,
    options,
  )
}
export type LnInvoiceCreateMutationHookResult = ReturnType<
  typeof useLnInvoiceCreateMutation
>
export type LnInvoiceCreateMutationResult = Apollo.MutationResult<LnInvoiceCreateMutation>
export type LnInvoiceCreateMutationOptions = Apollo.BaseMutationOptions<
  LnInvoiceCreateMutation,
  LnInvoiceCreateMutationVariables
>
export const OnChainAddressCurrentDocument = gql`
  mutation onChainAddressCurrent($input: OnChainAddressCurrentInput!) {
    onChainAddressCurrent(input: $input) {
      errors {
        __typename
        message
      }
      address
    }
  }
`
export type OnChainAddressCurrentMutationFn = Apollo.MutationFunction<
  OnChainAddressCurrentMutation,
  OnChainAddressCurrentMutationVariables
>

/**
 * __useOnChainAddressCurrentMutation__
 *
 * To run a mutation, you first call `useOnChainAddressCurrentMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useOnChainAddressCurrentMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [onChainAddressCurrentMutation, { data, loading, error }] = useOnChainAddressCurrentMutation({
 *   variables: {
 *      input: // value for 'input'
 *   },
 * });
 */
export function useOnChainAddressCurrentMutation(
  baseOptions?: Apollo.MutationHookOptions<
    OnChainAddressCurrentMutation,
    OnChainAddressCurrentMutationVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions }
  return Apollo.useMutation<
    OnChainAddressCurrentMutation,
    OnChainAddressCurrentMutationVariables
  >(OnChainAddressCurrentDocument, options)
}
export type OnChainAddressCurrentMutationHookResult = ReturnType<
  typeof useOnChainAddressCurrentMutation
>
export type OnChainAddressCurrentMutationResult =
  Apollo.MutationResult<OnChainAddressCurrentMutation>
export type OnChainAddressCurrentMutationOptions = Apollo.BaseMutationOptions<
  OnChainAddressCurrentMutation,
  OnChainAddressCurrentMutationVariables
>
export const LnUsdInvoiceCreateDocument = gql`
  mutation lnUsdInvoiceCreate($input: LnUsdInvoiceCreateInput!) {
    lnUsdInvoiceCreate(input: $input) {
      errors {
        __typename
        message
      }
      invoice {
        __typename
        paymentHash
        paymentRequest
        paymentSecret
        satoshis
      }
    }
  }
`
export type LnUsdInvoiceCreateMutationFn = Apollo.MutationFunction<
  LnUsdInvoiceCreateMutation,
  LnUsdInvoiceCreateMutationVariables
>

/**
 * __useLnUsdInvoiceCreateMutation__
 *
 * To run a mutation, you first call `useLnUsdInvoiceCreateMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useLnUsdInvoiceCreateMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [lnUsdInvoiceCreateMutation, { data, loading, error }] = useLnUsdInvoiceCreateMutation({
 *   variables: {
 *      input: // value for 'input'
 *   },
 * });
 */
export function useLnUsdInvoiceCreateMutation(
  baseOptions?: Apollo.MutationHookOptions<
    LnUsdInvoiceCreateMutation,
    LnUsdInvoiceCreateMutationVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions }
  return Apollo.useMutation<
    LnUsdInvoiceCreateMutation,
    LnUsdInvoiceCreateMutationVariables
  >(LnUsdInvoiceCreateDocument, options)
}
export type LnUsdInvoiceCreateMutationHookResult = ReturnType<
  typeof useLnUsdInvoiceCreateMutation
>
export type LnUsdInvoiceCreateMutationResult =
  Apollo.MutationResult<LnUsdInvoiceCreateMutation>
export type LnUsdInvoiceCreateMutationOptions = Apollo.BaseMutationOptions<
  LnUsdInvoiceCreateMutation,
  LnUsdInvoiceCreateMutationVariables
>
export const LnNoAmountInvoicePaymentSendDocument = gql`
  mutation lnNoAmountInvoicePaymentSend($input: LnNoAmountInvoicePaymentInput!) {
    lnNoAmountInvoicePaymentSend(input: $input) {
      errors {
        __typename
        message
      }
      status
    }
  }
`
export type LnNoAmountInvoicePaymentSendMutationFn = Apollo.MutationFunction<
  LnNoAmountInvoicePaymentSendMutation,
  LnNoAmountInvoicePaymentSendMutationVariables
>

/**
 * __useLnNoAmountInvoicePaymentSendMutation__
 *
 * To run a mutation, you first call `useLnNoAmountInvoicePaymentSendMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useLnNoAmountInvoicePaymentSendMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [lnNoAmountInvoicePaymentSendMutation, { data, loading, error }] = useLnNoAmountInvoicePaymentSendMutation({
 *   variables: {
 *      input: // value for 'input'
 *   },
 * });
 */
export function useLnNoAmountInvoicePaymentSendMutation(
  baseOptions?: Apollo.MutationHookOptions<
    LnNoAmountInvoicePaymentSendMutation,
    LnNoAmountInvoicePaymentSendMutationVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions }
  return Apollo.useMutation<
    LnNoAmountInvoicePaymentSendMutation,
    LnNoAmountInvoicePaymentSendMutationVariables
  >(LnNoAmountInvoicePaymentSendDocument, options)
}
export type LnNoAmountInvoicePaymentSendMutationHookResult = ReturnType<
  typeof useLnNoAmountInvoicePaymentSendMutation
>
export type LnNoAmountInvoicePaymentSendMutationResult =
  Apollo.MutationResult<LnNoAmountInvoicePaymentSendMutation>
export type LnNoAmountInvoicePaymentSendMutationOptions = Apollo.BaseMutationOptions<
  LnNoAmountInvoicePaymentSendMutation,
  LnNoAmountInvoicePaymentSendMutationVariables
>
export const LnInvoicePaymentSendDocument = gql`
  mutation lnInvoicePaymentSend($input: LnInvoicePaymentInput!) {
    lnInvoicePaymentSend(input: $input) {
      errors {
        __typename
        message
      }
      status
    }
  }
`
export type LnInvoicePaymentSendMutationFn = Apollo.MutationFunction<
  LnInvoicePaymentSendMutation,
  LnInvoicePaymentSendMutationVariables
>

/**
 * __useLnInvoicePaymentSendMutation__
 *
 * To run a mutation, you first call `useLnInvoicePaymentSendMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useLnInvoicePaymentSendMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [lnInvoicePaymentSendMutation, { data, loading, error }] = useLnInvoicePaymentSendMutation({
 *   variables: {
 *      input: // value for 'input'
 *   },
 * });
 */
export function useLnInvoicePaymentSendMutation(
  baseOptions?: Apollo.MutationHookOptions<
    LnInvoicePaymentSendMutation,
    LnInvoicePaymentSendMutationVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions }
  return Apollo.useMutation<
    LnInvoicePaymentSendMutation,
    LnInvoicePaymentSendMutationVariables
  >(LnInvoicePaymentSendDocument, options)
}
export type LnInvoicePaymentSendMutationHookResult = ReturnType<
  typeof useLnInvoicePaymentSendMutation
>
export type LnInvoicePaymentSendMutationResult =
  Apollo.MutationResult<LnInvoicePaymentSendMutation>
export type LnInvoicePaymentSendMutationOptions = Apollo.BaseMutationOptions<
  LnInvoicePaymentSendMutation,
  LnInvoicePaymentSendMutationVariables
>
export const LnNoAmountUsdInvoicePaymentSendDocument = gql`
  mutation lnNoAmountUsdInvoicePaymentSend($input: LnNoAmountUsdInvoicePaymentInput!) {
    lnNoAmountUsdInvoicePaymentSend(input: $input) {
      errors {
        __typename
        message
      }
      status
    }
  }
`
export type LnNoAmountUsdInvoicePaymentSendMutationFn = Apollo.MutationFunction<
  LnNoAmountUsdInvoicePaymentSendMutation,
  LnNoAmountUsdInvoicePaymentSendMutationVariables
>

/**
 * __useLnNoAmountUsdInvoicePaymentSendMutation__
 *
 * To run a mutation, you first call `useLnNoAmountUsdInvoicePaymentSendMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useLnNoAmountUsdInvoicePaymentSendMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [lnNoAmountUsdInvoicePaymentSendMutation, { data, loading, error }] = useLnNoAmountUsdInvoicePaymentSendMutation({
 *   variables: {
 *      input: // value for 'input'
 *   },
 * });
 */
export function useLnNoAmountUsdInvoicePaymentSendMutation(
  baseOptions?: Apollo.MutationHookOptions<
    LnNoAmountUsdInvoicePaymentSendMutation,
    LnNoAmountUsdInvoicePaymentSendMutationVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions }
  return Apollo.useMutation<
    LnNoAmountUsdInvoicePaymentSendMutation,
    LnNoAmountUsdInvoicePaymentSendMutationVariables
  >(LnNoAmountUsdInvoicePaymentSendDocument, options)
}
export type LnNoAmountUsdInvoicePaymentSendMutationHookResult = ReturnType<
  typeof useLnNoAmountUsdInvoicePaymentSendMutation
>
export type LnNoAmountUsdInvoicePaymentSendMutationResult =
  Apollo.MutationResult<LnNoAmountUsdInvoicePaymentSendMutation>
export type LnNoAmountUsdInvoicePaymentSendMutationOptions = Apollo.BaseMutationOptions<
  LnNoAmountUsdInvoicePaymentSendMutation,
  LnNoAmountUsdInvoicePaymentSendMutationVariables
>
export const OnChainPaymentSendDocument = gql`
  mutation onChainPaymentSend($input: OnChainPaymentSendInput!) {
    onChainPaymentSend(input: $input) {
      errors {
        __typename
        message
      }
      status
    }
  }
`
export type OnChainPaymentSendMutationFn = Apollo.MutationFunction<
  OnChainPaymentSendMutation,
  OnChainPaymentSendMutationVariables
>

/**
 * __useOnChainPaymentSendMutation__
 *
 * To run a mutation, you first call `useOnChainPaymentSendMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useOnChainPaymentSendMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [onChainPaymentSendMutation, { data, loading, error }] = useOnChainPaymentSendMutation({
 *   variables: {
 *      input: // value for 'input'
 *   },
 * });
 */
export function useOnChainPaymentSendMutation(
  baseOptions?: Apollo.MutationHookOptions<
    OnChainPaymentSendMutation,
    OnChainPaymentSendMutationVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions }
  return Apollo.useMutation<
    OnChainPaymentSendMutation,
    OnChainPaymentSendMutationVariables
  >(OnChainPaymentSendDocument, options)
}
export type OnChainPaymentSendMutationHookResult = ReturnType<
  typeof useOnChainPaymentSendMutation
>
export type OnChainPaymentSendMutationResult =
  Apollo.MutationResult<OnChainPaymentSendMutation>
export type OnChainPaymentSendMutationOptions = Apollo.BaseMutationOptions<
  OnChainPaymentSendMutation,
  OnChainPaymentSendMutationVariables
>
export const TransactionListForContactDocument = gql`
  query transactionListForContact(
    $username: Username!
    $first: Int
    $after: String
    $last: Int
    $before: String
  ) {
    me {
      id
      contactByUsername(username: $username) {
        transactions(first: $first, after: $after, last: $last, before: $before) {
          ...TransactionList
        }
      }
    }
  }
  ${TransactionListFragmentDoc}
`

/**
 * __useTransactionListForContactQuery__
 *
 * To run a query within a React component, call `useTransactionListForContactQuery` and pass it any options that fit your needs.
 * When your component renders, `useTransactionListForContactQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useTransactionListForContactQuery({
 *   variables: {
 *      username: // value for 'username'
 *      first: // value for 'first'
 *      after: // value for 'after'
 *      last: // value for 'last'
 *      before: // value for 'before'
 *   },
 * });
 */
export function useTransactionListForContactQuery(
  baseOptions: Apollo.QueryHookOptions<
    TransactionListForContactQuery,
    TransactionListForContactQueryVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions }
  return Apollo.useQuery<
    TransactionListForContactQuery,
    TransactionListForContactQueryVariables
  >(TransactionListForContactDocument, options)
}
export function useTransactionListForContactLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    TransactionListForContactQuery,
    TransactionListForContactQueryVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions }
  return Apollo.useLazyQuery<
    TransactionListForContactQuery,
    TransactionListForContactQueryVariables
  >(TransactionListForContactDocument, options)
}
export type TransactionListForContactQueryHookResult = ReturnType<
  typeof useTransactionListForContactQuery
>
export type TransactionListForContactLazyQueryHookResult = ReturnType<
  typeof useTransactionListForContactLazyQuery
>
export type TransactionListForContactQueryResult = Apollo.QueryResult<
  TransactionListForContactQuery,
  TransactionListForContactQueryVariables
>
export const ContactsDocument = gql`
  query contacts {
    me {
      id
      contacts {
        username
        alias
        transactionsCount
      }
    }
  }
`

/**
 * __useContactsQuery__
 *
 * To run a query within a React component, call `useContactsQuery` and pass it any options that fit your needs.
 * When your component renders, `useContactsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useContactsQuery({
 *   variables: {
 *   },
 * });
 */
export function useContactsQuery(
  baseOptions?: Apollo.QueryHookOptions<ContactsQuery, ContactsQueryVariables>,
) {
  const options = { ...defaultOptions, ...baseOptions }
  return Apollo.useQuery<ContactsQuery, ContactsQueryVariables>(ContactsDocument, options)
}
export function useContactsLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<ContactsQuery, ContactsQueryVariables>,
) {
  const options = { ...defaultOptions, ...baseOptions }
  return Apollo.useLazyQuery<ContactsQuery, ContactsQueryVariables>(
    ContactsDocument,
    options,
  )
}
export type ContactsQueryHookResult = ReturnType<typeof useContactsQuery>
export type ContactsLazyQueryHookResult = ReturnType<typeof useContactsLazyQuery>
export type ContactsQueryResult = Apollo.QueryResult<
  ContactsQuery,
  ContactsQueryVariables
>
export const TransactionListForDefaultAccountDocument = gql`
  query transactionListForDefaultAccount(
    $first: Int
    $after: String
    $last: Int
    $before: String
  ) {
    me {
      id
      defaultAccount {
        id
        transactions(first: $first, after: $after, last: $last, before: $before) {
          ...TransactionList
        }
      }
    }
  }
  ${TransactionListFragmentDoc}
`

/**
 * __useTransactionListForDefaultAccountQuery__
 *
 * To run a query within a React component, call `useTransactionListForDefaultAccountQuery` and pass it any options that fit your needs.
 * When your component renders, `useTransactionListForDefaultAccountQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useTransactionListForDefaultAccountQuery({
 *   variables: {
 *      first: // value for 'first'
 *      after: // value for 'after'
 *      last: // value for 'last'
 *      before: // value for 'before'
 *   },
 * });
 */
export function useTransactionListForDefaultAccountQuery(
  baseOptions?: Apollo.QueryHookOptions<
    TransactionListForDefaultAccountQuery,
    TransactionListForDefaultAccountQueryVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions }
  return Apollo.useQuery<
    TransactionListForDefaultAccountQuery,
    TransactionListForDefaultAccountQueryVariables
  >(TransactionListForDefaultAccountDocument, options)
}
export function useTransactionListForDefaultAccountLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    TransactionListForDefaultAccountQuery,
    TransactionListForDefaultAccountQueryVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions }
  return Apollo.useLazyQuery<
    TransactionListForDefaultAccountQuery,
    TransactionListForDefaultAccountQueryVariables
  >(TransactionListForDefaultAccountDocument, options)
}
export type TransactionListForDefaultAccountQueryHookResult = ReturnType<
  typeof useTransactionListForDefaultAccountQuery
>
export type TransactionListForDefaultAccountLazyQueryHookResult = ReturnType<
  typeof useTransactionListForDefaultAccountLazyQuery
>
export type TransactionListForDefaultAccountQueryResult = Apollo.QueryResult<
  TransactionListForDefaultAccountQuery,
  TransactionListForDefaultAccountQueryVariables
>
export const OnChainTxFeeDocument = gql`
  query onChainTxFee(
    $walletId: WalletId!
    $address: OnChainAddress!
    $amount: SatAmount!
    $targetConfirmations: TargetConfirmations
  ) {
    onChainTxFee(
      walletId: $walletId
      address: $address
      amount: $amount
      targetConfirmations: $targetConfirmations
    ) {
      amount
      targetConfirmations
    }
  }
`

/**
 * __useOnChainTxFeeQuery__
 *
 * To run a query within a React component, call `useOnChainTxFeeQuery` and pass it any options that fit your needs.
 * When your component renders, `useOnChainTxFeeQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useOnChainTxFeeQuery({
 *   variables: {
 *      walletId: // value for 'walletId'
 *      address: // value for 'address'
 *      amount: // value for 'amount'
 *      targetConfirmations: // value for 'targetConfirmations'
 *   },
 * });
 */
export function useOnChainTxFeeQuery(
  baseOptions: Apollo.QueryHookOptions<OnChainTxFeeQuery, OnChainTxFeeQueryVariables>,
) {
  const options = { ...defaultOptions, ...baseOptions }
  return Apollo.useQuery<OnChainTxFeeQuery, OnChainTxFeeQueryVariables>(
    OnChainTxFeeDocument,
    options,
  )
}
export function useOnChainTxFeeLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    OnChainTxFeeQuery,
    OnChainTxFeeQueryVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions }
  return Apollo.useLazyQuery<OnChainTxFeeQuery, OnChainTxFeeQueryVariables>(
    OnChainTxFeeDocument,
    options,
  )
}
export type OnChainTxFeeQueryHookResult = ReturnType<typeof useOnChainTxFeeQuery>
export type OnChainTxFeeLazyQueryHookResult = ReturnType<typeof useOnChainTxFeeLazyQuery>
export type OnChainTxFeeQueryResult = Apollo.QueryResult<
  OnChainTxFeeQuery,
  OnChainTxFeeQueryVariables
>
export const BtcPriceListDocument = gql`
  query btcPriceList($range: PriceGraphRange!) {
    btcPriceList(range: $range) {
      timestamp
      price {
        base
        offset
        currencyUnit
        formattedAmount
      }
    }
  }
`

/**
 * __useBtcPriceListQuery__
 *
 * To run a query within a React component, call `useBtcPriceListQuery` and pass it any options that fit your needs.
 * When your component renders, `useBtcPriceListQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useBtcPriceListQuery({
 *   variables: {
 *      range: // value for 'range'
 *   },
 * });
 */
export function useBtcPriceListQuery(
  baseOptions: Apollo.QueryHookOptions<BtcPriceListQuery, BtcPriceListQueryVariables>,
) {
  const options = { ...defaultOptions, ...baseOptions }
  return Apollo.useQuery<BtcPriceListQuery, BtcPriceListQueryVariables>(
    BtcPriceListDocument,
    options,
  )
}
export function useBtcPriceListLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    BtcPriceListQuery,
    BtcPriceListQueryVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions }
  return Apollo.useLazyQuery<BtcPriceListQuery, BtcPriceListQueryVariables>(
    BtcPriceListDocument,
    options,
  )
}
export type BtcPriceListQueryHookResult = ReturnType<typeof useBtcPriceListQuery>
export type BtcPriceListLazyQueryHookResult = ReturnType<typeof useBtcPriceListLazyQuery>
export type BtcPriceListQueryResult = Apollo.QueryResult<
  BtcPriceListQuery,
  BtcPriceListQueryVariables
>
export const MainQueryDocument = gql`
  query mainQuery($hasToken: Boolean!) {
    globals {
      nodesIds
      network
    }
    quizQuestions {
      id
      earnAmount
    }
    btcPrice {
      __typename
      base
      offset
      currencyUnit
      formattedAmount
    }
    me @include(if: $hasToken) {
      id
      language
      username
      phone
      quizQuestions {
        question {
          id
          earnAmount
        }
        completed
      }
      defaultAccount {
        id
        defaultWalletId
        transactions(first: 3) {
          ...TransactionList
        }
        wallets {
          id
          balance
          walletCurrency
        }
      }
    }
    mobileVersions {
      platform
      currentSupported
      minSupported
    }
  }
  ${TransactionListFragmentDoc}
`

/**
 * __useMainQueryQuery__
 *
 * To run a query within a React component, call `useMainQueryQuery` and pass it any options that fit your needs.
 * When your component renders, `useMainQueryQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useMainQueryQuery({
 *   variables: {
 *      hasToken: // value for 'hasToken'
 *   },
 * });
 */
export function useMainQueryQuery(
  baseOptions: Apollo.QueryHookOptions<MainQueryQuery, MainQueryQueryVariables>,
) {
  const options = { ...defaultOptions, ...baseOptions }
  return Apollo.useQuery<MainQueryQuery, MainQueryQueryVariables>(
    MainQueryDocument,
    options,
  )
}
export function useMainQueryLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<MainQueryQuery, MainQueryQueryVariables>,
) {
  const options = { ...defaultOptions, ...baseOptions }
  return Apollo.useLazyQuery<MainQueryQuery, MainQueryQueryVariables>(
    MainQueryDocument,
    options,
  )
}
export type MainQueryQueryHookResult = ReturnType<typeof useMainQueryQuery>
export type MainQueryLazyQueryHookResult = ReturnType<typeof useMainQueryLazyQuery>
export type MainQueryQueryResult = Apollo.QueryResult<
  MainQueryQuery,
  MainQueryQueryVariables
>
export const AccountLimitsDocument = gql`
  query accountLimits {
    me {
      defaultAccount {
        limits {
          withdrawal {
            totalLimit
            remainingLimit
            interval
            __typename
          }
          internalSend {
            totalLimit
            remainingLimit
            interval
            __typename
          }
          convert {
            totalLimit
            remainingLimit
            interval
            __typename
          }
        }
      }
    }
  }
`

/**
 * __useAccountLimitsQuery__
 *
 * To run a query within a React component, call `useAccountLimitsQuery` and pass it any options that fit your needs.
 * When your component renders, `useAccountLimitsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useAccountLimitsQuery({
 *   variables: {
 *   },
 * });
 */
export function useAccountLimitsQuery(
  baseOptions?: Apollo.QueryHookOptions<AccountLimitsQuery, AccountLimitsQueryVariables>,
) {
  const options = { ...defaultOptions, ...baseOptions }
  return Apollo.useQuery<AccountLimitsQuery, AccountLimitsQueryVariables>(
    AccountLimitsDocument,
    options,
  )
}
export function useAccountLimitsLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    AccountLimitsQuery,
    AccountLimitsQueryVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions }
  return Apollo.useLazyQuery<AccountLimitsQuery, AccountLimitsQueryVariables>(
    AccountLimitsDocument,
    options,
  )
}
export type AccountLimitsQueryHookResult = ReturnType<typeof useAccountLimitsQuery>
export type AccountLimitsLazyQueryHookResult = ReturnType<
  typeof useAccountLimitsLazyQuery
>
export type AccountLimitsQueryResult = Apollo.QueryResult<
  AccountLimitsQuery,
  AccountLimitsQueryVariables
>
export const UserDefaultWalletIdDocument = gql`
  query userDefaultWalletId($username: Username!) {
    userDefaultWalletId(username: $username)
  }
`

/**
 * __useUserDefaultWalletIdQuery__
 *
 * To run a query within a React component, call `useUserDefaultWalletIdQuery` and pass it any options that fit your needs.
 * When your component renders, `useUserDefaultWalletIdQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useUserDefaultWalletIdQuery({
 *   variables: {
 *      username: // value for 'username'
 *   },
 * });
 */
export function useUserDefaultWalletIdQuery(
  baseOptions: Apollo.QueryHookOptions<
    UserDefaultWalletIdQuery,
    UserDefaultWalletIdQueryVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions }
  return Apollo.useQuery<UserDefaultWalletIdQuery, UserDefaultWalletIdQueryVariables>(
    UserDefaultWalletIdDocument,
    options,
  )
}
export function useUserDefaultWalletIdLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    UserDefaultWalletIdQuery,
    UserDefaultWalletIdQueryVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions }
  return Apollo.useLazyQuery<UserDefaultWalletIdQuery, UserDefaultWalletIdQueryVariables>(
    UserDefaultWalletIdDocument,
    options,
  )
}
export type UserDefaultWalletIdQueryHookResult = ReturnType<
  typeof useUserDefaultWalletIdQuery
>
export type UserDefaultWalletIdLazyQueryHookResult = ReturnType<
  typeof useUserDefaultWalletIdLazyQuery
>
export type UserDefaultWalletIdQueryResult = Apollo.QueryResult<
  UserDefaultWalletIdQuery,
  UserDefaultWalletIdQueryVariables
>
export const PriceDocument = gql`
  subscription price($input: PriceInput!) {
    price(input: $input) {
      price {
        base
        offset
        currencyUnit
        formattedAmount
      }
      errors {
        message
      }
    }
  }
`

/**
 * __usePriceSubscription__
 *
 * To run a query within a React component, call `usePriceSubscription` and pass it any options that fit your needs.
 * When your component renders, `usePriceSubscription` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the subscription, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = usePriceSubscription({
 *   variables: {
 *      input: // value for 'input'
 *   },
 * });
 */
export function usePriceSubscription(
  baseOptions: Apollo.SubscriptionHookOptions<
    PriceSubscription,
    PriceSubscriptionVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions }
  return Apollo.useSubscription<PriceSubscription, PriceSubscriptionVariables>(
    PriceDocument,
    options,
  )
}
export type PriceSubscriptionHookResult = ReturnType<typeof usePriceSubscription>
export type PriceSubscriptionResult = Apollo.SubscriptionResult<PriceSubscription>
export const MyUpdatesDocument = gql`
  subscription myUpdates {
    myUpdates {
      errors {
        message
      }
      update {
        type: __typename
        ... on Price {
          base
          offset
          currencyUnit
          formattedAmount
        }
        ... on LnUpdate {
          paymentHash
          status
        }
        ... on OnChainUpdate {
          txNotificationType
          txHash
          amount
          usdPerSat
        }
        ... on IntraLedgerUpdate {
          txNotificationType
          amount
          usdPerSat
        }
      }
    }
  }
`

/**
 * __useMyUpdatesSubscription__
 *
 * To run a query within a React component, call `useMyUpdatesSubscription` and pass it any options that fit your needs.
 * When your component renders, `useMyUpdatesSubscription` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the subscription, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useMyUpdatesSubscription({
 *   variables: {
 *   },
 * });
 */
export function useMyUpdatesSubscription(
  baseOptions?: Apollo.SubscriptionHookOptions<
    MyUpdatesSubscription,
    MyUpdatesSubscriptionVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions }
  return Apollo.useSubscription<MyUpdatesSubscription, MyUpdatesSubscriptionVariables>(
    MyUpdatesDocument,
    options,
  )
}
export type MyUpdatesSubscriptionHookResult = ReturnType<typeof useMyUpdatesSubscription>
export type MyUpdatesSubscriptionResult = Apollo.SubscriptionResult<MyUpdatesSubscription>

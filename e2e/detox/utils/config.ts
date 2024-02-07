import { config } from "dotenv"
import path from "path"

config({ path: path.join(__dirname, "../../../dev/.env") })

if (!process.env.ALICE_PHONE || !process.env.BOB_PHONE) {
  throw new Error("Development environment environment configuration is incorrect")
}

export const timeout = 3000
export const otp = process.env.GALOY_STAGING_GLOBAL_OTP || "000000"

export const ALICE_PHONE = process.env.ALICE_PHONE
export const BOB_PHONE = process.env.BOB_PHONE

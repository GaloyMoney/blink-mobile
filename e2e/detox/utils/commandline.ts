import path from "path"
import { execSync } from "child_process"

const REPO_ROOT = path.join(__dirname, "../../..")

export const runDevSetup = () => {
  console.log("running dev-setup...")
  execSync(
    "tilt trigger dev-setup && tilt wait --timeout 5m --for=condition=Ready uiresources dev-setup",
  )
}

export const getKratosCode = (email: string) => {
  const emailBody = execSync(
    `source "${REPO_ROOT}/dev/vendor/galoy-quickstart/dev/helpers/cli.sh" && 
      kratos_pg -c "SELECT body FROM courier_messages WHERE recipient='${email}' ORDER BY created_at DESC LIMIT 1;"`,
    { encoding: "utf-8" },
  )

  const code = emailBody.match(/\b\d{6}\b/)?.[0]
  return code || ""
}

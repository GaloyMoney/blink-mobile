import axios from "axios"

export const mailslurpApiKey = process.env.MAILSLURP_API_KEY
if (mailslurpApiKey === undefined) {
  console.error("-----------------------------")
  console.error("MAILSLURP_API_KEY not set")
  console.error("-----------------------------")
  process.exit(1)
}

const headers = {
  "Accept": "application/json",
  "x-api-key": mailslurpApiKey,
}

export const getInbox = async () => {
  const optionsCreateInbox = {
    method: "POST",
    url: `https://api.mailslurp.com/inboxes?expiresIn=3600000&useShortAddress=true`,
    headers,
  }

  try {
    const { data } = await axios.request(optionsCreateInbox)
    const { id, emailAddress } = data
    console.log({ inboxId: id, emailAddress })
    return { id, emailAddress }
  } catch (error) {
    console.error(error)
  }
}

const getEmail = async (inboxId: string, index: number) => {
  const optionsGetEmails = {
    method: "GET",
    url: `https://api.mailslurp.com/waitForNthEmail?inboxId=${inboxId}&index=${index}&unreadOnly=false`,
    headers,
  }

  try {
    const { data } = await axios.request(optionsGetEmails)
    const { subject, body } = data
    return { subject, body }
  } catch (error) {
    console.error(error)
  }
}

export const getFirstEmail = async (inboxId: string) => {
  return getEmail(inboxId, 0)
}
export const getSecondEmail = async (inboxId: string) => {
  return getEmail(inboxId, 1)
}

// getInbox()
// getFirstEmail("a96cfd50-4c3e-4a1e-ba48-b7aa7958363f")

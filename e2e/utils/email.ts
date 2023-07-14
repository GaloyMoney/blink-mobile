import axios from "axios"

export const mailslurpApiKey = process.env.MAILSLURP_API_KEY || ""

const headers = {
  "Accept": "application/json",
  "x-api-key": mailslurpApiKey,
}

export const getInbox = async () => {
  const optionsCreateInbox = {
    method: "POST",
    url: `https://api.mailslurp.com/inboxes?useShortAddress=true`,
    // url: `https://api.mailslurp.com/inboxes?expiresIn=60000&useShortAddress=true`,
    headers,
  }

  try {
    const { data } = await axios.request(optionsCreateInbox)
    const { id, emailAddress } = data
    console.log({ id, emailAddress })
    return { id, emailAddress }
  } catch (error) {
    console.error(error)
  }
}

export const getFirstEmail = async (inboxId: string) => {
  const optionsGetEmails = {
    method: "GET",
    url: `https://api.mailslurp.com/waitForNthEmail?inboxId=${inboxId}&index=0&unreadOnly=false`,
    headers,
  }

  try {
    const { data } = await axios.request(optionsGetEmails)
    const { subject, body } = data
    console.log({ subject, body })
    return { subject, body }
  } catch (error) {
    console.error(error)
  }
}

// getInbox()
// getFirstEmail("a96cfd50-4c3e-4a1e-ba48-b7aa7958363f")

import JSONRPCHandler from "../../util/jsonrpc"
// streaming attachments is better cuz istg base64 :sob:

export default defineEventHandler(async (event) => {
    const cookies = parseCookies(event);
  const session = getCookie(event, "ws-url");
  const targetUrl = session + "/api/v1/rpc";

  if (!targetUrl) {
    setResponseStatus(event, 400);
    return { error: 'Missing "url" cookie' };
  }
  const res = event.node.res;
// get query param a
    const { a,g,r } = getQuery(event);
    console.log(getQuery(event));
    try {
    const response = await fetch(targetUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(new JSONRPCHandler().setMethod("getAttachment").setPayload({ id: a, recipientId:r,groupId: g }).build())
    }).then(r => r.json());
    if(response.error) {
        setResponseStatus(event, 404);
        return { error: "Attachment not found" };
    } else {
      console.log(response)
        const attachment = response.result;
        const bufferStream = Buffer.from(attachment.data, 'base64');
   
        res.end(bufferStream);
    }
  } catch (e) {
    console.error("Error fetching attachment:", e);
    setResponseStatus(event, 500);
    return { error: "Internal server error" };
  }
})
// streaming attachments is better cuz istg base64 :sob:

export default defineEventHandler(async (event) => {
    const cookies = parseCookies(event);
  const session = getCookie(event, "ws-url");
  const body = await readBody(event);
  const targetUrl = session + "/api/v1/rpc";

  if (!targetUrl) {
    setResponseStatus(event, 400);
    return { error: 'Missing "url" cookie' };
  }
  const res = event.node.res;
// get query param a
    const { a } = getQuery(event);
    try {
    const response = await fetch(targetUrl, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(new JSONRPCHandler().setMethod("getAttachment").setPayload({ attachmentId: a }).build())
    }).then(r => r.json());
    if(d.error) {
        setResponseStatus(event, 404);
        return { error: "Attachment not found" };
    } else {
        const attachment = response.result;
        const attachmentUrl = `${session}/attachments/${attachment.id}`;
        
        // Set headers for the response
        res.setHeader("Content-Type", attachment.contentType);
        res.setHeader("Content-Disposition", `attachment; filename="${attachment.filename}"`);
        res.setHeader("Content-Length", attachment.size.toString());
        
        // Return the attachment URL
        return sendRedirect(event, attachmentUrl);
    }

})
import { getCookie, parseCookies } from 'h3'
// server/api/proxy.ts
export default defineEventHandler(async (event) => {
    const cookies = parseCookies(event)
    const session = getCookie(event, 'ws-url')
    const body = await readBody(event)
    const targetUrl =session + '/api/v1/rpc'

    if (!targetUrl) {
        setResponseStatus(event, 400)
        return { error: 'Missing "url" cookie' }
    }

    const res = event.node.res

    try {
        console.log(body, ' the body')
        const response = await fetch(targetUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(body)
        })

        // Set status and headers from the target response
        res.statusCode = response.status
        for (const [key, value] of response.headers.entries()) {
            res.setHeader(key, value)
        }

        // Stream the body
        if (response.body) {
            const reader = response.body.getReader()
            const encoder = new TextEncoder()

            const stream = new ReadableStream({
                async pull(controller) {
                    const { done, value } = await reader.read()
                    if (done) {
                        controller.close()
                        return
                    }
                    controller.enqueue(value)
                }
            })

            return sendWebResponse(event, new Response(stream))
        } else {
            setResponseStatus(event, 502)
            return { error: 'No response body from target.' }
        }
    } catch (err: any) {
        setResponseStatus(event, 500)
        return { error: 'Proxy error', detail: err.message }
    }
})

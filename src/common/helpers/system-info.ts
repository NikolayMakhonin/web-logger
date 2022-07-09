import parseUserAgent from 'ua-parser-js'

export { parseUserAgent }

export async function parseSystemInfo(userAgentStr: string) {
	if (!userAgentStr) {
		return null
	}

	const userAgent = parseUserAgent(userAgentStr)
	const os = userAgent.os && userAgent.os.name && (`${userAgent.os.name} ${userAgent.os.version || ''}`.trim())

	const device = typeof window !== 'undefined'
		&& (window as any).getDeviceName
		&& await (window as any).getDeviceName()
		|| userAgent.device
			&& userAgent.device.vendor
			&& (`${userAgent.device.vendor} ${userAgent.device.model || ''}`.trim())
		|| 'desktop'

	return {
		device,
		os,
	}
}

export function isSmartPhone() {
	return /iphone|ipod|android.*mobile|windows.*phone|blackberry.*mobile/.test(
		navigator.userAgent.toLowerCase(),
	)
}

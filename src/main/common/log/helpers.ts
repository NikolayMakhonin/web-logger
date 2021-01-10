// @ts-ignore
import {html, SparkMD5} from './helpers-cjs'

export function md5(str: string): string {
	const spark = new SparkMD5()
	spark.append(str)
	return spark.end()
}

export function escapeHtml(str: string): string {
	return html.escape(str)
}

const _spacesRegex = /\s+/
const _spacesWithoutNewLinesRegex = /[^\S\n]+/
const _fixNewLines = /([^\S\n]*\n[^\S\n]*)/

export function removeExcessSpaces(text: string, keepLines?: number) {
	if (!text) {
		return text
	}

	if (keepLines) {
		text = text.replace(_spacesWithoutNewLinesRegex, ' ').trim()
		text = text.replace(_fixNewLines, '\\r\\n')
		text = text.replace(new RegExp('((\\r\\n){' + keepLines + '})[\\r\\n]*'), '$1')
	} else {
		text = text.replace(_spacesRegex, ' ').trim()
	}

	return text
}

/* eslint-disable no-shadow,global-require,object-property-newline,no-sync */
const {build} = require('../common/build')
const rollupPlugins = require('../rollup/plugins')
const fs = require('fs')
const path = require('path')

function buildLib({fileInput, fileOutput, name, rebuild}) {
	fileOutput = path.resolve(fileOutput)

	if (fs.existsSync(fileOutput)) {
		if (rebuild) {
			fs.unlinkSync(fileOutput)
		} else {
			console.log(`Lib already built: ${fileOutput}`)
			return Promise.resolve()
		}
	}

	return build(
		{fileInput, fileOutput, name}, {
			plugins: rollupPlugins.libs({dev: false, legacy: true}),
			output : {
				format   : 'iife',
				sourcemap: false,
				exports  : 'named',
			},
		},
	)
}

module.exports = {
	buildLib,
}

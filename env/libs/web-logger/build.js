const {buildLib} = require('../helpers')

// const fileOutput = path.resolve('static/polyfills/polyfill-custom.js')
// const fileOutput = path.resolve(__dirname, './bundle.js')

buildLib({
	fileInput : require.resolve('./all.js'),
	fileOutput: './web-logger.min.js',
	name: 'WebLogger',
	rebuild: true,
})
	.then(() => {
		console.log('web-logger build completed')
	})

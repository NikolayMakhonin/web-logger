const {buildLib} = require('../helpers')

// const fileOutput = path.resolve('static/polyfills/polyfill-custom.js')
// const fileOutput = path.resolve(__dirname, './bundle.js')

buildLib({
	fileInput : require.resolve('./all.js'),
	fileOutput: './unhandled-errors.min.js',
	name: 'UnhandledErrors',
	rebuild: true,
})
	.then(() => {
		console.log('polyfill build completed')
	})

/* eslint global-require: "off"*/

module.exports = {
	plugins: [
		require('precss')(),
		require('autoprefixer')(),
		require('postcss-flexbugs-fixes')(),
	],
};

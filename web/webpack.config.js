module.exports = {
	entry: './index.jsx',
	output: {
		path: __dirname,
		filename: 'index.js',
	},
	devtool: 'cheap-module-eval-source-map',
	module: {
		rules: [{
			test: /\.jsx$/,
			use: {
				loader: 'babel-loader',
				options: {
					presets: [
						['env', {
							targets: [
								'last 2 Chrome versions',
							],
						}],
						'react',
					],
					plugins: [
						'transform-class-properties',
					],
				},
			},
			exclude: /node_modules\/(?!react-measure)/,
		}, {
			test: /\.pcss$/,
			use: [{
				loader: 'style-loader',
				options: {
					sourceMap: true,
				},
			}, {
				loader: 'css-loader',
				options: {
					modules: true,
					localIdentName: '[name]__[local]--[hash:base64:5]',
					importLoaders: 1,
				},
			}, {
				loader: 'postcss-loader',
				options: {
					sourceMap: true,
				},
			}],
		}],
	},
};

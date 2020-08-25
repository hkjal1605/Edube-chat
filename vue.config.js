const VuetifyLoaderPlugin = require('vuetify-loader/lib/plugin');

const BundleAnalyzerPlugin = require('webpack-bundle-analyzer')
	.BundleAnalyzerPlugin;
module.exports = {
	productionSourceMap: false,
	configureWebpack: () => {
		if (process.env.NODE_ENV === 'production') {
			// mutate config for production...
			return {
				plugins: [new BundleAnalyzerPlugin(), new VuetifyLoaderPlugin()]
			};
		} else {
			// mutate for development...
			return {
				plugins: [new VuetifyLoaderPlugin()]
			};
		}
	}
};

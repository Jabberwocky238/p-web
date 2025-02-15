import { defineConfig } from "@rspack/cli";
import { CopyRspackPluginOptions, DefinePluginOptions, rspack } from "@rspack/core";
import RefreshPlugin from "@rspack/plugin-react-refresh";
import path from "path";

const isDev = process.env.NODE_ENV === "development";

// Target browsers, see: https://github.com/browserslist/browserslist
const targets = ["chrome >= 87", "edge >= 88", "firefox >= 78", "safari >= 14"];

export default defineConfig({
	context: __dirname,
	entry: {
		main: "./src/main.tsx"
	},
	resolve: {
		// 1. tsconfig object fails with `Module not found: Can't resolve 'src/calc' in os-path-to-this-file`
		tsConfig: {
			configFile: path.resolve(__dirname, "./tsconfig.json"),
			references: "auto",
		},
		extensions: ["...", ".ts", ".tsx", ".jsx", '.json'],
		alias: {
			"@": path.resolve(__dirname, "src"),
			"@@": path.resolve(__dirname, "src/components"),
		}
	},
	module: {
		rules: [
			{
				test: /\.svg$/,
				type: "asset"
			},
			{
				test: /\.(jsx?|tsx?)$/,
				use: [
					{
						loader: "builtin:swc-loader",
						options: {
							jsc: {
								parser: {
									syntax: "typescript",
									tsx: true
								},
								transform: {
									react: {
										runtime: "automatic",
										development: isDev,
										refresh: isDev
									}
								}
							},
							env: { targets }
						}
					}
				]
			}
		]
	},
	plugins: [
		new rspack.HtmlRspackPlugin({
			template: "./index.html"
		}),
		isDev ? new RefreshPlugin() : null,
		new rspack.CopyRspackPlugin({
			patterns: [
				{
					from: '*.*',
					context: 'public',
				},
			],
		} as CopyRspackPluginOptions),
		new rspack.DefinePlugin({
			"process.env.BACKEND_API": isDev ? JSON.stringify("http://127.0.0.1:23891") : JSON.stringify("http://music.jw238.site"),
			"process.env.SELF_API": isDev ? JSON.stringify("http://127.0.0.1:8080") : JSON.stringify("http://music.jw238.site"),
		} as DefinePluginOptions),
	].filter(Boolean),
	optimization: {
		minimizer: [
			new rspack.SwcJsMinimizerRspackPlugin(),
			new rspack.LightningCssMinimizerRspackPlugin({
				minimizerOptions: { targets }
			})
		]
	},
	experiments: {
		css: true
	},
});

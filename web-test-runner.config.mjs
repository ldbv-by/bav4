import { playwrightLauncher } from '@web/test-runner-playwright';
import { defaultReporter, summaryReporter } from '@web/test-runner';
import { jasmineTestRunnerConfig } from 'web-test-runner-jasmine';
import { webpackPlugin } from './test/wtr-webpack/web-test-runner-webpack-plugin.js';
import webpackConfig from './webpack.test.config.js';

export default /** @type {import("@web/test-runner").TestRunnerConfig} */ ({
	...jasmineTestRunnerConfig(),
	testFramework: {
		config: {
			defaultTimeoutInterval: 10000
		}
	},
	nodeResolve: true,
	// files: ['./src/*.spec.ts'],
	// files: ['./test/**/Button.test.js'],
	// test/modules/commons/components/Button.test.js
	// files: ['./test/**/Button.test.js'],
	files: ['./test/modules/commons/components/Spinner.test.js'],
	browsers: [playwrightLauncher({ product: 'chromium' })],
	coverageConfig: {
		// require: ['ts-node/register'],
		extension: ['.js'],
		report: true
		// reporters: ['mocha', 'coverage-istanbul'],
		// threshold: {
		// 	statements: 90,
		// 	branches: 90,
		// 	functions: 90,
		// 	lines: 90
		// }
	},
	reporters: [defaultReporter(), summaryReporter()],
	plugins: [webpackPlugin(webpackConfig)]
});

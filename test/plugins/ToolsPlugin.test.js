import { TestUtils } from '../test-utils.js';
import { $injector } from '../../src/injection';
import { QueryParameters } from '../../src/domain/queryParameters';
import { initialState, toolsReducer } from '../../src/store/tools/tools.reducer';
import { ToolsPlugin } from '../../src/plugins/ToolsPlugin';
import { Tools } from '../../src/domain/tools.js';

describe('ToolsPlugin', () => {
	const environmentServiceMock = {
		getQueryParams: () => new URLSearchParams(),
		isEmbedded: () => false
	};

	const setup = () => {
		const store = TestUtils.setupStoreAndDi(
			{},
			{
				tools: toolsReducer
			}
		);
		$injector.registerSingleton('EnvironmentService', environmentServiceMock);

		return store;
	};

	describe('register', () => {
		describe('in default mode', () => {
			it('updates the "tools" slice-of-state', async () => {
				const store = setup();
				const queryParam = new URLSearchParams(`${QueryParameters.TOOL_ID}=${Tools.EXPORT}`);
				const instanceUnderTest = new ToolsPlugin();
				spyOn(environmentServiceMock, 'getQueryParams').and.returnValue(queryParam);

				await instanceUnderTest.register(store);

				expect(store.getState().tools.current).toBe(Tools.EXPORT);
			});

			it('does NOTHING when the ToolId is not available', async () => {
				const store = setup();
				const queryParam = new URLSearchParams(``);
				const instanceUnderTest = new ToolsPlugin();
				spyOn(environmentServiceMock, 'getQueryParams').and.returnValue(queryParam);

				await instanceUnderTest.register(store);

				expect(store.getState().tools.current).toBe(initialState.current);
			});

			it('does NOTHING when the ToolId is not valid', async () => {
				const store = setup();
				const queryParam = new URLSearchParams(`${QueryParameters.TOOL_ID}=something`);
				const instanceUnderTest = new ToolsPlugin();
				spyOn(environmentServiceMock, 'getQueryParams').and.returnValue(queryParam);

				await instanceUnderTest.register(store);

				expect(store.getState().tools.current).toBe(initialState.current);
			});
		});
		describe('in embed mode', () => {
			it('updates the "tools" slice-of-state', async () => {
				const store = setup();
				const queryParam = new URLSearchParams(`${QueryParameters.TOOL_ID}=${Tools.DRAW}`);
				const instanceUnderTest = new ToolsPlugin();
				spyOn(environmentServiceMock, 'getQueryParams').and.returnValue(queryParam);
				spyOn(environmentServiceMock, 'isEmbedded').and.returnValue(true);

				await instanceUnderTest.register(store);

				expect(store.getState().tools.current).toBe(Tools.DRAW);
			});

			it('does NOTHING when the ToolId is not available for embed mode', async () => {
				const store = setup();
				const queryParam = new URLSearchParams(`${QueryParameters.TOOL_ID}=${Tools.ROUTING}`);
				const instanceUnderTest = new ToolsPlugin();
				spyOn(environmentServiceMock, 'getQueryParams').and.returnValue(queryParam);
				spyOn(environmentServiceMock, 'isEmbedded').and.returnValue(true);

				await instanceUnderTest.register(store);

				expect(store.getState().tools.current).toBe(initialState.current);
			});
		});
	});
});

import { TestUtils } from '../test-utils.js';
import { $injector } from '../../src/injection';
import { QueryParameters } from '../../src/domain/queryParameters';
import { initialState, toolsReducer } from '../../src/store/tools/tools.reducer';
import { ToolsPlugin } from '../../src/plugins/ToolsPlugin';
import { Tools } from '../../src/domain/tools.js';

describe('ToolsPlugin', () => {
	const windowMock = {
		location: {
			get search() {
				return null;
			}
		}
	};

	const setup = () => {
		const store = TestUtils.setupStoreAndDi(
			{},
			{
				tools: toolsReducer
			}
		);
		$injector.registerSingleton('EnvironmentService', { getWindow: () => windowMock });

		return store;
	};

	describe('register', () => {
		it('updates the "tools" slice-of-state', async () => {
			const store = setup();
			const queryParam = `${QueryParameters.TOOL_ID}=${Tools.EXPORT}`;
			const instanceUnderTest = new ToolsPlugin();
			spyOnProperty(windowMock.location, 'search').and.returnValue(queryParam);

			await instanceUnderTest.register(store);

			expect(store.getState().tools.current).toBe(Tools.EXPORT);
		});

		it('does NOTHING when the ToolId is not available', async () => {
			const store = setup();
			const queryParam = ``;
			const instanceUnderTest = new ToolsPlugin();
			spyOnProperty(windowMock.location, 'search').and.returnValue(queryParam);

			await instanceUnderTest.register(store);

			expect(store.getState().tools.current).toBe(initialState.current);
		});

		it('does NOTHING when the ToolId is not valid', async () => {
			const store = setup();
			const queryParam = `${QueryParameters.TOOL_ID}=something`;
			const instanceUnderTest = new ToolsPlugin();
			spyOnProperty(windowMock.location, 'search').and.returnValue(queryParam);

			await instanceUnderTest.register(store);

			expect(store.getState().tools.current).toBe(initialState.current);
		});
	});
});

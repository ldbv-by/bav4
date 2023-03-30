import { TopicsPlugin } from '../../src/plugins/TopicsPlugin';
import { TestUtils } from '../test-utils.js';
import { $injector } from '../../src/injection';
import { Topic } from '../../src/domain/topic';
import { QueryParameters } from '../../src/domain/queryParameters';
import { initialState, toolsReducer } from '../../src/store/tools/tools.reducer';
import { ToolId } from '../../src/store/tools/tools.action';
import { ToolsPlugin } from '../../src/plugins/ToolsPlugin';

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
			const queryParam = `${QueryParameters.TOOL_ID}=${ToolId.EXPORT}`;
			const instanceUnderTest = new ToolsPlugin();
			spyOnProperty(windowMock.location, 'search').and.returnValue(queryParam);

			await instanceUnderTest.register(store);

			expect(store.getState().tools.current).toBe(ToolId.EXPORT);
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

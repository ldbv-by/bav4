import { TestUtils } from '../test-utils.js';
import { $injector } from '../../src/injection/index.js';
import { toolsReducer } from '../../src/store/tools/tools.reducer.js';
import { BeforeUnloadPlugin } from '../../src/plugins/BeforeUnloadPlugin.js';
import { setCurrentTool } from '../../src/store/tools/tools.action.js';

describe('BeforeUnloadPlugin', () => {
	const environmentServiceMock = {
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
		describe('a tool is activated', () => {
			it('registers an "beforeunload" event listener', async () => {
				const spy = spyOn(window, 'addEventListener');
				const mockEvent = {
					returnValue: null,
					preventDefault: () => {}
				};
				const preventDefaultSpy = spyOn(mockEvent, 'preventDefault');
				const store = setup();
				const instanceUnderTest = new BeforeUnloadPlugin();

				await instanceUnderTest.register(store);

				setCurrentTool('myTool');

				expect(spy).toHaveBeenCalledWith('beforeunload', jasmine.any(Function));

				const beforeunloadFn = spy.calls.argsFor(0)[1];

				beforeunloadFn(mockEvent);

				expect(mockEvent.returnValue).toBe('string');
				expect(preventDefaultSpy).toHaveBeenCalled();
			});
		});
		describe('a tool is inactivated', () => {
			it('removes an "beforeunload" event listener', async () => {
				const spy = spyOn(window, 'removeEventListener');
				const store = setup();
				const instanceUnderTest = new BeforeUnloadPlugin();

				await instanceUnderTest.register(store);

				setCurrentTool('myTool');
				setCurrentTool(null);

				expect(spy).toHaveBeenCalledTimes(2);
				expect(spy).toHaveBeenCalledWith('beforeunload', jasmine.any(Function));
			});
		});
		it('does NOTHING when app is embedded', async () => {
			spyOn(environmentServiceMock, 'isEmbedded').and.returnValue(true);
			const removeEventListenerSpy = spyOn(window, 'removeEventListener');
			const addEventListenerSpy = spyOn(window, 'addEventListener');
			const store = setup();
			const instanceUnderTest = new BeforeUnloadPlugin();

			await instanceUnderTest.register(store);

			setCurrentTool('myTool');
			setCurrentTool(null);

			expect(removeEventListenerSpy).not.toHaveBeenCalled();
			expect(addEventListenerSpy).not.toHaveBeenCalled();
		});
	});
});

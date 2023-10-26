import { TestUtils } from '../test-utils.js';
import { $injector } from '../../src/injection/index.js';
import { toolsReducer } from '../../src/store/tools/tools.reducer.js';
import { BeforeUnloadPlugin } from '../../src/plugins/BeforeUnloadPlugin.js';
import { setCurrentTool } from '../../src/store/tools/tools.action.js';
import { Tools } from '../../src/domain/tools.js';

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

	describe('_getTools', () => {
		it('returns a list of relevant tool ids', async () => {
			const store = setup();
			const instanceUnderTest = new BeforeUnloadPlugin();
			await instanceUnderTest.register(store);

			expect(instanceUnderTest._getTools()).toEqual([Tools.DRAW, Tools.MEASURE, Tools.ROUTING]);
		});
	});

	describe('register', () => {
		describe('one of the relevant tool is activated', () => {
			it('registers an "beforeunload" event listener', async () => {
				const spy = spyOn(window, 'addEventListener');
				const mockEvent = {
					returnValue: null,
					preventDefault: () => {}
				};
				const preventDefaultSpy = spyOn(mockEvent, 'preventDefault');
				const store = setup();
				const instanceUnderTest = new BeforeUnloadPlugin();
				const toolId = 'myTool';
				spyOn(instanceUnderTest, '_getTools').and.returnValue([toolId]);
				await instanceUnderTest.register(store);

				setCurrentTool(toolId);

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
				const toolId = 'myTool';
				spyOn(instanceUnderTest, '_getTools').and.returnValue([toolId]);
				await instanceUnderTest.register(store);

				setCurrentTool(toolId);
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
			const toolId = 'myTool';
			const instanceUnderTest = new BeforeUnloadPlugin();
			spyOn(instanceUnderTest, '_getTools').and.returnValue([toolId]);

			await instanceUnderTest.register(store);

			setCurrentTool(toolId);
			setCurrentTool(null);

			expect(removeEventListenerSpy).not.toHaveBeenCalled();
			expect(addEventListenerSpy).not.toHaveBeenCalled();
		});

		it('does NOTHING when tool is not relevant', async () => {
			spyOn(environmentServiceMock, 'isEmbedded').and.returnValue(true);
			const removeEventListenerSpy = spyOn(window, 'removeEventListener');
			const addEventListenerSpy = spyOn(window, 'addEventListener');
			const store = setup();
			const toolId = 'myTool';
			const instanceUnderTest = new BeforeUnloadPlugin();
			spyOn(instanceUnderTest, '_getTools').and.returnValue([]);

			await instanceUnderTest.register(store);

			setCurrentTool(toolId);
			setCurrentTool(null);

			expect(removeEventListenerSpy).not.toHaveBeenCalled();
			expect(addEventListenerSpy).not.toHaveBeenCalled();
		});
	});
});

import { $injector } from '../../src/injection';
import { EncodeStatePlugin } from '../../src/plugins/EncodeStatePlugin';
import { indicateChange } from '../../src/store/stateForEncoding/stateForEncoding.action';
import { stateForEncodingReducer } from '../../src/store/stateForEncoding/stateForEncoding.reducer';
import { TestUtils } from '../test-utils';

describe('EncodeStatePlugin', () => {
	const shareService = {
		encodeState() {},
		getParameters() {}
	};
	const environmentService = {
		getWindow: () => {},
		isEmbedded: () => {}
	};

	const setup = () => {
		const store = TestUtils.setupStoreAndDi(
			{},
			{
				stateForEncoding: stateForEncodingReducer
			}
		);
		$injector.registerSingleton('EnvironmentService', environmentService).registerSingleton('ShareService', shareService);
		return store;
	};

	describe('class', () => {
		it('defines constant values', async () => {
			expect(EncodeStatePlugin.DEBOUNCED_DELAY_MS).toBe(200);
		});
	});

	it('registers stateForEncoding.changed listeners and updates the window history state', async () => {
		const expectedEncodedState = 'state';
		const mockHistory = { replaceState: () => {} };
		const historySpy = spyOn(mockHistory, 'replaceState');
		const mockWindow = { history: mockHistory };
		spyOn(environmentService, 'getWindow').and.returnValue(mockWindow);
		spyOn(environmentService, 'isEmbedded').and.returnValue(false);
		spyOn(shareService, 'encodeState').and.returnValue(expectedEncodedState);
		const store = setup();
		const instanceUnderTest = new EncodeStatePlugin();
		await instanceUnderTest.register(store);

		indicateChange();

		await TestUtils.timeout(EncodeStatePlugin.DEBOUNCED_DELAY_MS + 100);
		expect(historySpy).toHaveBeenCalledWith(null, '', expectedEncodedState);

		await TestUtils.timeout(0);
	});

	it('updates the window history state in a debounced manner', async () => {
		const expectedEncodedState = 'state';
		const mockHistory = { replaceState: () => {} };
		const historySpy = spyOn(mockHistory, 'replaceState');
		const mockWindow = { history: mockHistory };
		spyOn(environmentService, 'getWindow').and.returnValue(mockWindow);
		spyOn(environmentService, 'isEmbedded').and.returnValue(false);
		spyOn(shareService, 'encodeState').and.returnValue(expectedEncodedState);
		const store = setup();
		const instanceUnderTest = new EncodeStatePlugin();
		await instanceUnderTest.register(store);

		indicateChange();
		indicateChange();
		indicateChange();

		await TestUtils.timeout(EncodeStatePlugin.DEBOUNCED_DELAY_MS + 100);
		expect(historySpy).toHaveBeenCalledTimes(1);

		indicateChange();
		indicateChange();
		indicateChange();

		await TestUtils.timeout(EncodeStatePlugin.DEBOUNCED_DELAY_MS + 100);
		expect(historySpy).toHaveBeenCalledTimes(2);

		await TestUtils.timeout(0);
	});

	it("does nothing when we are in 'embed' mode", async () => {
		spyOn(environmentService, 'isEmbedded').and.returnValue(true);
		const store = setup();
		const instanceUnderTest = new EncodeStatePlugin();
		const updateHistorySpy = spyOn(instanceUnderTest, '_updateHistory');
		await instanceUnderTest.register(store);

		indicateChange();

		expect(updateHistorySpy).not.toHaveBeenCalled();
	});
});

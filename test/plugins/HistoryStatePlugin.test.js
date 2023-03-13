import { $injector } from '../../src/injection';
import { HistoryStatePlugin } from '../../src/plugins/HistoryStatePlugin';
import { indicateChange } from '../../src/store/stateForEncoding/stateForEncoding.action';
import { stateForEncodingReducer } from '../../src/store/stateForEncoding/stateForEncoding.reducer';
import { TestUtils } from '../test-utils';

describe('HistoryState', () => {
	const shareService = {
		encodeState() {}
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

	it('registers stateForEncoding.changed listeners and updates the window history state', async () => {
		const expectedEncodedState = 'state';
		const mockHistory = { replaceState: () => {} };
		const historySpy = spyOn(mockHistory, 'replaceState');
		const mockWindow = { history: mockHistory };
		spyOn(environmentService, 'getWindow').and.returnValue(mockWindow);
		spyOn(environmentService, 'isEmbedded').and.returnValue(false);
		spyOn(shareService, 'encodeState').and.returnValue(expectedEncodedState);
		const store = setup();
		const instanceUnderTest = new HistoryStatePlugin();
		await instanceUnderTest.register(store);

		indicateChange();

		expect(historySpy).toHaveBeenCalledWith(null, '', expectedEncodedState);
		await TestUtils.timeout(0);
	});

	it("does nothing when we are in 'embed' mode", async () => {
		spyOn(environmentService, 'isEmbedded').and.returnValue(true);
		const store = setup();
		const instanceUnderTest = new HistoryStatePlugin();
		const updateHistorySpy = spyOn(instanceUnderTest, '_updateHistory');
		await instanceUnderTest.register(store);

		await TestUtils.timeout(0);
		expect(updateHistorySpy).not.toHaveBeenCalled();
	});
});

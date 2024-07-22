import { QueryParameters } from '../../src/domain/queryParameters';
import { $injector } from '../../src/injection';
import { PublicComponent } from '../../src/modules/public/components/PublicComponent';
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
		isEmbedded: () => {},
		isEmbeddedAsWC: () => {}
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

	it('registers a stateForEncoding.changed listeners, updates the attributes of an embedded wc and removes initial-only attributes', async () => {
		const mockElement = {
			setAttribute: () => {},
			getAttribute: () => {},
			removeAttribute: () => {},
			getAttributeNames: () => {}
		};
		const mockDocument = { querySelector: () => {} };
		const mockWindow = { document: mockDocument };
		const setAttributeSpy = spyOn(mockElement, 'setAttribute');
		const getAttributeSpy = spyOn(mockElement, 'getAttribute').withArgs(QueryParameters.LAYER).and.returnValue(undefined);
		spyOn(mockElement, 'getAttributeNames').and.returnValue([
			QueryParameters.QUERY /** param won't be encoded by the ShareService, but is a known application parameter */,
			QueryParameters.LAYER /** param will be encoded by the ShareService  and is a known application parameter*/,
			'style' /** not a application parameter */
		]);
		const removeAttributeSpy = spyOn(mockElement, 'removeAttribute');
		spyOn(environmentService, 'getWindow').and.returnValue(mockWindow);
		spyOn(mockDocument, 'querySelector').withArgs(PublicComponent.tag).and.returnValue(mockElement);
		spyOn(environmentService, 'isEmbedded').and.returnValue(true);
		spyOn(environmentService, 'isEmbeddedAsWC').and.returnValue(true);
		spyOn(shareService, 'getParameters').and.returnValue(new Map([[QueryParameters.LAYER, 'layer']]));
		const store = setup();
		const instanceUnderTest = new EncodeStatePlugin();
		await instanceUnderTest.register(store);

		indicateChange();

		expect(setAttributeSpy).toHaveBeenCalledWith(QueryParameters.LAYER, 'layer');
		expect(getAttributeSpy).toHaveBeenCalledTimes(1);
		expect(removeAttributeSpy).toHaveBeenCalledOnceWith(QueryParameters.QUERY);
		await TestUtils.timeout(0);
	});

	it('registers a stateForEncoding.changed listeners and DOES not updates the attributes of an embedded wc when value did not change', async () => {
		const value = 'bar';
		const mockElement = { setAttribute: () => {}, getAttribute: () => {}, getAttributeNames: () => [] };
		const mockDocument = { querySelector: () => {} };
		const mockWindow = { document: mockDocument };
		const setAttributeSpy = spyOn(mockElement, 'setAttribute');
		const getAttributeSpy = spyOn(mockElement, 'getAttribute').withArgs('foo').and.returnValue(value);
		spyOn(environmentService, 'getWindow').and.returnValue(mockWindow);
		spyOn(mockDocument, 'querySelector').withArgs(PublicComponent.tag).and.returnValue(mockElement);
		spyOn(environmentService, 'isEmbedded').and.returnValue(true);
		spyOn(environmentService, 'isEmbeddedAsWC').and.returnValue(true);
		spyOn(shareService, 'getParameters').and.returnValue(new Map([['foo', `${value}`]]));
		const store = setup();
		const instanceUnderTest = new EncodeStatePlugin();
		await instanceUnderTest.register(store);

		indicateChange();

		expect(setAttributeSpy).not.toHaveBeenCalled();
		expect(getAttributeSpy).toHaveBeenCalledTimes(1);
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

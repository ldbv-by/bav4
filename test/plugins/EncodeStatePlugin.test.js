import { $injector } from '../../src/injection';
import { PublicComponent } from '../../src/modules/public/components/PublicComponent';
import { EncodeStatePlugin } from '../../src/plugins/EncodeStatePlugin';
import { indicateChange } from '../../src/store/stateForEncoding/stateForEncoding.action';
import { stateForEncodingReducer } from '../../src/store/stateForEncoding/stateForEncoding.reducer';
import { TestUtils } from '../test-utils';

describe('EncodeStatePlugin', () => {
	const shareService = {
		encodeState() {}
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

		expect(historySpy).toHaveBeenCalledWith(null, '', expectedEncodedState);
		await TestUtils.timeout(0);
	});

	it('registers a stateForEncoding.changed listeners and updates the attributes of an embedded wc', async () => {
		const mockElement = { setAttribute: () => {}, getAttribute: () => {} };
		const mockDocument = { querySelector: () => {} };
		const mockWindow = { document: mockDocument };
		const setAttributeSpy = spyOn(mockElement, 'setAttribute');
		const getAttributeSpy = spyOn(mockElement, 'getAttribute').withArgs('foo').and.returnValue(undefined);
		spyOn(environmentService, 'getWindow').and.returnValue(mockWindow);
		spyOn(mockDocument, 'querySelector').withArgs(PublicComponent.tag).and.returnValue(mockElement);
		spyOn(environmentService, 'isEmbedded').and.returnValue(true);
		spyOn(environmentService, 'isEmbeddedAsWC').and.returnValue(true);
		spyOn(shareService, 'encodeState').and.returnValue('http://some.thing?foo=bar');
		const store = setup();
		const instanceUnderTest = new EncodeStatePlugin();
		await instanceUnderTest.register(store);

		indicateChange();

		expect(setAttributeSpy).toHaveBeenCalledWith('foo', 'bar');
		expect(getAttributeSpy).toHaveBeenCalledTimes(1);
		await TestUtils.timeout(0);
	});

	it('registers a stateForEncoding.changed listeners and DOES not updates the attributes of an embedded wc when value did not change', async () => {
		const value = 'bar';
		const mockElement = { setAttribute: () => {}, getAttribute: () => {} };
		const mockDocument = { querySelector: () => {} };
		const mockWindow = { document: mockDocument };
		const setAttributeSpy = spyOn(mockElement, 'setAttribute');
		const getAttributeSpy = spyOn(mockElement, 'getAttribute').withArgs('foo').and.returnValue(value);
		spyOn(environmentService, 'getWindow').and.returnValue(mockWindow);
		spyOn(mockDocument, 'querySelector').withArgs(PublicComponent.tag).and.returnValue(mockElement);
		spyOn(environmentService, 'isEmbedded').and.returnValue(true);
		spyOn(environmentService, 'isEmbeddedAsWC').and.returnValue(true);
		spyOn(shareService, 'encodeState').and.returnValue(`http://some.thing?foo=${value}`);
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

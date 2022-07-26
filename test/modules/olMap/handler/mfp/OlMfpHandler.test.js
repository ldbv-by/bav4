import { Feature } from 'ol';
import { $injector } from '../../../../../src/injection';
import { OlMfpHandler } from '../../../../../src/modules/olMap/handler/mfp/OlMfpHandler';
import { mfpReducer } from '../../../../../src/store/mfp/mfp.reducer';
import { positionReducer } from '../../../../../src/store/position/position.reducer';
import { TestUtils } from '../../../../test-utils';

describe('OlMfpHandler', () => {
	const initialState = {
		active: false,
		current: { id: 'foo', scale: null }
	};

	const translationServiceMock = { translate: (key) => key };
	const mfpServiceMock = {
		getCapabilities() {
			return Promise.resolve([]);
		},
		getCapabilitiesById() {
			return { scales: [42, 21, 1] };
		}
	};
	const setup = (state = initialState) => {
		const mfpState = {
			mfp: state
		};
		TestUtils.setupStoreAndDi(mfpState, { mfp: mfpReducer, position: positionReducer });
		$injector.registerSingleton('TranslationService', translationServiceMock)
			.registerSingleton('MapService', { getSrid: () => 3857, getDefaultGeodeticSrid: () => 25832 })
			.registerSingleton('MfpService', mfpServiceMock);
	};

	it('instantiates the handler', () => {
		setup();
		const handler = new OlMfpHandler();

		expect(handler).toBeTruthy();
		expect(handler.id).toBe('mfp_layer');
		expect(handler._storeService.getStore()).toBeDefined();
		expect(handler._registeredObservers).toEqual([]);
		expect(handler._mfpBoundaryFeature).toEqual(jasmine.any(Feature));
		expect(handler._mfpLayer).toBeNull();
		expect(handler._map).toBeNull();
		expect(handler._pageSize).toBeNull();
	});
});

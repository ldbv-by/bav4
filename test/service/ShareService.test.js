import { $injector } from '../../src/injection';
import { addLayer } from '../../src/modules/map/store/layers.action';
import { layersReducer } from '../../src/modules/map/store/layers.reducer';
import { changeZoomAndCenter } from '../../src/modules/map/store/position.action';
import { positionReducer } from '../../src/modules/map/store/position.reducer';
import { QueryParameters } from '../../src/services/domain/queryParameters';
import { ShareService } from '../../src/services/ShareService';
import { TestUtils } from '../test-utils';

describe('ShareService', () => {

	const coordinateService = {
		transform: () => { }
	};
	const mapService = {
		getSridDefinitionsForView: () => { },
		getDefaultSridForView: () => { },
		getSrid: () => { }
	};

	const setup = (state) => {

		const store = TestUtils.setupStoreAndDi(state, {
			layers: layersReducer,
			position: positionReducer
		});
		$injector
			.registerSingleton('CoordinateService', coordinateService)
			.registerSingleton('MapService', mapService);

		return store;
	};





	describe('copy to clipboard', () => {
		it('calls Clipboard API', async () => {
			const mockNavigator = { clipboard: {} };
			mockNavigator.clipboard.writeText = jasmine.createSpy().and.returnValue(Promise.resolve('success'));
			const mockWindow = { isSecureContext: true, navigator: mockNavigator };


			const instanceUnderTest = new ShareService(mockWindow);
			const resolved = await instanceUnderTest.copyToClipboard('foo');
			expect(resolved).toBe('success');

			expect(mockNavigator.clipboard.writeText).toHaveBeenCalledWith('foo');
		});

		it('rejects when Clipboard API is not available', (done) => {
			const mockNavigator = { clipboard: {} };
			mockNavigator.clipboard.writeText = jasmine.createSpy().and.returnValue(Promise.resolve('success'));
			const mockWindow = { isSecureContext: false, navigator: mockNavigator };


			const instanceUnderTest = new ShareService(mockWindow);
			instanceUnderTest.copyToClipboard('foo')
				.then(() => {
					done(new Error('Promise should not be resolved'));
				}, (reason) => {
					expect(reason.message).toBe('Clipboard API is not available');
					expect(mockNavigator.clipboard.writeText).not.toHaveBeenCalled();
					done();
				});
		});
	});

	describe('encode current state to url', () => {

		describe('_extractLayersState', () => {
			it('extracts the current layers state', () => {
				setup();
				const instanceUnderTest = new ShareService();
				addLayer('someLayer');
				addLayer('anotherLayer');

				const extract = instanceUnderTest._extractLayers();
				expect(extract[QueryParameters.LAYER]).toEqual(['someLayer', 'anotherLayer']);
				expect(extract[QueryParameters.LAYER_OPACITY]).not.toBeDefined();
				expect(extract[QueryParameters.LAYER_VISIBILITY]).not.toBeDefined();
			});

			it('extracts the current layers state considering non default values', () => {
				setup();
				const instanceUnderTest = new ShareService();
				addLayer('someLayer', { opacity: 0.5 });
				addLayer('anotherLayer', { visible: false });

				const extract = instanceUnderTest._extractLayers();
				expect(extract[QueryParameters.LAYER]).toEqual(['someLayer', 'anotherLayer']);
				expect(extract[QueryParameters.LAYER_OPACITY]).toEqual([0.5, 1.0]);
				expect(extract[QueryParameters.LAYER_VISIBILITY]).toEqual([true, false]);
			});
		});

		describe('_extractLayersState', () => {
			it('extracts the current layers state', () => {
				setup();
				const instanceUnderTest = new ShareService();
				addLayer('someLayer');
				addLayer('anotherLayer');

				const extract = instanceUnderTest._extractLayers();
				expect(extract[QueryParameters.LAYER]).toEqual(['someLayer', 'anotherLayer']);
				expect(extract[QueryParameters.LAYER_OPACITY]).not.toBeDefined();
				expect(extract[QueryParameters.LAYER_VISIBILITY]).not.toBeDefined();
			});

			it('extracts the current layers state considering non default values', () => {
				setup();
				const instanceUnderTest = new ShareService();
				addLayer('someLayer', { opacity: 0.5 });
				addLayer('anotherLayer', { visible: false });

				const extract = instanceUnderTest._extractLayers();

				expect(extract[QueryParameters.LAYER]).toEqual(['someLayer', 'anotherLayer']);
				expect(extract[QueryParameters.LAYER_OPACITY]).toEqual([0.5, 1.0]);
				expect(extract[QueryParameters.LAYER_VISIBILITY]).toEqual([true, false]);
			});
		});

		describe('_extractPosition', () => {
			it('extracts the current layers state', () => {
				const viewSrid = 25832;
				const mapSrid = 3857;
				setup();
				const instanceUnderTest = new ShareService();
				spyOn(mapService, 'getSridDefinitionsForView').and.returnValue([{ code: viewSrid, digits: 3 }]);
				spyOn(mapService, 'getDefaultSridForView').and.returnValue(viewSrid);
				spyOn(mapService, 'getSrid').and.returnValue(mapSrid);
				spyOn(coordinateService, 'transform').withArgs([21, 42], mapSrid, viewSrid).and.returnValue([44.12345, 88.12345]);
				changeZoomAndCenter({ zoom: 5, center: [21, 42] });

				const extract = instanceUnderTest._extractPosition();

				expect(extract[QueryParameters.ZOOM]).toBe(5);
				expect(extract[QueryParameters.CENTER]).toEqual(['44.123', '88.123']);
			});
		});

		describe('encodeState', () => {
			
			it('encodes a state object to url', () => {
				const instanceUnderTest = new ShareService();

				spyOn(instanceUnderTest, '_extractPosition').and.returnValue({ z: 5, c: ['44.123', '88.123'] });
				spyOn(instanceUnderTest, '_extractLayers').and.returnValue({ l: ['some', 'other'] });

				const encoded = instanceUnderTest.encode();
				const queryParams = new URLSearchParams(new URL(encoded).search);

				expect(encoded.includes(window.location.href)).toBeTrue();
				expect(queryParams.get(QueryParameters.LAYER)).toBe('some,other');
				expect(queryParams.get(QueryParameters.ZOOM)).toBe('5');
				expect(queryParams.get(QueryParameters.CENTER)).toBe('44.123,88.123');
			});
		});
	});
});

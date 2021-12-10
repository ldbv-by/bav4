import { $injector } from '../../src/injection';
import { addLayer } from '../../src/store/layers/layers.action';
import { layersReducer } from '../../src/store/layers/layers.reducer';
import { changeRotation, changeZoomAndCenter } from '../../src/store/position/position.action';
import { positionReducer } from '../../src/store/position/position.reducer';
import { setCurrent } from '../../src/store/topics/topics.action';
import { topicsReducer } from '../../src/store/topics/topics.reducer';
import { QueryParameters } from '../../src/services/domain/queryParameters';
import { ShareService } from '../../src/services/ShareService';
import { TestUtils } from '../test-utils';
import { round } from '../../src/utils/numberUtils';

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
			position: positionReducer,
			topics: topicsReducer
		});
		$injector
			.registerSingleton('CoordinateService', coordinateService)
			.registerSingleton('MapService', mapService);

		return store;
	};

	describe('class', () => {

		it('defines constant values', async () => {

			expect(ShareService.ROTATION_VALUE_PRECISION).toBe(4);
			expect(ShareService.ZOOM_LEVEL_PRECISION).toBe(3);
		});
	});


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

		it('rejects when Clipboard API is not available', async () => {
			const mockNavigator = { clipboard: {} };
			mockNavigator.clipboard.writeText = jasmine.createSpy().and.returnValue(Promise.resolve('success'));
			const mockWindow = { isSecureContext: false, navigator: mockNavigator };

			const instanceUnderTest = new ShareService(mockWindow);

			try {
				await instanceUnderTest.copyToClipboard('foo');
				throw new Error('Promise should not be resolved');
			}
			catch (error) {
				expect(error.message).toBe('Clipboard API is not available');
				expect(mockNavigator.clipboard.writeText).not.toHaveBeenCalled();
			}
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

			it('extracts the current layers state ignoring hidden layer', () => {
				setup();
				const instanceUnderTest = new ShareService();
				addLayer('someLayer', { constraints: { hidden: true } });
				addLayer('anotherLayer');

				const extract = instanceUnderTest._extractLayers();
				expect(extract[QueryParameters.LAYER]).toEqual(['anotherLayer']);
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

			describe('and rotation = 0', () => {

				it('extracts the position state', () => {
					const zoomLevel = 5.353673;
					const viewSrid = 25832;
					const mapSrid = 3857;
					setup();
					const instanceUnderTest = new ShareService();
					spyOn(mapService, 'getSridDefinitionsForView').and.returnValue([{ code: viewSrid, digits: 3 }]);
					spyOn(mapService, 'getDefaultSridForView').and.returnValue(viewSrid);
					spyOn(mapService, 'getSrid').and.returnValue(mapSrid);
					spyOn(coordinateService, 'transform').withArgs([21, 42], mapSrid, viewSrid).and.returnValue([44.12345, 88.12345]);
					changeZoomAndCenter({ zoom: zoomLevel, center: [21, 42] });

					const extract = instanceUnderTest._extractPosition();

					expect(extract[QueryParameters.ZOOM]).toBe(round(zoomLevel, ShareService.ZOOM_LEVEL_PRECISION));
					expect(extract[QueryParameters.CENTER]).toEqual(['44.123', '88.123']);
					expect(extract[QueryParameters.ROTATION]).toBeUndefined();
				});
			});

			describe('and rotation != 0', () => {

				it('extracts the current position state', () => {
					const zoomLevel = 5.353673;
					const rotationValue = .5347485;
					const viewSrid = 25832;
					const mapSrid = 3857;
					setup();
					const instanceUnderTest = new ShareService();
					spyOn(mapService, 'getSridDefinitionsForView').and.returnValue([{ code: viewSrid, digits: 3 }]);
					spyOn(mapService, 'getDefaultSridForView').and.returnValue(viewSrid);
					spyOn(mapService, 'getSrid').and.returnValue(mapSrid);
					spyOn(coordinateService, 'transform').withArgs([21, 42], mapSrid, viewSrid).and.returnValue([44.12345, 88.12345]);
					changeZoomAndCenter({ zoom: zoomLevel, center: [21, 42] });
					changeRotation(rotationValue);

					const extract = instanceUnderTest._extractPosition();

					expect(extract[QueryParameters.ZOOM]).toBe(round(zoomLevel, ShareService.ZOOM_LEVEL_PRECISION));
					expect(extract[QueryParameters.CENTER]).toEqual(['44.123', '88.123']);
					expect(extract[QueryParameters.ROTATION]).toBe(round(rotationValue, ShareService.ROTATION_VALUE_PRECISION));
				});
			});
		});

		describe('_extractTopic', () => {
			it('extracts the current topics state', () => {
				setup();
				const instanceUnderTest = new ShareService();
				setCurrent('someTopic');

				const extract = instanceUnderTest._extractTopic();

				expect(extract[QueryParameters.TOPIC]).toBe('someTopic');
			});
		});

		describe('_mergeExtraParams', () => {

			it('merges an array when key already present', () => {
				setup();
				const instanceUnderTest = new ShareService();

				const { l: l1 } = instanceUnderTest._mergeExtraParams({ l: ['a', 'b'] }, { l: 'c' });

				expect(l1).toEqual(['a', 'b', 'c']);

				const { l: l2 } = instanceUnderTest._mergeExtraParams({ l: ['a', 'b'] }, { l: ['b', 'c'] });

				expect(l2).toEqual(['a', 'b', 'b', 'c']);
			});

			it('adds value(s) when key not present', () => {
				setup();
				const instanceUnderTest = new ShareService();

				const result = instanceUnderTest._mergeExtraParams({ foo: 'bar' }, { l: .5 });

				expect(result).toEqual({ foo: 'bar', l: .5 });
			});

			it('does nothing when key not present', () => {
				setup();
				const instanceUnderTest = new ShareService();

				const result = instanceUnderTest._mergeExtraParams({ foo: 'bar' }, { foo: 'other' });

				expect(result).toEqual({ foo: 'bar' });
			});
		});

		describe('encodeState', () => {

			it('encodes a state object to url', () => {
				const instanceUnderTest = new ShareService();
				spyOn(instanceUnderTest, '_extractPosition').and.returnValue({ z: 5, c: ['44.123', '88.123'] });
				spyOn(instanceUnderTest, '_extractLayers').and.returnValue({ l: ['someLayer', 'anotherLayer'] });
				spyOn(instanceUnderTest, '_extractTopic').and.returnValue({ t: 'someTopic' });
				const _mergeExtraParamsSpy = spyOn(instanceUnderTest, '_mergeExtraParams').withArgs(jasmine.anything(), {}).and.callThrough();

				const encoded = instanceUnderTest.encodeState();
				const queryParams = new URLSearchParams(new URL(encoded).search);

				expect(encoded.includes(window.location.href)).toBeTrue();
				expect(queryParams.get(QueryParameters.LAYER)).toBe('someLayer,anotherLayer');
				expect(queryParams.get(QueryParameters.ZOOM)).toBe('5');
				expect(queryParams.get(QueryParameters.CENTER)).toBe('44.123,88.123');
				expect(queryParams.get(QueryParameters.TOPIC)).toBe('someTopic');
				expect(_mergeExtraParamsSpy).toHaveBeenCalled();
			});

			it('encodes a state object to url merging extra parameter', () => {
				const instanceUnderTest = new ShareService();
				const extraParam = { foo: 'bar' };
				spyOn(instanceUnderTest, '_extractPosition').and.returnValue({ z: 5, c: ['44.123', '88.123'] });
				spyOn(instanceUnderTest, '_extractLayers').and.returnValue({ l: ['someLayer', 'anotherLayer'] });
				spyOn(instanceUnderTest, '_extractTopic').and.returnValue({ t: 'someTopic' });
				const _mergeExtraParamsSpy = spyOn(instanceUnderTest, '_mergeExtraParams').withArgs(jasmine.anything(), extraParam).and.callThrough();

				const encoded = instanceUnderTest.encodeState(extraParam);
				const queryParams = new URLSearchParams(new URL(encoded).search);

				expect(encoded.includes(window.location.href)).toBeTrue();
				expect(queryParams.get(QueryParameters.LAYER)).toBe('someLayer,anotherLayer');
				expect(queryParams.get(QueryParameters.ZOOM)).toBe('5');
				expect(queryParams.get(QueryParameters.CENTER)).toBe('44.123,88.123');
				expect(queryParams.get(QueryParameters.TOPIC)).toBe('someTopic');
				expect(queryParams.get('foo')).toBe('bar');
				expect(_mergeExtraParamsSpy).toHaveBeenCalled();
			});
		});
	});
});

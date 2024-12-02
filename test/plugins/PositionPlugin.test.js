import { PositionPlugin } from '../../src/plugins/PositionPlugin';
import { TestUtils } from '../test-utils.js';
import { positionReducer } from '../../src/store/position/position.reducer';
import { $injector } from '../../src/injection';
import { QueryParameters } from '../../src/domain/queryParameters';
import { indicateAttributeChange } from '../../src/store/wcAttribute/wcAttribute.action.js';
import { wcAttributeReducer } from '../../src/store/wcAttribute/wcAttribute.reducer.js';

describe('PositionPlugin', () => {
	const mapServiceMock = {
		getDefaultMapExtent() {},
		getLocalProjectedSrid() {},
		getSrid() {},
		getMaxZoomLevel: () => {}
	};

	const coordinateService = {
		transform() {},
		getCenter() {}
	};

	const environmentService = {
		getQueryParams: () => new URLSearchParams(),
		isEmbeddedAsWC: () => false
	};

	const setup = (state) => {
		const store = TestUtils.setupStoreAndDi(state, {
			position: positionReducer,
			wcAttribute: wcAttributeReducer
		});
		$injector
			.registerSingleton('MapService', mapServiceMock)
			.registerSingleton('CoordinateService', coordinateService)
			.registerSingleton('EnvironmentService', environmentService);

		return store;
	};

	describe('register', () => {
		it('calls #register', async () => {
			const store = setup();
			const instanceUnderTest = new PositionPlugin();
			const spy = spyOn(instanceUnderTest, '_init').withArgs(store).and.stub();

			await instanceUnderTest.register(store);

			expect(spy).toHaveBeenCalledTimes(1);
		});

		describe('_init', () => {
			it('sets the position by calling #_setPositionFromQueryParams', async () => {
				const store = setup();
				const instanceUnderTest = new PositionPlugin();
				const setPositionFromQueryParamsSpy = spyOn(instanceUnderTest, '_setPositionFromQueryParams');

				instanceUnderTest._init(store);
				await TestUtils.timeout();

				expect(setPositionFromQueryParamsSpy).toHaveBeenCalledTimes(1);
			});
		});

		describe('_setPositionFromConfig', () => {
			it('sets the position by zooming to configured extent', async () => {
				const store = setup();
				const initialFitRequest = store.getState().position.fitRequest;

				const instanceUnderTest = new PositionPlugin();
				const mapServiceSpy = spyOn(mapServiceMock, 'getDefaultMapExtent').and.returnValue([[21, 21, 42, 42]]);

				instanceUnderTest._setPositionFromConfig();

				await TestUtils.timeout();
				expect(mapServiceSpy).toHaveBeenCalledTimes(1);
				expect(store.getState().position.fitRequest).not.toEqual(initialFitRequest);
				expect(store.getState().position.fitRequest.payload.options).toEqual({ useVisibleViewport: false });
			});
		});

		describe('_setPositionFromQueryParams', () => {
			it('sets the position based on zoom level and geodetic coordinate', () => {
				const store = setup();
				const instanceUnderTest = new PositionPlugin();
				const geodeticCoord = [604384, 5537812];
				const expectedCoordinate = [11111, 22222];
				const expectedZoomLevel = 5;
				const expectedRotationValue = 0;
				const queryParam = new URLSearchParams(`${QueryParameters.CENTER}=${geodeticCoord.join(',')}&${QueryParameters.ZOOM}=${expectedZoomLevel}`);
				spyOn(environmentService, 'getQueryParams').and.returnValue(queryParam);
				spyOn(mapServiceMock, 'getLocalProjectedSrid').and.returnValue(4242);
				spyOn(mapServiceMock, 'getSrid').and.returnValue(3857);
				spyOn(coordinateService, 'transform').withArgs(geodeticCoord, 4242, 3857).and.returnValue(expectedCoordinate);

				instanceUnderTest._setPositionFromQueryParams(new URLSearchParams(queryParam));

				expect(store.getState().position.center).toEqual(expectedCoordinate);
				expect(store.getState().position.zoom).toBe(expectedZoomLevel);
				expect(store.getState().position.rotation).toBe(expectedRotationValue);
			});

			it('sets the position based on zoom level and wgs84 coordinate', () => {
				const store = setup();
				const instanceUnderTest = new PositionPlugin();
				const wgs84Coordinate = [11, 48];
				const expectedCoordinate = [11111, 22222];
				const expectedZoomLevel = 5;
				const expectedRotationValue = 0;
				const queryParam = new URLSearchParams(`${QueryParameters.CENTER}=${wgs84Coordinate.join(',')}&${QueryParameters.ZOOM}=${expectedZoomLevel}`);
				spyOn(environmentService, 'getQueryParams').and.returnValue(queryParam);
				spyOn(mapServiceMock, 'getSrid').and.returnValue(3857);
				spyOn(coordinateService, 'transform').withArgs(wgs84Coordinate, 4326, 3857).and.returnValue(expectedCoordinate);

				instanceUnderTest._setPositionFromQueryParams(new URLSearchParams(queryParam));

				expect(store.getState().position.center).toEqual(expectedCoordinate);
				expect(store.getState().position.zoom).toBe(expectedZoomLevel);
				expect(store.getState().position.rotation).toBe(expectedRotationValue);
			});

			it('sets the position based on zoom level, coordinate and rotation value', () => {
				const store = setup();
				const instanceUnderTest = new PositionPlugin();
				const wgs84Coordinate = [11, 48];
				const expectedCoordinate = [11111, 22222];
				const expectedZoomLevel = 5;
				const expectedRotationValue = 0.5;
				const queryParam = new URLSearchParams(
					`${QueryParameters.CENTER}=${wgs84Coordinate.join(',')}&${QueryParameters.ZOOM}=${expectedZoomLevel}&${
						QueryParameters.ROTATION
					}=${expectedRotationValue}`
				);
				spyOn(environmentService, 'getQueryParams').and.returnValue(queryParam);
				spyOn(mapServiceMock, 'getSrid').and.returnValue(3857);
				spyOn(coordinateService, 'transform').withArgs(wgs84Coordinate, 4326, 3857).and.returnValue(expectedCoordinate);

				instanceUnderTest._setPositionFromQueryParams(new URLSearchParams(queryParam));

				expect(store.getState().position.center).toEqual(expectedCoordinate);
				expect(store.getState().position.zoom).toBe(expectedZoomLevel);
				expect(store.getState().position.rotation).toBe(expectedRotationValue);
			});

			it('sets the position based on coordinate and rotation value', () => {
				const store = setup();
				const instanceUnderTest = new PositionPlugin();
				const wgs84Coordinate = [11, 48];
				const expectedCoordinate = [11111, 22222];
				const expectedRotationValue = 0.5;
				const queryParam = new URLSearchParams(
					`${QueryParameters.CENTER}=${wgs84Coordinate.join(',')}&${QueryParameters.ROTATION}=${expectedRotationValue}`
				);
				spyOn(environmentService, 'getQueryParams').and.returnValue(queryParam);
				spyOn(mapServiceMock, 'getSrid').and.returnValue(3857);
				spyOn(mapServiceMock, 'getMaxZoomLevel').and.returnValue(20);
				spyOn(coordinateService, 'transform').withArgs(wgs84Coordinate, 4326, 3857).and.returnValue(expectedCoordinate);

				instanceUnderTest._setPositionFromQueryParams(new URLSearchParams(queryParam));

				expect(store.getState().position.center).toEqual(expectedCoordinate);
				expect(store.getState().position.zoom).toBe(10);
				expect(store.getState().position.rotation).toBe(expectedRotationValue);
			});

			it('sets the position based on coordinate', () => {
				const store = setup();
				const instanceUnderTest = new PositionPlugin();
				const wgs84Coordinate = [11, 48];
				const expectedCoordinate = [11111, 22222];
				const queryParam = new URLSearchParams(`${QueryParameters.CENTER}=${wgs84Coordinate.join(',')}`);
				spyOn(environmentService, 'getQueryParams').and.returnValue(queryParam);
				spyOn(mapServiceMock, 'getSrid').and.returnValue(3857);
				spyOn(mapServiceMock, 'getMaxZoomLevel').and.returnValue(20);
				spyOn(coordinateService, 'transform').withArgs(wgs84Coordinate, 4326, 3857).and.returnValue(expectedCoordinate);

				instanceUnderTest._setPositionFromQueryParams(new URLSearchParams(queryParam));

				expect(store.getState().position.center).toEqual(expectedCoordinate);
				expect(store.getState().position.zoom).toBe(10);
				expect(store.getState().position.rotation).toBe(0);
			});

			it('sets the position based on zoom level and rotation value', () => {
				const store = setup();
				const instanceUnderTest = new PositionPlugin();
				const expectedZoomLevel = 5;
				const expectedRotationValue = 0.5;
				const expectedCoordinate = [11111, 22222];
				const extent = [[21, 21, 42, 42]];
				const queryParam = new URLSearchParams(`${QueryParameters.ZOOM}=${expectedZoomLevel}&${QueryParameters.ROTATION}=${expectedRotationValue}`);
				spyOn(environmentService, 'getQueryParams').and.returnValue(queryParam);
				spyOn(mapServiceMock, 'getSrid').and.returnValue(3857);
				spyOn(mapServiceMock, 'getDefaultMapExtent').and.returnValue(extent);
				spyOn(coordinateService, 'getCenter').withArgs(extent).and.returnValue(expectedCoordinate);

				instanceUnderTest._setPositionFromQueryParams(new URLSearchParams(queryParam));

				expect(store.getState().position.center).toEqual(expectedCoordinate);
				expect(store.getState().position.zoom).toBe(expectedZoomLevel);
				expect(store.getState().position.rotation).toBe(expectedRotationValue);
			});

			it('sets the position based on zoom level', () => {
				const store = setup();
				const instanceUnderTest = new PositionPlugin();
				const expectedZoomLevel = 5;
				const expectedCoordinate = [11111, 22222];
				const extent = [[21, 21, 42, 42]];
				const queryParam = new URLSearchParams(`${QueryParameters.ZOOM}=${expectedZoomLevel}`);
				spyOn(environmentService, 'getQueryParams').and.returnValue(queryParam);
				spyOn(mapServiceMock, 'getSrid').and.returnValue(3857);
				spyOn(mapServiceMock, 'getDefaultMapExtent').and.returnValue(extent);
				spyOn(coordinateService, 'getCenter').withArgs(extent).and.returnValue(expectedCoordinate);

				instanceUnderTest._setPositionFromQueryParams(new URLSearchParams(queryParam));

				expect(store.getState().position.center).toEqual(expectedCoordinate);
				expect(store.getState().position.zoom).toBe(expectedZoomLevel);
				expect(store.getState().position.rotation).toBe(0);
			});

			it('sets the position by calling #_setPositionFromConfig as fallback', async () => {
				const store = setup();
				const instanceUnderTest = new PositionPlugin();
				const expectedRotationValue = 0.5;
				const wgs84Coordinate = ['some', 'thing'];
				const expectedZoomLevel = 'unparseable';
				const queryParam = `${QueryParameters.CENTER}=${wgs84Coordinate.join(',')}&${QueryParameters.ZOOM}=${expectedZoomLevel}&${QueryParameters.ROTATION}=${expectedRotationValue}`;
				const setPositionFromConfigSpy = spyOn(instanceUnderTest, '_setPositionFromConfig');

				instanceUnderTest._setPositionFromQueryParams(new URLSearchParams(queryParam));

				expect(store.getState().position.rotation).toBe(expectedRotationValue);
				expect(setPositionFromConfigSpy).toHaveBeenCalled();
			});
		});

		describe('attribute change of the public web component', () => {
			it('calls #_setPositionFromQueryParams', async () => {
				const store = setup();
				const queryParam = new URLSearchParams(`${QueryParameters.CENTER}=21,42&${QueryParameters.ZOOM}=5`);
				const instanceUnderTest = new PositionPlugin();
				const getQueryParamsSpy = spyOn(environmentService, 'getQueryParams').and.returnValue(queryParam);
				const setPositionFromQueryParamsSpy = spyOn(instanceUnderTest, '_setPositionFromQueryParams').withArgs(queryParam).and.stub();
				spyOn(environmentService, 'isEmbeddedAsWC').and.returnValue(true);
				await instanceUnderTest._init(store);
				expect(setPositionFromQueryParamsSpy).toHaveBeenCalledTimes(1);
				expect(getQueryParamsSpy).toHaveBeenCalledTimes(1);

				indicateAttributeChange();

				expect(setPositionFromQueryParamsSpy).toHaveBeenCalledTimes(2);
				expect(getQueryParamsSpy).toHaveBeenCalledTimes(2);
			});
		});
	});
});

import { PositionPlugin } from '@src/plugins/PositionPlugin';
import { TestUtils } from '@test/test-utils.js';
import { positionReducer } from '@src/store/position/position.reducer';
import { $injector } from '@src/injection';
import { QueryParameters } from '@src/domain/queryParameters';

describe('PositionPlugin', () => {
	const mapServiceMock = {
		getDefaultMapExtent() {},
		getLocalProjectedSrid() {},
		getSrid() {},
		getMinZoomLevel: () => {},
		getMaxZoomLevel: () => {}
	};

	const coordinateService = {
		transform() {},
		getCenter() {}
	};

	const environmentService = {
		getQueryParams: () => new URLSearchParams()
	};

	const setup = (state) => {
		const store = TestUtils.setupStoreAndDi(state, {
			position: positionReducer
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
			const spy = vi.spyOn(instanceUnderTest, '_init').mockImplementation(() => {});

			await instanceUnderTest.register(store);

			expect(spy).toHaveBeenCalledTimes(1);
		});

		describe('_init', () => {
			it('sets the position by calling #_setPositionFromQueryParams', async () => {
				const store = setup();
				const instanceUnderTest = new PositionPlugin();
				const setPositionFromQueryParamsSpy = vi.spyOn(instanceUnderTest, '_setPositionFromQueryParams').mockImplementation(() => {});

				instanceUnderTest._init(store);
				await TestUtils.timeout();

				expect(setPositionFromQueryParamsSpy).toHaveBeenCalledTimes(1);
			});
		});

		describe('_setPositionFromConfig', () => {
			it('sets the position by zooming to configured extent', async () => {
				const store = setup();
				const expectedRotationValue = 0.5;
				const initialFitRequest = store.getState().position.fitRequest;
				const instanceUnderTest = new PositionPlugin();
				const mapServiceSpy = vi.spyOn(mapServiceMock, 'getDefaultMapExtent').mockReturnValue([[21, 21, 42, 42]]);

				instanceUnderTest._setPositionFromConfig(expectedRotationValue);

				await TestUtils.timeout();
				expect(mapServiceSpy).toHaveBeenCalledTimes(1);
				expect(store.getState().position.fitRequest).not.toEqual(initialFitRequest);
				expect(store.getState().position.fitRequest.payload.options).toEqual({ useVisibleViewport: false });
				expect(store.getState().position.rotation).toBe(expectedRotationValue);
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
				vi.spyOn(environmentService, 'getQueryParams').mockReturnValue(queryParam);
				vi.spyOn(mapServiceMock, 'getLocalProjectedSrid').mockReturnValue(4242);
				vi.spyOn(mapServiceMock, 'getSrid').mockReturnValue(3857);
				const transformSpy = vi.spyOn(coordinateService, 'transform').mockReturnValue(expectedCoordinate);

				instanceUnderTest._setPositionFromQueryParams(new URLSearchParams(queryParam));

				expect(transformSpy).toHaveBeenCalledExactlyOnceWith(geodeticCoord, 4242, 3857);
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
				vi.spyOn(environmentService, 'getQueryParams').mockReturnValue(queryParam);
				vi.spyOn(mapServiceMock, 'getSrid').mockReturnValue(3857);
				const transformSpy = vi.spyOn(coordinateService, 'transform').mockReturnValue(expectedCoordinate);

				instanceUnderTest._setPositionFromQueryParams(new URLSearchParams(queryParam));

				expect(transformSpy).toHaveBeenCalledExactlyOnceWith(wgs84Coordinate, 4326, 3857);
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
				vi.spyOn(environmentService, 'getQueryParams').mockReturnValue(queryParam);
				vi.spyOn(mapServiceMock, 'getSrid').mockReturnValue(3857);
				const transformSpy = vi.spyOn(coordinateService, 'transform').mockReturnValue(expectedCoordinate);

				instanceUnderTest._setPositionFromQueryParams(new URLSearchParams(queryParam));

				expect(transformSpy).toHaveBeenCalledExactlyOnceWith(wgs84Coordinate, 4326, 3857);
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
				vi.spyOn(environmentService, 'getQueryParams').mockReturnValue(queryParam);
				vi.spyOn(mapServiceMock, 'getSrid').mockReturnValue(3857);
				vi.spyOn(mapServiceMock, 'getMaxZoomLevel').mockReturnValue(20);
				const transformSpy = vi.spyOn(coordinateService, 'transform').mockReturnValue(expectedCoordinate);

				instanceUnderTest._setPositionFromQueryParams(new URLSearchParams(queryParam));

				expect(transformSpy).toHaveBeenCalledExactlyOnceWith(wgs84Coordinate, 4326, 3857);
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
				vi.spyOn(environmentService, 'getQueryParams').mockReturnValue(queryParam);
				vi.spyOn(mapServiceMock, 'getSrid').mockReturnValue(3857);
				vi.spyOn(mapServiceMock, 'getMaxZoomLevel').mockReturnValue(20);
				const transformSpy = vi.spyOn(coordinateService, 'transform').mockReturnValue(expectedCoordinate);

				instanceUnderTest._setPositionFromQueryParams(new URLSearchParams(queryParam));

				expect(transformSpy).toHaveBeenCalledExactlyOnceWith(wgs84Coordinate, 4326, 3857);
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
				vi.spyOn(environmentService, 'getQueryParams').mockReturnValue(queryParam);
				vi.spyOn(mapServiceMock, 'getSrid').mockReturnValue(3857);
				vi.spyOn(mapServiceMock, 'getDefaultMapExtent').mockReturnValue(extent);
				const getCenterSpy = vi.spyOn(coordinateService, 'getCenter').mockReturnValue(expectedCoordinate);

				instanceUnderTest._setPositionFromQueryParams(new URLSearchParams(queryParam));

				expect(getCenterSpy).toHaveBeenCalledExactlyOnceWith(extent);
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
				vi.spyOn(environmentService, 'getQueryParams').mockReturnValue(queryParam);
				vi.spyOn(mapServiceMock, 'getSrid').mockReturnValue(3857);
				vi.spyOn(mapServiceMock, 'getDefaultMapExtent').mockReturnValue(extent);
				const getCenterSpy = vi.spyOn(coordinateService, 'getCenter').mockReturnValue(expectedCoordinate);

				instanceUnderTest._setPositionFromQueryParams(new URLSearchParams(queryParam));

				expect(getCenterSpy).toHaveBeenCalledExactlyOnceWith(extent);
				expect(store.getState().position.center).toEqual(expectedCoordinate);
				expect(store.getState().position.zoom).toBe(expectedZoomLevel);
				expect(store.getState().position.rotation).toBe(0);
			});

			it('sets the position by calling #_setPositionFromConfig as fallback', async () => {
				setup();
				const instanceUnderTest = new PositionPlugin();
				const expectedRotationValue = 1.5;
				const wgs84Coordinate = ['some', 'thing'];
				const expectedZoomLevel = 'unparseable';
				const queryParam = `${QueryParameters.CENTER}=${wgs84Coordinate.join(',')}&${QueryParameters.ZOOM}=${expectedZoomLevel}&${QueryParameters.ROTATION}=${expectedRotationValue}`;
				const setPositionFromConfigSpy = vi.spyOn(instanceUnderTest, '_setPositionFromConfig').mockImplementation(() => {});

				instanceUnderTest._setPositionFromQueryParams(new URLSearchParams(queryParam));

				expect(setPositionFromConfigSpy).toHaveBeenCalledExactlyOnceWith(expectedRotationValue);
			});
		});
	});
});

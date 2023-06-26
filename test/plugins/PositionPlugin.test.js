import { PositionPlugin } from '../../src/plugins/PositionPlugin';
import { TestUtils } from '../test-utils.js';
import { positionReducer } from '../../src/store/position/position.reducer';
import { $injector } from '../../src/injection';
import { QueryParameters } from '../../src/domain/queryParameters';

describe('PositionPlugin', () => {
	const mapServiceMock = {
		getDefaultMapExtent() {},
		getLocalProjectedSrid() {},
		getSrid() {},
		getMinZoomLevel: () => {},
		getMaxZoomLevel: () => {}
	};

	const coordinateServiceMock = {
		transform() {}
	};

	const environmentServiceMock = {
		getQueryParams: () => new URLSearchParams()
	};

	const setup = (state) => {
		const store = TestUtils.setupStoreAndDi(state, {
			position: positionReducer
		});
		$injector
			.registerSingleton('MapService', mapServiceMock)
			.registerSingleton('CoordinateService', coordinateServiceMock)
			.registerSingleton('EnvironmentService', environmentServiceMock);

		return store;
	};

	describe('register', () => {
		it('calls #register', async () => {
			const store = setup();
			const instanceUnderTest = new PositionPlugin();
			const spy = spyOn(instanceUnderTest, '_init');

			await instanceUnderTest.register(store);

			expect(spy).toHaveBeenCalledTimes(1);
		});

		describe('_init', () => {
			describe('no suitable query param available', () => {
				it('sets position by calling #_setPositionFromConfig', () => {
					setup();
					const instanceUnderTest = new PositionPlugin();
					const setPositionFromConfigSpy = spyOn(instanceUnderTest, '_setPositionFromConfig');
					const setPositionFromQueryParamsSpy = spyOn(instanceUnderTest, '_setPositionFromQueryParams');

					instanceUnderTest._init();

					expect(setPositionFromConfigSpy).toHaveBeenCalledTimes(1);
					expect(setPositionFromQueryParamsSpy).not.toHaveBeenCalled();
				});
			});

			describe('both CENTER and ZOOM query params available', () => {
				it('sets position by calling #_setPositionFromQueryParams', () => {
					setup();
					const queryParam = new URLSearchParams(`${QueryParameters.CENTER}=21,42&${QueryParameters.ZOOM}=5`);
					const instanceUnderTest = new PositionPlugin();
					const setPositionFromConfigSpy = spyOn(instanceUnderTest, '_setPositionFromConfig');
					const setPositionFromQueryParamsSpy = spyOn(instanceUnderTest, '_setPositionFromQueryParams');
					spyOn(environmentServiceMock, 'getQueryParams').and.returnValue(queryParam);

					instanceUnderTest._init();

					expect(setPositionFromQueryParamsSpy).toHaveBeenCalledTimes(1);
					expect(setPositionFromConfigSpy).not.toHaveBeenCalled();
				});
			});

			describe('CENTER query param available', () => {
				it('sets position by calling #_setPositionFromQueryParams (only center)', () => {
					setup();
					const queryParam = new URLSearchParams(`${QueryParameters.CENTER}=21,42`);
					const instanceUnderTest = new PositionPlugin();
					const setPositionFromConfigSpy = spyOn(instanceUnderTest, '_setPositionFromConfig');
					const setPositionFromQueryParamsSpy = spyOn(instanceUnderTest, '_setPositionFromQueryParams');
					spyOn(environmentServiceMock, 'getQueryParams').and.returnValue(queryParam);

					instanceUnderTest._init();

					expect(setPositionFromQueryParamsSpy).toHaveBeenCalledTimes(1);
					expect(setPositionFromConfigSpy).not.toHaveBeenCalled();
				});
			});

			describe('ZOOM query param available', () => {
				it('sets position by calling #_setPositionFromQueryParams (only zoom available)', () => {
					setup();
					const queryParam = new URLSearchParams(`${QueryParameters.ZOOM}=5`);
					const instanceUnderTest = new PositionPlugin();
					const setPositionFromConfigSpy = spyOn(instanceUnderTest, '_setPositionFromConfig');
					const setPositionFromQueryParamsSpy = spyOn(instanceUnderTest, '_setPositionFromQueryParams');
					spyOn(environmentServiceMock, 'getQueryParams').and.returnValue(queryParam);

					instanceUnderTest._init();

					expect(setPositionFromQueryParamsSpy).toHaveBeenCalledTimes(1);
					expect(setPositionFromConfigSpy).not.toHaveBeenCalled();
				});
			});
		});

		describe('_setPositionFromConfig', () => {
			it('sets position by zooming to configured extent', async () => {
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
			it('sets position based on zoomlevel and geodetic coordinate', () => {
				const store = setup();
				const instanceUnderTest = new PositionPlugin();
				const geodeticCoord = [604384, 5537812];
				const expextedCoordinate = [11111, 22222];
				const expectedZoomLevel = 5;
				const expectedRotationValue = 0;
				const queryParam = new URLSearchParams(`${QueryParameters.CENTER}=${geodeticCoord.join(',')}&${QueryParameters.ZOOM}=${expectedZoomLevel}`);
				spyOn(environmentServiceMock, 'getQueryParams').and.returnValue(queryParam);
				spyOn(mapServiceMock, 'getLocalProjectedSrid').and.returnValue(4242);
				spyOn(mapServiceMock, 'getSrid').and.returnValue(3857);
				spyOn(coordinateServiceMock, 'transform').withArgs(geodeticCoord, 4242, 3857).and.returnValue(expextedCoordinate);

				instanceUnderTest._setPositionFromQueryParams(new URLSearchParams(queryParam));

				expect(store.getState().position.center).toEqual(expextedCoordinate);
				expect(store.getState().position.zoom).toBe(expectedZoomLevel);
				expect(store.getState().position.rotation).toBe(expectedRotationValue);
			});

			it('sets position based on zoomlevel and wgs84 coordinate', () => {
				const store = setup();
				const instanceUnderTest = new PositionPlugin();
				const wgs84Coordinate = [11, 48];
				const expectedCoordinate = [11111, 22222];
				const expectedZoomLevel = 5;
				const expectedRotationValue = 0;
				const queryParam = new URLSearchParams(`${QueryParameters.CENTER}=${wgs84Coordinate.join(',')}&${QueryParameters.ZOOM}=${expectedZoomLevel}`);
				spyOn(environmentServiceMock, 'getQueryParams').and.returnValue(queryParam);
				spyOn(mapServiceMock, 'getSrid').and.returnValue(3857);
				spyOn(coordinateServiceMock, 'transform').withArgs(wgs84Coordinate, 4326, 3857).and.returnValue(expectedCoordinate);

				instanceUnderTest._setPositionFromQueryParams(new URLSearchParams(queryParam));

				expect(store.getState().position.center).toEqual(expectedCoordinate);
				expect(store.getState().position.zoom).toBe(expectedZoomLevel);
				expect(store.getState().position.rotation).toBe(expectedRotationValue);
			});

			it('sets position based on zoomlevel, coordinate and rotation value', () => {
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
				spyOn(environmentServiceMock, 'getQueryParams').and.returnValue(queryParam);
				spyOn(mapServiceMock, 'getSrid').and.returnValue(3857);
				spyOn(coordinateServiceMock, 'transform').withArgs(wgs84Coordinate, 4326, 3857).and.returnValue(expectedCoordinate);

				instanceUnderTest._setPositionFromQueryParams(new URLSearchParams(queryParam));

				expect(store.getState().position.center).toEqual(expectedCoordinate);
				expect(store.getState().position.zoom).toBe(expectedZoomLevel);
				expect(store.getState().position.rotation).toBe(expectedRotationValue);
			});

			it('sets position based on coordinate and rotation value', () => {
				const store = setup();
				const instanceUnderTest = new PositionPlugin();
				const wgs84Coordinate = [11, 48];
				const expectedCoordinate = [11111, 22222];
				const expectedRotationValue = 0.5;
				const queryParam = new URLSearchParams(
					`${QueryParameters.CENTER}=${wgs84Coordinate.join(',')}&${QueryParameters.ROTATION}=${expectedRotationValue}`
				);
				spyOn(environmentServiceMock, 'getQueryParams').and.returnValue(queryParam);
				spyOn(mapServiceMock, 'getSrid').and.returnValue(3857);
				spyOn(coordinateServiceMock, 'transform').withArgs(wgs84Coordinate, 4326, 3857).and.returnValue(expectedCoordinate);

				instanceUnderTest._setPositionFromQueryParams(new URLSearchParams(queryParam));

				expect(store.getState().position.center).toEqual(expectedCoordinate);
				expect(store.getState().position.rotation).toBe(expectedRotationValue);
			});

			it('sets position based on coordinate', () => {
				const store = setup();
				const instanceUnderTest = new PositionPlugin();
				const wgs84Coordinate = [11, 48];
				const expectedCoordinate = [11111, 22222];
				const queryParam = new URLSearchParams(`${QueryParameters.CENTER}=${wgs84Coordinate.join(',')}`);
				spyOn(environmentServiceMock, 'getQueryParams').and.returnValue(queryParam);
				spyOn(mapServiceMock, 'getSrid').and.returnValue(3857);
				spyOn(coordinateServiceMock, 'transform').withArgs(wgs84Coordinate, 4326, 3857).and.returnValue(expectedCoordinate);

				instanceUnderTest._setPositionFromQueryParams(new URLSearchParams(queryParam));

				expect(store.getState().position.center).toEqual(expectedCoordinate);
			});

			it('sets position based on zoomlevel and rotation value', () => {
				const store = setup();
				const instanceUnderTest = new PositionPlugin();
				const expectedZoomLevel = 5;
				const expectedRotationValue = 0.5;
				const queryParam = new URLSearchParams(`${QueryParameters.ZOOM}=${expectedZoomLevel}&${QueryParameters.ROTATION}=${expectedRotationValue}`);
				spyOn(environmentServiceMock, 'getQueryParams').and.returnValue(queryParam);
				spyOn(mapServiceMock, 'getSrid').and.returnValue(3857);

				instanceUnderTest._setPositionFromQueryParams(new URLSearchParams(queryParam));

				expect(store.getState().position.zoom).toBe(expectedZoomLevel);
				expect(store.getState().position.rotation).toBe(expectedRotationValue);
			});

			it('sets position based on zoomlevel', () => {
				const store = setup();
				const instanceUnderTest = new PositionPlugin();
				const expectedZoomLevel = 5;
				const queryParam = new URLSearchParams(`${QueryParameters.ZOOM}=${expectedZoomLevel}`);
				spyOn(environmentServiceMock, 'getQueryParams').and.returnValue(queryParam);
				spyOn(mapServiceMock, 'getSrid').and.returnValue(3857);

				instanceUnderTest._setPositionFromQueryParams(new URLSearchParams(queryParam));

				expect(store.getState().position.zoom).toBe(expectedZoomLevel);
			});

			it('sets position by calling #_setPositionFromConfig as fallback', () => {
				setup();
				const instanceUnderTest = new PositionPlugin();
				const wgs84Coordinate = ['some', 'thing'];
				const expectedZoomLevel = 'unparseable';
				const queryParam = `${QueryParameters.CENTER}=${wgs84Coordinate.join(',')}&${QueryParameters.ZOOM}=${expectedZoomLevel}`;
				const setPositionFromConfigSpy = spyOn(instanceUnderTest, '_setPositionFromConfig');

				instanceUnderTest._setPositionFromQueryParams(new URLSearchParams(queryParam));

				expect(setPositionFromConfigSpy).toHaveBeenCalled();
			});
		});
	});
});

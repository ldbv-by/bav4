import { PositionPlugin } from '../../src/plugins/PositionPlugin';
import { TestUtils } from '../test-utils.js';
import { positionReducer } from '../../src/store/position/position.reducer';
import { $injector } from '../../src/injection';
import { QueryParameters } from '../../src/services/domain/queryParameters';


describe('PositionPlugin', () => {

	const mapServiceMock = {
		getDefaultMapExtent() { },
		getDefaultGeodeticSrid() {},
		getSrid() {},
		getMinZoomLevel: () => { },
		getMaxZoomLevel: () => { }
	};

	const coordinateServiceMock = {
		transform() {}
	};

	const windowMock = {
		location: {
			get search() {
				return null;
			}
		}
	};

	const setup = (state) => {

		const store = TestUtils.setupStoreAndDi(state, {
			position: positionReducer
		});
		$injector
			.registerSingleton('MapService', mapServiceMock)
			.registerSingleton('CoordinateService', coordinateServiceMock)
			.registerSingleton('EnvironmentService', { getWindow: () => windowMock });

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

			it('sets position by calling #_setPositionFromConfig', () => {
				setup();
				const instanceUnderTest = new PositionPlugin();
				const setPositionFromConfigSpy = spyOn(instanceUnderTest, '_setPositionFromConfig');
				const setPositionFromQueryParamsSpy = spyOn(instanceUnderTest, '_setPositionFromQueryParams');

				instanceUnderTest._init();

				expect(setPositionFromConfigSpy).toHaveBeenCalledTimes(1);
				expect(setPositionFromQueryParamsSpy).not.toHaveBeenCalled();
			});

			it('sets position by calling #_setPositionFromQueryParams', () => {
				setup();
				const queryParam = `${QueryParameters.CENTER}=21,42&${QueryParameters.ZOOM}=5`;
				const instanceUnderTest = new PositionPlugin();
				const setPositionFromConfigSpy = spyOn(instanceUnderTest, '_setPositionFromConfig');
				const setPositionFromQueryParamsSpy = spyOn(instanceUnderTest, '_setPositionFromQueryParams');
				spyOnProperty(windowMock.location, 'search').and.returnValue(queryParam);

				instanceUnderTest._init();

				expect(setPositionFromQueryParamsSpy).toHaveBeenCalledTimes(1);
				expect(setPositionFromConfigSpy).not.toHaveBeenCalled();
			});

			describe('zoom query param missing', () => {
				it('sets position by calling #_setPositionFromConfig', () => {
					setup();
					const queryParam = `${QueryParameters.CENTER}=21,42`;
					const instanceUnderTest = new PositionPlugin();
					const setPositionFromConfigSpy = spyOn(instanceUnderTest, '_setPositionFromConfig');
					const setPositionFromQueryParamsSpy = spyOn(instanceUnderTest, '_setPositionFromQueryParams');
					spyOnProperty(windowMock.location, 'search').and.returnValue(queryParam);

					instanceUnderTest._init();

					expect(setPositionFromConfigSpy).toHaveBeenCalledTimes(1);
					expect(setPositionFromQueryParamsSpy).not.toHaveBeenCalled();
				});
			});

			describe('center query param missing', () => {
				it('sets position by calling #_setPositionFromConfig', () => {
					setup();
					const queryParam = `${QueryParameters.ZOOM}=5`;
					const instanceUnderTest = new PositionPlugin();
					const setPositionFromConfigSpy = spyOn(instanceUnderTest, '_setPositionFromConfig');
					const setPositionFromQueryParamsSpy = spyOn(instanceUnderTest, '_setPositionFromQueryParams');
					spyOnProperty(windowMock.location, 'search').and.returnValue(queryParam);

					instanceUnderTest._init();

					expect(setPositionFromConfigSpy).toHaveBeenCalledTimes(1);
					expect(setPositionFromQueryParamsSpy).not.toHaveBeenCalled();
				});
			});

		});

		describe('_setPositionFromConfig', () => {

			it('sets position by zooming to configured extent', (done) => {
				const store = setup();
				const initialFitRequest = store.getState().position.fitRequest;

				const instanceUnderTest = new PositionPlugin();
				const mapServiceSpy = spyOn(mapServiceMock, 'getDefaultMapExtent').and.returnValue([
					[21, 21, 42, 42]
				]);

				instanceUnderTest._setPositionFromConfig();

				setTimeout(() => {
					expect(mapServiceSpy).toHaveBeenCalledTimes(1);
					expect(store.getState().position.fitRequest).not.toEqual(initialFitRequest);
					done();
				});
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
				const queryParam = `${QueryParameters.CENTER}=${geodeticCoord.join(',')}&${QueryParameters.ZOOM}=${expectedZoomLevel}`;
				spyOnProperty(windowMock.location, 'search').and.returnValue(queryParam);
				spyOn(mapServiceMock, 'getDefaultGeodeticSrid').and.returnValue(4242);
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
				const queryParam = `${QueryParameters.CENTER}=${wgs84Coordinate.join(',')}&${QueryParameters.ZOOM}=${expectedZoomLevel}`;
				spyOnProperty(windowMock.location, 'search').and.returnValue(queryParam);
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
				const expectedRotationValue = .5;
				const queryParam = `${QueryParameters.CENTER}=${wgs84Coordinate.join(',')}&${QueryParameters.ZOOM}=${expectedZoomLevel}&${QueryParameters.ROTATION}=${expectedRotationValue}`;
				spyOnProperty(windowMock.location, 'search').and.returnValue(queryParam);
				spyOn(mapServiceMock, 'getSrid').and.returnValue(3857);
				spyOn(coordinateServiceMock, 'transform').withArgs(wgs84Coordinate, 4326, 3857).and.returnValue(expectedCoordinate);

				instanceUnderTest._setPositionFromQueryParams(new URLSearchParams(queryParam));

				expect(store.getState().position.center).toEqual(expectedCoordinate);
				expect(store.getState().position.zoom).toBe(expectedZoomLevel);
				expect(store.getState().position.rotation).toBe(expectedRotationValue);
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

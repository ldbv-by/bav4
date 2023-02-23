import { OverlayService } from '../../../../src/modules/olMap/services/OverlayService';
import { $injector } from '../../../../src/injection';
import { TestUtils } from '../../../test-utils.js';
import { Feature } from 'ol';
import { Polygon } from 'ol/geom';
import { StyleTypes } from '../../../../src/modules/olMap/services/StyleService';
import proj4 from 'proj4';
import { register } from 'ol/proj/proj4';
import { measurementReducer } from '../../../../src/store/measurement/measurement.reducer';

proj4.defs('EPSG:25832', '+proj=utm +zone=32 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs +axis=neu');
register(proj4);

describe('OverlayService', () => {
	const initialState = {
		active: false,
		statistic: { length: 0, area: 0 },
		selection: [],
		reset: null,
		fileSaveResult: { adminId: 'init', fileId: 'init' }
	};
	const mapServiceMock = {
		getSrid: () => 3857,
		getDefaultGeodeticSrid: () => 25832
	};

	const environmentServiceMock = {
		isTouch() {}
	};

	const unitsServiceMock = {
		// eslint-disable-next-line no-unused-vars
		formatDistance: (distance, decimals) => {
			return distance + ' m';
		},
		// eslint-disable-next-line no-unused-vars
		formatArea: (area, decimals) => {
			return area + ' m²';
		}
	};
	beforeAll(() => {
		const measurementState = {
			measurement: initialState
		};
		TestUtils.setupStoreAndDi(measurementState, { measurement: measurementReducer });
		$injector
			.registerSingleton('MapService', mapServiceMock)
			.registerSingleton('EnvironmentService', environmentServiceMock)
			.registerSingleton('UnitsService', unitsServiceMock)
			.register('OverlayService', OverlayService);
	});

	let instanceUnderTest;
	beforeEach(() => {
		instanceUnderTest = new OverlayService();
	});
	const viewMock = {
		getResolution() {
			return 50;
		}
	};
	const mapMock = {
		getView: () => viewMock,
		addOverlay: () => {},
		removeOverlay: () => {},
		getOverlays: () => [],
		getInteractions() {
			return { getArray: () => [] };
		}
	};

	describe('add overlays', () => {
		it('adds measure-overlays to feature ', () => {
			const feature = new Feature({
				geometry: new Polygon([
					[
						[0, 0],
						[1, 0],
						[1, 1],
						[0, 1],
						[0, 0]
					]
				])
			});
			feature.setId('measure_123');
			const addOverlaySpy = jasmine.createSpy();
			const propertySetterSpy = spyOn(feature, 'set');
			mapMock.addOverlay = addOverlaySpy;

			instanceUnderTest = new OverlayService();
			instanceUnderTest.add(feature, mapMock, StyleTypes.MEASURE);

			expect(propertySetterSpy).toHaveBeenCalledWith('overlays', jasmine.any(Object));
			expect(addOverlaySpy).toHaveBeenCalledTimes(2);
		});

		it('adding overlays to feature with unknown style-type fails', () => {
			const feature = new Feature({
				geometry: new Polygon([
					[
						[0, 0],
						[1, 0],
						[1, 1],
						[0, 1],
						[0, 0]
					]
				])
			});
			feature.setId('measure_123');
			const warnSpy = spyOn(console, 'warn');
			const addOverlaySpy = jasmine.createSpy();
			const propertySetterSpy = spyOn(feature, 'set');
			mapMock.addOverlay = addOverlaySpy;

			instanceUnderTest.add(feature, mapMock, 'unknown');

			expect(propertySetterSpy).not.toHaveBeenCalledWith('overlays', jasmine.any(Object));
			expect(addOverlaySpy).not.toHaveBeenCalled();
			expect(warnSpy).toHaveBeenCalledWith('Could not provide a style for unknown style-type:', 'unknown');
		});
	});

	describe('update overlays', () => {
		it('updates measure-style to feature ', () => {
			const mockElement = { value: null, position: null };
			const mockOverlay = { get: () => true, getElement: () => mockElement };
			const feature = new Feature({
				geometry: new Polygon([
					[
						[0, 0],
						[1, 0],
						[1, 1],
						[0, 1],
						[0, 0]
					]
				])
			});
			feature.setId('measure_123');
			feature.set('measurement', mockOverlay);
			feature.set('area', mockOverlay);

			const addOverlaySpy = jasmine.createSpy();
			const removeOverlaySpy = jasmine.createSpy();
			const propertySetterSpy = spyOn(feature, 'set');
			mapMock.addOverlay = addOverlaySpy;
			mapMock.removeOverlay = removeOverlaySpy;

			instanceUnderTest = new OverlayService();
			instanceUnderTest.update(feature, mapMock, StyleTypes.MEASURE);
			expect(propertySetterSpy).toHaveBeenCalledWith('area', mockOverlay);
		});

		it('leaves feature to be not updated due to undetectable style ', () => {
			const feature = new Feature({
				geometry: new Polygon([
					[
						[0, 0],
						[1, 0],
						[1, 1],
						[0, 1],
						[0, 0]
					]
				])
			});
			feature.set('measurement', {});
			feature.set('area', {});

			const propertySetterSpy = spyOn(feature, 'set');

			instanceUnderTest = new OverlayService();
			spyOn(instanceUnderTest, '_getOverlayStyleByType').and.returnValue(null);
			instanceUnderTest.update(feature, mapMock, StyleTypes.MEASURE);
			expect(propertySetterSpy).not.toHaveBeenCalled();
		});
	});
	describe('remove overlays', () => {
		it('remove overlays from feature', () => {
			const feature = new Feature({
				geometry: new Polygon([
					[
						[0, 0],
						[1, 0],
						[1, 1],
						[0, 1],
						[0, 0]
					]
				])
			});
			feature.set('overlays', [{}, {}]);
			const removeOverlaySpy = jasmine.createSpy();
			const viewMock = {
				getResolution() {
					return 50;
				}
			};
			const mapMock = {
				getView: () => viewMock,
				removeOverlay: removeOverlaySpy,
				getInteractions() {
					return { getArray: () => [] };
				}
			};

			instanceUnderTest = new OverlayService();
			instanceUnderTest.remove(feature, mapMock);

			expect(removeOverlaySpy).toHaveBeenCalledTimes(2);
		});
	});
});

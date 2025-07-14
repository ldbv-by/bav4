import { OverlayService } from '../../../../src/modules/olMap/services/OverlayService';
import { $injector } from '../../../../src/injection';
import { TestUtils } from '../../../test-utils.js';
import { Feature } from 'ol';
import { Polygon } from 'ol/geom';
import { OlFeatureStyleTypes } from '../../../../src/modules/olMap/services/OlStyleService.js';
import proj4 from 'proj4';
import { register } from 'ol/proj/proj4';
import { measurementReducer } from '../../../../src/store/measurement/measurement.reducer';
import { asInternalProperty } from '../../../../src/utils/propertyUtils.js';

proj4.defs('EPSG:25832', '+proj=utm +zone=32 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs +axis=neu');
register(proj4);

describe('OverlayService', () => {
	const initialState = {
		active: false,
		statistic: { geometryType: null, coordinate: null, azimuth: null, length: null, area: null },
		displayRuler: true,
		selection: [],
		reset: null
	};
	const mapServiceMock = {
		getSrid: () => 3857,
		getLocalProjectedSrid: () => 25832,
		calcLength: () => 1
	};

	const environmentServiceMock = {
		isTouch() {}
	};

	const unitsServiceMock = {
		// eslint-disable-next-line no-unused-vars
		formatDistance: (distance, decimals) => {
			return { value: distance, localizedValue: distance, unit: 'm' };
		},
		// eslint-disable-next-line no-unused-vars
		formatArea: (area, decimals) => {
			return { value: area, localizedValue: area, unit: 'm²' };
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
		},
		on: () => {}
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
		it('adds measure-overlays to a feature ', () => {
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
			const addListenerSpy = spyOn(viewMock, 'on')
				.withArgs('change:resolution', jasmine.any(Function))
				.and.callThrough(() => {});
			const propertySetterSpy = spyOn(feature, 'set');
			mapMock.addOverlay = addOverlaySpy;

			instanceUnderTest = new OverlayService();
			instanceUnderTest.add(feature, mapMock, OlFeatureStyleTypes.MEASURE);

			expect(propertySetterSpy).toHaveBeenCalledWith(asInternalProperty('overlays'), jasmine.any(Object));
			expect(addOverlaySpy).toHaveBeenCalledTimes(2);
			expect(addListenerSpy).toHaveBeenCalled();
		});

		it('does NOT add overlays to a feature with draw specific style-type', () => {
			const drawSpecificStyleTypes = ['draw', 'point', 'line', 'polygon', 'marker', 'text'];
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

			drawSpecificStyleTypes.forEach((t) => instanceUnderTest.add(feature, mapMock, t));

			expect(propertySetterSpy).not.toHaveBeenCalledWith(asInternalProperty('overlays'), jasmine.any(Object));
			expect(addOverlaySpy).not.toHaveBeenCalled();
			expect(warnSpy).not.toHaveBeenCalled();
		});

		it('adding overlays to a feature with unknown style-type fails', () => {
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

			expect(propertySetterSpy).not.toHaveBeenCalledWith(asInternalProperty('overlays'), jasmine.any(Object));
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
			feature.set(asInternalProperty('measurement'), mockOverlay);
			feature.set(asInternalProperty('area'), mockOverlay);

			const addOverlaySpy = jasmine.createSpy();
			const removeOverlaySpy = jasmine.createSpy();
			const propertySetterSpy = spyOn(feature, 'set');
			mapMock.addOverlay = addOverlaySpy;
			mapMock.removeOverlay = removeOverlaySpy;

			instanceUnderTest = new OverlayService();
			instanceUnderTest.update(feature, mapMock, OlFeatureStyleTypes.MEASURE);
			expect(propertySetterSpy).toHaveBeenCalledWith(asInternalProperty('area'), mockOverlay);
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
			feature.set(asInternalProperty('measurement'), {});
			feature.set(asInternalProperty('area'), {});

			const propertySetterSpy = spyOn(feature, 'set');

			instanceUnderTest = new OverlayService();
			spyOn(instanceUnderTest, '_getOverlayStyleByType').and.returnValue(null);
			instanceUnderTest.update(feature, mapMock, OlFeatureStyleTypes.MEASURE);
			expect(propertySetterSpy).not.toHaveBeenCalled();
		});
	});
	describe('remove overlays', () => {
		it('removes overlays from a feature', () => {
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
			feature.set(asInternalProperty('overlays'), [{}, {}]);
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

		it('removes overlays from a feature with default style', () => {
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
			feature.set(asInternalProperty('overlays'), [{}, {}]);
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
			instanceUnderTest.remove(feature, mapMock, OlFeatureStyleTypes.DEFAULT);

			expect(removeOverlaySpy).toHaveBeenCalledTimes(2);
		});

		it('removes overlays from a feature with unknown style', () => {
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
			feature.set(asInternalProperty('overlays'), [{}, {}]);
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
			instanceUnderTest.remove(feature, mapMock, 'some');

			expect(removeOverlaySpy).toHaveBeenCalledTimes(0);
		});

		it('removes overlays from a measurement feature', () => {
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
			feature.set(asInternalProperty('overlays'), [{}, {}]);
			feature.set(asInternalProperty('measurement_style_listeners'), [jasmine.createSpy()]);
			const removeOverlaySpy = jasmine.createSpy();
			const unsetSpy = spyOn(feature, 'unset').and.callFake(() => {});
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
			instanceUnderTest.remove(feature, mapMock, OlFeatureStyleTypes.MEASURE);

			expect(removeOverlaySpy).toHaveBeenCalledTimes(2);
			expect(unsetSpy).toHaveBeenCalledWith(asInternalProperty('measurement_style_listeners'));
		});
	});
});

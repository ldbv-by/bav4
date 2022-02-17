import { Feature } from 'ol';
import { MeasurementOverlayStyle, saveManualOverlayPosition } from '../../../../../../../src/modules/map/components/olMap/handler/measure/MeasurementOverlayStyle';
import { TestUtils } from '../../../../../../test-utils.js';
import { LineString, Polygon } from 'ol/geom';
import { $injector } from '../../../../../../../src/injection';
import proj4 from 'proj4';
import { register } from 'ol/proj/proj4';



proj4.defs('EPSG:25832', '+proj=utm +zone=32 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs +axis=neu');
register(proj4);

describe('MeasurementOverlayStyle', () => {
	const environmentServiceMock = { isTouch: () => false };
	const setup = () => {
		TestUtils.setupStoreAndDi({});
		$injector.registerSingleton('TranslationService', { translate: (key) => key })
			.registerSingleton('MapService', { getSrid: () => 3857, getDefaultGeodeticSrid: () => 25832 })
			.registerSingleton('EnvironmentService', environmentServiceMock)
			.registerSingleton('UnitsService', {
				// eslint-disable-next-line no-unused-vars
				formatDistance: (distance, decimals) => {
					return distance + ' m';
				},
				// eslint-disable-next-line no-unused-vars
				formatArea: (area, decimals) => {
					return area + ' m²';
				}
			});

	};

	beforeEach(() => {
		setup();
	});
	const createFeature = () => {
		const feature = new Feature();
		feature.set('measurement', {});
		feature.set('area', {});
		feature.set('partitions', [{}, {}]);
		feature.set('overlays', [{}, {}, {}, {}]);
		return feature;
	};

	it('removes all overlays from feature', () => {
		const removeSpy = jasmine.createSpy();
		const mapMock = { removeOverlay: removeSpy };
		const feature = createFeature();

		const classUnderTest = new MeasurementOverlayStyle();
		classUnderTest.remove(feature, mapMock);
		expect(removeSpy).toHaveBeenCalledTimes(4);
		expect(feature.get('measurement')).toBeNull();
		expect(feature.get('area')).toBeNull();
		expect(feature.get('partitions')).toBeNull();
		expect(feature.get('overlays')).toEqual([]);
	});

	it('removes no overlays from feature with unsyncronized overlays', () => {
		const removeSpy = jasmine.createSpy();
		const mapMock = { removeOverlay: removeSpy };
		const feature = createFeature();
		feature.set('overlays', undefined);

		const classUnderTest = new MeasurementOverlayStyle();
		classUnderTest.remove(feature, mapMock);
		expect(removeSpy).not.toHaveBeenCalled();
		expect(feature.get('measurement')).toBeNull();
		expect(feature.get('area')).toBeNull();
		expect(feature.get('partitions')).toBeNull();
		expect(feature.get('overlays')).toEqual([]);
	});

	it('creates overlay content for line', () => {
		const addOverlaySpy = jasmine.createSpy();
		const mapMock = {
			addOverlay: addOverlaySpy,
			getInteractions() {
				return { getArray: () => [] };
			}
		};

		const classUnderTest = new MeasurementOverlayStyle();

		const geometry = new LineString([[0, 0], [1, 0]]);
		const feature = new Feature({ geometry: geometry });
		classUnderTest._createDistanceOverlay(feature, mapMock);

		const baOverlay = feature.get('measurement').getElement();
		expect(baOverlay.outerHTML).toBe('<ba-measure-overlay></ba-measure-overlay>');
	});

	it('creates partition tooltips for line small zoom', () => {
		const addOverlaySpy = jasmine.createSpy();
		const mapMock = {
			addOverlay: addOverlaySpy,
			getInteractions() {
				return { getArray: () => [] };
			},
			getView() {
				return { getResolution: () => 50 };
			}
		};

		const classUnderTest = new MeasurementOverlayStyle();
		const geometry = new LineString([[0, 0], [12345, 0]]);
		const feature = new Feature({ geometry: geometry });

		classUnderTest._createOrRemovePartitionOverlays(feature, mapMock);

		expect(feature.get('partitions').length).toBe(1);
	});

	const getPartition = (feature) => {
		const partitionOverlays = feature.get('partitions');
		const overlay = partitionOverlays[0];
		return overlay.getElement();
	};

	it('creates partition tooltips for line in right-sector', () => {
		const addOverlaySpy = jasmine.createSpy();
		const mapMock = {
			addOverlay: addOverlaySpy,
			getInteractions() {
				return { getArray: () => [] };
			},
			getView() {
				return { getResolution: () => 50 };
			}
		};

		const classUnderTest = new MeasurementOverlayStyle();
		const geometry = new LineString([[0, 0], [12345, 0]]);
		const feature = new Feature({ geometry: geometry });

		classUnderTest._createOrRemovePartitionOverlays(feature, mapMock);
		const partition = getPartition(feature);

		expect(partition.placement).toEqual({ sector: 'right', positioning: 'center-center', offset: [jasmine.any(Number), jasmine.any(Number)] });
	});


	it('creates partition tooltips for line in left-sector', () => {
		const addOverlaySpy = jasmine.createSpy();
		const mapMock = {
			addOverlay: addOverlaySpy,
			getInteractions() {
				return { getArray: () => [] };
			},
			getView() {
				return { getResolution: () => 50 };
			}
		};

		const classUnderTest = new MeasurementOverlayStyle();
		const geometry = new LineString([[12345, 0], [0, 0]]);
		const feature = new Feature({ geometry: geometry });

		classUnderTest._createOrRemovePartitionOverlays(feature, mapMock);
		const partition = getPartition(feature);

		expect(partition.placement).toEqual({ sector: 'left', positioning: 'center-center', offset: [jasmine.any(Number), jasmine.any(Number)] });
	});

	it('creates partition tooltips for line in bottom-sector', () => {
		const addOverlaySpy = jasmine.createSpy();
		const mapMock = {
			addOverlay: addOverlaySpy,
			getInteractions() {
				return { getArray: () => [] };
			},
			getView() {
				return { getResolution: () => 50 };
			}
		};

		const classUnderTest = new MeasurementOverlayStyle();
		const geometry = new LineString([[0, 12345], [0, 0]]);
		const feature = new Feature({ geometry: geometry });

		classUnderTest._createOrRemovePartitionOverlays(feature, mapMock);
		const partition = getPartition(feature);

		expect(partition.placement).toEqual({ sector: 'bottom', positioning: 'center-center', offset: [jasmine.any(Number), jasmine.any(Number)] });
	});

	it('creates partition tooltips for line in top-sector', () => {
		const addOverlaySpy = jasmine.createSpy();
		const mapMock = {
			addOverlay: addOverlaySpy,
			getInteractions() {
				return { getArray: () => [] };
			},
			getView() {
				return { getResolution: () => 50 };
			}
		};

		const classUnderTest = new MeasurementOverlayStyle();
		const geometry = new LineString([[0, 0], [0, 12345]]);
		const feature = new Feature({ geometry: geometry });

		classUnderTest._createOrRemovePartitionOverlays(feature, mapMock);
		const partition = getPartition(feature);

		expect(partition.placement).toEqual({ sector: 'top', positioning: 'center-center', offset: [jasmine.any(Number), jasmine.any(Number)] });
	});

	it('creates partition tooltips for line big zoom', () => {
		const addOverlaySpy = jasmine.createSpy();
		const mapMock = {
			addOverlay: addOverlaySpy,
			getInteractions() {
				return { getArray: () => [] };
			},
			getView() {
				return { getResolution: () => 1 };
			}
		};

		const classUnderTest = new MeasurementOverlayStyle();
		const geometry = new LineString([[0, 0], [12345, 0]]);
		const feature = new Feature({ geometry: geometry });

		classUnderTest._createOrRemovePartitionOverlays(feature, mapMock);

		expect(feature.get('partitions').length).toBe(12);
	});

	it('creates partition tooltips for not closed polygon', () => {
		const addOverlaySpy = jasmine.createSpy();
		const mapMock = {
			addOverlay: addOverlaySpy,
			getInteractions() {
				return { getArray: () => [] };
			},
			getView() {
				return { getResolution: () => 50 };
			}
		};

		const classUnderTest = new MeasurementOverlayStyle();
		const geometry = new Polygon([[[0, 0], [5000, 0], [5500, 5500], [0, 5000]]]);
		const feature = new Feature({ geometry: geometry });

		classUnderTest._createOrRemovePartitionOverlays(feature, mapMock);

		expect(feature.get('partitions').length).toBe(1);
	});

	it('removes partition tooltips after shrinking very long line', () => {
		const addOverlaySpy = jasmine.createSpy();
		const removeOverlaySpy = jasmine.createSpy();
		const mapMock = {
			addOverlay: addOverlaySpy,
			removeOverlay: removeOverlaySpy,
			getInteractions() {
				return { getArray: () => [] };
			},
			getView() {
				return { getResolution: () => 50 };
			}
		};

		const classUnderTest = new MeasurementOverlayStyle();
		const geometry = new LineString([[0, 0], [123456, 0]]);
		const feature = new Feature({ geometry: geometry });

		classUnderTest._createOrRemovePartitionOverlays(feature, mapMock);
		expect(feature.get('partitions').length).toBe(12);

		geometry.setCoordinates([[0, 0], [12345, 0]]);
		classUnderTest._createOrRemovePartitionOverlays(feature, mapMock);

		expect(feature.get('partitions').length).toBe(12);
	});

	it('removes area overlay after change from polygon to line', () => {
		const addOverlaySpy = jasmine.createSpy();
		const removeOverlaySpy = jasmine.createSpy();
		const mapMock = {
			addOverlay: addOverlaySpy,
			removeOverlay: removeOverlaySpy,
			getInteractions() {
				return { getArray: () => [] };
			},
			getView() {
				return { getResolution: () => 50 };
			}
		};

		const classUnderTest = new MeasurementOverlayStyle();
		const geometry = new Polygon([[[0, 0], [5000, 0], [5500, 5500], [0, 5000]]]);
		const feature = new Feature({ geometry: geometry });

		classUnderTest._createOrRemoveAreaOverlay(feature, mapMock);
		expect(feature.get('area')).toBeTruthy();

		// change to Line
		geometry.setCoordinates([[0, 0], [12345, 0]]);
		classUnderTest._createOrRemoveAreaOverlay(feature, mapMock);

		expect(feature.get('area')).toBeFalsy();
	});

	it('writes manual overlay-position to the related feature', () => {
		const draggedOverlayMock = {
			getPosition: () => [42, 21], get(property) {
				return property === 'manualPositioning';
			}
		};
		const staticOverlayMock = {
			getPosition: () => [], get() {
				return false;
			}
		};

		const geometry = new LineString([[0, 0], [123456, 0]]);
		const feature = new Feature({ geometry: geometry });

		feature.set('measurement', draggedOverlayMock);
		feature.set('area', draggedOverlayMock);
		feature.set('static', staticOverlayMock);

		saveManualOverlayPosition(feature);

		expect(feature.get('measurement_position_x')).toBe(42);
		expect(feature.get('measurement_position_y')).toBe(21);
		expect(feature.get('area_position_x')).toBe(42);
		expect(feature.get('area_position_y')).toBe(21);
		expect(feature.get('static_position_x')).toBeUndefined();
		expect(feature.get('static_position_y')).toBeUndefined();
	});

	it('writes no manual overlay-position to the related feature, when not needed', () => {
		const draggedOverlayMock = {
			getPosition: () => [42, 21], get() {
				return false;
			}
		};
		const staticOverlayMock = {
			getPosition: () => [], get() {
				return false;
			}
		};

		const geometry = new LineString([[0, 0], [123456, 0]]);
		const feature = new Feature({ geometry: geometry });

		feature.set('measurement', draggedOverlayMock);
		feature.set('area', draggedOverlayMock);
		feature.set('static', staticOverlayMock);

		saveManualOverlayPosition(feature);

		expect(feature.get('measurement_position_x')).toBeUndefined();
		expect(feature.get('measurement_position_y')).toBeUndefined();
		expect(feature.get('area_position_x')).toBeUndefined();
		expect(feature.get('area_position_y')).toBeUndefined();
		expect(feature.get('static_position_x')).toBeUndefined();
		expect(feature.get('static_position_y')).toBeUndefined();
	});



	it('restore manual overlay-position from the related feature', () => {
		let actualPosition;
		const actualProperty = { key: '', value: null };
		const overlayMock = {
			setPosition(pos) {
				actualPosition = pos;
			}, set(key, value) {
				actualProperty.key = key;
				actualProperty.value = value;
			}, setOffset() { }
		};
		const classUnderTest = new MeasurementOverlayStyle();
		const geometry = new LineString([[0, 0], [123456, 0]]);
		const feature = new Feature({ geometry: geometry });

		feature.set('measurement', overlayMock);
		feature.set('measurement_position_x', 42);
		feature.set('measurement_position_y', 21);

		classUnderTest._restoreManualOverlayPosition(feature);

		expect(actualPosition).toEqual([42, 21]);
		expect(actualProperty).toEqual({ key: 'manualPositioning', value: true });
	});

	it('cannot restore manual overlay-position from the related feature', () => {
		let actualPosition;
		const actualProperty = { key: '', value: null };
		const overlayMock = {
			setPosition(pos) {
				actualPosition = pos;
			}, set(key, value) {
				actualProperty.key = key;
				actualProperty.value = value;
			}, setOffset() { }
		};
		const classUnderTest = new MeasurementOverlayStyle();
		const geometry = new LineString([[0, 0], [123456, 0]]);
		const feature = new Feature({ geometry: geometry });

		feature.set('measurement', overlayMock);
		feature.set('measurement_position_x', 42);

		classUnderTest._restoreManualOverlayPosition(feature);

		expect(actualPosition).toBeUndefined();
		expect(actualProperty).toEqual({ key: '', value: null });
	});
});

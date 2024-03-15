import { Feature } from 'ol';
import { MeasurementOverlayStyle, saveManualOverlayPosition } from '../../../../src/modules/olMap/overlayStyle/MeasurementOverlayStyle';
import { TestUtils } from '../../../test-utils.js';
import { Geometry, LineString, Polygon } from 'ol/geom';
import { $injector } from '../../../../src/injection';
import proj4 from 'proj4';
import { register } from 'ol/proj/proj4';
import { measurementReducer } from '../../../../src/store/measurement/measurement.reducer';
import { DragPan } from 'ol/interaction';

proj4.defs('EPSG:25832', '+proj=utm +zone=32 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs +axis=neu');
register(proj4);

describe('MeasurementOverlayStyle', () => {
	const mapServiceMock = {
		getSrid: () => 3857,
		getLocalProjectedSrid: () => 25832,
		getCoordinateRepresentations: () => [{ global: false, code: 25832 }],
		calcLength: () => {}
	};
	const environmentServiceMock = { isTouch: () => false };
	const initialState = {
		active: false,
		statistic: { length: 0, area: 0 },
		selection: [],
		reset: null,
		fileSaveResult: { adminId: 'init', fileId: 'init' }
	};
	const setup = (state = initialState) => {
		const measurementState = {
			measurement: state
		};
		TestUtils.setupStoreAndDi(measurementState, { measurement: measurementReducer });
		$injector
			.registerSingleton('TranslationService', { translate: (key) => key })
			.registerSingleton('MapService', mapServiceMock)
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

	const createFeature = () => {
		const feature = new Feature();
		feature.set('measurement', {});
		feature.set('area', {});
		feature.set('partitions', [{}, {}]);
		feature.set('overlays', [{}, {}, {}, {}]);
		return feature;
	};

	const getPartition = (feature) => {
		const partitionOverlays = feature.get('partitions');
		const overlay = partitionOverlays[0];
		return overlay.getElement();
	};

	it('adds overlays', () => {
		const featureMock = {};
		const mapMock = {};
		setup();
		const classUnderTest = new MeasurementOverlayStyle();
		const createDistanceOverlaySpy = spyOn(classUnderTest, '_createDistanceOverlay')
			.withArgs(featureMock, mapMock)
			.and.callFake(() => {});
		const createOrRemoveAreaOverlaySpy = spyOn(classUnderTest, '_createOrRemoveAreaOverlay')
			.withArgs(featureMock, mapMock)
			.and.callFake(() => {});
		const createOrRemovePartitionOverlaysSpy = spyOn(classUnderTest, '_createOrRemovePartitionOverlays')
			.withArgs(featureMock, mapMock)
			.and.callFake(() => {});
		const restoreManualOverlayPositionSpy = spyOn(classUnderTest, '_restoreManualOverlayPosition')
			.withArgs(featureMock, mapMock)
			.and.callFake(() => {});

		classUnderTest.add(featureMock, mapMock);

		expect(createDistanceOverlaySpy).toHaveBeenCalled();
		expect(createOrRemoveAreaOverlaySpy).toHaveBeenCalled();
		expect(createOrRemovePartitionOverlaysSpy).toHaveBeenCalled();
		expect(restoreManualOverlayPositionSpy).toHaveBeenCalled();
	});
	describe('updates overlays', () => {
		it('with existing distance overlay', () => {
			const distanceOverlayMock = {};
			const elementMock = { style: { display: false, opacity: false } };
			const overlayMock = { getElement: () => {} };
			const featureMock = {
				get: (key) => (key === 'measurement' ? distanceOverlayMock : [overlayMock]),
				getGeometry: () =>
					new LineString([
						[0, 0],
						[1, 0]
					])
			};
			const mapMock = {};
			setup();
			const classUnderTest = new MeasurementOverlayStyle();
			const getElementSpy = spyOn(overlayMock, 'getElement').and.returnValue(elementMock);
			const updateOverlaySpy = spyOn(classUnderTest, '_updateOlOverlay')
				.withArgs(distanceOverlayMock, jasmine.any(Geometry), '')
				.and.callFake(() => {});
			const createOrRemoveAreaOverlaySpy = spyOn(classUnderTest, '_createOrRemoveAreaOverlay')
				.withArgs(featureMock, mapMock)
				.and.callFake(() => {});
			const createOrRemovePartitionOverlaysSpy = spyOn(classUnderTest, '_createOrRemovePartitionOverlays')
				.withArgs(featureMock, mapMock, jasmine.any(Geometry))
				.and.callFake(() => {});

			classUnderTest.update(featureMock, mapMock);

			expect(updateOverlaySpy).toHaveBeenCalled();
			expect(createOrRemoveAreaOverlaySpy).toHaveBeenCalled();
			expect(createOrRemovePartitionOverlaysSpy).toHaveBeenCalled();
			expect(getElementSpy).toHaveBeenCalled();
		});

		it('WITHOUT existing distance overlay', () => {
			const elementMock = { style: { display: false, opacity: false } };
			const overlayMock = { getElement: () => elementMock };
			const featureMock = {
				get: (key) => (key === 'measurement' ? null : [overlayMock]),
				getGeometry: () =>
					new LineString([
						[0, 0],
						[1, 0]
					])
			};
			const mapMock = {};
			setup();
			const classUnderTest = new MeasurementOverlayStyle();

			const updateOverlaySpy = spyOn(classUnderTest, '_updateOlOverlay').and.callFake(() => {});
			const createOrRemoveAreaOverlaySpy = spyOn(classUnderTest, '_createOrRemoveAreaOverlay').and.callFake(() => {});
			const createOrRemovePartitionOverlaysSpy = spyOn(classUnderTest, '_createOrRemovePartitionOverlays').and.callFake(() => {});

			classUnderTest.update(featureMock, mapMock);

			expect(updateOverlaySpy).not.toHaveBeenCalled();
			expect(createOrRemoveAreaOverlaySpy).not.toHaveBeenCalled();
			expect(createOrRemovePartitionOverlaysSpy).not.toHaveBeenCalled();
		});

		it('WITHOUT overlays et al', () => {
			const featureMock = {
				get: () => null,
				getGeometry: () =>
					new LineString([
						[0, 0],
						[1, 0]
					])
			};
			const mapMock = {};
			setup();
			const classUnderTest = new MeasurementOverlayStyle();
			const featureSpy = spyOn(featureMock, 'get').withArgs(jasmine.any(String)).and.callThrough();
			classUnderTest.update(featureMock, mapMock);

			expect(featureSpy).toHaveBeenCalledTimes(2);
		});

		it('removes area overlay', () => {
			const elementMock = { style: { display: false, opacity: false } };
			const overlayMock = { get: () => {}, setPosition: () => {}, getElement: () => elementMock };
			const featureMock = {
				get: (key) => (['area', 'measurement'].includes(key) ? overlayMock : null),
				getGeometry: () =>
					new LineString([
						[0, 0],
						[1, 0]
					]),
				set: () => {}
			};
			const mapMock = { removeOverlay: () => {} };
			setup();
			const classUnderTest = new MeasurementOverlayStyle();
			spyOn(classUnderTest, '_updateOlOverlay')
				.withArgs(overlayMock, jasmine.any(Geometry), '')
				.and.callFake(() => {});
			spyOn(classUnderTest, '_createOrRemovePartitionOverlays')
				.withArgs(featureMock, mapMock, jasmine.any(Geometry))
				.and.callFake(() => {});
			spyOn(classUnderTest, '_createOrRemoveAreaOverlay').and.callThrough();
			spyOn(classUnderTest, '_remove').and.callThrough();
			const mapSpy = spyOn(mapMock, 'removeOverlay').and.callFake(() => {});
			const featureSpy = spyOn(featureMock, 'set').and.callFake(() => {});
			classUnderTest.update(featureMock, mapMock);

			expect(mapSpy).toHaveBeenCalledWith(overlayMock);
			expect(featureSpy).toHaveBeenCalledWith('area', null);
		});
	});

	it('removes all overlays from feature', () => {
		setup();
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

	it('removes no overlays from feature with not synchronized overlays', () => {
		setup();
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
		setup();
		const addOverlaySpy = jasmine.createSpy();
		const mapMock = {
			addOverlay: addOverlaySpy,
			getInteractions() {
				return { getArray: () => [] };
			}
		};

		const classUnderTest = new MeasurementOverlayStyle();

		const geometry = new LineString([
			[0, 0],
			[1, 0]
		]);
		const feature = new Feature({ geometry: geometry });
		classUnderTest._createDistanceOverlay(feature, mapMock);

		const baOverlay = feature.get('measurement').getElement();
		expect(baOverlay.outerHTML).toBe('<ba-measure-overlay></ba-measure-overlay>');
	});

	it('create draggable measurement tooltip ', () => {
		const state = { ...initialState, active: true };
		setup(state);
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
		const geometry = new LineString([
			[0, 0],
			[12345, 0]
		]);
		const feature = new Feature({ geometry: geometry });

		classUnderTest._createDistanceOverlay(feature, mapMock);
		expect(feature.get('measurement').getElement().isDraggable).toBeTrue();
	});

	it('creates non-draggable measurement tooltips for touch-environment', () => {
		const state = { ...initialState, active: true };
		setup(state);
		spyOn(environmentServiceMock, 'isTouch').and.returnValue(true);
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
		const geometry = new LineString([
			[0, 0],
			[12345, 0]
		]);
		const feature = new Feature({ geometry: geometry });

		classUnderTest._createDistanceOverlay(feature, mapMock);
		expect(feature.get('measurement').getElement().isDraggable).toBeFalse();
	});

	it('creates non-draggable measurement tooltips while no active measurement-session', () => {
		const state = { ...initialState, active: false };
		setup(state);
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
		const geometry = new LineString([
			[0, 0],
			[12345, 0]
		]);
		const feature = new Feature({ geometry: geometry });

		classUnderTest._createDistanceOverlay(feature, mapMock);
		expect(feature.get('measurement').getElement().isDraggable).toBeFalse();
	});

	it('creates draggable area tooltips ', () => {
		const state = { ...initialState, active: true };
		setup(state);
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
		const geometry = new Polygon([
			[
				[0, 0],
				[5000, 0],
				[5500, 5500],
				[0, 5000]
			]
		]);
		const feature = new Feature({ geometry: geometry });

		classUnderTest._createOrRemoveAreaOverlay(feature, mapMock);
		expect(feature.get('area').getElement().isDraggable).toBeTrue();
	});

	it('creates non-draggable area tooltips for touch-environment', () => {
		const state = { ...initialState, active: true };
		setup(state);
		spyOn(environmentServiceMock, 'isTouch').and.returnValue(true);
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
		const geometry = new Polygon([
			[
				[0, 0],
				[5000, 0],
				[5500, 5500],
				[0, 5000]
			]
		]);
		const feature = new Feature({ geometry: geometry });

		classUnderTest._createOrRemoveAreaOverlay(feature, mapMock);
		expect(feature.get('area').getElement().isDraggable).toBeFalse();
	});

	it('creates non-draggable area tooltips while no active measurement-session', () => {
		const state = { ...initialState, active: false };
		setup(state);
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
		const geometry = new Polygon([
			[
				[0, 0],
				[5000, 0],
				[5500, 5500],
				[0, 5000]
			]
		]);
		const feature = new Feature({ geometry: geometry });

		classUnderTest._createOrRemoveAreaOverlay(feature, mapMock);
		expect(feature.get('area').getElement().isDraggable).toBeFalse();
	});

	it('creates partition tooltips for line small zoom', () => {
		setup();
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
		const geometry = new LineString([
			[0, 0],
			[12345, 0]
		]);
		const feature = new Feature({ geometry: geometry });
		spyOn(mapServiceMock, 'calcLength').and.returnValue(12345);
		classUnderTest._createOrRemovePartitionOverlays(feature, mapMock);

		expect(feature.get('partitions').length).toBe(1);
	});

	it('creates partition tooltips for line in right-sector', () => {
		setup();
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
		const geometry = new LineString([
			[0, 0],
			[12345, 0]
		]);
		const feature = new Feature({ geometry: geometry });
		spyOn(mapServiceMock, 'calcLength').and.returnValue(12345);
		classUnderTest._createOrRemovePartitionOverlays(feature, mapMock);
		const partition = getPartition(feature);

		expect(partition.placement).toEqual({ sector: 'right', positioning: 'center-center', offset: [jasmine.any(Number), jasmine.any(Number)] });
	});

	it('creates partition tooltips for line in left-sector', () => {
		setup();
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
		const geometry = new LineString([
			[12345, 0],
			[0, 0]
		]);
		const feature = new Feature({ geometry: geometry });
		spyOn(mapServiceMock, 'calcLength').and.returnValue(12345);
		classUnderTest._createOrRemovePartitionOverlays(feature, mapMock);

		const partition = getPartition(feature);

		expect(partition.placement).toEqual({ sector: 'left', positioning: 'center-center', offset: [jasmine.any(Number), jasmine.any(Number)] });
	});

	it('creates partition tooltips for line in bottom-sector', () => {
		setup();
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
		const geometry = new LineString([
			[0, 12345],
			[0, 0]
		]);
		const feature = new Feature({ geometry: geometry });
		spyOn(mapServiceMock, 'calcLength').and.returnValue(12345);

		classUnderTest._createOrRemovePartitionOverlays(feature, mapMock);
		const partition = getPartition(feature);

		expect(partition.placement).toEqual({ sector: 'bottom', positioning: 'center-center', offset: [jasmine.any(Number), jasmine.any(Number)] });
	});

	it('creates partition tooltips for line in top-sector', () => {
		setup();
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
		const geometry = new LineString([
			[0, 0],
			[0, 12345]
		]);
		const feature = new Feature({ geometry: geometry });
		spyOn(mapServiceMock, 'calcLength').and.returnValue(12345);

		classUnderTest._createOrRemovePartitionOverlays(feature, mapMock);
		const partition = getPartition(feature);

		expect(partition.placement).toEqual({ sector: 'top', positioning: 'center-center', offset: [jasmine.any(Number), jasmine.any(Number)] });
	});

	it('creates partition tooltips for line big zoom', () => {
		setup();
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
		const geometry = new LineString([
			[0, 0],
			[12345, 0]
		]);
		const feature = new Feature({ geometry: geometry });
		spyOn(mapServiceMock, 'calcLength').and.returnValue(12345);

		classUnderTest._createOrRemovePartitionOverlays(feature, mapMock);

		expect(feature.get('partitions').length).toBe(12);
	});

	it('creates partition tooltips for not closed polygon', () => {
		setup();
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
		const geometry = new Polygon([
			[
				[0, 0],
				[5000, 0],
				[5500, 5500],
				[0, 5000]
			]
		]);
		const feature = new Feature({ geometry: geometry });
		spyOn(mapServiceMock, 'calcLength').and.returnValue(16000);
		classUnderTest._createOrRemovePartitionOverlays(feature, mapMock);

		expect(feature.get('partitions').length).toBe(1);
	});

	it('removes partition tooltips after shrinking very long line', () => {
		setup();
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
		const geometry = new LineString([
			[0, 0],
			[123456, 0]
		]);
		const feature = new Feature({ geometry: geometry });
		spyOn(mapServiceMock, 'calcLength').and.returnValues(123456, 12345);
		classUnderTest._createOrRemovePartitionOverlays(feature, mapMock);
		expect(feature.get('partitions').length).toBe(12);

		geometry.setCoordinates([
			[0, 0],
			[12345, 0]
		]);

		classUnderTest._createOrRemovePartitionOverlays(feature, mapMock);

		expect(feature.get('partitions').length).toBe(1);
	});

	it('removes area overlay after change from polygon to line', () => {
		setup();
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
		const geometry = new Polygon([
			[
				[0, 0],
				[5000, 0],
				[5500, 5500],
				[0, 5000]
			]
		]);
		const feature = new Feature({ geometry: geometry });

		classUnderTest._createOrRemoveAreaOverlay(feature, mapMock);
		expect(feature.get('area')).toBeTruthy();

		// change to Line
		geometry.setCoordinates([
			[0, 0],
			[12345, 0]
		]);
		classUnderTest._createOrRemoveAreaOverlay(feature, mapMock);

		expect(feature.get('area')).toBeFalsy();
	});

	it('writes manual overlay-position to the related feature', () => {
		setup();
		const draggedOverlayMock = {
			getPosition: () => [42, 21],
			get(property) {
				return property === 'manualPositioning';
			}
		};
		const staticOverlayMock = {
			getPosition: () => [],
			get() {
				return false;
			}
		};

		const geometry = new LineString([
			[0, 0],
			[123456, 0]
		]);
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
		setup();
		const draggedOverlayMock = {
			getPosition: () => [42, 21],
			get() {
				return false;
			}
		};
		const fooOverlayMock = {};

		const geometry = new LineString([
			[0, 0],
			[123456, 0]
		]);
		const feature = new Feature({ geometry: geometry });

		feature.set('measurement', draggedOverlayMock);
		feature.set('foo', fooOverlayMock);

		saveManualOverlayPosition(feature);

		expect(feature.get('measurement_position_x')).toBeUndefined();
		expect(feature.get('measurement_position_y')).toBeUndefined();
		expect(feature.get('foo_position_x')).toBeUndefined();
		expect(feature.get('foo_position_y')).toBeUndefined();
	});

	it('restore manual overlay-position from the related feature', () => {
		setup();
		let actualPosition;
		const actualProperty = { key: '', value: null };
		const overlayMock = {
			setPosition(pos) {
				actualPosition = pos;
			},
			set(key, value) {
				actualProperty.key = key;
				actualProperty.value = value;
			},
			setOffset() {}
		};
		const classUnderTest = new MeasurementOverlayStyle();
		const geometry = new LineString([
			[0, 0],
			[123456, 0]
		]);
		const feature = new Feature({ geometry: geometry });

		feature.set('measurement', overlayMock);
		feature.set('measurement_position_x', 42);
		feature.set('measurement_position_y', 21);

		classUnderTest._restoreManualOverlayPosition(feature);

		expect(actualPosition).toEqual([42, 21]);
		expect(actualProperty).toEqual({ key: 'manualPositioning', value: true });
	});

	it('cannot restore manual overlay-position from the related feature', () => {
		setup();
		let actualPosition;
		const actualProperty = { key: '', value: null };
		const overlayMock = {
			setPosition(pos) {
				actualPosition = pos;
			},
			set(key, value) {
				actualProperty.key = key;
				actualProperty.value = value;
			},
			setOffset() {}
		};
		const classUnderTest = new MeasurementOverlayStyle();
		const geometry = new LineString([
			[0, 0],
			[123456, 0]
		]);
		const feature = new Feature({ geometry: geometry });

		feature.set('measurement', overlayMock);
		feature.set('measurement_position_x', 42);

		classUnderTest._restoreManualOverlayPosition(feature);

		expect(actualPosition).toBeUndefined();
		expect(actualProperty).toEqual({ key: '', value: null });
	});

	describe('_createDragOn', () => {
		const getOverlay = () => {
			const element = document.createElement('div');
			return { getElement: () => element, set: () => {} };
		};

		const getMapMock = (interaction) => {
			return {
				getInteractions: () => {
					return { getArray: () => [interaction] };
				}
			};
		};

		it('change overlay-property on pointerdown', () => {
			setup();
			const overlay = getOverlay();
			const draggingSpy = spyOn(overlay, 'set');
			const dragPan = new DragPan();
			const interactionSpy = spyOn(dragPan, 'setActive');
			const mapMock = getMapMock(dragPan);
			const element = overlay.getElement();
			const classUnderTest = new MeasurementOverlayStyle();

			classUnderTest._createDragOn(overlay, mapMock);
			element.dispatchEvent(new Event('pointerdown'));

			expect(draggingSpy).toHaveBeenCalledWith('dragging', true);
			expect(interactionSpy).toHaveBeenCalledWith(false);
		});

		it('change overlay-property on pointerup', () => {
			setup();
			const overlay = getOverlay();
			const draggingSpy = spyOn(overlay, 'set');
			const dragPan = new DragPan();
			const interactionSpy = spyOn(dragPan, 'setActive');
			const mapMock = getMapMock(dragPan);
			const element = overlay.getElement();
			const classUnderTest = new MeasurementOverlayStyle();

			classUnderTest._createDragOn(overlay, mapMock);
			element.dispatchEvent(new Event('pointerup'));

			expect(draggingSpy).toHaveBeenCalledWith('dragging', false);
			expect(interactionSpy).toHaveBeenCalledWith(true);
		});

		it('change overlay-property on mouseenter', () => {
			setup();
			const overlay = getOverlay();
			const dragableSpy = spyOn(overlay, 'set');
			const dragPan = new DragPan();
			const mapMock = getMapMock(dragPan);
			const element = overlay.getElement();
			const classUnderTest = new MeasurementOverlayStyle();

			classUnderTest._createDragOn(overlay, mapMock);
			element.dispatchEvent(new MouseEvent('mouseenter'));

			expect(dragableSpy).toHaveBeenCalledWith('dragable', true);
		});

		it('change overlay-property on mouseleave', () => {
			setup();
			const overlay = getOverlay();
			const dragableSpy = spyOn(overlay, 'set');
			const dragPan = new DragPan();
			const mapMock = getMapMock(dragPan);
			const element = overlay.getElement();
			const classUnderTest = new MeasurementOverlayStyle();

			classUnderTest._createDragOn(overlay, mapMock);
			element.dispatchEvent(new MouseEvent('mouseleave'));

			expect(dragableSpy).toHaveBeenCalledWith('dragable', false);
		});
	});
});

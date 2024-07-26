import { Feature } from 'ol';
import { MeasurementOverlayStyle, saveManualOverlayPosition } from '../../../../src/modules/olMap/overlayStyle/MeasurementOverlayStyle';
import { TestUtils } from '../../../test-utils.js';
import { Geometry, LineString, Polygon } from 'ol/geom';
import { $injector } from '../../../../src/injection';
import proj4 from 'proj4';
import { register } from 'ol/proj/proj4';
import { measurementReducer } from '../../../../src/store/measurement/measurement.reducer';
import { DragPan } from 'ol/interaction';
import { PROJECTED_LENGTH_GEOMETRY_PROPERTY } from '../../../../src/modules/olMap/utils/olGeometryUtils.js';

proj4.defs('EPSG:25832', '+proj=utm +zone=32 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs +axis=neu');
register(proj4);

describe('MeasurementOverlayStyle', () => {
	const mapServiceMock = {
		getSrid: () => 3857,
		getLocalProjectedSrid: () => 25832,
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
		return overlay?.getElement();
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
		const viewMock = { getCenter: () => [50, 50], calculateExtent: () => [0, 0, 100, 100], getResolution: () => 10, getZoomForResolution: () => 21 };
		const mapMock = { getSize: () => [100, 100], getView: () => viewMock };
		it('with existing distance overlay', () => {
			const distanceOverlayMock = {};
			const elementMock = { style: { display: false, opacity: false } };
			const overlayMock = { getElement: () => {}, getPosition: () => [0, 0] };
			const featureMock = {
				get: (key) => (key === 'measurement' ? distanceOverlayMock : [overlayMock]),
				getGeometry: () =>
					new LineString([
						[0, 0],
						[1, 0]
					])
			};

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

		describe('and use UpdateProperties', () => {
			const styleMock = {
				displayValue: false,
				opacityValue: false,
				get display() {
					return this.displayValue;
				},
				set display(value) {
					this.displayValue = value;
				},

				get opacity() {
					return this.opacityValue;
				},
				set opacity(value) {
					this.opacityValue = value;
				}
			};
			const distanceOverlayMock = {};

			const elementMock = { style: styleMock };
			const overlayMock = { getElement: () => {}, getPosition: () => [0, 0] };
			const featureMock = {
				get: (key) => (key === 'measurement' ? distanceOverlayMock : [overlayMock]),
				getGeometry: () =>
					new LineString([
						[0, 0],
						[1, 0]
					])
			};

			it('updates element style properties with default values', () => {
				setup();
				const classUnderTest = new MeasurementOverlayStyle();
				const getElementSpy = spyOn(overlayMock, 'getElement').and.returnValue(elementMock);
				const displayPropertySpy = spyOnProperty(styleMock, 'display', 'set').and.callThrough();
				const opacityPropertySpy = spyOnProperty(styleMock, 'opacity', 'set').and.callThrough();
				spyOn(classUnderTest, '_updateOlOverlay')
					.withArgs(distanceOverlayMock, jasmine.any(Geometry), '')
					.and.callFake(() => {});
				spyOn(classUnderTest, '_createOrRemoveAreaOverlay')
					.withArgs(featureMock, mapMock)
					.and.callFake(() => {});
				spyOn(classUnderTest, '_createOrRemovePartitionOverlays')
					.withArgs(featureMock, mapMock, jasmine.any(Geometry))
					.and.callFake(() => {});

				classUnderTest.update(featureMock, mapMock);

				expect(getElementSpy).toHaveBeenCalled();
				expect(displayPropertySpy).toHaveBeenCalledWith('inherit');
				expect(opacityPropertySpy).toHaveBeenCalledWith(1);
			});

			it('updates element style properties with given opacity value', () => {
				setup();
				const classUnderTest = new MeasurementOverlayStyle();
				const getElementSpy = spyOn(overlayMock, 'getElement').and.returnValue(elementMock);
				const displayPropertySpy = spyOnProperty(styleMock, 'display', 'set').and.callThrough();
				const opacityPropertySpy = spyOnProperty(styleMock, 'opacity', 'set').and.callThrough();
				spyOn(classUnderTest, '_updateOlOverlay')
					.withArgs(distanceOverlayMock, jasmine.any(Geometry), '')
					.and.callFake(() => {});
				spyOn(classUnderTest, '_createOrRemoveAreaOverlay')
					.withArgs(featureMock, mapMock)
					.and.callFake(() => {});
				spyOn(classUnderTest, '_createOrRemovePartitionOverlays')
					.withArgs(featureMock, mapMock, jasmine.any(Geometry))
					.and.callFake(() => {});

				classUnderTest.update(featureMock, mapMock, { opacity: 0.42 });

				expect(getElementSpy).toHaveBeenCalled();
				expect(displayPropertySpy).toHaveBeenCalledWith('inherit');
				expect(opacityPropertySpy).toHaveBeenCalledWith(0.42);
			});

			it('updates element style properties with given visible(true) value', () => {
				setup();
				const classUnderTest = new MeasurementOverlayStyle();
				const getElementSpy = spyOn(overlayMock, 'getElement').and.returnValue(elementMock);
				const displayPropertySpy = spyOnProperty(styleMock, 'display', 'set').and.callThrough();
				const opacityPropertySpy = spyOnProperty(styleMock, 'opacity', 'set').and.callThrough();
				spyOn(classUnderTest, '_updateOlOverlay')
					.withArgs(distanceOverlayMock, jasmine.any(Geometry), '')
					.and.callFake(() => {});
				spyOn(classUnderTest, '_createOrRemoveAreaOverlay')
					.withArgs(featureMock, mapMock)
					.and.callFake(() => {});
				spyOn(classUnderTest, '_createOrRemovePartitionOverlays')
					.withArgs(featureMock, mapMock, jasmine.any(Geometry))
					.and.callFake(() => {});

				classUnderTest.update(featureMock, mapMock, { visible: true });

				expect(getElementSpy).toHaveBeenCalled();
				expect(displayPropertySpy).toHaveBeenCalledWith('inherit');
				expect(opacityPropertySpy).toHaveBeenCalledWith(1);
			});

			it('updates element style properties with given visible(false) value', () => {
				setup();
				const classUnderTest = new MeasurementOverlayStyle();
				const getElementSpy = spyOn(overlayMock, 'getElement').and.returnValue(elementMock);
				const displayPropertySpy = spyOnProperty(styleMock, 'display', 'set').and.callThrough();
				const opacityPropertySpy = spyOnProperty(styleMock, 'opacity', 'set').and.callThrough();
				spyOn(classUnderTest, '_updateOlOverlay')
					.withArgs(distanceOverlayMock, jasmine.any(Geometry), '')
					.and.callFake(() => {});
				spyOn(classUnderTest, '_createOrRemoveAreaOverlay')
					.withArgs(featureMock, mapMock)
					.and.callFake(() => {});
				spyOn(classUnderTest, '_createOrRemovePartitionOverlays')
					.withArgs(featureMock, mapMock, jasmine.any(Geometry))
					.and.callFake(() => {});

				classUnderTest.update(featureMock, mapMock, { visible: false });

				expect(getElementSpy).toHaveBeenCalled();
				expect(displayPropertySpy).toHaveBeenCalledWith('none');
				expect(opacityPropertySpy).toHaveBeenCalledWith(1);
			});

			it('updates element style properties with given top(false) value', () => {
				setup();
				const classUnderTest = new MeasurementOverlayStyle();
				const getElementSpy = spyOn(overlayMock, 'getElement').and.returnValue(elementMock);
				const displayPropertySpy = spyOnProperty(styleMock, 'display', 'set').and.callThrough();
				const opacityPropertySpy = spyOnProperty(styleMock, 'opacity', 'set').and.callThrough();
				spyOn(classUnderTest, '_updateOlOverlay')
					.withArgs(distanceOverlayMock, jasmine.any(Geometry), '')
					.and.callFake(() => {});
				spyOn(classUnderTest, '_createOrRemoveAreaOverlay')
					.withArgs(featureMock, mapMock)
					.and.callFake(() => {});
				spyOn(classUnderTest, '_createOrRemovePartitionOverlays')
					.withArgs(featureMock, mapMock, jasmine.any(Geometry))
					.and.callFake(() => {});

				classUnderTest.update(featureMock, mapMock, { top: false });

				expect(getElementSpy).toHaveBeenCalled();
				expect(displayPropertySpy).toHaveBeenCalledWith('none');
				expect(opacityPropertySpy).toHaveBeenCalledWith(1);
			});

			it('updates element style properties with given top(true) value', () => {
				setup();
				const classUnderTest = new MeasurementOverlayStyle();
				const getElementSpy = spyOn(overlayMock, 'getElement').and.returnValue(elementMock);
				const displayPropertySpy = spyOnProperty(styleMock, 'display', 'set').and.callThrough();
				const opacityPropertySpy = spyOnProperty(styleMock, 'opacity', 'set').and.callThrough();
				spyOn(classUnderTest, '_updateOlOverlay')
					.withArgs(distanceOverlayMock, jasmine.any(Geometry), '')
					.and.callFake(() => {});
				spyOn(classUnderTest, '_createOrRemoveAreaOverlay')
					.withArgs(featureMock, mapMock)
					.and.callFake(() => {});
				spyOn(classUnderTest, '_createOrRemovePartitionOverlays')
					.withArgs(featureMock, mapMock, jasmine.any(Geometry))
					.and.callFake(() => {});

				classUnderTest.update(featureMock, mapMock, { top: true });

				expect(getElementSpy).toHaveBeenCalled();
				expect(displayPropertySpy).toHaveBeenCalledWith('inherit');
				expect(opacityPropertySpy).toHaveBeenCalledWith(1);
			});
		});

		it('WITHOUT existing distance overlay', () => {
			const elementMock = { style: { display: false, opacity: false } };
			const overlayMock = { getElement: () => elementMock, getPosition: () => [0, 0] };
			const featureMock = {
				get: (key) => (key === 'measurement' ? null : [overlayMock]),
				getGeometry: () =>
					new LineString([
						[0, 0],
						[1, 0]
					])
			};
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

		it('WITHOUT overlays at all', () => {
			const featureMock = {
				get: () => null,
				getGeometry: () =>
					new LineString([
						[0, 0],
						[1, 0]
					])
			};
			setup();
			const classUnderTest = new MeasurementOverlayStyle();
			const featureSpy = spyOn(featureMock, 'get').withArgs(jasmine.any(String)).and.callThrough();
			classUnderTest.update(featureMock, mapMock);

			expect(featureSpy).toHaveBeenCalledTimes(2);
		});

		it('removes area overlay', () => {
			const elementMock = { style: { display: false, opacity: false } };
			const overlayMock = { get: () => {}, setPosition: () => {}, getElement: () => elementMock };
			const featureWithAreaOverlay = {
				get: (key) => (['area', 'measurement'].includes(key) ? overlayMock : null),
				getGeometry: () =>
					new LineString([
						[0, 0],
						[1, 0]
					]),
				set: () => {}
			};
			const featureWithoutAreaOverlay = {
				get: (key) => (['measurement'].includes(key) ? overlayMock : null),
				getGeometry: () =>
					new LineString([
						[0, 0],
						[1, 0]
					]),
				set: () => {}
			};
			const mapMock = { getSize: () => [100, 100], getView: () => viewMock, removeOverlay: () => {} };
			setup();
			const classUnderTest = new MeasurementOverlayStyle();
			spyOn(classUnderTest, '_updateOlOverlay')
				.withArgs(overlayMock, jasmine.any(Geometry), '')
				.and.callFake(() => {});
			spyOn(classUnderTest, '_createOrRemovePartitionOverlays')
				.withArgs(featureWithAreaOverlay, mapMock, jasmine.any(Geometry))
				.and.callFake(() => {})
				.withArgs(featureWithoutAreaOverlay, mapMock, jasmine.any(Geometry))
				.and.callFake(() => {});
			spyOn(classUnderTest, '_createOrRemoveAreaOverlay').and.callThrough();
			spyOn(classUnderTest, '_remove').and.callThrough();
			const mapSpy = spyOn(mapMock, 'removeOverlay').and.callFake(() => {});
			const featureWithAreaOverlySpy = spyOn(featureWithAreaOverlay, 'set').and.callFake(() => {});
			const featureWithoutAreaOverlySpy = spyOn(featureWithoutAreaOverlay, 'set').and.callFake(() => {});
			classUnderTest.update(featureWithAreaOverlay, mapMock);
			classUnderTest.update(featureWithoutAreaOverlay, mapMock);

			expect(mapSpy).toHaveBeenCalledWith(overlayMock);
			expect(featureWithAreaOverlySpy).toHaveBeenCalledWith('area', null);
			expect(featureWithoutAreaOverlySpy).not.toHaveBeenCalled();
		});

		it('uses properties.geometry', () => {
			const distanceOverlayMock = {};
			const elementMock = { style: { display: false, opacity: false } };
			const overlayMock = { getElement: () => {}, getPosition: () => [0, 0] };
			const featureMock = {
				get: (key) => (key === 'measurement' ? distanceOverlayMock : [overlayMock]),
				getGeometry: () => {}
			};
			const mapMock = { getSize: () => [100, 100], getView: () => viewMock };
			const measureGeometry = new LineString([
				[0, 0],
				[1, 0]
			]);
			const properties = { geometry: measureGeometry };
			setup();
			const classUnderTest = new MeasurementOverlayStyle();
			spyOn(overlayMock, 'getElement').and.returnValue(elementMock);
			const updateOverlaySpy = spyOn(classUnderTest, '_updateOlOverlay')
				.withArgs(distanceOverlayMock, measureGeometry, '')
				.and.callFake(() => {});
			const createOrRemoveAreaOverlaySpy = spyOn(classUnderTest, '_createOrRemoveAreaOverlay')
				.withArgs(featureMock, mapMock)
				.and.callFake(() => {});
			const createOrRemovePartitionOverlaysSpy = spyOn(classUnderTest, '_createOrRemovePartitionOverlays')
				.withArgs(featureMock, mapMock, measureGeometry)
				.and.callFake(() => {});

			classUnderTest.update(featureMock, mapMock, properties);

			expect(updateOverlaySpy).toHaveBeenCalled();
			expect(createOrRemoveAreaOverlaySpy).toHaveBeenCalled();
			expect(createOrRemovePartitionOverlaysSpy).toHaveBeenCalled();
		});

		it('hides not visible overlays with display:none', () => {
			const distanceOverlayMock = {};
			const styleMock = { display: false, opacity: false };
			const overlayMock = { getElement: () => {}, getPosition: () => [0, 0] };
			const featureMock = {
				get: (key) => (key === 'measurement' ? distanceOverlayMock : [overlayMock]),
				getGeometry: () => {}
			};
			const mapMock = { getSize: () => [100, 100], getView: () => viewMock };
			const measureGeometry = new LineString([
				[0, 0],
				[1, 0]
			]);
			const properties = { geometry: measureGeometry, visible: false };
			setup();
			const classUnderTest = new MeasurementOverlayStyle();
			spyOn(overlayMock, 'getElement').and.returnValue({ style: styleMock });
			spyOn(classUnderTest, '_updateOlOverlay').and.callFake(() => {});
			spyOn(classUnderTest, '_createOrRemoveAreaOverlay').and.callFake(() => {});
			spyOn(classUnderTest, '_createOrRemovePartitionOverlays').and.callFake(() => {});

			classUnderTest.update(featureMock, mapMock, properties);

			expect(styleMock.display).toBe('none');
			expect(styleMock.opacity).toBe(1);
		});

		it('with existing partition overlays, clears old partitions', () => {
			const elementMock = { style: { display: false, opacity: false } };
			const overlayMock1 = {
				getElement: () => elementMock
			};
			const overlayMock2 = {
				getElement: () => elementMock
			};
			const featureMock = {
				get: (key) => {
					switch (key) {
						case 'partitions':
							return [overlayMock1, overlayMock2];
						case PROJECTED_LENGTH_GEOMETRY_PROPERTY:
							return 200;
						default:
							return [
								{
									getElement: () => elementMock,
									getPosition: () => {
										return [0, 0];
									}
								}
							];
					}
				},
				getGeometry: () =>
					new Polygon([
						[
							[0, 0],
							[2, 0],
							[0, 0]
						]
					]),
				set: () => {}
			};
			const mapMock = {
				getView: () => {
					return { getResolution: () => 1, calculateExtent: () => [0, 0, 1, 1] };
				},
				getSize: () => {},
				addOverlay: () => {},
				removeOverlay: () => {}
			};
			setup();
			const classUnderTest = new MeasurementOverlayStyle();
			spyOn(classUnderTest, '_updateOlOverlay').and.callFake(() => {});
			spyOn(classUnderTest, '_createOrRemoveAreaOverlay').and.callFake(() => {});
			const createOrRemovePartitionOverlaysSpy = spyOn(classUnderTest, '_createOrRemovePartitionOverlays').and.callThrough();
			const addPartitionOverlaySpy = spyOn(mapMock, 'addOverlay').and.callFake(() => {});
			const removePartitionOverlaySpy = spyOn(mapMock, 'removeOverlay').and.callFake(() => {});

			classUnderTest.update(featureMock, mapMock, {
				geometry: new Polygon([
					[
						[0, 0],
						[2, 0],
						[0, 0]
					]
				])
			});

			expect(createOrRemovePartitionOverlaysSpy).toHaveBeenCalled();
			expect(addPartitionOverlaySpy).not.toHaveBeenCalled();
			expect(removePartitionOverlaySpy).toHaveBeenCalledTimes(1);
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
		expect(baOverlay.outerHTML).toBe('<ba-map-overlay></ba-map-overlay>');
	});

	it('creates a draggable measurement tooltip ', () => {
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

	it('updates draggable area tooltips ', () => {
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
		feature.set('area', 'foo');
		const updateOverlaySpy = spyOn(classUnderTest, '_updateOlOverlay').and.callFake(() => {});

		classUnderTest._createOrRemoveAreaOverlay(feature, mapMock);

		expect(addOverlaySpy).not.toHaveBeenCalled();
		expect(updateOverlaySpy).toHaveBeenCalledWith('foo', geometry);
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
		feature.set(PROJECTED_LENGTH_GEOMETRY_PROPERTY, 12345);
		classUnderTest._createOrRemovePartitionOverlays(feature, mapMock, geometry);

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
		feature.set(PROJECTED_LENGTH_GEOMETRY_PROPERTY, 12345);
		classUnderTest._createOrRemovePartitionOverlays(feature, mapMock, geometry);
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
		feature.set(PROJECTED_LENGTH_GEOMETRY_PROPERTY, 12345);
		classUnderTest._createOrRemovePartitionOverlays(feature, mapMock, geometry);

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
		feature.set(PROJECTED_LENGTH_GEOMETRY_PROPERTY, 12345);

		classUnderTest._createOrRemovePartitionOverlays(feature, mapMock, geometry);
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
		feature.set(PROJECTED_LENGTH_GEOMETRY_PROPERTY, 12345);

		classUnderTest._createOrRemovePartitionOverlays(feature, mapMock, geometry);
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
		feature.set(PROJECTED_LENGTH_GEOMETRY_PROPERTY, 12345);

		classUnderTest._createOrRemovePartitionOverlays(feature, mapMock, geometry);

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
		feature.set(PROJECTED_LENGTH_GEOMETRY_PROPERTY, 16000);
		classUnderTest._createOrRemovePartitionOverlays(feature, mapMock, geometry);

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
		feature.set(PROJECTED_LENGTH_GEOMETRY_PROPERTY, 123456);
		classUnderTest._createOrRemovePartitionOverlays(feature, mapMock, geometry);
		expect(feature.get('partitions').length).toBe(12);

		geometry.setCoordinates([
			[0, 0],
			[12345, 0]
		]);

		feature.set(PROJECTED_LENGTH_GEOMETRY_PROPERTY, 12345);
		classUnderTest._createOrRemovePartitionOverlays(feature, mapMock, geometry);

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
				},
				once: () => {}
			};
		};

		it('change overlay-property on pointerdown', () => {
			setup();
			const overlay = getOverlay();
			const draggingSpy = spyOn(overlay, 'set');
			const dragPan = new DragPan();
			const interactionSpy = spyOn(dragPan, 'setActive');
			const mapMock = getMapMock(dragPan);
			const onceSpy = spyOn(mapMock, 'once');
			const element = overlay.getElement();
			const classUnderTest = new MeasurementOverlayStyle();

			classUnderTest._createDragOn(overlay, mapMock);
			element.dispatchEvent(new Event('pointerdown'));

			expect(draggingSpy).toHaveBeenCalledWith('dragging', true);
			expect(interactionSpy).toHaveBeenCalledWith(false);
			expect(onceSpy).toHaveBeenCalledWith('pointerup', jasmine.any(Function));
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
			const draggableSpy = spyOn(overlay, 'set');
			const dragPan = new DragPan();
			const mapMock = getMapMock(dragPan);
			const element = overlay.getElement();
			const classUnderTest = new MeasurementOverlayStyle();

			classUnderTest._createDragOn(overlay, mapMock);
			element.dispatchEvent(new MouseEvent('mouseenter'));

			expect(draggableSpy).toHaveBeenCalledWith('dragable', true);
		});

		it('change overlay-property on mouseleave', () => {
			setup();
			const overlay = getOverlay();
			const draggableSpy = spyOn(overlay, 'set');
			const dragPan = new DragPan();
			const mapMock = getMapMock(dragPan);
			const element = overlay.getElement();
			const classUnderTest = new MeasurementOverlayStyle();

			classUnderTest._createDragOn(overlay, mapMock);
			element.dispatchEvent(new MouseEvent('mouseleave'));

			expect(draggableSpy).toHaveBeenCalledWith('dragable', false);
		});
	});

	describe('_getPlacement', () => {
		it('finds a placement sector for all degrees within 360°', () => {
			setup();
			// regression test -> to be safe against changes in private SectorsOfPlacement definitions
			const classUnderTest = new MeasurementOverlayStyle();

			for (let angle = 0; angle <= 360; angle++) {
				expect(classUnderTest._getPlacement(angle).sector).not.toBeUndefined();
			}
		});
	});
});

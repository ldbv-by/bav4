import { Feature } from 'ol';
import { OverlayManager } from '../../../../../../../src/modules/map/components/olMap/handler/measure/OverlayManager';
import { TestUtils } from '../../../../../../test-utils.js';
import { LineString, Polygon } from 'ol/geom';
import { $injector } from '../../../../../../../src/injection';
import proj4 from 'proj4';
import { register } from 'ol/proj/proj4';



proj4.defs('EPSG:25832', '+proj=utm +zone=32 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs +axis=neu');
register(proj4);

describe('OverlayManager', () => {
	const environmentServiceMock = { isTouch: () => false };
	const setup = () => {
		TestUtils.setupStoreAndDi({},);
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
		return feature;
	};

	const getOverlaysFromFeature = (feature) => {
		const overlays = [];
		overlays.push(feature.get('measurement'));
		overlays.push(feature.get('area'));
		feature.get('partitions').forEach(p => overlays.push(p));
		return overlays;
	};
	it('ctor', () => {
		const mapStub = {};
		const classUnderTest = new OverlayManager(mapStub);

		expect(classUnderTest).toBeTruthy();
		expect(classUnderTest._overlays).toEqual([]);
	});

	it('adds a overlay to map and state', () => {
		const addOverlaySpy = jasmine.createSpy();
		const mapMock = { addOverlay: addOverlaySpy };

		const classUnderTest = new OverlayManager(mapMock);
		classUnderTest.add({});

		expect(addOverlaySpy).toHaveBeenCalled();
		expect(classUnderTest.getOverlays().length).toBe(1);

	});

	it('removes a overlay from map and state', () => {
		const removeOverlaySpy = jasmine.createSpy();
		const mapMock = { removeOverlay: removeOverlaySpy };
		const overlayStub = {};

		const classUnderTest = new OverlayManager(mapMock);
		classUnderTest._overlays = [overlayStub];
		expect(classUnderTest.getOverlays().length).toBe(1);
		classUnderTest.remove(overlayStub);

		expect(removeOverlaySpy).toHaveBeenCalled();
		expect(classUnderTest.getOverlays().length).toBe(0);

	});

	it('apply callback on overlays', () => {
		const callbackSpy = jasmine.createSpy();
		const mapStub = {};

		const classUnderTest = new OverlayManager(mapStub);
		classUnderTest._overlays = [{}, {}, {}];
		expect(classUnderTest.getOverlays().length).toBe(3);
		classUnderTest.apply(callbackSpy);

		expect(callbackSpy).toHaveBeenCalledTimes(3);
	});

	it('resets state', () => {
		const removeSpy = jasmine.createSpy();
		const mapMock = { removeOverlay: removeSpy };

		const classUnderTest = new OverlayManager(mapMock);
		classUnderTest._overlays = [{}, {}, {}];
		expect(classUnderTest.getOverlays().length).toBe(3);
		classUnderTest.reset();

		expect(removeSpy).toHaveBeenCalledTimes(3);
	});

	it('removes all overlays from feature', () => {
		const removeSpy = jasmine.createSpy();
		const mapMock = { removeOverlay: removeSpy };
		const feature = createFeature();

		const classUnderTest = new OverlayManager(mapMock);
		classUnderTest._overlays = getOverlaysFromFeature(feature);

		expect(classUnderTest.getOverlays().length).toBe(4);
		classUnderTest.removeFrom(feature);
		expect(removeSpy).toHaveBeenCalledTimes(4);
	});

	it ('creates overlay content for line', () => { 
		const addOverlaySpy = jasmine.createSpy();
		const mapMock = { addOverlay: addOverlaySpy,
			getInteractions() {
				return { getArray:() => [] };
			} };

		const classUnderTest = new OverlayManager(mapMock);
		const geometry = new LineString([[0, 0], [1, 0]]);
		const feature = new Feature({ geometry: geometry });

		classUnderTest.createDistanceOverlay(feature);

		const baOverlay = feature.get('measurement').getElement();
		expect(baOverlay.outerHTML).toBe('<ba-measure-overlay></ba-measure-overlay>');
	});

	it ('creates partition tooltips for line small zoom', () => { 
		const addOverlaySpy = jasmine.createSpy();
		const mapMock = { addOverlay: addOverlaySpy,
			getInteractions() {
				return { getArray:() => [] };
			},
			getView() {
				return { getResolution:() => 50 };
			} };

		const classUnderTest = new OverlayManager(mapMock);
		const geometry = new LineString([[0, 0], [12345, 0]]);
		const feature = new Feature({ geometry: geometry });

		classUnderTest.createPartitionOverlays(feature);

		expect(feature.get('partitions').length).toBe(1);
	});

	it ('creates partition tooltips for line big zoom', () => { 
		const addOverlaySpy = jasmine.createSpy();
		const mapMock = { addOverlay: addOverlaySpy,
			getInteractions() {
				return { getArray:() => [] };
			},
			getView() {
				return { getResolution:() => 1 };
			} };

		const classUnderTest = new OverlayManager(mapMock);
		const geometry = new LineString([[0, 0], [12345, 0]]);
		const feature = new Feature({ geometry: geometry });

		classUnderTest.createPartitionOverlays(feature);

		expect(feature.get('partitions').length).toBe(12);
	});

	it('creates partition tooltips for not closed polygon', () => {
		const addOverlaySpy = jasmine.createSpy();
		const mapMock = { addOverlay: addOverlaySpy,
			getInteractions() {
				return { getArray:() => [] };
			},
			getView() {
				return { getResolution:() => 50 };
			} };

		const classUnderTest = new OverlayManager(mapMock);
		const geometry = new Polygon([[[0, 0], [5000, 0], [5500, 5500], [0, 5000]]]);
		const feature = new Feature({ geometry: geometry });

		classUnderTest.createPartitionOverlays(feature);

		expect(feature.get('partitions').length).toBe(1);
	});

	it('removes partition tooltips after shrinking very long line', () => {
		const addOverlaySpy = jasmine.createSpy();
		const removeOverlaySpy = jasmine.createSpy();
		const mapMock = { 
			addOverlay: addOverlaySpy,
			removeOverlay:removeOverlaySpy,
			getInteractions() {
				return { getArray:() => [] };
			},
			getView() {
				return { getResolution:() => 50 };
			} };

		const classUnderTest = new OverlayManager(mapMock);
		const geometry = new LineString([[0, 0], [123456, 0]]);
		const feature = new Feature({ geometry: geometry });
		
		classUnderTest.createPartitionOverlays(feature);
		expect(feature.get('partitions').length).toBe(12);

		geometry.setCoordinates([[0, 0], [12345, 0]]);
		classUnderTest.createPartitionOverlays(feature);

		expect(feature.get('partitions').length).toBe(1);
	});


	it('writes manual overlay-position to the related feature', () => {
		const mapStub = {};
		const overlayMock = { getPosition:() => [42, 21], get(property) {
			return property === 'manualPositioning';
		} };
		const classUnderTest = new OverlayManager(mapStub);
		const geometry = new LineString([[0, 0], [123456, 0]]);
		const feature = new Feature({ geometry: geometry });
		
		feature.set('measurement', overlayMock);
		feature.set('area', overlayMock);
		
		classUnderTest.saveManualOverlayPosition(feature);
		
		expect(feature.get('measurement_position_x')).toBe(42);
		expect(feature.get('measurement_position_y')).toBe(21);
		expect(feature.get('area_position_x')).toBe(42);
		expect(feature.get('area_position_y')).toBe(21);
	});


	it('restore manual overlay-position from the related feature', () => {
		const mapStub = {};
		let actualPosition;
		const actualProperty = { key:'', value:null };
		const overlayMock = { setPosition(pos) {
			actualPosition = pos;
		}, set(key, value) {
			actualProperty.key = key;
			actualProperty.value = value;
		} };
		const classUnderTest = new OverlayManager(mapStub);
		const geometry = new LineString([[0, 0], [123456, 0]]);
		const feature = new Feature({ geometry: geometry });
		
		feature.set('measurement', overlayMock);
		feature.set('measurement_position_x', 42);
		feature.set('measurement_position_y', 21);
		
		classUnderTest.restoreManualOverlayPosition(feature);
		
		expect(actualPosition).toEqual([42, 21]);
		expect(actualProperty).toEqual({ key:'manualPositioning', value:true });		
	});

});
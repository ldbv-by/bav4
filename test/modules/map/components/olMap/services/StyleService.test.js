import { Feature } from 'ol';
import { $injector } from '../../../../../../src/injection';
import { TestUtils } from '../../../../../test-utils.js';
import { detectStyleType, StyleService, StyleTypes } from '../../../../../../src/modules/map/components/olMap/services/StyleService';
import { Polygon } from 'ol/geom';
import proj4 from 'proj4';
import { register } from 'ol/proj/proj4';

proj4.defs('EPSG:25832', '+proj=utm +zone=32 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs +axis=neu');
register(proj4);
describe('StyleService', () => {
	const mapServiceMock = { getSrid: () => 3857, getDefaultGeodeticSrid: () => 25832 };

	const environmentServiceMock = {
		isTouch() { }
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
	let instanceUnderTest;
	

	beforeAll(() => {
		TestUtils.setupStoreAndDi();
		$injector
			.registerSingleton('MapService', mapServiceMock)
			.registerSingleton('EnvironmentService', environmentServiceMock)
			.registerSingleton('UnitsService', unitsServiceMock) ;
	});

	beforeEach(() => {
		instanceUnderTest = new StyleService();
	});
	describe('detecting StyleTypes ', () => {
		it('detects measure as type from olFeature', () => {
			const feature = { getId:() => 'measure_123' };
			
			expect(detectStyleType(feature)).toEqual(StyleTypes.MEASURE);
		});

		it('detects not the type from olFeature', () => {
			const feature1 = { getId:() => 'mea_sure_123' };
			const feature2 = { getId:() => '123_measure_123' };
			const feature3 = { getId:() => ' measure_123' };
			const feature4 = { getId:() => '123measure_123' };

			expect(detectStyleType(feature1)).toBeNull();
			expect(detectStyleType(feature2)).toBeNull();
			expect(detectStyleType(feature3)).toBeNull();
			expect(detectStyleType(feature4)).toBeNull();
		});
	});

	describe('add style', () => {
		it('adds measure-style to feature with implicit style-type', () => {
			const feature = new Feature({ geometry:new Polygon([[[0, 0], [1, 0], [1, 1], [0, 1], [0, 0]]]) });
			feature.setId('measure_123');
			const addOverlaySpy = jasmine.createSpy();
			const styleSetterSpy = spyOn(feature, 'setStyle');
			const propertySetterSpy =  spyOn(feature, 'set');
			
			const viewMock = { getResolution() {
				return 50;
			} };
			const mapMock = { getView:() => viewMock, addOverlay:addOverlaySpy, getInteractions() {
				return { getArray:() => [] };
			} };

			instanceUnderTest = new StyleService();
			instanceUnderTest.addStyle(mapMock, feature);

			expect(styleSetterSpy).toHaveBeenCalledWith(jasmine.any(Array));
			expect(propertySetterSpy).toHaveBeenCalledWith('overlays', jasmine.any(Object));
			expect(addOverlaySpy).toHaveBeenCalledTimes(2);
		});

		it('adds measure-style to feature with explicit style-type', () => {
			const feature = new Feature({ geometry:new Polygon([[[0, 0], [1, 0], [1, 1], [0, 1], [0, 0]]]) });
			const addOverlaySpy = jasmine.createSpy();
			const styleSetterSpy = spyOn(feature, 'setStyle');
			const propertySetterSpy =  spyOn(feature, 'set');			
			const viewMock = { getResolution() {
				return 50;
			} };
			const mapMock = { getView:() => viewMock, addOverlay:addOverlaySpy, getInteractions() {
				return { getArray:() => [] };
			} };

			instanceUnderTest = new StyleService();
			instanceUnderTest.addStyle(mapMock, feature, 'measure');

			expect(styleSetterSpy).toHaveBeenCalledWith(jasmine.any(Array));
			expect(propertySetterSpy).toHaveBeenCalledWith('overlays', jasmine.any(Object));
			expect(addOverlaySpy).toHaveBeenCalledTimes(2);
		});
		it('adding style to feature with unknown style-type fails', () => {
			const feature = new Feature({ geometry:new Polygon([[[0, 0], [1, 0], [1, 1], [0, 1], [0, 0]]]) });
			const addOverlaySpy = jasmine.createSpy();
			const warnSpy = spyOn(console, 'warn');
			const styleSetterSpy = spyOn(feature, 'setStyle');
			const propertySetterSpy =  spyOn(feature, 'set');			
			const viewMock = { getResolution() {
				return 50;
			} };
			const mapMock = { getView:() => viewMock, addOverlay:addOverlaySpy, getInteractions() {
				return { getArray:() => [] };
			} };

			instanceUnderTest = new StyleService();
			instanceUnderTest.addStyle(mapMock, feature, 'unknown');

			expect(styleSetterSpy).not.toHaveBeenCalledWith(jasmine.any(Array));
			expect(propertySetterSpy).not.toHaveBeenCalledWith('overlays', jasmine.any(Object));
			expect(addOverlaySpy).not.toHaveBeenCalled();
			expect(warnSpy).toHaveBeenCalledWith('Could not provide a style for unknown style-type:', 'unknown');
		});
	
		
	});
	describe('removes styles', () => {
		it('removes a style from feature', () => {
			const feature = new Feature({ geometry:new Polygon([[[0, 0], [1, 0], [1, 1], [0, 1], [0, 0]]]) });
			feature.set('overlays', [{}, {}]);
			const removeOverlaySpy = jasmine.createSpy();
			const viewMock = { getResolution() {
				return 50;
			} };
			const mapMock = { getView:() => viewMock, removeOverlay:removeOverlaySpy, getInteractions() {
				return { getArray:() => [] };
			} };
    
			instanceUnderTest = new StyleService();
			instanceUnderTest.removeStyle(mapMock, feature);
    
			expect(removeOverlaySpy).toHaveBeenCalledTimes(2);
		});
	});
});
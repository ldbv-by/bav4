import { MeasurementOverlay, MeasurementOverlayTypes } from '../../../../../../../src/modules/map/components/olMap/handler/measure/MeasurementOverlay';
import { UnitsService } from '../../../../../../../src/services/UnitsService';
import { LineString, Polygon } from 'ol/geom';
import { $injector } from '../../../../../../../src/injection';
import { TestUtils } from '../../../../../../test-utils.js';

import proj4 from 'proj4';
import { register } from 'ol/proj/proj4';
window.customElements.define(MeasurementOverlay.tag, MeasurementOverlay);

describe('MeasurementOverlay', () => {

	beforeEach(async () => {
		TestUtils.setupStoreAndDi({});			
		$injector.registerSingleton('ConfigService', {
			getValue: () => { }
		});
		$injector.registerSingleton('UnitsService', new UnitsService());
		proj4.defs('EPSG:25832', '+proj=utm +zone=32 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs +axis=neu');
		register(proj4);
	});
    
	const setup = async ( properties = {}) => {
		const element = await TestUtils.render(MeasurementOverlay.tag);

		// transform test-geometries from assumed default geodetic projection to default map-projection
		if (properties.geometry) {
			properties.geometry.transform('EPSG:25832', 'EPSG:3857');
		}
		for (const property in properties) {
			element[property] = properties[property];
		}
		return element;
	};


	describe('when initialized with type property', () => {
		it('renders the text view', async () => {
			const element = await setup();

			expect(element.type).toBe(MeasurementOverlayTypes.TEXT);
			expect(element.static).toBeFalse();
			expect(element.value).toBe('');			
		});

		it('renders the help view', async () => {
			const properties = { type:MeasurementOverlayTypes.HELP, value:'foo' };
			const element = await setup(properties);
			const div = element.shadowRoot.querySelector('div');

			expect(div.classList.contains('help')).toBeTrue();
			expect(div.classList.contains('floating')).toBeFalse();
			expect(div.classList.contains('static')).toBeFalse();
			expect(element.type).toBe(MeasurementOverlayTypes.HELP);			
			expect(element.static).toBeFalse();
			expect(element.value).toBe('foo');			
		});

		it('renders the distance view', async () => {
			const geodeticGeometry = new LineString([[0, 0], [1, 0]]);			
			const properties = { type:MeasurementOverlayTypes.DISTANCE, geometry:geodeticGeometry, projectionHints:{ fromProjection:'EPSG:3857', toProjection:'EPSG:25832' } };
			const element = await setup(properties);			
			const div = element.shadowRoot.querySelector('div');

			expect(div.classList.contains('distance')).toBeTrue();
			expect(div.classList.contains('floating')).toBeTrue();
			expect(element.type).toBe(MeasurementOverlayTypes.DISTANCE);			
			expect(element.static).toBeFalse();
			expect(div.innerText).toBe('90.00°/1 m');			
		});

		it('renders the area view', async () => {
			const geodeticGeometry = new Polygon([[[0, 0], [10, 0], [10, 10], [0, 10], [0, 0]]]);
			const properties = { type:MeasurementOverlayTypes.AREA, 
				geometry:geodeticGeometry, 
				projectionHints:{ fromProjection:'EPSG:3857', toProjection:'EPSG:25832' } };
			const element = await setup(properties);			
			const div = element.shadowRoot.querySelector('div');

			expect(div.classList.contains('area')).toBeTrue();
			expect(div.classList.contains('floating')).toBeTrue();
			expect(element.type).toBe(MeasurementOverlayTypes.AREA);			
			expect(element.static).toBeFalse();
			expect(div.innerText).toBe('100 m²');			
		});

		it('renders the distance-partition view', async () => {
			const geodeticGeometry = new LineString([[0, 0], [100, 0]]);
			const properties = {
				type:MeasurementOverlayTypes.DISTANCE_PARTITION, 
				geometry:geodeticGeometry, 
				value:0.1, 
				projectionHints:{ fromProjection:'EPSG:3857', toProjection:'EPSG:25832' }
			};
			const element = await setup(properties);
			const div = element.shadowRoot.querySelector('div');

			expect(div.classList.contains('partition')).toBeTrue();
			expect(div.classList.contains('floating')).toBeTrue();
			expect(element.type).toBe(MeasurementOverlayTypes.DISTANCE_PARTITION);			
			expect(element.static).toBeFalse();
			expect(div.innerText).toBe('10 m');			
		});

		it('renders the static distance view', async () => {
			const geodeticGeometry = new LineString([[0, 0], [1, 0]]);
			const properties = { type:MeasurementOverlayTypes.DISTANCE, geometry:geodeticGeometry, static:true, projectionHints:{ fromProjection:'EPSG:3857', toProjection:'EPSG:25832' } };
			const element = await setup(properties);			
			const div = element.shadowRoot.querySelector('div');

			expect(div.classList.contains('distance')).toBeTrue();
			expect(div.classList.contains('static')).toBeTrue();
			expect(div.classList.contains('floating')).toBeFalse();
			expect(element.type).toBe(MeasurementOverlayTypes.DISTANCE);			
			expect(div.innerText).toBe('90.00°/1 m');			
		});

		it('renders formatted distance 1 m ', async () => {
			const geodeticGeometry = new LineString([[0, 0], [1, 0]]);
			const properties = { type:MeasurementOverlayTypes.DISTANCE, geometry:geodeticGeometry, projectionHints:{ fromProjection:'EPSG:3857', toProjection:'EPSG:25832' } };
			const element = await setup(properties);			
			const div = element.shadowRoot.querySelector('div');

			expect(div.innerText).toBe('90.00°/1 m');
		});

		it('renders formatted distance 10 m ', async () => {
			const geodeticGeometry = new LineString([[0, 0], [10, 0]]);
			const properties = { type:MeasurementOverlayTypes.DISTANCE, geometry:geodeticGeometry, projectionHints:{ fromProjection:'EPSG:3857', toProjection:'EPSG:25832' } };
			const element = await setup(properties);			
			const div = element.shadowRoot.querySelector('div');

			expect(div.innerText).toBe('90.00°/10 m');
		});

		it('renders formatted distance 100 m ', async () => {
			const geodeticGeometry = new LineString([[0, 0], [100, 0]]);
			const properties = { type:MeasurementOverlayTypes.DISTANCE, geometry:geodeticGeometry, projectionHints:{ fromProjection:'EPSG:3857', toProjection:'EPSG:25832' } };
			const element = await setup(properties);			

			const div = element.shadowRoot.querySelector('div');

			expect(div.innerText).toBe('90.00°/100 m');
		});

		it('renders formatted distance 1 km ', async () => {
			const geodeticGeometry = new LineString([[0, 0], [1000, 0]]);
			const properties = { type:MeasurementOverlayTypes.DISTANCE, geometry:geodeticGeometry, projectionHints:{ fromProjection:'EPSG:3857', toProjection:'EPSG:25832' } };
			const element = await setup(properties);			

			const div = element.shadowRoot.querySelector('div');

			expect(div.innerText).toBe('90.00°/1 km');
		});

		it('renders formatted distance 10 km ', async () => {
			const geodeticGeometry = new LineString([[0, 0], [10000, 0]]);
			const properties = { type:MeasurementOverlayTypes.DISTANCE, geometry:geodeticGeometry, projectionHints:{ fromProjection:'EPSG:3857', toProjection:'EPSG:25832' } };
			const element = await setup(properties);			

			const div = element.shadowRoot.querySelector('div');

			expect(div.innerText).toBe('90.00°/10 km');
		});

		it('renders formatted distance 1.25 km ', async () => {
			const geodeticGeometry = new LineString([[0, 0], [1234, 0]]);
			const properties = { type:MeasurementOverlayTypes.DISTANCE, geometry:geodeticGeometry, projectionHints:{ fromProjection:'EPSG:3857', toProjection:'EPSG:25832' } };
			const element = await setup(properties);			

			const div = element.shadowRoot.querySelector('div');

			expect(div.innerText).toBe('90.00°/1.23 km');
		});

		it('renders formatted area 1 ha', async () => {
			const geodeticGeometry = new Polygon([[[0, 0], [120, 0], [120, 120], [0, 120], [0, 0]]]);
			const properties = { type:MeasurementOverlayTypes.AREA, geometry:geodeticGeometry, projectionHints:{ fromProjection:'EPSG:3857', toProjection:'EPSG:25832' } };
			const element = await setup(properties);			
			const div = element.shadowRoot.querySelector('div');

			expect(div.classList.contains('area')).toBeTrue();
			expect(div.classList.contains('floating')).toBeTrue();
			expect(element.type).toBe(MeasurementOverlayTypes.AREA);			
			expect(element.static).toBeFalse();
			expect(div.innerText).toBe('1.44 ha');			
		});

		it('renders formatted area 1 km²', async () => {
			const geodeticGeometry = new Polygon([[[0, 0], [1100, 0], [1100, 1100], [0, 1100], [0, 0]]]);
			const properties = { type:MeasurementOverlayTypes.AREA, geometry:geodeticGeometry, projectionHints:{ fromProjection:'EPSG:3857', toProjection:'EPSG:25832' } };
			const element = await setup(properties);			
			const div = element.shadowRoot.querySelector('div');

			expect(div.classList.contains('area')).toBeTrue();
			expect(div.classList.contains('floating')).toBeTrue();
			expect(element.type).toBe(MeasurementOverlayTypes.AREA);			
			expect(element.static).toBeFalse();
			expect(div.innerText).toBe('1.21 km²');			
		});
	});

	describe('when type changed', () => {
		it('renders the changed view', async () => {
		
			const element = await setup();			
			const div = element.shadowRoot.querySelector('div');

			expect(element.type).toBe(MeasurementOverlayTypes.TEXT);
			expect(element.static).toBeFalse();
			expect(element.value).toBe('');			

			element.type = MeasurementOverlayTypes.DISTANCE;

			expect(div.classList.contains('distance')).toBeTrue();
			expect(div.classList.contains('floating')).toBeTrue();
			expect(element.type).toBe(MeasurementOverlayTypes.DISTANCE);			
			expect(element.static).toBeFalse();
		});
	});
});
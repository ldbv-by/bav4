import { MeasurementOverlay, MeasurementOverlayTypes } from '../../../../../../../src/modules/map/components/olMap/handler/measure/MeasurementOverlay';
import { LineString } from 'ol/geom';
import { TestUtils } from '../../../../../../test-utils.js';
window.customElements.define(MeasurementOverlay.tag, MeasurementOverlay);


describe('MeasurementOverlay', () => {

	beforeEach(async () => {
		TestUtils.setupStoreAndDi({});
	});
    
	const setup = async ( properties = {}) => {
		const element = await TestUtils.render(MeasurementOverlay.tag);
		for (let property in properties) {
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
			const properties = { type:MeasurementOverlayTypes.DISTANCE, geometry:new LineString([[0, 0], [1, 0]]) };
			const element = await setup(properties);			
			const div = element.shadowRoot.querySelector('div');

			expect(div.classList.contains('distance')).toBeTrue();
			expect(div.classList.contains('floating')).toBeTrue();
			expect(element.type).toBe(MeasurementOverlayTypes.DISTANCE);			
			expect(element.static).toBeFalse();
			expect(div.innerText).toBe('90.00°/1 m');			
		});

		it('renders the distance-partition view', async () => {
			const properties = {
				type:MeasurementOverlayTypes.DISTANCE_PARTITION, 
				geometry:new LineString([[0, 0], [100, 0]]), 
				value:0.1 
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
			const properties = { type:MeasurementOverlayTypes.DISTANCE, geometry:new LineString([[0, 0], [1, 0]]), static:true };
			const element = await setup(properties);			
			const div = element.shadowRoot.querySelector('div');

			expect(div.classList.contains('distance')).toBeTrue();
			expect(div.classList.contains('static')).toBeTrue();
			expect(div.classList.contains('floating')).toBeFalse();
			expect(element.type).toBe(MeasurementOverlayTypes.DISTANCE);			
			expect(div.innerText).toBe('90.00°/1 m');			
		});

		it('renders formatted distance 1 m ', async () => {
			const properties = { type:MeasurementOverlayTypes.DISTANCE, geometry:new LineString([[0, 0], [1, 0]]) };
			const element = await setup(properties);			
			const div = element.shadowRoot.querySelector('div');

			expect(div.innerText).toBe('90.00°/1 m');
		});

		it('renders formatted distance 10 m ', async () => {
			const properties = { type:MeasurementOverlayTypes.DISTANCE, geometry:new LineString([[0, 0], [10, 0]]) };
			const element = await setup(properties);			
			const div = element.shadowRoot.querySelector('div');

			expect(div.innerText).toBe('90.00°/10 m');
		});

		it('renders formatted distance 100 m ', async () => {
			const properties = { type:MeasurementOverlayTypes.DISTANCE, geometry:new LineString([[0, 0], [100, 0]]) };
			const element = await setup(properties);			

			const div = element.shadowRoot.querySelector('div');

			expect(div.innerText).toBe('90.00°/100 m');
		});

		it('renders formatted distance 1 km ', async () => {
			const properties = { type:MeasurementOverlayTypes.DISTANCE, geometry:new LineString([[0, 0], [1000, 0]]) };
			const element = await setup(properties);			

			const div = element.shadowRoot.querySelector('div');

			expect(div.innerText).toBe('90.00°/1 km');
		});

		it('renders formatted distance 10 km ', async () => {
			const properties = { type:MeasurementOverlayTypes.DISTANCE, geometry:new LineString([[0, 0], [10000, 0]]) };
			const element = await setup(properties);			

			const div = element.shadowRoot.querySelector('div');

			expect(div.innerText).toBe('90.00°/10 km');
		});

		it('renders formatted distance 1.23 km ', async () => {
			const properties = { type:MeasurementOverlayTypes.DISTANCE, geometry:new LineString([[0, 0], [1234, 0]]) };
			const element = await setup(properties);			

			const div = element.shadowRoot.querySelector('div');

			expect(div.innerText).toBe('90.00°/1.23 km');
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
import { MeasurementOverlay, MeasurementOverlayTypes } from '../../../../../../../src/modules/map/components/olMap/handler/measure/MeasurementOverlay';
import { TestUtils } from '../../../../../../test-utils.js';
window.customElements.define(MeasurementOverlay.tag, MeasurementOverlay);


describe('Button', () => {

	beforeEach(async () => {
		TestUtils.setupStoreAndDi({});
	});
    
	describe('when initialized with type attribute', () => {
		it('renders the text view', async () => {

			const element = await TestUtils.render(MeasurementOverlay.tag);

			expect(element.type).toBe('text');
			expect(element.static).toBeFalse();
			expect(element.value).toBe('');			
		});

		it('renders the help view', async () => {
			const element = await TestUtils.render(MeasurementOverlay.tag, { type:MeasurementOverlayTypes.HELP, value:'foo' });
			const div = element.shadowRoot.querySelector('div');

			expect(div.classList.contains('help')).toBeTrue();
			expect(div.classList.contains('floating')).toBeFalse();
			expect(div.classList.contains('static')).toBeFalse();
			expect(element.type).toBe(MeasurementOverlayTypes.HELP);			
			expect(element.static).toBeFalse();
			expect(element.value).toBe('foo');			
		});

		it('renders the distance view', async () => {

			const element = await TestUtils.render(MeasurementOverlay.tag, { type:MeasurementOverlayTypes.DISTANCE, value:1 });
			const div = element.shadowRoot.querySelector('div');

			expect(div.classList.contains('distance')).toBeTrue();
			expect(div.classList.contains('floating')).toBeTrue();
			expect(element.type).toBe(MeasurementOverlayTypes.DISTANCE);			
			expect(element.static).toBeFalse();
			expect(element.value).toBe('1');			
		});

		it('renders the distance-partition view', async () => {

			const element = await TestUtils.render(MeasurementOverlay.tag, { type:MeasurementOverlayTypes.DISTANCE_PARTITION, value:1 });
			const div = element.shadowRoot.querySelector('div');

			expect(div.classList.contains('partition')).toBeTrue();
			expect(div.classList.contains('floating')).toBeTrue();
			expect(element.type).toBe(MeasurementOverlayTypes.DISTANCE_PARTITION);			
			expect(element.static).toBeFalse();
			expect(element.value).toBe('1');			
		});

		it('renders the static distance view', async () => {

			const element = await TestUtils.render(MeasurementOverlay.tag, { type:MeasurementOverlayTypes.DISTANCE, value:1, static:true });
			const div = element.shadowRoot.querySelector('div');

			expect(div.classList.contains('distance')).toBeTrue();
			expect(div.classList.contains('static')).toBeTrue();
			expect(div.classList.contains('floating')).toBeFalse();
			expect(element.type).toBe(MeasurementOverlayTypes.DISTANCE);			
			expect(element.value).toBe('1');			
		});

		it('renders formatted distance 1 m ', async () => {

			const element = await TestUtils.render(MeasurementOverlay.tag, { type:MeasurementOverlayTypes.DISTANCE, value:1 });
			const div = element.shadowRoot.querySelector('div');

			expect(div.innerText).toBe('1 m');
		});

		it('renders formatted distance 10 m ', async () => {

			const element = await TestUtils.render(MeasurementOverlay.tag, { type:MeasurementOverlayTypes.DISTANCE, value:10 });
			const div = element.shadowRoot.querySelector('div');

			expect(div.innerText).toBe('10 m');
		});

		it('renders formatted distance 100 m ', async () => {

			const element = await TestUtils.render(MeasurementOverlay.tag, { type:MeasurementOverlayTypes.DISTANCE, value:100 });
			const div = element.shadowRoot.querySelector('div');

			expect(div.innerText).toBe('100 m');
		});

		it('renders formatted distance 1 km ', async () => {

			const element = await TestUtils.render(MeasurementOverlay.tag, { type:MeasurementOverlayTypes.DISTANCE, value:1000 });
			const div = element.shadowRoot.querySelector('div');

			expect(div.innerText).toBe('1 km');
		});

		it('renders formatted distance 10 km ', async () => {

			const element = await TestUtils.render(MeasurementOverlay.tag, { type:MeasurementOverlayTypes.DISTANCE, value:10000 });
			const div = element.shadowRoot.querySelector('div');

			expect(div.innerText).toBe('10 km');
		});

		it('renders formatted distance 1.23 km ', async () => {

			const element = await TestUtils.render(MeasurementOverlay.tag, { type:MeasurementOverlayTypes.DISTANCE, value:1234 });
			const div = element.shadowRoot.querySelector('div');

			expect(div.innerText).toBe('1.23 km');
		});
	});

	describe('when type changed', () => {
		it('renders the changed view', async () => {

			const element = await TestUtils.render(MeasurementOverlay.tag);
			const div = element.shadowRoot.querySelector('div');

			expect(element.type).toBe('text');
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
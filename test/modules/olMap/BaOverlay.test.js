
import { Point } from 'ol/geom';
import { BaOverlay, BaOverlayTypes } from '../../../src/modules/olMap/BaOverlay';
import { TestUtils } from '../../test-utils.js';

window.customElements.define(BaOverlay.tag, BaOverlay);

describe('BaOverlay', () => {

	beforeEach(async () => {
		TestUtils.setupStoreAndDi({});
		// eslint-disable-next-line no-unused-vars
	});

	const setup = async (properties = {}) => {
		const element = await TestUtils.render(BaOverlay.tag);

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

			expect(element.type).toBe(BaOverlayTypes.TEXT);
			expect(element.static).toBeFalse();
			expect(element.value).toBe(null);
		});

		it('renders the help view', async () => {
			const properties = { type: BaOverlayTypes.HELP, value: 'foo' };
			const element = await setup(properties);
			const div = element.shadowRoot.querySelector('div');

			expect(div.classList.contains('help')).toBeTrue();
			expect(div.classList.contains('floating')).toBeFalse();
			expect(div.classList.contains('static')).toBeFalse();
			expect(element.type).toBe(BaOverlayTypes.HELP);
			expect(element.static).toBeFalse();
			expect(element.value).toBe('foo');
		});

		it('have no effect on rendering the help view, when static is set to \'true\' ', async () => {
			const properties = { type: BaOverlayTypes.HELP, value: 'foo', static: true };
			const element = await setup(properties);
			const div = element.shadowRoot.querySelector('div');

			expect(div.classList.contains('help')).toBeTrue();
			expect(div.classList.contains('floating')).toBeFalse();
			expect(div.classList.contains('static')).toBeFalse();
			expect(element.type).toBe(BaOverlayTypes.HELP);
			expect(element.static).toBeTrue();
			expect(element.value).toBe('foo');
		});
	});

	describe('when type changed', () => {
		it('renders the changed view', async () => {

			const element = await setup();
			const div = element.shadowRoot.querySelector('div');

			expect(element.type).toBe(BaOverlayTypes.TEXT);
			expect(element.static).toBeFalse();
			expect(element.value).toBe(null);

			element.type = BaOverlayTypes.HELP;

			expect(div.classList.contains('help')).toBeTrue();
			expect(div.classList.contains('floating')).toBeFalse();
			expect(element.type).toBe(BaOverlayTypes.HELP);
			expect(element.static).toBeFalse();
		});

		it('renders NOT the view, when type value is unchanged', async () => {

			const element = await setup();
			const spy = spyOn(element, 'render').and.callThrough();

			element.type = BaOverlayTypes.HELP;
			element.type = BaOverlayTypes.HELP;

			expect(spy).toHaveBeenCalledTimes(1);
		});
	});

	describe('when geometry changed', () => {
		it('updates the position', async () => {
			const geometry = new Point(0, 0);
			const element = await setup();
			const positionSpy = spyOn(element, '_updatePosition').and.callThrough();

			element.geometry = geometry;

			expect(positionSpy).toHaveBeenCalled();
			expect(element.geometry).toBeTruthy();
			expect(element.position).toBeTruthy();
		});
	});

	describe('when draggable changed', () => {
		it('renders the changed view', async () => {
			const element = await setup();
			const spy = spyOn(element, 'render').and.callThrough();

			element.isDraggable = true;

			expect(spy).toHaveBeenCalled();
		});

		it('renders NOT the view, when draggable-value is unchanged', async () => {
			const element = await setup();
			const spy = spyOn(element, 'render').and.callThrough();

			element.isDraggable = true;
			element.isDraggable = true;

			expect(spy).toHaveBeenCalledTimes(1);
		});
	});
});

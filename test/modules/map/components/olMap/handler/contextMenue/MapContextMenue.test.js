/* eslint-disable no-undef */
import { MapContextMenue } from '../../../../../../../src/modules/map/components/olMap/handler/contextMenue/MapContextMenue';
import { mapContextMenueReducer } from '../../../../../../../src/modules/map/store/mapContextMenue.reducer';
import { TestUtils } from '../../../../../../test-utils.js';
import { initialState } from '../../../../../../../src/modules/contextMenue/store/contextMenue.reducer';
import { close, open } from '../../../../../../../src/modules/map/store/mapContextMenue.action';
window.customElements.define(MapContextMenue.tag, MapContextMenue);

describe('MapContextMenue', () => {
	let element;

	beforeEach(async () => {

		const state = {
			mapContextMenue: initialState
		};

		TestUtils.setupStoreAndDi(state, { mapContextMenue: mapContextMenueReducer });
		element = await TestUtils.render(MapContextMenue.tag);
	});

	describe('when initialized', () => {
		it('adds a div which is not visible', async () => {
			const container = element.shadowRoot.querySelector('.context-menue');

			expect(container).toBeTruthy();
			expect(window.getComputedStyle(container).display).toBe('none');
		});
	});

	describe('store changed', () => {
		it('shows/hides the context menue', async () => {

			const container = element.shadowRoot.querySelector('.context-menue');

			open({ x: 10, y: 10 });

			expect(window.getComputedStyle(container).display).toBe('block');

			close();

			expect(window.getComputedStyle(container).display).toBe('none');
		});

		it('shows/hides the context menue', async () => {

			const container = element.shadowRoot.querySelector('.context-menue');

			open({ x: 10, y: 10 });

			expect(window.getComputedStyle(container).display).toBe('block');

			close();

			expect(window.getComputedStyle(container).display).toBe('none');
		});

		it('calls the calculateParameter()', async () => {
			
			const clickEvent = { x: 10, y: 10 };
			const spy = spyOn(element, '_calculateParameter').and.callThrough();
			const container = element.shadowRoot.querySelector('.context-menue');

			open(clickEvent);
            
			expect(spy).toHaveBeenCalledWith(clickEvent, container);
		});

		it('adds ccs classes and stylings', async () => {
			
			const clickEvent = { x: 10, y: 10 };
			const container = element.shadowRoot.querySelector('.context-menue');

			open(clickEvent);
            
			expect(window.getComputedStyle(container).left).toBeTruthy('10px');
			expect(window.getComputedStyle(container).top).toBe('30px');
			expect(container.classList.contains('top-left')).toBeTrue();
		});
	});

	describe('calculateParameter', () => {
		it('returns  default parameter when event coordinate or element is missing', async () => {
			
			const expectedParameter = { left: 0, top: 0, vAlignment: 'left', hAlignment: 'top' };

			let parameter = element._calculateParameter();

			expect(parameter).toEqual(expectedParameter);

			parameter = element._calculateParameter({ x: 10, y: 10 });

			expect(parameter).toEqual(expectedParameter);
		});

		it('returns parameter for top-left click position', async () => {
			
			const expectedParameter = { left: '10px', top: '30px', vAlignment: 'left', hAlignment: 'top' };
			spyOnProperty(window, 'innerWidth', 'get').and.returnValue(400);
			spyOnProperty(window, 'innerHeight', 'get').and.returnValue(400);
			spyOnProperty(element, 'offsetWidth', 'get').and.returnValue(50);
			spyOnProperty(element, 'offsetHeight', 'get').and.returnValue(50);

			const parameter = element._calculateParameter({ x: 10, y: 10 }, element);

			expect(parameter).toEqual(expectedParameter);
		});

		it('returns parameter for top-right click position', async () => {
			
			const expectedParameter = { left: '250px', top: '30px', vAlignment: 'right', hAlignment: 'top' };
			spyOnProperty(window, 'innerWidth', 'get').and.returnValue(400);
			spyOnProperty(window, 'innerHeight', 'get').and.returnValue(400);
			spyOnProperty(element, 'offsetWidth', 'get').and.returnValue(50);
			spyOnProperty(element, 'offsetHeight', 'get').and.returnValue(50);

			const parameter = element._calculateParameter({ x: 300, y: 10 }, element);

			expect(parameter).toEqual(expectedParameter);
		});

		it('returns parameter for bottom-left click position', async () => {
			
			const expectedParameter = { left: '10px', top: '230px', vAlignment: 'left', hAlignment: 'bottom' };
			spyOnProperty(window, 'innerWidth', 'get').and.returnValue(400);
			spyOnProperty(window, 'innerHeight', 'get').and.returnValue(400);
			spyOnProperty(element, 'offsetWidth', 'get').and.returnValue(50);
			spyOnProperty(element, 'offsetHeight', 'get').and.returnValue(50);

			const parameter = element._calculateParameter({ x: 10, y: 300 }, element);

			expect(parameter).toEqual(expectedParameter);
		});

		it('returns parameter for bottom-right click position', async () => {
			
			const expectedParameter = { left: '250px', top: '230px', vAlignment: 'right', hAlignment: 'bottom' };
			spyOnProperty(window, 'innerWidth', 'get').and.returnValue(400);
			spyOnProperty(window, 'innerHeight', 'get').and.returnValue(400);
			spyOnProperty(element, 'offsetWidth', 'get').and.returnValue(50);
			spyOnProperty(element, 'offsetHeight', 'get').and.returnValue(50);

			const parameter = element._calculateParameter({ x: 300, y: 300 }, element);

			expect(parameter).toEqual(expectedParameter);
		});

	});

});
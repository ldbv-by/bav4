/* eslint-disable no-undef */
import { MapContextMenu } from '../../../../../src/modules/map/components/contextMenu/MapContextMenu';
import { TestUtils } from '../../../../test-utils.js';
import { $injector } from '../../../../../src/injection';
import { html } from 'lit-html';
import { mapContextMenuReducer, initialState } from '../../../../../src/store/mapContextMenu/mapContextMenu.reducer';
import { close, open } from '../../../../../src/store/mapContextMenu/mapContextMenu.action';
window.customElements.define(MapContextMenu.tag, MapContextMenu);

describe('MapContextMenu', () => {
	const setup = (state = initialState) => {
		const mapContextMenuState = {
			mapContextMenu: state
		};

		TestUtils.setupStoreAndDi(mapContextMenuState, { mapContextMenu: mapContextMenuReducer });
		$injector.registerSingleton('TranslationService', { translate: (key) => key });
		return TestUtils.render(MapContextMenu.tag);
	};

	describe('when initialized', () => {
		it('renders nothing', async () => {
			const element = await setup();

			expect(element.childElementCount).toBe(0);
		});
	});

	describe('store changed', () => {
		it('shows/hides the context menu and its content', async () => {
			const element = await setup();

			open([10, 10], html`<span class="foo">bar</span>`);

			const container = element.shadowRoot.querySelector('.context-menu');
			const content = element.shadowRoot.querySelector('.foo');
			expect(window.getComputedStyle(container).display).toBe('block');
			expect(content.innerText).toBe('bar');

			close();

			expect(element.shadowRoot.querySelector('.context-menu')).toBeFalsy();
		});
	});

	describe('when opened', () => {
		it('shows a header and a close button which closes the menu', async () => {
			const element = await setup({ coordinate: [10, 20], content: 'someId' });

			const header = element.shadowRoot.querySelector('.header');
			expect(header).toBeTruthy();
			expect(header.innerText).toBe('map_contextMenu_header');

			const icon = element.shadowRoot.querySelector('ba-icon');
			expect(icon).toBeTruthy();
			expect(icon.title).toBe('map_contextMenu_close_button');

			icon.click();

			expect(element.shadowRoot.querySelector('.context-menu')).toBeFalsy();
		});

		it('calls the _calculateSector() method', async () => {
			const element = await setup();
			const clickEvent = [10, 20];
			const spy = spyOn(element, '_calculateSector').and.callThrough();

			open(clickEvent, 'someId');

			expect(spy).toHaveBeenCalledWith(clickEvent);
		});

		it('adds css classes and stylings when click event in sector0', async () => {
			spyOnProperty(window, 'innerWidth', 'get').and.returnValue(1000);
			spyOnProperty(window, 'innerHeight', 'get').and.returnValue(500);
			const element = await setup();
			const clickEvent = [300, 150];

			open(clickEvent, 'someId');

			const container = element.shadowRoot.querySelector('.context-menu');
			expect(container.style.getPropertyValue('--mouse-x')).toBe('300px');
			//consider arrow offset of 20px
			expect(container.style.getPropertyValue('--mouse-y')).toBe('170px');
			expect(container.classList.length).toBe(2);
			expect(container.classList.contains('context-menu')).toBeTrue();
			expect(container.classList.contains('sector-0')).toBeTrue();
		});

		it('adds css classes and stylings when click event in sector1', async () => {
			spyOnProperty(window, 'innerWidth', 'get').and.returnValue(1000);
			spyOnProperty(window, 'innerHeight', 'get').and.returnValue(500);
			const element = await setup();
			const clickEvent = [700, 150];

			open(clickEvent, 'someId');

			const container = element.shadowRoot.querySelector('.context-menu');
			expect(container.style.getPropertyValue('--mouse-x')).toBe('700px');
			//consider arrow offset of 20px
			expect(container.style.getPropertyValue('--mouse-y')).toBe('170px');
			expect(container.classList.length).toBe(2);
			expect(container.classList.contains('context-menu')).toBeTrue();
			expect(container.classList.contains('sector-1')).toBeTrue();
		});

		it('adds css classes and stylings when click event in sector2', async () => {
			spyOnProperty(window, 'innerWidth', 'get').and.returnValue(1000);
			spyOnProperty(window, 'innerHeight', 'get').and.returnValue(500);
			const element = await setup();
			const clickEvent = [700, 350];

			open(clickEvent, 'someId');

			const container = element.shadowRoot.querySelector('.context-menu');
			expect(container.style.getPropertyValue('--mouse-x')).toBe('700px');
			//consider arrow offset of -20px
			expect(container.style.getPropertyValue('--mouse-y')).toBe('330px');
			expect(container.classList.length).toBe(2);
			expect(container.classList.contains('context-menu')).toBeTrue();
			expect(container.classList.contains('sector-2')).toBeTrue();
		});

		it('adds css classes and stylings when click event in sector3', async () => {
			spyOnProperty(window, 'innerWidth', 'get').and.returnValue(1000);
			spyOnProperty(window, 'innerHeight', 'get').and.returnValue(500);
			const element = await setup();
			const clickEvent = [300, 350];

			open(clickEvent, 'someId');

			const container = element.shadowRoot.querySelector('.context-menu');
			expect(container.style.getPropertyValue('--mouse-x')).toBe('300px');
			//consider arrow offset of -20px
			expect(container.style.getPropertyValue('--mouse-y')).toBe('330px');
			expect(container.classList.length).toBe(2);
			expect(container.classList.contains('context-menu')).toBeTrue();
			expect(container.classList.contains('sector-3')).toBeTrue();
		});
	});
});

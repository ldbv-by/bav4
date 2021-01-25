
import { ContextMenue } from '../../../../src/modules/contextMenue/components/ContextMenue';
import { contextMenueReducer } from '../../../../src/modules/contextMenue/store/contextMenue.reducer';
import { contextMenueClose, contextMenueOpen } from '../../../../src/modules/contextMenue/store/contextMenue.action';

import { TestUtils } from '../../../test-utils';
window.customElements.define(ContextMenue.tag, ContextMenue);

const setupStoreAndDi = (state) => {
	TestUtils.setupStoreAndDi(state, { contextMenue: contextMenueReducer });

};

describe('ContextMenue', () => {

	let element;

	describe('when initialized', () => {
		it('is hidden with no contextMenue-Entries', async () => {
			//arrange
			setupStoreAndDi({
				contextMenue: {
					data: { pointer: false, commands: false }
				}
			});

			// act
			element = await TestUtils.render(ContextMenue.tag);

			// assert
			expect(element.shadowRoot.querySelector('.context_menu_active')).toBeFalsy();
			expect(element.shadowRoot.querySelector('.context-menu')).toBeTruthy();
			expect(element.shadowRoot.querySelector('.context-menu__items')).toBeFalsy();
			expect(element.shadowRoot.querySelector('.context-menu__item')).toBeFalsy();

		});
	});

	describe('when contextmenue state changed', () => {
		beforeEach(async () => {

			const state = {
				contextMenue: {
					data: { pointer: false, commands: false }
				}
			};

			TestUtils.setupStoreAndDi(state, {
				contextMenue: contextMenueReducer
			});

			element = await TestUtils.render(ContextMenue.tag);
		});

		it('adds data-content to context-menu', () => {
			const contextMenueData = {
				pointer: { x: 0, y: 0 },
				commands: [
					{ label: 'foo', action: () => { } },
					{ label: 'bar', action: () => { } }]
			};

			contextMenueOpen(contextMenueData);

			expect(element.shadowRoot.querySelector('.context_menu_active')).toBeTruthy();
			expect(element.shadowRoot.querySelector('.context-menu')).toBeTruthy();
			expect(element.shadowRoot.querySelector('.context-menu__items')).toBeTruthy();
			expect(element.shadowRoot.querySelector('.context-menu__item')).toBeTruthy();
		});

		it('removes data-content from context-menu', () => {
			const contextMenueData = {
				pointer: { x: 0, y: 0 },
				commands: [
					{ label: 'foo', action: () => { } },
					{ label: 'bar', action: () => { } }]
			};

			contextMenueOpen(contextMenueData);
			const wasOpen = element.shadowRoot.getElementById('context-menu').firstChild !== null;			
			contextMenueClose();
			

			expect(wasOpen).toBe(true);
			expect(element.shadowRoot.querySelector('.context-menu__items')).toBeFalsy();
		});
	});

	describe('when called with coordinates near boundingRect', () => {
		beforeEach(async () => {

			const state = {
				contextMenue: {
					data: { pointer: false, commands: false }
				}
			};

			TestUtils.setupStoreAndDi(state, {
				contextMenue: contextMenueReducer
			});

			element = await TestUtils.render(ContextMenue.tag);
		});

		it('places the menu left of pointer', () => {
			const offset = 4;
			const placementRect = {
				left: window.screenLeft,
				top: window.screenTop,
				width: window.innerWidth,
				height: window.innerHeight,
				right: window.screenLeft + window.innerWidth,
				bottom: window.screenTop + window.innerHeight
			};

			const pointerNearRightBorder = {
				x: window.screenLeft + window.innerWidth - offset,
				y: window.screenTop
			};
			const contextMenueData = {
				pointer: pointerNearRightBorder,
				boundingRect: placementRect,
				commands: [
					{ label: 'foo', action: () => { } },
					{ label: 'bar', action: () => { } }]
			};

			contextMenueOpen(contextMenueData);
			const actualRect = element.shadowRoot.getElementById('context-menu').getBoundingClientRect();

			expect(actualRect.left).toBeLessThan(pointerNearRightBorder.x);
			expect(actualRect.top).toBeGreaterThan(pointerNearRightBorder.y);

		});

		it('places the menu top of pointer', () => {
			const offset = 4;
			const placementRect = {
				left: window.screenLeft,
				top: window.screenTop,
				width: window.innerWidth,
				height: window.innerHeight,
				right: window.screenLeft + window.innerWidth,
				bottom: window.screenTop + window.innerHeight
			};

			const pointerNearBottomBorder = {
				x: window.screenLeft,
				y: window.screenTop + window.innerHeight - offset
			};
			const contextMenueData = {
				pointer: pointerNearBottomBorder,
				boundingRect: placementRect,
				commands: [
					{ label: 'foo', action: () => { } },
					{ label: 'bar', action: () => { } }]
			};

			contextMenueOpen(contextMenueData);
			const actualRect = element.shadowRoot.getElementById('context-menu').getBoundingClientRect();

			expect(actualRect.top).toBeLessThan(pointerNearBottomBorder.y);
			expect(actualRect.left).toBeGreaterThan(pointerNearBottomBorder.x);

		});

		it('calls the command-callback on click', () => {
			const command = { label: 'foo', action: () => {} };
			command.action = jasmine.createSpy();
			const contextMenueData = {
				pointer: { x: 0, y: 0 },
				commands: [command]
			};

			contextMenueOpen(contextMenueData);
			element.shadowRoot.getElementById('context-menu__item_0').click();

			expect(command.action).toHaveBeenCalled();
		});
	});
});
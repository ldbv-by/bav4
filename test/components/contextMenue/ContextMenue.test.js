
import { ContextMenue } from '../../../src/components/contextMenue/ContextMenue';
import { contextMenueReducer } from '../../../src/components/contextMenue/store/contextMenue.reducer';
import { contextMenueClose, contextMenueOpen } from '../../../src/components/contextMenue/store/contextMenue.action';

import { TestUtils } from '../../test-utils';
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
			expect(element.shadowRoot.querySelector('.context-menu--active')).toBeFalsy();
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
			// arrange
			const contextMenueData = {
				pointer: { x: 0, y: 0 },
				commands: [
					{ label: 'foo', action: () => { } },
					{ label: 'bar', action: () => { } }]
			};

			// act
			contextMenueOpen(contextMenueData);

			// assert
			expect(element.shadowRoot.querySelector('.context-menu--active')).toBeTruthy();
			expect(element.shadowRoot.querySelector('.context-menu')).toBeTruthy();
			expect(element.shadowRoot.querySelector('.context-menu__items')).toBeTruthy();
			expect(element.shadowRoot.querySelector('.context-menu__item')).toBeTruthy();
		});

		it('adds data-content with object as label to context-menu', () => {
			// arrange
			const obj = { foo: 'bar' };
			class SimpleClass {

				constructor(value) {
					this._value = value;
				}

				toString() {
					return this._value;
				}
			}

			const instance = new SimpleClass('foobar');
			const contextMenueData = {
				pointer: { x: 0, y: 0 },
				commands: [
					{ label: instance, action: () => { } },
					{ label: obj, action: () => { } }]
			};

			// act
			contextMenueOpen(contextMenueData);

			// assert
			expect(element.shadowRoot.querySelector('.context-menu--active')).toBeTruthy();
			expect(element.shadowRoot.querySelector('.context-menu')).toBeTruthy();
			expect(element.shadowRoot.querySelector('.context-menu__items')).toBeTruthy();
			expect(element.shadowRoot.querySelector('.context-menu__item')).toBeTruthy();
			expect(element.shadowRoot.querySelector('.context-menu__label').firstChild.nodeValue).toEqual('foobar');
			expect(element.shadowRoot.querySelectorAll('.context-menu__label')[1].innerText).toEqual('[object Object]');
		});


		it('removes data-content from context-menu', () => {
			// arrange
			const contextMenueData = {
				pointer: { x: 0, y: 0 },
				commands: [
					{ label: 'foo', action: () => { } },
					{ label: 'bar', action: () => { } }]
			};

			// act
			contextMenueOpen(contextMenueData);
			const wasOpen = element.shadowRoot.querySelector('.context-menu--active') !== null;

			contextMenueClose();
			const isOpen = element.shadowRoot.querySelector('.context-menu--active') !== null;

			// assert
			expect(wasOpen).toBeTruthy();
			expect(isOpen).toBeFalsy();
		});
	});
});
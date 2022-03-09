import { html } from 'lit-html';
import { BaElement } from '../../src/modules/BaElement';
import { MvuElement } from '../../src/modules/MvuElement';
import { TEST_ID_ATTRIBUTE_NAME } from '../../src/utils/markup';
import { TestUtils } from '../test-utils';

class MvuElementParent extends MvuElement {

	createView() {
		return html`
			<div id='id' data-test-id></div>
			<div class='class foo' data-test-id></div>
			<div data-test-id></div>
			<mvu-element-child data-test-id id='id'></mvu-element-child>
			<div id='id'></div>
			<div class='class foo'></div>
			<div></div>
			<mvu-element-child></mvu-element-child>
			`;
	}

	static get tag() {
		return 'mvu-element-parent';
	}
}

class MvuElementChild extends MvuElement {

	createView() {
		return html`<div id='id' data-test-id></div>`;
	}

	static get tag() {
		return 'mvu-element-child';
	}
}

window.customElements.define(MvuElementParent.tag, MvuElementParent);
window.customElements.define(MvuElementChild.tag, MvuElementChild);

class BaElementParent extends BaElement {

	createView() {
		return html`
			<div id='id' data-test-id></div>
			<div class='class foo' data-test-id></div>
			<div data-test-id></div>
			<ba-element-child data-test-id id='id'></ba-element-child>
			<div id='id'></div>
			<div class='class foo'></div>
			<div></div>
			<ba-element-child></ba-element-child>
			`;
	}

	static get tag() {
		return 'ba-element-parent';
	}
}

class BaElementChild extends BaElement {

	createView() {
		return html``;
	}

	static get tag() {
		return 'ba-element-child';
	}
}
window.customElements.define(BaElementParent.tag, BaElementParent);
window.customElements.define(BaElementChild.tag, BaElementChild);

describe('markup utils', () => {
	describe('constants', () => {

		it('provides an attribute name for test ids', () => {
			expect(TEST_ID_ATTRIBUTE_NAME).toBe('data-test-id');
		});
	});

	describe('constants', () => {

		beforeEach(() => {
			TestUtils.setupStoreAndDi();
		});

		afterEach(() => {
			window.enableTestIds = undefined;
		});

		describe('generateTestIds for MvuElements', () => {

			it('provides the correct test id for MvuElements', async () => {
				window.enableTestIds = true;
				const warnSpy = spyOn(console, 'warn');
				const element = await TestUtils.render(MvuElementParent.tag, { 'data-test-id': '' });

				const divElements = element.shadowRoot.querySelectorAll('div');
				const mvuElements = element.shadowRoot.querySelectorAll(MvuElementChild.tag);

				expect(element.getAttribute(TEST_ID_ATTRIBUTE_NAME)).toBe('mvu-element-parent-0');
				expect(divElements).toHaveSize(6);
				expect(divElements.item(0).getAttribute(TEST_ID_ATTRIBUTE_NAME)).toBe('mvu-element-parent-0_id');
				expect(divElements.item(1).getAttribute(TEST_ID_ATTRIBUTE_NAME)).toBe('mvu-element-parent-0_class-foo');
				expect(warnSpy).toHaveBeenCalledOnceWith('No data-test-id qualifier found for: mvu-element-parent-0 -> div. Please add either an id or a class attribute.');
				expect(divElements.item(3).hasAttribute(TEST_ID_ATTRIBUTE_NAME)).toBeFalse();
				expect(divElements.item(4).hasAttribute(TEST_ID_ATTRIBUTE_NAME)).toBeFalse();
				expect(divElements.item(5).hasAttribute(TEST_ID_ATTRIBUTE_NAME)).toBeFalse();
				expect(mvuElements).toHaveSize(2);
				expect(mvuElements.item(0).getAttribute(TEST_ID_ATTRIBUTE_NAME)).toBe('mvu-element-parent-0_id');
				expect(mvuElements.item(1).hasAttribute(TEST_ID_ATTRIBUTE_NAME)).toBeFalse();
			});

			it('does nothing', async () => {
				const element = await TestUtils.render(MvuElementParent.tag, { 'data-test-id': '' });

				const all = [...element.shadowRoot.querySelectorAll('div'), ...element.shadowRoot.querySelectorAll(MvuElementChild.tag)];

				expect(all).toHaveSize(8);
				all.forEach(el => {
					expect(el.getAttribute(TEST_ID_ATTRIBUTE_NAME)).toBeFalsy();
				});
			});
		});

		describe('generateTestIds for BaElements', () => {

			it('provides the correct test id for MvuElements', async () => {
				window.enableTestIds = true;
				const warnSpy = spyOn(console, 'warn');
				const element = await TestUtils.render(BaElementParent.tag, { 'data-test-id': '' });

				const divElements = element.shadowRoot.querySelectorAll('div');
				const mvuElements = element.shadowRoot.querySelectorAll(BaElementChild.tag);

				expect(element.getAttribute(TEST_ID_ATTRIBUTE_NAME)).toBe('ba-element-parent-0');
				expect(divElements).toHaveSize(6);
				expect(divElements.item(0).getAttribute(TEST_ID_ATTRIBUTE_NAME)).toBe('ba-element-parent-0_id');
				expect(divElements.item(1).getAttribute(TEST_ID_ATTRIBUTE_NAME)).toBe('ba-element-parent-0_class-foo');
				expect(warnSpy).toHaveBeenCalledOnceWith('No data-test-id qualifier found for: ba-element-parent-0 -> div. Please add either an id or a class attribute.');
				expect(divElements.item(3).hasAttribute(TEST_ID_ATTRIBUTE_NAME)).toBeFalse();
				expect(divElements.item(4).hasAttribute(TEST_ID_ATTRIBUTE_NAME)).toBeFalse();
				expect(divElements.item(5).hasAttribute(TEST_ID_ATTRIBUTE_NAME)).toBeFalse();
				expect(mvuElements).toHaveSize(2);
				expect(mvuElements.item(0).getAttribute(TEST_ID_ATTRIBUTE_NAME)).toBe('ba-element-parent-0_id');
				expect(mvuElements.item(1).hasAttribute(TEST_ID_ATTRIBUTE_NAME)).toBeFalse();
			});

			it('does nothing', async () => {
				const element = await TestUtils.render(BaElementParent.tag, { 'data-test-id': '' });

				const all = [...element.shadowRoot.querySelectorAll('div'), ...element.shadowRoot.querySelectorAll(BaElementChild.tag)];

				expect(all).toHaveSize(8);
				all.forEach(el => {
					expect(el.getAttribute(TEST_ID_ATTRIBUTE_NAME)).toBeFalsy();
				});
			});
		});
	});
});

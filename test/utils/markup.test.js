import { html } from 'lit-html';
import { BaElement } from '../../src/modules/BaElement';
import { MvuElement } from '../../src/modules/MvuElement';
import {
	BA_FORM_ELEMENT_VISITED_CLASS,
	decodeHtmlEntities,
	findAllBySelector,
	forEachBySelector,
	IFRAME_ENCODED_STATE,
	IFRAME_GEOMETRY_REFERENCE_ID,
	LOG_LIFECYLE_ATTRIBUTE_NAME,
	REGISTER_FOR_VIEWPORT_CALCULATION_ATTRIBUTE_NAME,
	TEST_ID_ATTRIBUTE_NAME
} from '../../src/utils/markup';
import { TestUtils } from '../test-utils';

class MvuElementParent extends MvuElement {
	createView() {
		return html`
			<div id="id" data-test-id></div>
			<div class="class foo" data-test-id></div>
			<div data-test-id></div>
			<mvu-element-child data-test-id id="id"></mvu-element-child>
			<mvu-element-child data-test-id class="class"></mvu-element-child>
			<div id="id"></div>
			<div class="class foo"></div>
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
		return html`<div id="id" data-test-id></div>`;
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
			<div id="id" data-test-id></div>
			<div class="class foo" data-test-id></div>
			<div data-test-id></div>
			<ba-element-child data-test-id id="id"></ba-element-child>
			<ba-element-child data-test-id class="class"></ba-element-child>
			<div id="id"></div>
			<div class="class foo"></div>
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

		it('provides an attribute name to register for viewport calculation', () => {
			expect(REGISTER_FOR_VIEWPORT_CALCULATION_ATTRIBUTE_NAME).toBe('data-register-for-viewport-calc');
		});

		it('provides an attribute name to enable lifecycle logging', () => {
			expect(LOG_LIFECYLE_ATTRIBUTE_NAME).toBe('data-log-lifecycle');
		});
		it('provides an attribute name for iframes to enable exposing the current state of an embedded BA app', () => {
			expect(IFRAME_ENCODED_STATE).toBe('data-iframe-encoded-state');
		});
		it('provides an attribute name for iframes to enable exposing the reference id of an user-generated geometry', () => {
			expect(IFRAME_GEOMETRY_REFERENCE_ID).toBe('data-iframe-geometry-reference-id');
		});
		it('provides an css class name for ba form elements', () => {
			expect(BA_FORM_ELEMENT_VISITED_CLASS).toBe('userVisited');
		});
	});

	describe('constants', () => {
		beforeEach(() => {
			TestUtils.setupStoreAndDi();
		});

		afterEach(() => {
			window.ba_enableTestIds = undefined;
		});

		describe('generateTestIds for MvuElements', () => {
			it('provides the correct test id for MvuElements', async () => {
				window.ba_enableTestIds = true;
				const warnSpy = spyOn(console, 'warn');
				const element = await TestUtils.render(MvuElementParent.tag, {}, { 'data-test-id': '' });

				const divElements = element.shadowRoot.querySelectorAll('div');
				const mvuChildElements = element.shadowRoot.querySelectorAll(MvuElementChild.tag);

				expect(element.getAttribute(TEST_ID_ATTRIBUTE_NAME)).toBe('mvu-element-parent-0');
				expect(divElements).toHaveSize(6);
				expect(divElements.item(0).getAttribute(TEST_ID_ATTRIBUTE_NAME)).toBe('mvu-element-parent-0_id');
				expect(divElements.item(1).getAttribute(TEST_ID_ATTRIBUTE_NAME)).toBe('mvu-element-parent-0_class-foo');
				expect(warnSpy).toHaveBeenCalledOnceWith(
					'No data-test-id qualifier found for: mvu-element-parent-0 -> div. Please add either an id or a class attribute.'
				);
				expect(divElements.item(3).hasAttribute(TEST_ID_ATTRIBUTE_NAME)).toBeFalse();
				expect(divElements.item(4).hasAttribute(TEST_ID_ATTRIBUTE_NAME)).toBeFalse();
				expect(divElements.item(5).hasAttribute(TEST_ID_ATTRIBUTE_NAME)).toBeFalse();
				expect(mvuChildElements).toHaveSize(3);
				expect(mvuChildElements.item(0).getAttribute(TEST_ID_ATTRIBUTE_NAME)).toBe('mvu-element-parent-0_mvu-element-child-0');
				expect(mvuChildElements.item(1).getAttribute(TEST_ID_ATTRIBUTE_NAME)).toBe('mvu-element-parent-0_mvu-element-child-1');
				expect(mvuChildElements.item(2).hasAttribute(TEST_ID_ATTRIBUTE_NAME)).toBeFalse();
			});

			it('does nothing', async () => {
				const element = await TestUtils.render(MvuElementParent.tag, {}, { 'data-test-id': '' });

				const all = [...element.shadowRoot.querySelectorAll('div'), ...element.shadowRoot.querySelectorAll(MvuElementChild.tag)];

				expect(all).toHaveSize(9);
				all.forEach((el) => {
					expect(el.getAttribute(TEST_ID_ATTRIBUTE_NAME)).toBeFalsy();
				});
			});
		});

		describe('generateTestIds for BaElements', () => {
			it('provides the correct test id for MvuElements', async () => {
				window.ba_enableTestIds = true;
				const warnSpy = spyOn(console, 'warn');
				const element = await TestUtils.render(BaElementParent.tag, {}, { 'data-test-id': '' });

				const divElements = element.shadowRoot.querySelectorAll('div');
				const baChildElements = element.shadowRoot.querySelectorAll(BaElementChild.tag);

				expect(element.getAttribute(TEST_ID_ATTRIBUTE_NAME)).toBe('ba-element-parent-0');
				expect(divElements).toHaveSize(6);
				expect(divElements.item(0).getAttribute(TEST_ID_ATTRIBUTE_NAME)).toBe('ba-element-parent-0_id');
				expect(divElements.item(1).getAttribute(TEST_ID_ATTRIBUTE_NAME)).toBe('ba-element-parent-0_class-foo');
				expect(warnSpy).toHaveBeenCalledOnceWith(
					'No data-test-id qualifier found for: ba-element-parent-0 -> div. Please add either an id or a class attribute.'
				);
				expect(divElements.item(3).hasAttribute(TEST_ID_ATTRIBUTE_NAME)).toBeFalse();
				expect(divElements.item(4).hasAttribute(TEST_ID_ATTRIBUTE_NAME)).toBeFalse();
				expect(divElements.item(5).hasAttribute(TEST_ID_ATTRIBUTE_NAME)).toBeFalse();
				expect(baChildElements).toHaveSize(3);
				expect(baChildElements.item(0).getAttribute(TEST_ID_ATTRIBUTE_NAME)).toBe('ba-element-parent-0_ba-element-child-0');
				expect(baChildElements.item(1).getAttribute(TEST_ID_ATTRIBUTE_NAME)).toBe('ba-element-parent-0_ba-element-child-1');
				expect(baChildElements.item(2).hasAttribute(TEST_ID_ATTRIBUTE_NAME)).toBeFalse();
			});

			it('does nothing', async () => {
				const element = await TestUtils.render(BaElementParent.tag, {}, { 'data-test-id': '' });

				const all = [...element.shadowRoot.querySelectorAll('div'), ...element.shadowRoot.querySelectorAll(BaElementChild.tag)];

				expect(all).toHaveSize(9);
				all.forEach((el) => {
					expect(el.getAttribute(TEST_ID_ATTRIBUTE_NAME)).toBeFalsy();
				});
			});
		});
	});

	describe('decodeHtmlEntities', () => {
		it('decodes text from html-content', () => {
			expect(decodeHtmlEntities('&sup2;')).toBe('²');
			expect(decodeHtmlEntities('&sup3;')).toBe('³');
			expect(decodeHtmlEntities('<b>foo</b>')).toBe('foo');
			expect(decodeHtmlEntities('<div class="foo">bar</div>')).toBe('bar');
		});

		it('ignores js-code', () => {
			const spy = spyOn(window, 'alert');
			const decoded = decodeHtmlEntities('<img src="dummy" onerror="alert(\'called\')")');
			expect(spy).not.toHaveBeenCalled();
			expect(decoded).toBe('');
		});
	});

	describe('forEachBySelector', () => {
		beforeEach(() => {
			TestUtils.setupStoreAndDi();
		});

		afterEach(() => {
			window.ba_enableTestIds = undefined;
		});

		it('applies a function on all elements containing a specific attribute', async () => {
			// we reuse the data-test-id MvuElement classes for our test
			window.ba_enableTestIds = true;
			spyOn(console, 'warn');
			const element = await TestUtils.render(MvuElementParent.tag);
			const callbackSpy = jasmine.createSpy();

			forEachBySelector(element, '[data-test-id]', callbackSpy);

			expect(callbackSpy).toHaveBeenCalledTimes(8);
			expect(callbackSpy).toHaveBeenCalledWith(jasmine.any(HTMLElement));
		});
	});

	describe('findAllBySelector', () => {
		beforeEach(() => {
			TestUtils.setupStoreAndDi();
		});

		afterEach(() => {
			window.ba_enableTestIds = undefined;
		});

		it('finds all elements matching a specific selector', async () => {
			// we reuse the data-test-id MvuElement classes for our test
			window.ba_enableTestIds = true;
			spyOn(console, 'warn');
			const element = await TestUtils.render(MvuElementParent.tag);

			const result = findAllBySelector(element, '[data-test-id]');

			expect(result).toHaveSize(8);
			expect(result[0].tagName).toBe('DIV');
			expect(result[3].tagName).toBe('MVU-ELEMENT-CHILD');
		});
	});
});

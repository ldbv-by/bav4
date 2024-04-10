/* eslint-disable no-undef */

import { Badge } from '../../../../src/modules/commons/components/badge/Badge.js';
import { TestUtils } from '../../../test-utils.js';
window.customElements.define(Badge.tag, Badge);

describe('Badge', () => {
	beforeEach(async () => {
		TestUtils.setupStoreAndDi({});
	});

	describe('when initialized', () => {
		it('contains default values in the model', async () => {
			const element = await TestUtils.render(Badge.tag);

			//model
			expect(element.label).toBe('');
			expect(element.title).toBe('');
			expect(element.icon).toBeNull;
			expect(element.size).toBe(0.8);
			expect(element.color).toBe('var(--text1)');
			expect(element.background).toBe('var(--secondary-bg-color)');
		});

		it('renders the view', async () => {
			const element = await TestUtils.render(Badge.tag);

			//view
			const badge = element.shadowRoot.querySelector('.badge');
			expect(badge.children.length).toBe(1);
			expect(element.shadowRoot.styleSheets.length).toBe(2);
			const text = element.shadowRoot.querySelector('.text');
			expect(text.innerText).toBe('');
			expect(element.shadowRoot.querySelectorAll('.icon')).toHaveSize(0);
		});
	});

	describe("when property'label' changes", () => {
		it('updates the view', async () => {
			const element = await TestUtils.render(Badge.tag);
			const text = element.shadowRoot.querySelector('.text');

			element.label = 'foo';

			expect(text.innerText).toBe('foo');
		});
	});

	describe("when property'title' changes", () => {
		it('updates the view', async () => {
			const element = await TestUtils.render(Badge.tag);

			element.title = 'foo';

			expect(element.title).toBe('foo');
		});
	});

	describe("when property'icon' changes", () => {
		it('updates the view', async () => {
			const fakeBase64Svg = 'data:image/svg+xml;base64,foo';
			const element = await TestUtils.render(Badge.tag);

			element.icon = fakeBase64Svg;

			expect(element.shadowRoot.styleSheets[1].cssRules.item(4).cssText).toContain(fakeBase64Svg);
		});
	});

	describe("when property'size' changes", () => {
		it('updates the view', async () => {
			const element = await TestUtils.render(Badge.tag);

			element.size = 5;

			expect(element.shadowRoot.styleSheets[1].cssRules.item(3).cssText).toContain('--size: 5rem;');
		});
	});

	describe("when property'color' changes", () => {
		it('updates the view', async () => {
			const element = await TestUtils.render(Badge.tag);

			element.color = 'var(--foo)';

			expect(element.shadowRoot.styleSheets[1].cssRules.item(3).cssText).toContain('color: var(--foo);');
		});
	});

	describe("when property'background' changes", () => {
		it('updates the view', async () => {
			const element = await TestUtils.render(Badge.tag);

			element.background = 'var(--foo)';

			expect(element.shadowRoot.styleSheets[1].cssRules.item(3).cssText).toContain('background: var(--foo);');
		});
	});
});

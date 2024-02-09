/* eslint-disable no-undef */

import { Badge } from '../../../../src/modules/commons/components/badge/Badge.js';
import { TestUtils } from '../../../test-utils.js';
window.customElements.define(Badge.tag, Badge);

describe('Button', () => {
	beforeEach(async () => {
		TestUtils.setupStoreAndDi({});
	});

	describe('when initialized', () => {
		it('contains default values in the model', async () => {
			const element = await TestUtils.render(Badge.tag);

			//model
			expect(element.label).toBe('label');
			expect(element.icon).toBeNull;
			expect(element.color).toBe('var(--text3)');
			expect(element.background).toBe('var(--secondary-color)');
		});

		it('renders the view', async () => {
			const element = await TestUtils.render(Badge.tag);

			//view
			const badge = element.shadowRoot.querySelector('.badge');
			expect(badge.children.length).toBe(1);
			expect(element.shadowRoot.styleSheets.length).toBe(2);
			const text = element.shadowRoot.querySelector('.text');
			expect(text.innerText).toBe('label');
		});
	});
});

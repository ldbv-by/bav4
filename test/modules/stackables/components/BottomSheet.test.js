import { BottomSheet } from '../../../../src/modules/stackables/components/BottomSheet';

import { TestUtils } from '../../../test-utils';

import { html } from 'lit-html';

import { TEST_ID_ATTRIBUTE_NAME } from '../../../../src/utils/markup';

window.customElements.define(BottomSheet.tag, BottomSheet);

describe('BottomSheet', () => {

	describe('when BottomSheet is rendered', () => {

		const setup = async (content) => {
			TestUtils.setupStoreAndDi({}, {});

			const element = await TestUtils.render(BottomSheet.tag);
			element.content = content;
			return element;
		};

		it('displays the bottom sheet content', async () => {
			const element = await setup('FooBar');
			const contentElement = element.shadowRoot.querySelector('.bottom-sheet');

			expect(contentElement.innerText).toContain('FooBar');
			expect(element.shadowRoot.querySelectorAll(`[${TEST_ID_ATTRIBUTE_NAME}]`)).toHaveSize(1);
		});

		it('displays the bottom sheet content from a lit-html template-result', async () => {
			const template = (str) => html`${str}`;

			const element = await setup(template('FooBarBaz'));
			const contentElement = element.shadowRoot.querySelector('.bottom-sheet');

			expect(contentElement.innerText).toMatch(/FooBarBaz[\r\n]?/);
		});
	});
});

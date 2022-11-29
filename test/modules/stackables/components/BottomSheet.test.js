import { BottomSheet } from '../../../../src/modules/stackables/components/BottomSheet';

import { TestUtils } from '../../../test-utils';

import { html } from 'lit-html';

import { TEST_ID_ATTRIBUTE_NAME } from '../../../../src/utils/markup';

window.customElements.define(BottomSheet.tag, BottomSheet);

describe('BottomSheet', () => {

	const setup = async (content) => {
		TestUtils.setupStoreAndDi({});

		const element = await TestUtils.render(BottomSheet.tag);
		element.content = content;
		return element;
	};

	describe('constructor', () => {
		TestUtils.setupStoreAndDi({});
		it('sets a default model', async () => {
			const element = new BottomSheet();

			expect(element.getModel()).toEqual({
				content: null
			});
		});
	});

	describe('when initialized', () => {

		it('renders nothing when no data available', async () => {
			const element = await setup();

			expect(element.shadowRoot.children.length).toBe(0);
		});
	});

	describe('when BottomSheet is rendered', () => {

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

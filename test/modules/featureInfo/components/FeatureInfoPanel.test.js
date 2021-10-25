/* eslint-disable no-undef */
import { TestUtils } from '../../../test-utils.js';
import { $injector } from '../../../../src/injection';
import { FeatureInfoPanel } from '../../../../src/modules/featureInfo/components/FeatureInfoPanel';
import { featureInfoReducer } from '../../../../src/store/featureInfo/featureInfo.reducer';
import { AbstractMvuContentPanel } from '../../../../src/modules/menu/components/mainMenu/content/AbstractMvuContentPanel.js';
import { html } from 'lit-html';
import { addFeatureInfoItems } from '../../../../src/store/featureInfo/featureInfo.action.js';

window.customElements.define(FeatureInfoPanel.tag, FeatureInfoPanel);



describe('FeatureInfoPanel', () => {

	let store;

	const setup = (state) => {

		store = TestUtils.setupStoreAndDi(state, { featureInfo: featureInfoReducer });
		$injector
			.registerSingleton('TranslationService', { translate: (key) => key });
		return TestUtils.render(FeatureInfoPanel.tag);
	};

	describe('class', () => {

		it('inherits from AbstractContentPanel', async () => {

			const element = await setup();

			expect(element instanceof AbstractMvuContentPanel).toBeTrue();
		});
	});

	describe('when initialized', () => {

		describe('and no featureInfo items are available', () => {

			it('renders a close icon-button, a container and no items', async () => {

				const element = await setup();
				const button = element.shadowRoot.querySelector('ba-icon');
				const container = element.shadowRoot.querySelectorAll('.container');
				const items = element.shadowRoot.querySelectorAll('.ba-section');

				expect(button.title).toBe('featureInfo_close_button');
				expect(container).toHaveSize(1);
				expect(items).toHaveSize(0);
			});
		});

		describe('and featureInfo items are available', () => {

			it('renders a close icon-button, a container and no items', async () => {

				const element = await setup({
					featureInfo: {
						//content may be a String or a TempateResult
						current: [{ title: 'title0', content: 'content0' }, { title: 'title1', content: html`content1` }]
					}
				});
				const button = element.shadowRoot.querySelector('ba-icon');
				const container = element.shadowRoot.querySelectorAll('.container');
				const items = element.shadowRoot.querySelectorAll('.ba-section');
				const header = element.shadowRoot.querySelector('.ba-list-item__main-text');

				expect(button.title).toBe('featureInfo_close_button');
				expect(container).toHaveSize(1);
				expect(items).toHaveSize(2);
				expect(items.item(0).querySelector('.ba-list-item__text').innerText).toBe('title0');
				expect(items.item(0).querySelector('.collapse-content').innerText).toBe('content0');
				expect(items.item(1).querySelector('.ba-list-item__text').innerText).toBe('title1');
				expect(items.item(1).querySelector('.collapse-content').innerText).toBe('content1');
				expect(header.innerText).toBe('featureInfo_header');
			});
		});
	});

	describe('when initialized', () => {

		describe('and no featureInfo items are available', () => {

			it('renders a close icon-button, a container and no items', async () => {

				const element = await setup();
				const button = element.shadowRoot.querySelector('ba-icon');
				const container = element.shadowRoot.querySelectorAll('.container');
				const items = element.shadowRoot.querySelectorAll('.ba-section');

				expect(button.title).toBe('featureInfo_close_button');
				expect(container).toHaveSize(1);
				expect(items).toHaveSize(0);
			});
		});

		describe('and featureInfo items are available', () => {

			it('renders a close icon-button, a container and no items', async () => {

				const element = await setup({
					featureInfo: {
						current: [{ title: 'title0', content: 'content0' }, { title: 'title1', content: html`content1` }]
					}
				});
				const button = element.shadowRoot.querySelector('ba-icon');
				const container = element.shadowRoot.querySelectorAll('.container');
				const items = element.shadowRoot.querySelectorAll('.ba-section');

				expect(button.title).toBe('featureInfo_close_button');
				expect(container).toHaveSize(1);
				expect(items).toHaveSize(2);
			});
		});
	});

	describe('when featureInfo items are added', () => {

		it('renders renders the items', async () => {

			const element = await setup();

			addFeatureInfoItems({ title: 'title0', content: 'content0' });
			addFeatureInfoItems({ title: 'title1', content: 'content1' });

			const items = element.shadowRoot.querySelectorAll('.ba-section');
			expect(items).toHaveSize(2);
		});
	});

	describe('when clear button clicked', () => {

		it('clear the featureInfo in store', async () => {

			const element = await setup({
				featureInfo: {
					current: [{ title: 'title0', content: 'content0' }, { title: 'title1', content: html`content1` }]
				}
			});
			const iconButton = element.shadowRoot.querySelector('ba-icon');

			iconButton.click();

			expect(store.getState().featureInfo.current).toEqual([]);
		});
	});
});

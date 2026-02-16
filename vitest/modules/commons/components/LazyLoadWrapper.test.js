import { html } from 'lit-html';
import { $injector } from '@src/injection';
import { LazyLoadWrapper } from '@src/modules/commons/components/lazy/LazyLoadWrapper';
import { TestUtils } from '@test/test-utils.js';
window.customElements.define(LazyLoadWrapper.tag, LazyLoadWrapper);

describe('LazyLoadWrapper', () => {
	const setup = async (properties = {}) => {
		TestUtils.setupStoreAndDi({});
		$injector.registerSingleton('TranslationService', { translate: (key) => key });
		return TestUtils.render(LazyLoadWrapper.tag, properties);
	};

	describe('when instantiated', () => {
		it('has a model containing default values', async () => {
			await setup();
			const element = new LazyLoadWrapper();

			expect(element.getModel().loaded).toBe(false);
		});
	});

	describe('when initialized', () => {
		it('displays a loading hint', async () => {
			const element = await setup();

			expect(element.shadowRoot.querySelectorAll('ba-spinner')).toHaveLength(1);
			expect(element.shadowRoot.querySelectorAll('.content')).toHaveLength(0);
		});

		it('displays the content after the chunk was loaded', async () => {
			const element = await setup({ chunkName: 'mockChunk', content: html`<div class="content"></div>` });

			await vi.dynamicImportSettled(); // Waits for dynamic imports to complete

			expect(element.shadowRoot.querySelectorAll('ba-spinner')).toHaveLength(0);
			expect(element.shadowRoot.querySelectorAll('.content')).toHaveLength(1);
		});
	});
});

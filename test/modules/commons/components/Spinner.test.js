import { $injector } from '../../../../src/injection';
import { Spinner } from '../../../../src/modules/commons/components/spinner/Spinner';
import { TestUtils } from '../../../test-utils.js';
window.customElements.define(Spinner.tag, Spinner);


describe('Spinner', () => {

	beforeEach(async () => {
		TestUtils.setupStoreAndDi({});
		$injector
			.registerSingleton('TranslationService', { translate: (key) => key });
	});

	describe('when initialized', () => {

		it('contains default values in the model', async () => {

			const element = await TestUtils.render(Spinner.tag);

			//model
			expect(element.label).toBeNull();
		});

		it('renders the view', async () => {

			const element = await TestUtils.render(Spinner.tag);

			expect(element.shadowRoot.querySelector('.loading').innerText).toBe('spinner_text');
		});
	});

	describe('when property\'label\' changes', () => {

		it('updates the view', async () => {

			const element = await TestUtils.render(Spinner.tag);
			const label = element.shadowRoot.querySelector('.loading');

			expect(label.innerText).toBe('spinner_text');

			element.label = 'foo';

			expect(label.innerText).toBe('foo');
		});
	});
});

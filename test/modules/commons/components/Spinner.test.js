import { $injector } from '../../../../src/injection';
import { Spinner } from '../../../../src/modules/commons/components/spinner/Spinner';
import { TEST_ID_ATTRIBUTE_NAME } from '../../../../src/utils/markup';
import { TestUtils } from '../../../test-utils.js';
window.customElements.define(Spinner.tag, Spinner);

describe('Spinner', () => {
	beforeEach(async () => {
		TestUtils.setupStoreAndDi({});
		$injector.registerSingleton('TranslationService', { translate: (key) => key });
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

		it('automatically appends the "data-test-id" attribute', async () => {
			expect((await TestUtils.render(Spinner.tag)).getAttribute(TEST_ID_ATTRIBUTE_NAME)).toBe('');
		});
	});

	describe("when property'label' changes", () => {
		it('updates the view', async () => {
			const element = await TestUtils.render(Spinner.tag);
			const label = element.shadowRoot.querySelector('.loading');

			expect(label.innerText).toBe('spinner_text');

			element.label = 'foo';

			expect(label.innerText).toBe('foo');
		});
	});
});

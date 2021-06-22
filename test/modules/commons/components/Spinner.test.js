import { Spinner } from '../../../../src/modules/commons/components/spinner/Spinner';
import { TestUtils } from '../../../test-utils.js';
window.customElements.define(Spinner.tag, Spinner);


describe('Spinner', () => {

	beforeEach(async () => {
		TestUtils.setupStoreAndDi({});
	});

	describe('when initializeds', () => {

		it('renders the view', async () => {

			const element = await TestUtils.render(Spinner.tag);

			expect(element.shadowRoot.querySelector('span').innerText).toBe('Loading...');
		});
	});
});
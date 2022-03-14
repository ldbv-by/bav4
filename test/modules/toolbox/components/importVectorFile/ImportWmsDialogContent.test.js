import { $injector } from '../../../../../src/injection';
import { ImportWmsDialogContent } from '../../../../../src/modules/toolbox/components/importVectorFile/ImportWmsDialogContent';
import { TestUtils } from '../../../../test-utils';

window.customElements.define(ImportWmsDialogContent.tag, ImportWmsDialogContent);

const setup = (state) => {
	TestUtils.setupStoreAndDi(state, { });

	$injector.registerSingleton('TranslationService', { translate: (key) => key });

	return TestUtils.render(ImportWmsDialogContent.tag);
};

describe('ImportWmsDialogContent', () => {

	it('renders the component', async () => {
		const element = await setup();
		const textarea = element.shadowRoot.querySelectorAll('textarea');

		expect(textarea).toHaveSize(1);
	});

	it('should render the first element of the layers urls sorted ascending', async () => {
		const element = await setup();

		const li1 = element.shadowRoot.querySelector('li');

		expect(li1.innerText).toBe('topic 1');

	});

	it('should render the first element of the layers urls sorted descending', async () => {
		const element = await setup();

		const layerButton = element.shadowRoot.querySelector('#layer-button');

		layerButton.click();

		const li1 = element.shadowRoot.querySelector('li');

		expect(li1.innerText).toBe('topic 4');

	});

	it('should render the first element of the layers urls in the description area', async () => {
		const element = await setup();

		const li1 = element.shadowRoot.querySelector('li');

		li1.dispatchEvent(new MouseEvent('mouseover'));

		const descriptionArea = element.shadowRoot.querySelector('#descriptionArea');

		expect(descriptionArea.textContent).toBe('this is topic 1 xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx');
	});

});

import { AbstractMvuContentPanel } from '../../../../../../../src/modules/menu/components/mainMenu/content/AbstractMvuContentPanel';
import { MoreContentPanel } from '../../../../../../../src/modules/menu/components/mainMenu/content/more/MoreContentPanel';
import { ThemeToggle } from '../../../../../../../src/modules/uiTheme/components/toggle/ThemeToggle';
import { TestUtils } from '../../../../../../test-utils';

window.customElements.define(MoreContentPanel.tag, MoreContentPanel);

describe('MoreContentPanel', () => {

	const setup = () => {
		TestUtils.setupStoreAndDi();
		return TestUtils.render(MoreContentPanel.tag);
	};

	describe('class', () => {

		it('inherits from AbstractContentPanel', async () => {

			const element = await setup();

			expect(element instanceof AbstractMvuContentPanel).toBeTrue();
		});
	});

	describe('when initialized', () => {

		it('renders the view', async () => {
			const element = await setup();

			expect(element.shadowRoot.querySelectorAll(ThemeToggle.tag)).toHaveSize(1);
		});

		it('checks the list ', async () => {
			const element = await setup();

			expect(element.shadowRoot.querySelectorAll('ul')).toHaveSize(1);
			expect(element.shadowRoot.querySelectorAll('li').length).toBe(9);
		});
	});
});

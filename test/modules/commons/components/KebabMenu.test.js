import { KebabMenu } from '../../../../src/modules/commons/components/kebabMenu/KebabMenu';
import { TestUtils } from '../../../test-utils';
window.customElements.define(KebabMenu.tag, KebabMenu);
describe('KebabMenu', () => {

	beforeEach(async () => {
		TestUtils.setupStoreAndDi({});
	});

	describe('when initialized', () => {
		it('contains default values in the model', async () => {

			const element = await TestUtils.render(KebabMenu.tag);

			expect(element.getModel()).toEqual({ menuItems: [], isCollapsed: true, anchorPosition: null });

		});

		it('renders the view', async () => {

			const element = await TestUtils.render(KebabMenu.tag);

			const anchorElements = element.shadowRoot.querySelectorAll('.anchor');
			expect(anchorElements).toHaveSize(1);
			const menu = element.shadowRoot.querySelector('.menu__container');
			expect(menu.classList.contains('iscollapsed')).toBeTrue();
		});
	});

	describe('when button is clicked', () => {

		it('opens menu with the menu-items', async () => {

			const element = await TestUtils.render(KebabMenu.tag);
			element.items = [{ label: 'item 1', action: () => {} }, { label: 'Item 2', action: () => {} }, { label: 'item 3', action: () => {} }];
			const button = element.shadowRoot.querySelector('.kebabmenu__button');

			button.click();

			expect(element.shadowRoot.querySelectorAll('.menuitem')).toHaveSize(3);
		});
	});
});

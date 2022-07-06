import { $injector } from '../../../../src/injection';
import { KebabMenu } from '../../../../src/modules/commons/components/kebabMenu/KebabMenu';
import { notificationReducer } from '../../../../src/store/notifications/notifications.reducer';
import { isTemplateResult } from '../../../../src/utils/checks';
import { TestUtils } from '../../../test-utils';
window.customElements.define(KebabMenu.tag, KebabMenu);

describe('KebabMenu', () => {
	let store;
	const environmentService = {
		isTouch: () => false
	};

	beforeEach(async () => {
		store = TestUtils.setupStoreAndDi({}, { notifications: notificationReducer });
		$injector
			.registerSingleton('EnvironmentService', environmentService);
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
			expect(element.shadowRoot.querySelector('.menu__container')).toBeNull();
		});

		it('calculates the sector', async () => {
			const element = await TestUtils.render(KebabMenu.tag);
			spyOnProperty(window, 'innerWidth').and.returnValue(100);
			spyOnProperty(window, 'innerHeight').and.returnValue(100);

			expect(element._calculateSector([20, 20])).toBe(0);
			expect(element._calculateSector([80, 20])).toBe(1);
			expect(element._calculateSector([80, 80])).toBe(2);
			expect(element._calculateSector([20, 80])).toBe(3);
		});
	});

	describe('when button is clicked', () => {

		const menuItems = [
			{ label: 'item 1', action: () => { } },
			{ label: 'Item 2', action: () => { } },
			{ label: 'item 3', action: () => { } }];

		it('opens menu with the menu-items', async () => {
			const element = await TestUtils.render(KebabMenu.tag);
			element.items = menuItems;
			const button = element.shadowRoot.querySelector('.kebabmenu__button');

			button.click();

			expect(element.shadowRoot.querySelectorAll('.menuitem')).toHaveSize(3);
		});

		it('opens menu with clickable menu-items', async () => {
			const element = await TestUtils.render(KebabMenu.tag);
			const actionSpy1 = jasmine.createSpy('action1');
			const actionSpy2 = jasmine.createSpy('action2');
			const actionSpy3 = jasmine.createSpy('action3');
			element.items = [
				{ label: 'item 1', action: actionSpy1 },
				{ label: 'Item 2', action: actionSpy2 },
				{ label: 'item 3', action: actionSpy3 }];
			const button = element.shadowRoot.querySelector('.kebabmenu__button');

			button.click();
			const menuItems = element.shadowRoot.querySelectorAll('.menuitem');
			menuItems.forEach(item => item.dispatchEvent(new Event('pointerdown')));

			expect(actionSpy1).toHaveBeenCalled();
			expect(actionSpy2).toHaveBeenCalled();
			expect(actionSpy3).toHaveBeenCalled();
		});

		describe('creates menu for sector', () => {
			const model = {
				menuItems: menuItems,
				isCollapsed: false,
				anchorPosition: { absolute: [50, 50], relative: [10, 10] }
			};

			it('0 (default)', async () => {
				const element = await TestUtils.render(KebabMenu.tag);
				const button = element.shadowRoot.querySelector('.kebabmenu__button');

				button.click();
				element.signal('update_last_anchor_position', null);
				const menuContainer = element.shadowRoot.querySelector('.menu__container');

				expect(menuContainer.classList.contains('sector0')).toBeTrue();
			});

			it('0', async () => {
				const element = await TestUtils.render(KebabMenu.tag);
				spyOn(element, '_calculateSector').and.returnValue(0);

				const button = element.shadowRoot.querySelector('.kebabmenu__button');

				button.click();
				const menuContainer = element.shadowRoot.querySelector('.menu__container');

				expect(menuContainer.classList.contains('sector0')).toBeTrue();
			});

			it('1', async () => {
				const element = await TestUtils.render(KebabMenu.tag);
				spyOn(element, '_calculateSector').and.returnValue(1);

				const button = element.shadowRoot.querySelector('.kebabmenu__button');

				button.click();
				const menuContainer = element.shadowRoot.querySelector('.menu__container');

				expect(menuContainer.classList.contains('sector1')).toBeTrue();
			});

			it('2', async () => {
				const element = await TestUtils.render(KebabMenu.tag);
				spyOn(element, '_calculateSector').and.returnValue(2);

				const button = element.shadowRoot.querySelector('.kebabmenu__button');

				button.click();
				const menuContainer = element.shadowRoot.querySelector('.menu__container');

				expect(menuContainer.classList.contains('sector2')).toBeTrue();
			});

			it('3', async () => {
				const element = await TestUtils.render(KebabMenu.tag);
				spyOn(element, '_calculateSector').and.returnValue(3);

				const button = element.shadowRoot.querySelector('.kebabmenu__button');

				button.click();
				const menuContainer = element.shadowRoot.querySelector('.menu__container');

				expect(menuContainer.classList.contains('sector3')).toBeTrue();
			});
		});

		it('close the menu on any click on the screen', async () => {
			const element = await TestUtils.render(KebabMenu.tag);
			element.items = menuItems;
			const button = element.shadowRoot.querySelector('.kebabmenu__button');

			button.click();

			// menu is open
			expect(element.shadowRoot.querySelectorAll('.menuitem')).toHaveSize(3);

			document.dispatchEvent(new Event('pointerup'));

			// menu is closed
			expect(element.shadowRoot.querySelectorAll('.menuitem')).toHaveSize(0);
		});

		it('close the menu on any touch on the screen', async () => {
			spyOn(environmentService, 'isTouch').and.returnValue(true);
			const element = await TestUtils.render(KebabMenu.tag);
			element.items = menuItems;
			const button = element.shadowRoot.querySelector('.kebabmenu__button');

			button.click();

			// menu is open
			expect(isTemplateResult(store.getState().notifications.latest.payload));

			document.dispatchEvent(new Event('pointerup'));

			// menu is closed
			expect(store.getState().notifications.latest.payload).toEqual({ content: null });
		});
	});
});

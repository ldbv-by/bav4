import { $injector } from '../../../../src/injection';
import { OverflowMenu, MenuTypes } from '../../../../src/modules/commons/components/overflowMenu/OverflowMenu';
import { notificationReducer } from '../../../../src/store/notifications/notifications.reducer';
import { isTemplateResult } from '../../../../src/utils/checks';
import { TestUtils } from '../../../test-utils';
window.customElements.define(OverflowMenu.tag, OverflowMenu);

describe('OverflowMenu', () => {
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

			const element = await TestUtils.render(OverflowMenu.tag);

			expect(element.getModel()).toEqual({ type: MenuTypes.MEATBALL, menuItems: [], isCollapsed: true, anchorPosition: null });

		});

		it('renders the view', async () => {

			const element = await TestUtils.render(OverflowMenu.tag);

			const anchorElements = element.shadowRoot.querySelectorAll('.anchor');
			expect(anchorElements).toHaveSize(1);
			expect(element.shadowRoot.querySelector('.menu__container')).toBeNull();
		});

		it('calculates the sector', async () => {
			const element = await TestUtils.render(OverflowMenu.tag);
			spyOnProperty(window, 'innerWidth').and.returnValue(100);
			spyOnProperty(window, 'innerHeight').and.returnValue(100);

			expect(element._calculateSector([20, 20])).toBe(0);
			expect(element._calculateSector([80, 20])).toBe(1);
			expect(element._calculateSector([80, 80])).toBe(2);
			expect(element._calculateSector([20, 80])).toBe(3);
		});

		it('updates menu type to kebab', async () => {
			const element = await TestUtils.render(OverflowMenu.tag);
			const spy = spyOn(element, 'signal').withArgs('update_menu_type', 'kebab').and.callThrough();

			element.type = 'kebab';

			expect(spy).toHaveBeenCalled();
		});

		it('updates menu type to meatball', async () => {
			const element = await TestUtils.render(OverflowMenu.tag);
			const spy = spyOn(element, 'signal').withArgs('update_menu_type', 'meatball').and.callThrough();

			element.type = 'meatball';

			expect(spy).toHaveBeenCalled();
		});

		it('does NOT updates menu type to invalid type name', async () => {
			const element = await TestUtils.render(OverflowMenu.tag);
			const spy = spyOn(element, 'signal').withArgs('update_menu_type', 'foo').and.callThrough();

			element.type = 'foo';

			expect(spy).not.toHaveBeenCalled();
		});
	});

	describe('when button is clicked', () => {

		const menuItems = [
			{ label: 'item 1', action: () => { } },
			{ label: 'Item 2', action: () => { } },
			{ label: 'item 3', action: () => { } }];

		it('opens menu with the menu-items', async () => {
			const element = await TestUtils.render(OverflowMenu.tag);
			element.items = menuItems;
			const button = element.shadowRoot.querySelector('.menu__button');

			button.click();

			expect(element.shadowRoot.querySelectorAll('.menuitem')).toHaveSize(3);
		});

		it('opens menu with clickable menu-items', async () => {
			const element = await TestUtils.render(OverflowMenu.tag);
			const actionSpy1 = jasmine.createSpy('action1');
			const actionSpy2 = jasmine.createSpy('action2');
			const actionSpy3 = jasmine.createSpy('action3');
			element.items = [
				{ label: 'item 1', action: actionSpy1 },
				{ label: 'Item 2', action: actionSpy2 },
				{ label: 'item 3', action: actionSpy3 }];
			const button = element.shadowRoot.querySelector('.menu__button');

			button.click();
			const menuItems = element.shadowRoot.querySelectorAll('.menuitem');
			menuItems.forEach(item => item.dispatchEvent(new Event('pointerdown')));

			expect(actionSpy1).toHaveBeenCalled();
			expect(actionSpy2).toHaveBeenCalled();
			expect(actionSpy3).toHaveBeenCalled();
		});

		describe('creates menu for sector', () => {

			it('0 (default)', async () => {
				const element = await TestUtils.render(OverflowMenu.tag);
				const button = element.shadowRoot.querySelector('.menu__button');

				button.click();
				element.signal('update_last_anchor_position', null);
				const menuContainer = element.shadowRoot.querySelector('.menu__container');

				expect(menuContainer.classList.contains('sector0')).toBeTrue();
			});

			it('0', async () => {
				const element = await TestUtils.render(OverflowMenu.tag);
				spyOn(element, '_calculateSector').and.returnValue(0);

				const button = element.shadowRoot.querySelector('.menu__button');

				button.click();
				const menuContainer = element.shadowRoot.querySelector('.menu__container');

				expect(menuContainer.classList.contains('sector0')).toBeTrue();
			});

			it('1', async () => {
				const element = await TestUtils.render(OverflowMenu.tag);
				spyOn(element, '_calculateSector').and.returnValue(1);

				const button = element.shadowRoot.querySelector('.menu__button');

				button.click();
				const menuContainer = element.shadowRoot.querySelector('.menu__container');

				expect(menuContainer.classList.contains('sector1')).toBeTrue();
			});

			it('2', async () => {
				const element = await TestUtils.render(OverflowMenu.tag);
				spyOn(element, '_calculateSector').and.returnValue(2);

				const button = element.shadowRoot.querySelector('.menu__button');

				button.click();
				const menuContainer = element.shadowRoot.querySelector('.menu__container');

				expect(menuContainer.classList.contains('sector2')).toBeTrue();
			});

			it('3', async () => {
				const element = await TestUtils.render(OverflowMenu.tag);
				spyOn(element, '_calculateSector').and.returnValue(3);

				const button = element.shadowRoot.querySelector('.menu__button');

				button.click();
				const menuContainer = element.shadowRoot.querySelector('.menu__container');

				expect(menuContainer.classList.contains('sector3')).toBeTrue();
			});
		});

		it('close the menu on any click on the screen', async () => {
			const element = await TestUtils.render(OverflowMenu.tag);
			element.items = menuItems;
			const button = element.shadowRoot.querySelector('.menu__button');

			button.click();

			// menu is open
			expect(element.shadowRoot.querySelectorAll('.menuitem')).toHaveSize(3);

			document.dispatchEvent(new Event('pointerup'));

			// menu is closed
			expect(element.shadowRoot.querySelectorAll('.menuitem')).toHaveSize(0);
		});

		it('close the menu on any touch on the screen', async () => {
			spyOn(environmentService, 'isTouch').and.returnValue(true);
			const element = await TestUtils.render(OverflowMenu.tag);
			element.items = menuItems;
			const button = element.shadowRoot.querySelector('.menu__button');

			button.click();

			// menu is open
			expect(isTemplateResult(store.getState().notifications.latest.payload));

			document.dispatchEvent(new Event('pointerup'));

			// menu is closed
			expect(store.getState().notifications.latest.payload).toEqual({ content: null });
		});
	});
});

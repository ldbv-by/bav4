import { $injector } from '../../../../src/injection';
import { OverflowMenu, MenuTypes } from '../../../../src/modules/commons/components/overflowMenu/OverflowMenu';
import { notificationReducer } from '../../../../src/store/notifications/notifications.reducer';
import { isTemplateResult } from '../../../../src/utils/checks';
import { TEST_ID_ATTRIBUTE_NAME } from '../../../../src/utils/markup';
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
			expect(element.shadowRoot.querySelector('.menu__container').classList.contains('collapsed')).toBeTrue();
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

			element.type = MenuTypes.KEBAB;

			expect(spy).toHaveBeenCalled();
		});

		it('updates menu type to meatball', async () => {
			const element = await TestUtils.render(OverflowMenu.tag);
			const spy = spyOn(element, 'signal').withArgs('update_menu_type', 'meatball').and.callThrough();

			element.type = MenuTypes.MEATBALL;

			expect(spy).toHaveBeenCalled();
		});
	});

	describe('when button is clicked', () => {

		const menuItems = [
			{ label: 'Item 1', action: () => { } },
			{ label: 'Item 2', action: () => { } },
			{ label: 'Item 3', action: () => { } }];

		it('opens menu with the menu-items', async () => {
			const element = await TestUtils.render(OverflowMenu.tag);
			element.items = menuItems;
			const button = element.shadowRoot.querySelector('.menu__button');

			button.click();

			expect(element.shadowRoot.querySelectorAll('.menuitem')).toHaveSize(3);
			expect(element.shadowRoot.querySelectorAll(`button[${TEST_ID_ATTRIBUTE_NAME}]`)).toHaveSize(3);
		});

		it('has menu-items with indexed-based ids', async () => {
			const element = await TestUtils.render(OverflowMenu.tag);
			element.items = menuItems;
			const button = element.shadowRoot.querySelector('.menu__button');

			button.click();
			const menuItemElements = element.shadowRoot.querySelectorAll('.menuitem');

			expect(menuItemElements[0].id).toBe('menuitem_0');

			expect(menuItemElements[1].id).toBe('menuitem_1');

			expect(menuItemElements[2].id).toBe('menuitem_2');
		});

		it('has menu-items with custom ids', async () => {
			const element = await TestUtils.render(OverflowMenu.tag);
			element.items = [
				{ id: 'foo', label: 'Item 1', action: () => { } },
				{ id: 'bar', label: 'Item 2', action: () => { } },
				{ id: 'baz', label: 'Item 3', action: () => { } }];
			const button = element.shadowRoot.querySelector('.menu__button');

			button.click();
			const menuItemElements = element.shadowRoot.querySelectorAll('.menuitem');

			expect(menuItemElements[0].id).toBe('menuitem_foo');

			expect(menuItemElements[1].id).toBe('menuitem_bar');

			expect(menuItemElements[2].id).toBe('menuitem_baz');
		});

		it('registers document listeners', async () => {
			const element = await TestUtils.render(OverflowMenu.tag);
			const registerSpy = spyOn(element, '_registerDocumentListener').and.callThrough();

			element.items = menuItems;
			const button = element.shadowRoot.querySelector('.menu__button');

			button.click();

			expect(registerSpy).toHaveBeenCalledWith('pointerdown');
			expect(registerSpy).toHaveBeenCalledWith('pointerup');
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
			menuItems.forEach(item => item.click());

			expect(actionSpy1).toHaveBeenCalled();
			expect(actionSpy2).toHaveBeenCalled();
			expect(actionSpy3).toHaveBeenCalled();
		});

		it('renders menuitems with icons', async () => {
			const icon = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxNiIgaGVpZ2h0PSIxNiIgZmlsbD0iY3VycmVudENvbG9yIiBjbGFzcz0iYmkgYmktYXJyb3ctdXAtY2lyY2xlLWZpbGwiIHZpZXdCb3g9IjAgMCAxNiAxNiI+PCEtLU1JVCBMaWNlbnNlLS0+CiAgPHBhdGggZD0iTTE2IDhBOCA4IDAgMSAwIDAgOGE4IDggMCAwIDAgMTYgMHptLTcuNSAzLjVhLjUuNSAwIDAgMS0xIDBWNS43MDdMNS4zNTQgNy44NTRhLjUuNSAwIDEgMS0uNzA4LS43MDhsMy0zYS41LjUgMCAwIDEgLjcwOCAwbDMgM2EuNS41IDAgMCAxLS43MDguNzA4TDguNSA1LjcwN1YxMS41eiIvPgo8L3N2Zz4=';
			const element = await TestUtils.render(OverflowMenu.tag);
			element.items = [
				{ label: 'item 1', icon: icon },
				{ label: 'Item 2', icon: icon },
				{ label: 'item 3', icon: icon }];

			const button = element.shadowRoot.querySelector('.menu__button');

			button.click();

			//element.shadowRoot.styleSheets[0] --> baElement.css
			//element.shadowRoot.styleSheets[1] --> overflowmenu.css
			//element.shadowRoot.styleSheets[2] --> menuitem.css
			expect(element.shadowRoot.styleSheets[3].cssRules.item(0).cssText).toContain('.menuitem__icon_0 { mask: url("data:image/svg+xml;base64,PHN2ZyB4');
			expect(element.shadowRoot.styleSheets[4].cssRules.item(0).cssText).toContain('.menuitem__icon_1 { mask: url("data:image/svg+xml;base64,PHN2ZyB4');
			expect(element.shadowRoot.styleSheets[5].cssRules.item(0).cssText).toContain('.menuitem__icon_2 { mask: url("data:image/svg+xml;base64,PHN2ZyB4');

		});

		it('closes the open menu and deregisters document listener', async () => {
			const element = await TestUtils.render(OverflowMenu.tag);
			const deregisterSpy = spyOn(element, '_deregisterDocumentListener').and.callThrough();

			element.items = menuItems;
			const button = element.shadowRoot.querySelector('.menu__button');

			button.click();

			// menu is open
			expect(element.shadowRoot.querySelectorAll('.menuitem')).toHaveSize(3);

			button.click();

			// menu is closed
			expect(element.shadowRoot.querySelectorAll('.menuitem')).toHaveSize(0);
			expect(deregisterSpy).toHaveBeenCalledWith('pointerdown');
			expect(deregisterSpy).toHaveBeenCalledWith('pointerup');
		});

		it('does not close the menu by document listener', async () => {
			const element = await TestUtils.render(OverflowMenu.tag);
			element.items = menuItems;
			const button = element.shadowRoot.querySelector('.menu__button');

			button.click();

			// menu is open
			expect(element.shadowRoot.querySelectorAll('.menuitem')).toHaveSize(3);

			const pointerDownEvent = new Event('pointerdown');
			const deregisterSpy = spyOn(element, '_deregisterDocumentListener').and.callThrough();
			spyOn(pointerDownEvent, 'composedPath').and.returnValue([element]);

			document.dispatchEvent(pointerDownEvent);

			expect(deregisterSpy).not.toHaveBeenCalledWith('pointerdown');
			expect(deregisterSpy).not.toHaveBeenCalledWith('pointerup');
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

		it('closes the menu on any click on the screen', async () => {
			const element = await TestUtils.render(OverflowMenu.tag);
			element.items = menuItems;
			const button = element.shadowRoot.querySelector('.menu__button');

			button.click();

			// menu is open
			expect(element.shadowRoot.querySelectorAll('.menuitem')).toHaveSize(3);

			document.dispatchEvent(new Event('pointerdown'));

			// menu is closed
			expect(element.shadowRoot.querySelectorAll('.menuitem')).toHaveSize(0);
		});

		it('closes the menu on any touch on the screen', async () => {
			spyOn(environmentService, 'isTouch').and.returnValue(true);
			const element = await TestUtils.render(OverflowMenu.tag);
			element.items = menuItems;
			const button = element.shadowRoot.querySelector('.menu__button');

			button.click();

			// menu is open
			expect(isTemplateResult(store.getState().notifications.latest.payload));

			document.dispatchEvent(new Event('pointerdown'));

			// menu is closed
			expect(store.getState().notifications.latest.payload).toEqual({ content: null });
		});

		it('deregisters the document listener on pointerdown', async () => {
			const element = await TestUtils.render(OverflowMenu.tag);
			const deregisterSpy = spyOn(element, '_deregisterDocumentListener').withArgs('pointerdown').and.callThrough();
			element.items = menuItems;
			const button = element.shadowRoot.querySelector('.menu__button');

			button.click();

			// menu is open
			expect(element.shadowRoot.querySelectorAll('.menuitem')).toHaveSize(3);

			const menuItemElements = element.shadowRoot.querySelectorAll('.menuitem');
			const menuItemElement = menuItemElements[0];

			// menuitem is clicked/touched
			menuItemElement.dispatchEvent(new Event('pointerdown'));

			expect(deregisterSpy).toHaveBeenCalled();
		});

		it('stops eventPropagation on pointer', async () => {
			const element = await TestUtils.render(OverflowMenu.tag);
			element.items = menuItems;
			const button = element.shadowRoot.querySelector('.menu__button');

			button.click();

			// menu is open
			expect(element.shadowRoot.querySelectorAll('.menuitem')).toHaveSize(3);

			const menuItemElements = element.shadowRoot.querySelectorAll('.menuitem');
			const menuItemElement = menuItemElements[0];
			const event = new Event('pointerup');
			const eventSpy = spyOn(event, 'stopPropagation').and.callThrough();

			// menuitem is clicked/touched
			menuItemElement.dispatchEvent(event);

			expect(eventSpy).toHaveBeenCalled();
		});

	});
});

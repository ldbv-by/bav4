import { StackableContentPanel } from '../../../../src/modules/stackables/components/stackableContentPanel/StackableContentPanel';
import { NotificationItem } from '../../../../src/modules/stackables/components/notificationItem/NotificationItem';
import { notificationReducer } from '../../../../src/store/notifications/notifications.reducer';
import { emitNotification, LevelTypes } from '../../../../src/store/notifications/notifications.action';
import { TestUtils } from '../../../test-utils';
import { $injector } from '../../../../src/injection';
import { pointerReducer } from '../../../../src/store/pointer/pointer.reducer';
import { openBottomSheet } from '../../../../src/store/bottomSheet/bottomSheet.action';
import { bottomSheetReducer } from '../../../../src/store/bottomSheet/bottomSheet.reducer';
import { createNoInitialStateMainMenuReducer } from '../../../../src/store/mainMenu/mainMenu.reducer';
import { createNoInitialStateMediaReducer } from '../../../../src/store/media/media.reducer';
import { navigationRailReducer } from '../../../../src/store/navigationRail/navigationRail.reducer';

window.customElements.define(StackableContentPanel.tag, StackableContentPanel);
window.customElements.define(NotificationItem.tag, NotificationItem);

describe('StackableContentPanel', () => {
	describe('constructor', () => {
		it('sets a default model', async () => {
			TestUtils.setupStoreAndDi();
			const element = new StackableContentPanel();

			expect(element.getModel()).toEqual({
				notifications: [],
				bottomSheet: null,
				autocloseTime: jasmine.any(Number),
				lastNotification: null
			});
		});
	});

	describe('when initialized', () => {
		it('renders nothing when no data available', async () => {
			TestUtils.setupStoreAndDi(
				{ notifications: { notification: null }, bottomSheet: { data: null } },
				{
					notifications: notificationReducer,
					bottomSheet: bottomSheetReducer
				}
			);
			const element = await TestUtils.render(StackableContentPanel.tag);

			expect(element.shadowRoot.children.length).toBe(0);
		});
	});

	describe('when rendered', () => {
		const setup = async (
			state = { notifications: { notification: null }, bottomSheet: { data: null }, mainMenu: { open: false }, media: { portrait: false } }
		) => {
			TestUtils.setupStoreAndDi(state, {
				notifications: notificationReducer,
				pointer: pointerReducer,
				bottomSheet: bottomSheetReducer,
				mainMenu: createNoInitialStateMainMenuReducer(),
				media: createNoInitialStateMediaReducer(),
				navigationRail: navigationRailReducer
			});
			$injector.registerSingleton('TranslationService', { translate: (key) => key });
			const element = await TestUtils.render(StackableContentPanel.tag);

			return element;
		};

		it('adds a NotificationItem, when a notification is emitted', async () => {
			const element = await setup();

			expect(element).toBeTruthy();
			expect(element._model.notifications.length).toBe(0);

			emitNotification('fooBar', LevelTypes.INFO);

			expect(element._model.notifications.length).toBe(1);
			expect(element._model.notifications[0].id).toEqual(jasmine.any(Number));
			expect(element._model.notifications[0].content).toBe('fooBar');
			expect(element._model.notifications[0].level).toBe(LevelTypes.INFO);

			const notificationElement = element.shadowRoot.querySelector('ba-notification-item');
			expect(notificationElement).toBeTruthy();
		});

		it('adds another NotificationItem, when a notification is emitted', async () => {
			const element = await setup();

			expect(element).toBeTruthy();
			expect(element._model.notifications.length).toBe(0);

			emitNotification('fooBar', LevelTypes.INFO);
			emitNotification('fooBar', LevelTypes.INFO);

			expect(element._model.notifications.length).toBe(2);

			const notificationElements = element.shadowRoot.querySelectorAll('ba-notification-item');
			expect(notificationElements.length).toBe(2);
		});

		it('adds a BottomSheet element, when a bottom sheet content is added', async () => {
			const element = await setup();

			expect(element).toBeTruthy();
			expect(element._model.notifications.length).toBe(0);
			expect(element._model.bottomSheet).toBeNull();

			emitNotification('fooBar', LevelTypes.INFO);
			openBottomSheet('fooBar');

			expect(element._model.notifications.length).toBe(1);
			expect(element._model.bottomSheet).toBe('fooBar');

			const notificationElements = element.shadowRoot.querySelectorAll('ba-notification-item');
			const bottomSheetElements = element.shadowRoot.querySelectorAll('ba-bottom-sheet');
			expect(notificationElements).toHaveSize(1);
			expect(bottomSheetElements).toHaveSize(1);
		});

		it('adds and replace a bottomSheet content, when a bottomSheet content changed', async () => {
			const element = await setup();

			expect(element).toBeTruthy();
			expect(element._model.notifications.length).toBe(0);
			expect(element._model.bottomSheet).toBeNull();

			openBottomSheet('fooBar');

			const bottomSheetElements1 = element.shadowRoot.querySelectorAll('ba-bottom-sheet');
			expect(bottomSheetElements1).toHaveSize(1);
			expect(bottomSheetElements1[0].content).toBe('fooBar');
			expect(element.getModel().bottomSheet).toBe('fooBar');

			openBottomSheet('fooBarBaz');

			const bottomSheetElements2 = element.shadowRoot.querySelectorAll('ba-bottom-sheet');
			expect(bottomSheetElements2).toHaveSize(1);
			expect(bottomSheetElements2[0].content).toBe('fooBarBaz');
			expect(element.getModel().bottomSheet).toBe('fooBarBaz');
		});

		it('adds a NotificationItem only once, when panel is rerendered', async () => {
			const element = await setup();

			expect(element).toBeTruthy();
			expect(element._model.notifications.length).toBe(0);

			emitNotification('fooBar', LevelTypes.INFO);

			expect(element._model.notifications.length).toBe(1);

			await element.render();
			await element.render();

			expect(element._model.notifications.length).toBe(1);

			const notificationElements = element.shadowRoot.querySelectorAll('ba-notification-item');
			expect(notificationElements.length).toBe(1);
		});

		it('removes notificationItem, when a notification-item closes', async () => {
			const autocloseTime = 1000;
			const laterThenPanelAutoCloseTime = autocloseTime + 100;
			const element = await setup();
			element.signal('update_autoclose_time', autocloseTime);
			expect(element).toBeTruthy();

			emitNotification('fooBar', LevelTypes.INFO);

			const notificationElement = element.shadowRoot.querySelector('ba-notification-item');
			const notificationItemElement = notificationElement.shadowRoot.querySelector('.notification_item');

			await TestUtils.timeout(laterThenPanelAutoCloseTime);
			notificationItemElement.dispatchEvent(new Event('animationend'));
			await TestUtils.timeout();
			expect(element.shadowRoot.querySelector('ba-notification-item')).toBeFalsy();
		});
	});
});

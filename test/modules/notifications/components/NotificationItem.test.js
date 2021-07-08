import { NotificationItem } from '../../../../src/modules/notifications/components/NotificationItem';
import { LevelTypes, notificationReducer } from '../../../../src/store/notifications/notifications.reducer';
import { TestUtils } from '../../../test-utils';
import { $injector } from '../../../../src/injection';

window.customElements.define(NotificationItem.tag, NotificationItem);

describe('NotificationItem', () => {
	const notificationTemplate = {
		message:null,
		level:LevelTypes.INFO,
		permanent:false,
		id:1234,
		index:0,
		autocloseTime:0
	};

	describe('when notification item is rendered', () => {
		const setup = async (notification) => {
			TestUtils.setupStoreAndDi({}, { notifications: notificationReducer });
			$injector.registerSingleton('TranslationService', {	 translate: (key) => key });
			const  element = await TestUtils.render(NotificationItem.tag);
			element.content =  notification ;
			return element;
		};

		it('displays the notification message', async () => {
			const element = await setup({ ...notificationTemplate, message:'FooBar' });
			const contentElement = element.shadowRoot.querySelector('.notification_content');

			expect(contentElement.innerText).toContain('FooBar');
		});
	});
});
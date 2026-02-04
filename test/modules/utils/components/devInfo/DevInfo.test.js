import { DevInfo } from '../../../../../src/modules/utils/components/devInfo/DevInfo';
import { TestUtils } from '../../../../test-utils';
import { $injector } from '../../../../../src/injection';
import { modalReducer } from '../../../../../src/store/modal/modal.reducer';
import { notificationReducer } from '../../../../../src/store/notifications/notifications.reducer';

window.customElements.define(DevInfo.tag, DevInfo);

describe('DevInfo', () => {
	let store;

	const shareServiceMock = {
		copyToClipboard: async () => {}
	};

	const setup = (config) => {
		const { softwareVersion, softwareInfo, runtimeMode } = config;

		store = TestUtils.setupStoreAndDi({}, { notifications: notificationReducer, modal: modalReducer });
		$injector
			.registerSingleton('TranslationService', { translate: (key) => key })
			.registerSingleton('ShareService', shareServiceMock)
			.registerSingleton('ConfigService', {
				getValue: (key) => {
					switch (key) {
						case 'RUNTIME_MODE':
							return runtimeMode;
						case 'SOFTWARE_INFO':
							return softwareInfo;
						case 'SOFTWARE_VERSION':
							return softwareVersion;
					}
				}
			});
		return TestUtils.render(DevInfo.tag);
	};

	describe('when initialized', () => {
		it('adds dev-info elements and css classes', async () => {
			const element = await setup({ softwareVersion: '1.0', softwareInfo: '42', runtimeMode: 'development' });

			expect(element.shadowRoot.querySelectorAll('.container')).toHaveSize(1);
			expect(element.shadowRoot.querySelectorAll('.build-info>ba-button')).toHaveSize(1);
			expect(element.shadowRoot.querySelectorAll('.build-info>ba-icon.copy-to-clipboard')).toHaveSize(1);
			expect(element.shadowRoot.querySelector('.build-info>ba-button').label).toBe('v1.0 - 42');
			expect(element.shadowRoot.querySelector('.build-info>ba-icon.copy-to-clipboard').title).toBe('defInfo_copy_to_clipboard_title');
		});

		it('adds nothing when SOFTWARE_INFO property is missing', async () => {
			const element = await setup({ softwareVersion: '1.0', softwareInfo: undefined, runtimeMode: 'development' });

			expect(element.shadowRoot.childElementCount).toBe(0);
		});
	});

	describe('when button is clicked', () => {
		it('shows a modal window containing the showcase', async () => {
			const element = await setup({ softwareVersion: '1.0', softwareInfo: '42', runtimeMode: 'development' });

			element.shadowRoot.querySelector('ba-button').click();

			expect(store.getState().modal.data.title).toBe('Showcase');
			//we expect a lit-html TemplateResult as content
			expect(store.getState().modal.data.content.strings[0]).toBe('<ba-showcase></ba-showcase>');
		});

		it('copies build-info to clipboard', async () => {
			const element = await setup({ softwareVersion: '1.0', softwareInfo: '42', runtimeMode: 'development' });
			const clipboardSpy = spyOn(shareServiceMock, 'copyToClipboard');

			element.shadowRoot.querySelector('.build-info>ba-icon.copy-to-clipboard').click();
			await TestUtils.timeout(); // wait for notification

			expect(store.getState().notifications.latest.payload.content).toBe('defInfo_copy_to_clipboard_success');
			expect(clipboardSpy).toHaveBeenCalledOnceWith('v1.0 - 42');
		});

		it('notifies with an error when copy to clipboard fails', async () => {
			const element = await setup({ softwareVersion: '1.0', softwareInfo: '42', runtimeMode: 'development' });
			const consoleSpy = spyOn(console, 'warn');
			spyOn(shareServiceMock, 'copyToClipboard').and.rejectWith();

			element.shadowRoot.querySelector('.build-info>ba-icon.copy-to-clipboard').click();
			await TestUtils.timeout(); // wait for notification

			expect(store.getState().notifications.latest.payload.content).toBe('defInfo_copy_to_clipboard_error');
			expect(consoleSpy).toHaveBeenCalledOnceWith('Clipboard API not available');
		});
	});
});

import { ShareToolDialog } from '../../../../../src/modules/toolbox/components/shareToolContent/ShareToolDialog';
import { TestUtils } from '../../../../test-utils';
import { $injector } from '../../../../../src/injection';

window.customElements.define(ShareToolDialog.tag, ShareToolDialog);

describe('ShareToolDialog', () => {
	let element;

	const windowMock = {
		matchMedia() { },
	};
	const shareServiceMock = {
		copyToClipboard() {
			return Promise.resolve();
		},
	};
	const setup = (state = {}, config = {}) => {

		const { embed = false, isTouch = false } = config;
		TestUtils.setupStoreAndDi(state);
		$injector
			.registerSingleton('EnvironmentService', {
				isEmbedded: () => embed,
				getWindow: () => windowMock,
				isTouch: () => isTouch

			}).registerSingleton('TranslationService', { translate: (key) => key })
			.registerSingleton('ShareService', shareServiceMock);
		return TestUtils.render(ShareToolDialog.tag);
	};

	beforeEach(async () => {
		element = await setup();
		element.shareUrl = 'https://mock.url';		
	});

	it('renders the component', () => {
		expect(element).toBeTruthy;
		expect(element.shadowRoot.querySelector('.share_item .share_copy')).toBeTruthy();
	});

	it('renders the sharedUrl', async () => {
		expect(element.shadowRoot.querySelectorAll('.share_item').length).toBe(1);
	});

	it('copies the url to the clipboard, when click', async (done) => {
		const copySpy = spyOn(shareServiceMock, 'copyToClipboard').and.callFake(() => Promise.resolve());

		const copyButton = element.shadowRoot.querySelector('.share_item .share_copy');

		copyButton.click();

		setTimeout(() => {
			expect(copyButton).toBeTruthy();
			expect(copySpy).toHaveBeenCalledWith('https://mock.url');
			done();
		});
	});

	it('logs a warning when copyToClipboard fails', async (done) => {
		const copySpy = spyOn(shareServiceMock, 'copyToClipboard').and.callFake(() => Promise.reject());
		const warnSpy = spyOn(console, 'warn');

		const copyElement = element.shadowRoot.querySelector('.share_item .share_copy');

		copyElement.click();

		setTimeout(() => {
			expect(copySpy).toHaveBeenCalledWith('https://mock.url');
			expect(warnSpy).toHaveBeenCalledWith('Clipboard API not available');
			done();
		});

	});
}); 
import { ShareMeasureDialog } from '../../../../../src/modules/toolbox/components/measureToolContent/ShareMeasureDialog';
import { TestUtils } from '../../../../test-utils';
import { $injector } from '../../../../../src/injection';

window.customElements.define(ShareMeasureDialog.tag, ShareMeasureDialog);

describe('ShareMeasureDialog', () => {
	const windowMock = {
		matchMedia() { }
	};
	const shareServiceMock = {
		copyToClipboard() {
			return Promise.resolve();
		},
	};
	const setup = (state = {}, config = {}) => {

		const { embed = false, isTouch = false } = config;
		TestUtils.setupStoreAndDi(state, {  });
		$injector
			.registerSingleton('EnvironmentService', {
				isEmbedded: () => embed,
				getWindow: () => windowMock,
				isTouch: () => isTouch

			}).registerSingleton('TranslationService', { translate: (key) => key })
			.registerSingleton('ShareService', shareServiceMock);
		return TestUtils.render(ShareMeasureDialog.tag);
	};

	it('renders the component', async () => {
		const element = await setup();
		element.shareurls = { adminId:'foo', fileid:'bar' };
		expect(element).toBeTruthy;
	});

	it('renders the sharedUrls', async () => {
		const element = await setup();
		element.shareurls = { adminId:'foo', fileid:'bar' };
		

		const shareItems = element.shadowRoot.querySelectorAll('.share_item');
		expect(shareItems.length).toBe(2);
	});

	it('copies the url to the clipboard', async (done) => {
		const copySpy = spyOn(shareServiceMock, 'copyToClipboard').and.callFake(() => Promise.resolve());
        
		const element = await setup();
		element.shareurls = { adminId:'foo', fileid:'foo' };
		const copyElement = element.shadowRoot.querySelector('.share_item .close');
		
		copyElement.click();
		
		setTimeout(() => {
			expect(copyElement).toBeTruthy();
			expect(copySpy).toHaveBeenCalledWith('foo');
			done();
		});

	});

	it('logs a warning when copyToClipboard fails', async (done) => {
		
		const copySpy = spyOn(shareServiceMock, 'copyToClipboard').and.callFake(() => Promise.reject());
		const warnSpy = spyOn(console, 'warn');
		const element = await setup();
		element.shareurls = { adminId:'foo', fileid:'foo' };
		const copyElement = element.shadowRoot.querySelector('.share_item .close');
		
		copyElement.click();

		setTimeout(() => {
			expect(copySpy).toHaveBeenCalledWith('foo');
			expect(warnSpy).toHaveBeenCalledWith('Clipboard API not available');
			done();
		});

	});
});
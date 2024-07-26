import { html } from 'lit-html';
import { $injector } from '../../src/injection';
import { MvuElement } from '../../src/modules/MvuElement';
import { IframeGeometryIdPlugin } from '../../src/plugins/IframeGeometryIdPlugin';
import { IFRAME_GEOMETRY_REFERENCE_ID } from '../../src/utils/markup';
import { TestUtils } from '../test-utils';
import { clear, setLatestStorageResultAndFileId } from '../../src/store/fileStorage/fileStorage.action';
import { fileStorageReducer } from '../../src/store/fileStorage/fileStorage.reducer';

class MvuElementParent extends MvuElement {
	createView() {
		return html` <iframe data-iframe-geometry-reference-id src=""></iframe> `;
	}

	static get tag() {
		return 'mvu-element-parent';
	}
}
window.customElements.define(MvuElementParent.tag, MvuElementParent);

describe('IframeGeometryIdPlugin', () => {
	const environmentService = {
		getWindow: () => {},
		isEmbedded: () => {}
	};

	const mockIframeElement = {
		setAttribute: () => {}
	};

	const setup = () => {
		const store = TestUtils.setupStoreAndDi(
			{},
			{
				fileStorage: fileStorageReducer
			}
		);
		$injector.registerSingleton('EnvironmentService', environmentService);
		return store;
	};

	it('registers fileStorage.fileId listeners and updates the iframes data attribute', async () => {
		const expectedGeometryId = 'foo';
		spyOn(environmentService, 'isEmbedded').and.returnValue(true);
		const store = setup();
		const instanceUnderTest = new IframeGeometryIdPlugin();
		const iframeSpy = spyOn(mockIframeElement, 'setAttribute');
		spyOn(instanceUnderTest, '_findIframe').and.returnValue(mockIframeElement);
		await instanceUnderTest.register(store);

		// drawing created
		setLatestStorageResultAndFileId('content', expectedGeometryId);

		expect(iframeSpy).toHaveBeenCalledWith(IFRAME_GEOMETRY_REFERENCE_ID, expectedGeometryId);

		// drawing deleted
		clear();

		expect(iframeSpy).toHaveBeenCalledWith(IFRAME_GEOMETRY_REFERENCE_ID, '');
	});

	it("does nothing when we are NOT in 'embed' mode", async () => {
		spyOn(environmentService, 'isEmbedded').and.returnValue(false);
		const store = setup();
		const instanceUnderTest = new IframeGeometryIdPlugin();
		const updateAttributeSpy = spyOn(instanceUnderTest, '_updateAttribute');
		await instanceUnderTest.register(store);

		setLatestStorageResultAndFileId('content', 'fileId');

		expect(updateAttributeSpy).not.toHaveBeenCalled();
	});

	describe('_findIframe', () => {
		it('finds an iframe element by the IFRAME_GEOMETRY_REFERENCE_ID attribute', async () => {
			setup();
			await TestUtils.render(MvuElementParent.tag);
			const instanceUnderTest = new IframeGeometryIdPlugin();
			spyOn(instanceUnderTest, '_getDocument').and.returnValue(document);

			expect(instanceUnderTest._findIframe().tagName).toBe('IFRAME');
		});
	});

	describe('_getDocument', () => {
		it('returns the correct document', async () => {
			const mock = {};
			const mockWindow = {
				parent: {
					document: mock
				}
			};
			spyOn(environmentService, 'getWindow').and.returnValue(mockWindow);
			setup();
			const instanceUnderTest = new IframeGeometryIdPlugin();

			expect(instanceUnderTest._getDocument()).toEqual(mock);
		});
	});
});

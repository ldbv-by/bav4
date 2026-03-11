import { html } from 'lit-html';
import { PathParameters } from '@src/domain/pathParameters';
import { $injector } from '@src/injection';
import { MvuElement } from '@src/modules/MvuElement';
import { IframeStatePlugin } from '@src/plugins/IframeStatePlugin';
import { indicateChange } from '@src/store/stateForEncoding/stateForEncoding.action';
import { stateForEncodingReducer } from '@src/store/stateForEncoding/stateForEncoding.reducer';
import { IFRAME_ENCODED_STATE } from '@src/utils/markup';
import { TestUtils } from '@test/test-utils';

class MvuElementParent extends MvuElement {
	createView() {
		return html` <iframe data-iframe-encoded-state src=""></iframe> `;
	}

	static get tag() {
		return 'mvu-element-parent';
	}
}
window.customElements.define(MvuElementParent.tag, MvuElementParent);

describe('IframeStatePlugin', () => {
	const shareService = {
		encodeState() {}
	};
	const environmentService = {
		getWindow: () => {},
		isEmbeddedAsIframe: () => {}
	};

	const mockIframeElement = {
		setAttribute: () => {}
	};

	const setup = () => {
		const store = TestUtils.setupStoreAndDi(
			{},
			{
				stateForEncoding: stateForEncodingReducer
			}
		);
		$injector.registerSingleton('EnvironmentService', environmentService).registerSingleton('ShareService', shareService);
		return store;
	};

	it('registers the stateForEncoding.changed listeners and updates the iframe data attribute', async () => {
		const expectedEncodedState = 'foo';
		vi.spyOn(environmentService, 'isEmbeddedAsIframe').mockReturnValue(true);
		const shareServiceSpy = vi.spyOn(shareService, 'encodeState').mockReturnValue(expectedEncodedState);
		const store = setup();
		const instanceUnderTest = new IframeStatePlugin();
		const iframeSpy = vi.spyOn(mockIframeElement, 'setAttribute').mockImplementation(() => {});
		vi.spyOn(instanceUnderTest, '_findIframe').mockReturnValue(mockIframeElement);
		vi.spyOn(instanceUnderTest, '_hasParentSameOrigin').mockReturnValue(true);
		await instanceUnderTest.register(store);

		indicateChange();

		expect(iframeSpy).toHaveBeenCalledWith(IFRAME_ENCODED_STATE, expectedEncodedState);
		expect(shareServiceSpy).toHaveBeenCalledWith({}, [PathParameters.EMBED]);
	});

	it('does nothing when iframe element is not available', async () => {
		vi.spyOn(environmentService, 'isEmbeddedAsIframe').mockReturnValue(true);
		const store = setup();
		const instanceUnderTest = new IframeStatePlugin();
		vi.spyOn(instanceUnderTest, '_findIframe').mockReturnValue(null);
		vi.spyOn(instanceUnderTest, '_hasParentSameOrigin').mockReturnValue(true);
		const shareServiceSpy = vi.spyOn(shareService, 'encodeState');
		await instanceUnderTest.register(store);

		indicateChange();

		expect(shareServiceSpy).not.toHaveBeenCalled();
	});

	it("does nothing when we are NOT in 'embed' mode", async () => {
		vi.spyOn(environmentService, 'isEmbeddedAsIframe').mockReturnValue(false);
		const store = setup();
		const instanceUnderTest = new IframeStatePlugin();
		const updateAttributeSpy = vi.spyOn(instanceUnderTest, '_updateAttribute').mockImplementation(() => {});
		await instanceUnderTest.register(store);

		indicateChange();

		expect(updateAttributeSpy).not.toHaveBeenCalled();
	});

	it('does nothing when we are NOT same origin', async () => {
		vi.spyOn(environmentService, 'isEmbeddedAsIframe').mockReturnValue(true);
		const store = setup();
		const instanceUnderTest = new IframeStatePlugin();
		const updateAttributeSpy = vi.spyOn(instanceUnderTest, '_updateAttribute').mockImplementation(() => {});
		vi.spyOn(instanceUnderTest, '_findIframe').mockReturnValue(mockIframeElement);
		vi.spyOn(instanceUnderTest, '_hasParentSameOrigin').mockReturnValue(false);
		await instanceUnderTest.register(store);

		indicateChange();

		expect(updateAttributeSpy).not.toHaveBeenCalled();
	});

	describe('_findIframe', () => {
		it('finds an iframe element by the IFRAME_ENCODED_STATE attribute', async () => {
			setup();
			await TestUtils.render(MvuElementParent.tag);
			const instanceUnderTest = new IframeStatePlugin();
			vi.spyOn(instanceUnderTest, '_getDocument').mockReturnValue(document);

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
			vi.spyOn(environmentService, 'getWindow').mockReturnValue(mockWindow);
			setup();
			const instanceUnderTest = new IframeStatePlugin();

			expect(instanceUnderTest._getDocument()).toEqual(mock);
		});
	});

	describe('_hasParentSameOrigin', () => {
		it('returns true if the iframe has the same origin as the parent', async () => {
			setup();
			const instanceUnderTest = new IframeStatePlugin();
			vi.spyOn(instanceUnderTest, '_getDocument').mockReturnValue(document);

			expect(instanceUnderTest._hasParentSameOrigin()).toBe(true);
		});

		it('returns false if the iframe has NOT the same origin as the parent', async () => {
			setup();
			const instanceUnderTest = new IframeStatePlugin();
			vi.spyOn(instanceUnderTest, '_getDocument').mockImplementation(() => {
				throw new Error('');
			});

			expect(instanceUnderTest._hasParentSameOrigin()).toBe(false);
		});
	});
});

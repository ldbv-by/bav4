import { html } from 'lit-html';
import { PathParameters } from '../../src/domain/pathParameters';
import { $injector } from '../../src/injection';
import { MvuElement } from '../../src/modules/MvuElement';
import { IframeStatePlugin } from '../../src/plugins/IframeStatePlugin';
import { indicateChange } from '../../src/store/stateForEncoding/stateForEncoding.action';
import { stateForEncodingReducer } from '../../src/store/stateForEncoding/stateForEncoding.reducer';
import { IFRAME_ENCODED_STATE } from '../../src/utils/markup';
import { TestUtils } from '../test-utils';

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
		isEmbedded: () => {}
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
		spyOn(environmentService, 'isEmbedded').and.returnValue(true);
		const shareServiceSpy = spyOn(shareService, 'encodeState').and.returnValue(expectedEncodedState);
		const store = setup();
		const instanceUnderTest = new IframeStatePlugin();
		const iframeSpy = spyOn(mockIframeElement, 'setAttribute');
		spyOn(instanceUnderTest, '_findIframe').and.returnValue(mockIframeElement);
		spyOn(instanceUnderTest, '_hasParentSameOrigin').and.returnValue(true);
		await instanceUnderTest.register(store);

		indicateChange();

		expect(iframeSpy).toHaveBeenCalledWith(IFRAME_ENCODED_STATE, expectedEncodedState);
		expect(shareServiceSpy).toHaveBeenCalledWith({}, [PathParameters.EMBED]);
	});

	it('does nothing when iframe element is not available', async () => {
		spyOn(environmentService, 'isEmbedded').and.returnValue(true);
		const store = setup();
		const instanceUnderTest = new IframeStatePlugin();
		spyOn(instanceUnderTest, '_findIframe').and.returnValue(null);
		spyOn(instanceUnderTest, '_hasParentSameOrigin').and.returnValue(true);
		const shareServiceSpy = spyOn(shareService, 'encodeState');
		await instanceUnderTest.register(store);

		indicateChange();

		expect(shareServiceSpy).not.toHaveBeenCalled();
	});

	it("does nothing when we are NOT in 'embed' mode", async () => {
		spyOn(environmentService, 'isEmbedded').and.returnValue(false);
		const store = setup();
		const instanceUnderTest = new IframeStatePlugin();
		const updateAttributeSpy = spyOn(instanceUnderTest, '_updateAttribute');
		await instanceUnderTest.register(store);

		indicateChange();

		expect(updateAttributeSpy).not.toHaveBeenCalled();
	});

	it('does nothing when we are NOT same origin', async () => {
		spyOn(environmentService, 'isEmbedded').and.returnValue(true);
		const store = setup();
		const instanceUnderTest = new IframeStatePlugin();
		const updateAttributeSpy = spyOn(instanceUnderTest, '_updateAttribute');
		spyOn(instanceUnderTest, '_findIframe').and.returnValue(mockIframeElement);
		spyOn(instanceUnderTest, '_hasParentSameOrigin').and.returnValue(false);
		await instanceUnderTest.register(store);

		indicateChange();

		expect(updateAttributeSpy).not.toHaveBeenCalled();
	});

	describe('_findIframe', () => {
		it('finds an iframe element by the IFRAME_ENCODED_STATE attribute', async () => {
			setup();
			await TestUtils.render(MvuElementParent.tag);
			const instanceUnderTest = new IframeStatePlugin();
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
			const instanceUnderTest = new IframeStatePlugin();

			expect(instanceUnderTest._getDocument()).toEqual(mock);
		});
	});

	describe('_hasParentSameOrigin', () => {
		it('returns true if the iframe has the same origin as the parent', async () => {
			setup();
			const instanceUnderTest = new IframeStatePlugin();
			spyOn(instanceUnderTest, '_getDocument').and.returnValue(document);

			expect(instanceUnderTest._hasParentSameOrigin()).toBeTrue();
		});

		it('returns false if the iframe has NOT the same origin as the parent', async () => {
			setup();
			const instanceUnderTest = new IframeStatePlugin();
			spyOn(instanceUnderTest, '_getDocument').and.throwError();

			expect(instanceUnderTest._hasParentSameOrigin()).toBeFalse();
		});
	});
});

import { html } from 'lit-html';
import { PathParameters } from '../../src/domain/pathParameters';
import { $injector } from '../../src/injection';
import { MvuElement } from '../../src/modules/MvuElement';
import { IframeStatePlugin } from '../../src/plugins/IframeStatePlugin';
import { addLayer } from '../../src/store/layers/layers.action';
import { layersReducer } from '../../src/store/layers/layers.reducer';
import { changeCenter, changeRotation, increaseZoom } from '../../src/store/position/position.action';
import { positionReducer } from '../../src/store/position/position.reducer';
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

describe('IframeState', () => {
	const shareService = {
		encodeState() {}
	};
	const environmentService = {
		getWindow: () => {},
		isEmbedded: () => {}
	};
	const mapService = {
		getMaxZoomLevel: () => 1,
		getMinZoomLevel: () => 0
	};

	const mockIframeElement = {
		setAttribute: () => {}
	};

	const setup = () => {
		const state = {
			position: {
				zoom: 0,
				pointerPosition: [0, 0],
				rotation: 0
			}
		};

		const store = TestUtils.setupStoreAndDi(state, {
			position: positionReducer,
			layers: layersReducer
		});
		$injector
			.registerSingleton('EnvironmentService', environmentService)
			.registerSingleton('ShareService', shareService)
			.registerSingleton('MapService', mapService);
		return store;
	};

	it('registers postion.zoom change listeners and updates the iframes data attribute', async () => {
		const expectedEncodedState = 'foo';
		spyOn(environmentService, 'isEmbedded').and.returnValue(true);
		const shareServiceSpy = spyOn(shareService, 'encodeState').and.returnValue(expectedEncodedState);
		const store = setup();
		const instanceUnderTest = new IframeStatePlugin();
		const iframeSpy = spyOn(mockIframeElement, 'setAttribute');
		spyOn(instanceUnderTest, '_findIframe').and.returnValue(mockIframeElement);
		await instanceUnderTest.register(store);

		increaseZoom();

		expect(iframeSpy).toHaveBeenCalledWith(IFRAME_ENCODED_STATE, expectedEncodedState);
		expect(shareServiceSpy).toHaveBeenCalledWith({}, [PathParameters.EMBED]);
		await TestUtils.timeout(0);
	});

	it('registers postion.center change listeners and updates the window history state', async () => {
		const expectedEncodedState = 'foo';
		spyOn(environmentService, 'isEmbedded').and.returnValue(true);
		const shareServiceSpy = spyOn(shareService, 'encodeState').and.returnValue(expectedEncodedState);
		const store = setup();
		const instanceUnderTest = new IframeStatePlugin();
		const iframeSpy = spyOn(mockIframeElement, 'setAttribute');
		spyOn(instanceUnderTest, '_findIframe').and.returnValue(mockIframeElement);
		await instanceUnderTest.register(store);

		changeCenter([1, 1]);

		expect(iframeSpy).toHaveBeenCalledWith(IFRAME_ENCODED_STATE, expectedEncodedState);
		expect(shareServiceSpy).toHaveBeenCalledWith({}, [PathParameters.EMBED]);
		await TestUtils.timeout(0);
	});

	it('registers postion.rotation change listeners and updates the window history state', async () => {
		const expectedEncodedState = 'foo';
		spyOn(environmentService, 'isEmbedded').and.returnValue(true);
		const shareServiceSpy = spyOn(shareService, 'encodeState').and.returnValue(expectedEncodedState);
		const store = setup();
		const instanceUnderTest = new IframeStatePlugin();
		const iframeSpy = spyOn(mockIframeElement, 'setAttribute');
		spyOn(instanceUnderTest, '_findIframe').and.returnValue(mockIframeElement);
		await instanceUnderTest.register(store);

		changeRotation(1);

		expect(iframeSpy).toHaveBeenCalledWith(IFRAME_ENCODED_STATE, expectedEncodedState);
		expect(shareServiceSpy).toHaveBeenCalledWith({}, [PathParameters.EMBED]);
		await TestUtils.timeout(0);
	});

	it('registers layers.active change listeners and updates the window history state', async () => {
		const expectedEncodedState = 'foo';
		spyOn(environmentService, 'isEmbedded').and.returnValue(true);
		const shareServiceSpy = spyOn(shareService, 'encodeState').and.returnValue(expectedEncodedState);
		const store = setup();
		const instanceUnderTest = new IframeStatePlugin();
		const iframeSpy = spyOn(mockIframeElement, 'setAttribute');
		spyOn(instanceUnderTest, '_findIframe').and.returnValue(mockIframeElement);
		await instanceUnderTest.register(store);

		addLayer('some');

		expect(iframeSpy).toHaveBeenCalledWith(IFRAME_ENCODED_STATE, expectedEncodedState);
		expect(shareServiceSpy).toHaveBeenCalledWith({}, [PathParameters.EMBED]);
		await TestUtils.timeout(0);
	});

	it('updates the iframes data attribute in an asynchronous manner after plugin registration is done', async () => {
		const expectedEncodedState = 'foo';
		spyOn(environmentService, 'isEmbedded').and.returnValue(true);
		const shareServiceSpy = spyOn(shareService, 'encodeState').and.returnValue(expectedEncodedState);
		const store = setup();
		const instanceUnderTest = new IframeStatePlugin();
		const iframeSpy = spyOn(mockIframeElement, 'setAttribute');
		spyOn(instanceUnderTest, '_findIframe').and.returnValue(mockIframeElement);
		await instanceUnderTest.register(store);

		await TestUtils.timeout(0);
		expect(iframeSpy).toHaveBeenCalledWith(IFRAME_ENCODED_STATE, expectedEncodedState);
		expect(shareServiceSpy).toHaveBeenCalledWith({}, [PathParameters.EMBED]);
		await TestUtils.timeout(0);
	});

	it("does nothing when encoded state has'nt changed", async () => {
		const expectedEncodedState = 'foo';
		spyOn(environmentService, 'isEmbedded').and.returnValue(true);
		const shareServiceSpy = spyOn(shareService, 'encodeState').and.returnValue(expectedEncodedState);
		const store = setup();
		const instanceUnderTest = new IframeStatePlugin();
		const iframeSpy = spyOn(mockIframeElement, 'setAttribute');
		spyOn(instanceUnderTest, '_findIframe').and.returnValue(mockIframeElement);
		await instanceUnderTest.register(store);
		await TestUtils.timeout(0);

		// Let's trigger one observer multiple times
		changeCenter([1, 1]);
		changeCenter([1, 2]);
		changeCenter([1, 3]);
		changeCenter([1, 4]);

		// We always return the same encoded state from the ShareService,
		// so the attribute should be updated only once
		expect(iframeSpy).toHaveBeenCalledOnceWith(IFRAME_ENCODED_STATE, expectedEncodedState);
		expect(shareServiceSpy).toHaveBeenCalledWith({}, [PathParameters.EMBED]);
		await TestUtils.timeout(0);
	});

	it("does nothing when we are NOT in 'embed' mode", async () => {
		spyOn(environmentService, 'isEmbedded').and.returnValue(false);
		const store = setup();
		const instanceUnderTest = new IframeStatePlugin();
		const updateAttributeSpy = spyOn(instanceUnderTest, '_updateAttribute');
		await instanceUnderTest.register(store);

		await TestUtils.timeout(0);
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
});

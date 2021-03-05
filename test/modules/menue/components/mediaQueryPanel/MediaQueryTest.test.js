/* eslint-disable no-undef */

import { MediaQueryPanel } from '../../../../../src/modules/menue/components/mediaQueryPanel/MediaQueryPanel';
import { sidePanelReducer } from '../../../../../src/modules/menue/store/sidePanel.reducer';
import { TestUtils } from '../../../../test-utils';

window.customElements.define(MediaQueryPanel.tag, MediaQueryPanel);


describe('MediaQueryPanel', () => {

	const setup = async (state) => {

		TestUtils.setupStoreAndDi(state, { sidePanel: sidePanelReducer });

		return TestUtils.render(MediaQueryPanel.tag);
	};

	describe('when initialized', () => {
		fit('layouts for landscape', async () => {

			const matchMediaSpy = spyOn(window, 'matchMedia')
				//mock 
				.withArgs('(orientation: portrait)').and.returnValue(TestUtils.newMediaQueryList(false))
				//does not interest in this test
				.withArgs('(min-width: 600px)').and.callThrough();

			const element = await setup();

			expect(element.shadowRoot.querySelector('.landscape')).toBeTruthy();
			expect(element.shadowRoot.querySelector('.content-panel')).toBeTruthy();
			expect(matchMediaSpy).toHaveBeenCalledTimes(2);
		});

		it('layouts for portrait', async () => {

			const matchMediaSpy = spyOn(window, 'matchMedia')
				//mock 
				.withArgs('(orientation: portrait)').and.returnValue(TestUtils.newMediaQueryList(true))
				//does not interest in this test
				.withArgs('(min-width: 600px)').and.callThrough();

			const element = await setup();

			expect(element.shadowRoot.querySelector('.portrait')).toBeTruthy();
			expect(element.shadowRoot.querySelector('.content-panel')).toBeTruthy();
			expect(matchMediaSpy).toHaveBeenCalledTimes(2);
		});

		it('layouts for width < 600px', async () => {

			const matchMediaSpy = spyOn(window, 'matchMedia')
				//does not interest in this test
				.withArgs('(orientation: portrait)').and.callThrough()
				//mock 
				.withArgs('(min-width: 600px)').and.returnValue(TestUtils.newMediaQueryList(false));

			const element = await setup();
			expect(element.shadowRoot.querySelector('.content-panel')).toBeTruthy();
			expect(element.shadowRoot.querySelector('.only-greater-600')).toBeFalsy();
			expect(matchMediaSpy).toHaveBeenCalledTimes(2);
		});

		it('layouts for width >= 600px', async () => {

			const matchMediaSpy = spyOn(window, 'matchMedia')
				//does not interest in this test
				.withArgs('(orientation: portrait)').and.callThrough()
				//mock 
				.withArgs('(min-width: 600px)').and.returnValue(TestUtils.newMediaQueryList(true));

			const element = await setup();
			expect(element.shadowRoot.querySelector('.content-panel')).toBeTruthy();
			expect(element.shadowRoot.querySelector('.only-greater-600')).toBeTruthy();
			expect(matchMediaSpy).toHaveBeenCalledTimes(2);
		});
	});
});
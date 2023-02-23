/* eslint-disable no-undef */

import { $injector } from '../../../../../src/injection';
import { MediaQueryPanel } from '../../../../../src/modules/menu/components/mediaQueryPanel/MediaQueryPanel';
import { createNoInitialStateMainMenuReducer } from '../../../../../src/store/mainMenu/mainMenu.reducer';
import { TestUtils } from '../../../../test-utils';

window.customElements.define(MediaQueryPanel.tag, MediaQueryPanel);

describe('MediaQueryPanel', () => {
	const windowMock = {
		matchMedia() {}
	};

	const setup = async (state) => {
		TestUtils.setupStoreAndDi(state, { mainMenu: createNoInitialStateMainMenuReducer });
		$injector.registerSingleton('EnvironmentService', { getWindow: () => windowMock });

		return TestUtils.render(MediaQueryPanel.tag);
	};

	describe('when initialized', () => {
		it('layouts for landscape and width > 600px', async () => {
			//mock
			const matchMediaSpy = spyOn(windowMock, 'matchMedia')
				.withArgs('(orientation: portrait)')
				.and.returnValue(TestUtils.newMediaQueryList(false))
				.withArgs('(min-width: 600px)')
				.and.returnValue(TestUtils.newMediaQueryList(true));

			const element = await setup();

			expect(element.shadowRoot.querySelector('.is-landscape')).toBeTruthy();
			expect(element.shadowRoot.querySelector('.content-panel')).toBeTruthy();
			expect(matchMediaSpy).toHaveBeenCalledTimes(2);
		});

		it('layouts for portrait and width > 600px', async () => {
			//mock
			const matchMediaSpy = spyOn(windowMock, 'matchMedia')
				.withArgs('(orientation: portrait)')
				.and.returnValue(TestUtils.newMediaQueryList(true))
				.withArgs('(min-width: 600px)')
				.and.returnValue(TestUtils.newMediaQueryList(true));

			const element = await setup();

			expect(element.shadowRoot.querySelector('.is-portrait')).toBeTruthy();
			expect(element.shadowRoot.querySelector('.content-panel')).toBeTruthy();
			expect(matchMediaSpy).toHaveBeenCalledTimes(2);
		});

		it('layouts for width < 600px', async () => {
			const matchMediaSpy = spyOn(windowMock, 'matchMedia')
				.withArgs('(orientation: portrait)')
				.and.returnValue(TestUtils.newMediaQueryList(false))
				.withArgs('(min-width: 600px)')
				.and.returnValue(TestUtils.newMediaQueryList(false));

			const element = await setup();
			expect(element.shadowRoot.querySelector('.content-panel')).toBeTruthy();
			expect(element.shadowRoot.querySelector('.only-greater-600')).toBeFalsy();
			expect(matchMediaSpy).toHaveBeenCalledTimes(2);
		});

		it('layouts for width >= 600px', async () => {
			const matchMediaSpy = spyOn(windowMock, 'matchMedia')
				.withArgs('(orientation: portrait)')
				.and.returnValue(TestUtils.newMediaQueryList(false))
				.withArgs('(min-width: 600px)')
				.and.returnValue(TestUtils.newMediaQueryList(true));

			const element = await setup();
			expect(element.shadowRoot.querySelector('.content-panel')).toBeTruthy();
			expect(element.shadowRoot.querySelector('.only-greater-600')).toBeTruthy();
			expect(matchMediaSpy).toHaveBeenCalledTimes(2);
		});
	});
});

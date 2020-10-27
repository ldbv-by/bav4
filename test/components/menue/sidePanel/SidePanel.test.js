/* eslint-disable no-undef */

import { SidePanel } from '../../../../src/components/menue/sidePanel/SidePanel';
import sidePanelReducer from '../../../../src/components/menue/sidePanel/store/sidePanel.reducer';
import { toggleSidePanel } from '../../../../src/components/menue/sidePanel//store/sidePanel.action';
import { TestUtils } from '../../../test-utils';
import { $injector } from '../../../../src/injection';

window.customElements.define(SidePanel.tag, SidePanel);


describe('SidePanelElement', () => {

	beforeAll(() => {
		window.classUnderTest = SidePanel.name;
	});

	afterAll(() => {
		window.classUnderTest = undefined;
	});

	const setup = async (config) => {

		const { mobile } = config;

		const state = {
			sidePanel: {
				open: true
			}
		};
		TestUtils.setupStoreAndDi(state, { sidePanel: sidePanelReducer });
		$injector.registerSingleton('EnvironmentService', {
			mobile: mobile
		});
		return TestUtils.render(SidePanel.tag);
	};

	describe('when initialized', () => {
		it('adds a div which holds the sidepanel content and a close icon for desktop layout', async () => {

			const element = await setup({ mobile: false });

			expect(element.querySelector('.sidePanel.overlay.overlay-desktop.overlay-desktop-open')).toBeTruthy();
			expect(element.querySelector('.close')).toBeTruthy();

			expect(element.querySelector('.header-desktop')).toBeTruthy();
			expect(element.querySelector('.tab-bar-desktop')).toBeTruthy();


			expect(element.getElementsByClassName('tabcontent').length).toBe(5);
			expect(element.getElementsByClassName('tablink').length).toBe(5);

			expect(element.getElementsByClassName('tabcontent')[0].style.display).toBe('block');
			expect(element.getElementsByClassName('tablink')[0].classList.contains('tablink-active')).toBeTrue();
		});

		it('adds a div which holds the sidepanel content and a close icon for mobile layout', async () => {

			const element = await setup({ mobile: true });

			expect(element.querySelector('.sidePanel.overlay.overlay-mobile.overlay-mobile-open')).toBeTruthy();
			expect(element.querySelector('.close')).toBeTruthy();

			expect(element.querySelector('.header-mobile')).toBeTruthy();
			expect(element.querySelector('.tab-bar-mobile')).toBeTruthy();

			expect(element.getElementsByClassName('tabcontent').length).toBe(5);
			expect(element.getElementsByClassName('tablink').length).toBe(5);

			expect(element.getElementsByClassName('tabcontent')[0].style.display).toBe('block');
			expect(element.getElementsByClassName('tablink')[0].classList.contains('tablink-active')).toBeTrue();
		});

	});

	describe('when close button clicked', () => {
		it('it closes the sidepanel (desktop)', async () => {
			const element = await setup({ mobile: false });
			element.querySelector('.close').click();
			expect(element.querySelector('.sidePanel.overlay.overlay-desktop.overlay-desktop-closed')).toBeTruthy();
			expect(element.querySelector('.overlay-desktop-open')).toBeFalsy();
		});

		it('it closes the sidepanel (mobile)', async () => {
			const element = await setup({ mobile: true });
			element.querySelector('.close').click();
			expect(element.querySelector('.sidePanel.overlay.overlay-mobile.overlay-mobile-closed')).toBeTruthy();
			expect(element.querySelector('.overlay-mobile-open')).toBeFalsy();
		});
	});

	describe('when tab clicked', () => {
		it('it displays the current tab and its content and preserves the index', async () => {
			const element = await setup({ mobile: false });
			const firstTab = element.getElementsByClassName('tablink')[0];
			const secondTab = element.getElementsByClassName('tablink')[1];
			const firstContent = element.getElementsByClassName('tabcontent')[0];
			const secondContent = element.getElementsByClassName('tabcontent')[1];
			
			expect(firstTab.classList.contains('tablink-active')).toBeTrue();
			expect(secondTab.classList.contains('tablink-active')).toBeFalse();
			expect(firstContent.style.display).toBe('block');
			expect(secondContent.style.display).toBe('none');


			//activate the second tab
			secondTab.click();

			expect(firstTab.classList.contains('tablink-active')).toBeFalse();
			expect(secondTab.classList.contains('tablink-active')).toBeTrue();
			expect(firstContent.style.display).toBe('none');
			expect(secondContent.style.display).toBe('block');

			// now we want to see, if the active tab is preserved after re-rendering the view
			toggleSidePanel();

			expect(firstTab.classList.contains('tablink-active')).toBeFalse();
			expect(secondTab.classList.contains('tablink-active')).toBeTrue();
			expect(firstContent.style.display).toBe('none');
			expect(secondContent.style.display).toBe('block');
		});
	});
});

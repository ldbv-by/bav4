/* eslint-disable no-undef */

import { SidePanel } from '../../../../../src/modules/menu/components/sidePanel/SidePanel';
import { sidePanelReducer } from '../../../../../src/modules/menu/store/sidePanel.reducer';
import { toggleSidePanel } from '../../../../../src/modules/menu/store/sidePanel.action';
import { TestUtils } from '../../../../test-utils';
import { $injector } from '../../../../../src/injection';

window.customElements.define(SidePanel.tag, SidePanel);


describe('SidePanelElement', () => {


	const setup = async (config) => {

		const { portrait = false, embed = false } = config;

		const state = {
			sidePanel: {
				open: true
			}
		};
		TestUtils.setupStoreAndDi(state, { sidePanel: sidePanelReducer });
		$injector
			.registerSingleton('EnvironmentService', {
				getScreenOrientation: () => {
					return { portrait: portrait };
				},
				isEmbedded: () => embed
			})
			.registerSingleton('SearchResultProviderService', { getGeoresourceSearchResultProvider: () => { } });
		return TestUtils.render(SidePanel.tag);
	};

	describe('when initialized', () => {
		it('adds a div which holds the sidepanel content and a close icon for landscape layout', async () => {

			const element = await setup({ portrait: false });

			expect(element.shadowRoot.querySelector('.sidePanel.overlay.overlay-landscape.overlay-landscape-open')).toBeTruthy();
			expect(element.shadowRoot.querySelector('.close')).toBeTruthy();

			expect(element.shadowRoot.querySelector('.header-landscape')).toBeTruthy();
			expect(element.shadowRoot.querySelector('.tab-bar-landscape')).toBeTruthy();


			expect(element.shadowRoot.querySelectorAll('.tabcontent').length).toBe(5);
			expect(element.shadowRoot.querySelectorAll('.tablink').length).toBe(5);

			expect(element.shadowRoot.querySelectorAll('.tabcontent')[0].style.display).toBe('block');
			expect(element.shadowRoot.querySelectorAll('.tablink')[0].classList.contains('tablink-active')).toBeTrue();
		});

		it('adds a div which holds the sidepanel content and no close icon for portrait layout', async () => {

			const element = await setup({ portrait: true });

			expect(element.shadowRoot.querySelector('.sidePanel.overlay.overlay-portrait.overlay-portrait-open')).toBeTruthy();
			expect(element.shadowRoot.querySelector('.close')).toBeFalsy();

			expect(element.shadowRoot.querySelector('.header-portrait')).toBeTruthy();
			expect(element.shadowRoot.querySelector('.tab-bar-portrait')).toBeTruthy();

			expect(element.shadowRoot.querySelectorAll('.tabcontent').length).toBe(5);
			expect(element.shadowRoot.querySelectorAll('.tablink').length).toBe(5);

			expect(element.shadowRoot.querySelectorAll('.tabcontent')[0].style.display).toBe('block');
			expect(element.shadowRoot.querySelectorAll('.tablink')[0].classList.contains('tablink-active')).toBeTrue();
		});

		it('renders nothing when embedded', async () => {
			const element = await setup({ embed: true });
			expect(element.shadowRoot.children.length).toBe(0);
		});
	});

	describe('when close button clicked', () => {
		it('closes the sidepanel (landscape)', async () => {
			const element = await setup({ portrait: false });
			element.shadowRoot.querySelector('.close').click();
			expect(element.shadowRoot.querySelector('.sidePanel.overlay.overlay-landscape.overlay-landscape-closed')).toBeTruthy();
			expect(element.shadowRoot.querySelector('.overlay-landscape-open')).toBeFalsy();
		});

		it('closes the sidepanel (portrait)', async () => {
			const element = await setup({ portrait: true });
			toggleSidePanel();
			expect(element.shadowRoot.querySelector('.sidePanel.overlay.overlay-portrait.overlay-portrait-closed')).toBeTruthy();
			expect(element.shadowRoot.querySelector('.overlay-portrait-open')).toBeFalsy();
		});
	});

	describe('when tab clicked', () => {
		it('displays the current tab and its content and preserves the index', async () => {
			const element = await setup({ portrait: false });
			const firstTab = element.shadowRoot.querySelectorAll('.tablink')[0];
			const secondTab = element.shadowRoot.querySelectorAll('.tablink')[1];
			const firstContent = element.shadowRoot.querySelectorAll('.tabcontent')[0];
			const secondContent = element.shadowRoot.querySelectorAll('.tabcontent')[1];

			expect(element._activeTabIndex).toBe(0);
			expect(firstTab.classList.contains('tablink-active')).toBeTrue();
			expect(secondTab.classList.contains('tablink-active')).toBeFalse();
			expect(firstContent.style.display).toBe('block');
			expect(secondContent.style.display).toBe('none');


			//activate the second tab
			secondTab.click();

			expect(element._activeTabIndex).toBe(1);
			expect(firstTab.classList.contains('tablink-active')).toBeFalse();
			expect(secondTab.classList.contains('tablink-active')).toBeTrue();
			expect(firstContent.style.display).toBe('none');
			expect(secondContent.style.display).toBe('block');

			// now we want to see, if the active tab is preserved after re-rendering the view
			toggleSidePanel();

			expect(element._activeTabIndex).toBe(1);
			expect(firstTab.classList.contains('tablink-active')).toBeFalse();
			expect(secondTab.classList.contains('tablink-active')).toBeTrue();
			expect(firstContent.style.display).toBe('none');
			expect(secondContent.style.display).toBe('block');
		});
	});
});

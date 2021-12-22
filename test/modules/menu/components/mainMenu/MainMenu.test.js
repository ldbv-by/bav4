/* eslint-disable no-undef */

import { MainMenu } from '../../../../../src/modules/menu/components/mainMenu/MainMenu';
import { createNoInitialStateMainMenuReducer } from '../../../../../src/store/mainMenu/mainMenu.reducer';
import { TabKey, toggle } from '../../../../../src/store/mainMenu/mainMenu.action';
import { TestUtils } from '../../../../test-utils';
import { $injector } from '../../../../../src/injection';
import { setTab } from '../../../../../src/store/mainMenu/mainMenu.action';
import { DevInfo } from '../../../../../src/modules/utils/components/devInfo/DevInfo';
import { SearchResultsPanel } from '../../../../../src/modules/search/components/menu/SearchResultsPanel';
import { TopicsContentPanel } from '../../../../../src/modules/topics/components/menu/TopicsContentPanel';
import { createNoInitialStateMediaReducer } from '../../../../../src/store/media/media.reducer';
import { disableResponsiveParameterObservation, enableResponsiveParameterObservation } from '../../../../../src/store/media/media.action';
import { FeatureInfoPanel } from '../../../../../src/modules/featureInfo/components/FeatureInfoPanel';
import { MapsContentPanel } from '../../../../../src/modules/menu/components/mainMenu/content/maps/MapsContentPanel';
import { MoreContentPanel } from '../../../../../src/modules/menu/components/mainMenu/content/more/MoreContentPanel';

window.customElements.define(MainMenu.tag, MainMenu);

describe('MainMenu', () => {

	const setup = (state = {}, config = {}) => {

		const { embed = false } = config;

		const initialState = {
			mainMenu: {
				open: true,
				tab: null
			},
			media: {
				portrait: false,
				minWidth: true,
				observeResponsiveParameter: true
			},
			...state

		};
		TestUtils.setupStoreAndDi(initialState, {
			mainMenu: createNoInitialStateMainMenuReducer(),
			media: createNoInitialStateMediaReducer()
		});
		$injector
			.registerSingleton('EnvironmentService', {
				isEmbedded: () => embed
			})
			.registerSingleton('TranslationService', { translate: (key) => key });

		return TestUtils.render(MainMenu.tag);
	};

	describe('responsive layout ', () => {

		it('layouts for landscape and width >= 80em', async () => {
			const state = {
				media: {
					portrait: false,
					minWidth: true
				}
			};

			const element = await setup(state);

			expect(element.shadowRoot.querySelector('.is-landscape')).toBeTruthy();
			expect(element.shadowRoot.querySelector('.is-desktop')).toBeTruthy();
			expect(element.shadowRoot.querySelector('.main-menu')).toBeTruthy();
		});

		it('layouts for portrait and width >= 80em', async () => {
			const state = {
				media: {
					portrait: true,
					minWidth: true
				}
			};

			const element = await setup(state);

			expect(element.shadowRoot.querySelector('.is-portrait')).toBeTruthy();
			expect(element.shadowRoot.querySelector('.is-desktop')).toBeTruthy();
			expect(element.shadowRoot.querySelector('.main-menu')).toBeTruthy();
		});

		it('layouts for landscape and width < 80em', async () => {
			const state = {
				media: {
					portrait: false,
					minWidth: false
				}
			};

			const element = await setup(state);

			expect(element.shadowRoot.querySelector('.is-landscape')).toBeTruthy();
			expect(element.shadowRoot.querySelector('.is-tablet')).toBeTruthy();
			expect(element.shadowRoot.querySelector('.main-menu')).toBeTruthy();
		});

		it('layouts for portrait and width < 80em', async () => {
			const state = {
				media: {
					portrait: true,
					minWidth: false
				}
			};

			const element = await setup(state);

			expect(element.shadowRoot.querySelector('.is-portrait')).toBeTruthy();
			expect(element.shadowRoot.querySelector('.is-tablet')).toBeTruthy();
			expect(element.shadowRoot.querySelector('.main-menu')).toBeTruthy();
		});
	});


	describe('when initialized', () => {

		it('adds a div which holds the main menu and a close button', async () => {

			const element = await setup();
			expect(element.shadowRoot.querySelector('.main-menu.is-open')).toBeTruthy();
			expect(element.shadowRoot.querySelector('.main-menu__close-button')).toBeTruthy();
			expect(element.shadowRoot.querySelector('.main-menu__close-button').title).toBe('menu_main_open_button');
			expect(element.shadowRoot.querySelector('.main-menu__close-button-text').innerText).toBe('menu_main_open_button');
		});

		it('adds a container for content and shows demo content', async () => {
			const element = await setup();

			expect(element.shadowRoot.querySelector('.main-menu__container')).toBeTruthy();
			expect(element.shadowRoot.querySelector('.main-menu__container').children.length > 0).toBeTrue();
		});

		it('renders nothing when embedded', async () => {
			const element = await setup({}, { embed: true });

			expect(element.shadowRoot.children.length).toBe(0);
		});

		it('renders the content panels', async () => {
			const element = await setup();

			const contentPanels = element.shadowRoot.querySelectorAll('.tabcontent');
			expect(contentPanels.length).toBe(Object.keys(TabKey).length);
			for (let i = 0; i < contentPanels.length; i++) {
				switch (i) {
					case TabKey.SEARCH:
						expect(contentPanels[i].innerHTML.toString().includes(SearchResultsPanel.tag)).toBeTrue();
						break;
					case TabKey.TOPICS:
						expect(contentPanels[i].innerHTML.toString().includes(TopicsContentPanel.tag)).toBeTrue();
						break;
					case TabKey.FEATUREINFO:
						expect(contentPanels[i].innerHTML.toString().includes(FeatureInfoPanel.tag)).toBeTrue();
						break;
					case TabKey.MAPS:
						expect(contentPanels[i].innerHTML.toString().includes(MapsContentPanel.tag)).toBeTrue();
						break;
					case TabKey.MORE:
						expect(contentPanels[i].innerHTML.toString().includes(MoreContentPanel.tag)).toBeTrue();
						break;
				}
			}
		});

		it('display the content panel for default index = 0', async () => {
			const element = await setup();

			const contentPanels = element.shadowRoot.querySelectorAll('.tabcontent');
			expect(contentPanels.length).toBe(Object.keys(TabKey).length);
			for (let i = 0; i < contentPanels.length; i++) {
				expect(contentPanels[i].classList.contains('is-active')).toBe(Object.values(TabKey)[i] === 0);
			}
		});

		it('displays the content panel for non default index', async () => {
			const activeTabIndex = TabKey.MORE;
			const state = {
				mainMenu: {
					open: true,
					tab: activeTabIndex
				}
			};
			const element = await setup(state);

			const contentPanels = element.shadowRoot.querySelectorAll('.tabcontent');
			expect(contentPanels.length).toBe(Object.keys(TabKey).length);
			for (let i = 0; i < contentPanels.length; i++) {
				expect(contentPanels[i].classList.contains('is-active')).toBe(Object.values(TabKey)[i] === activeTabIndex);
			}
		});

		it('adds a slider to resize width', async () => {
			const element = await setup();
			const slider = element.shadowRoot.querySelector('.slider-container input');

			expect(slider.type).toBe('range');
			expect(slider.value).toBe('28');
			expect(slider.min).toBe('28');
			expect(slider.max).toBe('100');
			expect(slider.draggable).toBeTrue();
		});

		it('contains a dev info', async () => {
			const element = await setup();

			expect(element.shadowRoot.querySelector('.main-menu').querySelector(DevInfo.tag)).toBeTruthy();
		});

		it('does not add the prevent-transition css class', async () => {
			const state = {
				media: {
					portrait: true,
					minWidth: false,
					observeResponsiveParameter: true
				}
			};

			const element = await setup(state);

			expect(element.shadowRoot.querySelector('.main-menu').parentElement.classList.contains('prevent-transition')).toBeFalse();
		});
	});

	describe('when tab-index changes', () => {

		const check = (index, panels) => {
			for (let i = 0; i < panels.length; i++) {
				expect(panels[i].classList.contains('is-active')).toBe(Object.values(TabKey)[i] === index);
			}
		};

		it('displays the corresponding content panel', async () => {
			const element = await setup();
			const contentPanels = element.shadowRoot.querySelectorAll('.tabcontent');

			setTab(TabKey.MAPS);
			check(TabKey.MAPS, contentPanels);

			setTab(TabKey.MORE);
			check(TabKey.MORE, contentPanels);

			setTab(TabKey.ROUTING);
			check(TabKey.ROUTING, contentPanels);

			setTab(TabKey.SEARCH);
			check(TabKey.SEARCH, contentPanels);

			setTab(TabKey.FEATUREINFO);
			check(TabKey.FEATUREINFO, contentPanels);

			setTab(TabKey.TOPICS);
			check(TabKey.TOPICS, contentPanels);
		});

		it('adds or removes a special Css class for the FeatureInfoContentPanel', async () => {
			const element = await setup();

			setTab(TabKey.MAPS);

			expect(element.shadowRoot.querySelectorAll('.main-menu.is-full-size')).toHaveSize(0);

			setTab(TabKey.FEATUREINFO);

			expect(element.shadowRoot.querySelectorAll('.main-menu.is-full-size')).toHaveSize(1);

			setTab(TabKey.MAPS);

			expect(element.shadowRoot.querySelectorAll('.main-menu.is-full-size')).toHaveSize(0);
		});
	});

	describe('when close button clicked', () => {

		it('closes the main menu', async () => {
			const element = await setup();

			toggle();

			expect(element.shadowRoot.querySelector('.main-menu.is-open')).toBeNull();
			expect(element.shadowRoot.querySelector('.main-menu__close-button')).toBeTruthy();
		});
	});

	describe('when responsive parameter observation state changes', () => {

		it('adds or removes the prevent-transition css class', async () => {
			const state = {
				media: {
					portrait: true,
					minWidth: false,
					observeResponsiveParameter: true
				}
			};

			const element = await setup(state);

			expect(element.shadowRoot.querySelector('.main-menu').parentElement.classList.contains('prevent-transition')).toBeFalse();

			disableResponsiveParameterObservation();

			expect(element.shadowRoot.querySelector('.main-menu').parentElement.classList.contains('prevent-transition')).toBeTrue();

			enableResponsiveParameterObservation();

			expect(element.shadowRoot.querySelector('.main-menu').parentElement.classList.contains('prevent-transition')).toBeFalse();
		});
	});

	describe('when slider changes', () => {

		it('adjusts the main menu width', async () => {
			const value = 50;
			const state = {
				mainMenu: {
					open: true,
					tab: TabKey.FEATUREINFO
				}
			};
			const element = await setup(state);
			const mainMenu = element.shadowRoot.querySelector('#mainmenu');
			const slider = element.shadowRoot.querySelector('.slider-container input');

			slider.value = value;
			slider.dispatchEvent(new Event('input'));

			expect(mainMenu.style.width).toBe(`${value}em`);
		});

		it('saves and restores width values', async () => {
			const value = 50;
			const element = await setup();
			const mainMenu = element.shadowRoot.querySelector('#mainmenu');
			const slider = element.shadowRoot.querySelector('.slider-container input');
			const initialWidthInPx = window.getComputedStyle(mainMenu).width;

			//open FeatureInfo panel and adjust width
			setTab(TabKey.FEATUREINFO);
			slider.value = value;
			slider.dispatchEvent(new Event('input'));
			const adjustedWidthInPx = window.getComputedStyle(mainMenu).width;

			//open another panel
			setTab(TabKey.MAPS);

			expect(window.getComputedStyle(mainMenu).width).toBe(initialWidthInPx);

			//open FeatureInfo panel again
			setTab(TabKey.FEATUREINFO);

			expect(window.getComputedStyle(mainMenu).width).toBe(adjustedWidthInPx);
		});

		it('prevents default event handling and stops its propagation', async () => {
			const state = {
				mainMenu: {
					open: true,
					tab: TabKey.FEATUREINFO
				}
			};
			const element = await setup(state);
			const slider = element.shadowRoot.querySelector('.slider-container input');
			const event = new Event('dragstart');
			const preventDefaultSpy = spyOn(event, 'preventDefault');
			const stopPropagationSpy = spyOn(event, 'stopPropagation');

			slider.dispatchEvent(event);

			expect(preventDefaultSpy).toHaveBeenCalled();
			expect(stopPropagationSpy).toHaveBeenCalled();
		});
	});
});

/* eslint-disable no-undef */
import { Header } from '../../../../src/modules/header/components/Header';
import { createNoInitialStateMainMenuReducer } from '../../../../src/store/mainMenu/mainMenu.reducer';
import { TestUtils } from '../../../test-utils.js';
import { $injector } from '../../../../src/injection';
import { layersReducer, createDefaultLayer } from '../../../../src/store/layers/layers.reducer';
import { networkReducer } from '../../../../src/store/network/network.reducer';
import { createNoInitialStateNavigationRailReducer } from '../../../../src/store/navigationRail/navigationRail.reducer';
import { setFetching } from '../../../../src/store/network/network.action';
import { searchReducer } from '../../../../src/store/search/search.reducer';
import { EventLike } from '../../../../src/utils/storeUtils';
import { createNoInitialStateMediaReducer } from '../../../../src/store/media/media.reducer';
import { TabIds } from '../../../../src/domain/mainMenu';
import { modalReducer } from '../../../../src/store/modal/modal.reducer';
import { REGISTER_FOR_VIEWPORT_CALCULATION_ATTRIBUTE_NAME, TEST_ID_ATTRIBUTE_NAME } from '../../../../src/utils/markup';
import { setQuery } from '../../../../src/store/search/search.action';
import { setIsPortrait } from '../../../../src/store/media/media.action';
import { authReducer } from '../../../../src/store/auth/auth.reducer';
import { toolsReducer } from '../../../../src/store/tools/tools.reducer';
import { Tools } from '../../../../src/domain/tools';
import { setSignedIn, setSignedOut } from '../../../../src/store/auth/auth.action';
import { focusSearchField } from '../../../../src/store/mainMenu/mainMenu.action.js';
import { Highlight_Item_Class } from '../../../../src/modules/search/components/menu/AbstractResultItem.js';

window.customElements.define(Header.tag, Header);

let store;

const authService = {
	isSignedIn: () => {},
	getRoles: () => {
		return ['Plus', 'Admin'];
	},
	signIn: () => {},
	signOut: () => {}
};

describe('Header', () => {
	const setup = (state = {}, config = {}) => {
		const { embed = false, standalone = false } = config;

		const initialState = {
			mainMenu: {
				open: true,
				tab: TabIds.TOPICS
			},
			network: {
				fetching: false,
				pendingRequests: 0
			},
			layers: {
				active: [createDefaultLayer('test')]
			},
			search: {
				query: new EventLike(null)
			},
			media: {
				portrait: false,
				minWidth: true,
				observeResponsiveParameter: true
			},
			navigationRail: {
				open: false
			},
			auth: {
				signedIn: false
			},
			...state
		};
		store = TestUtils.setupStoreAndDi(initialState, {
			mainMenu: createNoInitialStateMainMenuReducer(),
			modal: modalReducer,
			network: networkReducer,
			layers: layersReducer,
			search: searchReducer,
			tools: toolsReducer,
			auth: authReducer,
			media: createNoInitialStateMediaReducer(),
			navigationRail: createNoInitialStateNavigationRailReducer()
		});
		$injector
			.registerSingleton('EnvironmentService', { isEmbedded: () => embed, isStandalone: () => standalone })
			.registerSingleton('TranslationService', { translate: (key) => key })
			.registerSingleton('AuthService', authService);

		return TestUtils.render(Header.tag);
	};

	describe('class', () => {
		it('static constants', () => {
			expect(Header.TIME_INTERVAL_MS).toBe(300);
		});
	});

	describe('when instantiated', () => {
		it('has a model with default values', async () => {
			await setup();
			const model = new Header().getModel();

			expect(model).toEqual({
				isOpen: false,
				tabIndex: null,
				isFetching: false,
				layers: [],
				isPortrait: false,
				hasMinWidth: false,
				searchTerm: null,
				isOpenNavigationRail: false
			});
		});

		it('has static constants', async () => {
			expect(Header.SWIPE_DELTA_PX).toBe(50);
		});
	});

	describe('responsive layout ', () => {
		it('layouts for landscape and width >= 80em', async () => {
			const state = {
				media: {
					portrait: false,
					minWidth: true
				}
			};

			const element = await setup(state);

			expect(element.shadowRoot.querySelectorAll('.is-landscape')).toHaveSize(1);
			expect(element.shadowRoot.querySelectorAll('.is-desktop')).toHaveSize(1);
			expect(element.shadowRoot.querySelectorAll('.is-tablet')).toHaveSize(0);
			expect(element.shadowRoot.querySelectorAll('.header')).toHaveSize(1);
			expect(window.getComputedStyle(element.shadowRoot.querySelector('.header__logo')).display).toBe('block');
			expect(window.getComputedStyle(element.shadowRoot.querySelector('#headerMobile')).display).toBe('none');
			expect(window.getComputedStyle(element.shadowRoot.querySelector('#input')).width).not.toBe('0px');
		});

		it('layouts for portrait and width >= 80em', async () => {
			const state = {
				media: {
					portrait: true,
					minWidth: true
				}
			};

			const element = await setup(state);

			expect(element.shadowRoot.querySelectorAll('.is-portrait')).toHaveSize(1);
			expect(element.shadowRoot.querySelectorAll('.is-desktop')).toHaveSize(1);
			expect(element.shadowRoot.querySelectorAll('.is-tablet')).toHaveSize(0);
			expect(element.shadowRoot.querySelectorAll('.header')).toHaveSize(1);
			expect(window.getComputedStyle(element.shadowRoot.querySelector('.header__logo')).display).toBe('none');
			expect(window.getComputedStyle(element.shadowRoot.querySelector('#headerMobile')).display).toBe('block');
			expect(window.getComputedStyle(element.shadowRoot.querySelector('#input')).width).toBe('0px');
		});

		it('layouts for landscape and width < 80em', async () => {
			const state = {
				media: {
					portrait: false,
					minWidth: false
				}
			};

			const element = await setup(state);

			expect(element.shadowRoot.querySelectorAll('.is-landscape')).toHaveSize(1);
			expect(element.shadowRoot.querySelectorAll('.is-desktop')).toHaveSize(0);
			expect(element.shadowRoot.querySelectorAll('.is-tablet')).toHaveSize(1);
			expect(element.shadowRoot.querySelectorAll('.header')).toHaveSize(1);
			expect(window.getComputedStyle(element.shadowRoot.querySelector('.header__logo')).display).toBe('block');
			expect(window.getComputedStyle(element.shadowRoot.querySelector('#headerMobile')).display).toBe('none');
			expect(window.getComputedStyle(element.shadowRoot.querySelector('#input')).width).toBe('0px');
		});

		it('layouts for portrait and layouts for width < 80em', async () => {
			const state = {
				media: {
					portrait: true,
					minWidth: false
				}
			};

			const element = await setup(state);

			expect(element.shadowRoot.querySelectorAll('.is-portrait')).toHaveSize(1);
			expect(element.shadowRoot.querySelectorAll('.is-desktop')).toHaveSize(0);
			expect(element.shadowRoot.querySelectorAll('.is-tablet')).toHaveSize(1);
			expect(element.shadowRoot.querySelectorAll('.header')).toHaveSize(1);
			expect(window.getComputedStyle(element.shadowRoot.querySelector('.header__logo')).display).toBe('none');
			expect(window.getComputedStyle(element.shadowRoot.querySelector('#headerMobile')).display).toBe('block');
			expect(window.getComputedStyle(element.shadowRoot.querySelector('#input')).width).toBe('0px');
		});
	});

	describe('when initialized', () => {
		it('removes a preload css class', async () => {
			const element = await setup();

			expect(element.shadowRoot.querySelectorAll('.preload')).toHaveSize(0);
		});

		it('adds header bar', async () => {
			const element = await setup();

			expect(element.shadowRoot.querySelectorAll('.header')).toHaveSize(1);
			expect(element.shadowRoot.querySelectorAll('.header__routing-button')).toHaveSize(1);
			expect(window.getComputedStyle(element.shadowRoot.querySelector('.header__routing-button')).display).toBe('none');

			expect(element.shadowRoot.querySelectorAll('.header__button-container')).toHaveSize(1);
			expect(element.shadowRoot.querySelector('.header__button-container').children.length).toBe(3);
			expect(element.shadowRoot.querySelector('.header__button-container').children[0].classList.contains('is-active')).toBeTrue();
			expect(element.shadowRoot.querySelector('.header__button-container').children[0].innerText).toBe('header_tab_topics_button');

			expect(element.shadowRoot.querySelector('.header__button-container').children[1].children[0].innerText).toBe('header_tab_maps_button');
			expect(element.shadowRoot.querySelector('.header__button-container').children[1].children[1].innerText).toBe('1');
			expect(element.shadowRoot.querySelector('.header__button-container').children[1].classList.contains('is-active')).toBeFalse();

			expect(element.shadowRoot.querySelector('.header__button-container').children[2].innerText).toBe('header_tab_misc_button');
			expect(element.shadowRoot.querySelector('.header__button-container').children[2].classList.contains('is-active')).toBeFalse();

			expect(element.shadowRoot.querySelectorAll('#inputFocusButton')).toHaveSize(1);
			expect(element.shadowRoot.querySelector('#inputFocusButton').title).toBe('header_search_title');

			expect(element.shadowRoot.querySelector('.header__search').getAttribute('placeholder')).toBe('header_search_placeholder');
			expect(element.shadowRoot.querySelector('.header__search').title).toBe('header_search_title');

			expect(element.shadowRoot.querySelectorAll('#clear')).toHaveSize(1);
			expect(element.shadowRoot.querySelector('#clear').title).toBe('header_search_clear_button');

			expect(element.shadowRoot.querySelector('.header__logo-badge').innerText).toBe('header_logo_badge');

			expect(element.shadowRoot.querySelector('.header__logo').title).toBe('header_logo_title_open');

			expect(element.shadowRoot.querySelectorAll('div.header__emblem')).toHaveSize(1);
			expect(element.shadowRoot.querySelectorAll('a.header__emblem')).toHaveSize(0);
		});

		it('adds a close button', async () => {
			const element = await setup();
			expect(element.shadowRoot.querySelector('button.close-menu').id).toBe('header_toggle');
			expect(element.shadowRoot.querySelector('button.close-menu').title).toBe('header_close_button_title');
		});

		it('renders nothing when embedded', async () => {
			const element = await setup({}, { embed: true });

			expect(element.shadowRoot.children.length).toBe(0);
		});

		it('displays 2 active Layers', async () => {
			//we add one hidden layer
			const hiddenLayer = createDefaultLayer('test2');
			hiddenLayer.constraints.hidden = true;
			const state = {
				layers: {
					active: [createDefaultLayer('test0'), createDefaultLayer('test1'), hiddenLayer]
				}
			};
			const element = await setup(state);

			expect(element.shadowRoot.querySelector('.header__button-container').children[1].children[1].innerText).toBe('2');
		});

		it('adopts the states query term', async () => {
			const term = 'foo';
			const state = {
				search: {
					query: new EventLike(term)
				}
			};

			const element = await setup(state);

			expect(element.shadowRoot.querySelector('#input').getAttribute('value')).toBe(term);
		});

		it('contains test-id attributes', async () => {
			const element = await setup();

			expect(element.shadowRoot.querySelectorAll(`[${TEST_ID_ATTRIBUTE_NAME}]`)).toHaveSize(4);
			expect(element.shadowRoot.querySelector('#topics_button').hasAttribute(TEST_ID_ATTRIBUTE_NAME)).toBeTrue();
			expect(element.shadowRoot.querySelector('#maps_button').hasAttribute(TEST_ID_ATTRIBUTE_NAME)).toBeTrue();
			expect(element.shadowRoot.querySelector('#misc_button').hasAttribute(TEST_ID_ATTRIBUTE_NAME)).toBeTrue();
			expect(element.shadowRoot.querySelector('#input').hasAttribute(TEST_ID_ATTRIBUTE_NAME)).toBeTrue();
		});

		it('renders for standalone', async () => {
			const element = await setup({}, { standalone: true });

			expect(element.shadowRoot.querySelectorAll('.is-demo')).toBeTruthy();

			expect(element.shadowRoot.querySelectorAll('div.header__emblem')).toHaveSize(0);
			expect(element.shadowRoot.querySelectorAll('a.header__emblem')).toHaveSize(1);
			expect(element.shadowRoot.querySelector('.header__logo-badge').innerText).toBe('header_logo_badge_standalone');
			expect(element.shadowRoot.querySelector('.header__emblem').getAttribute('title')).toBe('header_emblem_title_standalone');
			expect(element.shadowRoot.querySelector('.header__emblem').getAttribute('href')).toBe('header_emblem_link_standalone');
		});

		it('renders for signIn state', async () => {
			const element = await setup({ auth: { signedIn: true } });

			expect(element.shadowRoot.querySelectorAll('.badge-signed-in')).toHaveSize(1);
			expect(element.shadowRoot.querySelector('.header__logo-badge').innerText).toBe(authService.getRoles().join(' '));

			expect(element.shadowRoot.querySelectorAll('.badges-signed-in')).toHaveSize(1);
			expect(element.shadowRoot.querySelectorAll('.badges-signed-in-icon')).toHaveSize(1);
		});

		it('layouts with open navigation rail', async () => {
			const state = {
				navigationRail: {
					open: true
				}
			};

			const element = await setup(state);
			expect(element.shadowRoot.querySelectorAll('.is-open-navigationRail')).toHaveSize(1);
			expect(element.shadowRoot.querySelector('.header__logo').title).toBe('header_logo_title_close');
		});

		it('layouts with closed navigation rail ', async () => {
			const state = {
				navigationRail: {
					open: false
				}
			};
			const element = await setup(state);
			expect(element.shadowRoot.querySelectorAll('.is-open-navigationRail')).toHaveSize(0);
			expect(element.shadowRoot.querySelector('.header__logo').title).toBe('header_logo_title_open');
		});
	});

	describe('when action-button clicked', () => {
		it('toggle navigation rail', async () => {
			const element = await setup();
			expect(element.shadowRoot.querySelectorAll('.is-open-navigationRail')).toHaveSize(0);
			expect(store.getState().navigationRail.open).toBe(false);

			element.shadowRoot.querySelector('.action-button').click();

			expect(element.shadowRoot.querySelectorAll('.is-open-navigationRail')).toHaveSize(1);
			expect(store.getState().navigationRail.open).toBe(true);

			element.shadowRoot.querySelector('.action-button').click();

			expect(element.shadowRoot.querySelectorAll('.is-open-navigationRail')).toHaveSize(0);
			expect(store.getState().navigationRail.open).toBe(false);
		});
	});

	describe('when search-button clicked', () => {
		it('focus search input', async () => {
			const element = await setup();

			const searchButton = element.shadowRoot.querySelector('#inputFocusButton');
			const input = element.shadowRoot.querySelector('#input');

			expect(input.matches(':focus')).toBeFalse();
			searchButton.click();
			expect(input.matches(':focus')).toBeTrue();
		});
	});

	describe('when menu button is Tab.MAPS', () => {
		it('updates the store', async () => {
			const state = {
				mainMenu: {
					open: false
				}
			};

			const element = await setup(state);

			expect(store.getState().mainMenu.open).toBe(false);
			element.shadowRoot.querySelector('button.close-menu').click();
			expect(store.getState().mainMenu.open).toBe(true);
		});
	});

	describe('when close button is clicked', () => {
		it('hides the header', async () => {
			const element = await setup();

			element.shadowRoot.querySelector('.close-menu').click();

			expect(element.shadowRoot.querySelector('.header.is-open')).toBeNull();
		});
	});

	describe('when close button is swiped', () => {
		const getCenter = (element) => {
			const rect = element.getBoundingClientRect();
			return { x: (rect.right + rect.left) / 2, y: (rect.top + rect.bottom) / 2 };
		};

		it('hides the header on swiped left', async () => {
			const element = await setup();

			const closeButton = element.shadowRoot.querySelector('.close-menu');
			const center = getCenter(closeButton);

			// Touch-path swipe left
			TestUtils.simulateTouchEvent('touchstart', closeButton, center.x, center.y, 2);
			TestUtils.simulateTouchEvent('touchmove', closeButton, center.x - 55, center.y, 2);
			TestUtils.simulateTouchEvent('touchend', closeButton, center.x - 200, center.y);
			expect(element.shadowRoot.querySelector('.header.is-open')).toBeNull();
		});

		it('does NOT hides the header on swiped right, upwards and downwards', async () => {
			const element = await setup();

			const closeButton = element.shadowRoot.querySelector('.close-menu');
			const center = getCenter(closeButton);

			// Touch-path swipe right
			TestUtils.simulateTouchEvent('touchstart', closeButton, center.x, center.y, 2);
			TestUtils.simulateTouchEvent('touchmove', closeButton, center.x + 55, center.y, 2);
			TestUtils.simulateTouchEvent('touchend', closeButton, center.x + 200, center.y);

			// Touch-path swipe upwards
			TestUtils.simulateTouchEvent('touchstart', closeButton, center.x, center.y, 2);
			TestUtils.simulateTouchEvent('touchmove', closeButton, center.x, center.y - 55, 2);
			TestUtils.simulateTouchEvent('touchend', closeButton, center.x, center.y - 200);

			// Touch-path downwards
			TestUtils.simulateTouchEvent('touchstart', closeButton, center.x, center.y, 2);
			TestUtils.simulateTouchEvent('touchmove', closeButton, center.x, center.y + 55, 2);
			TestUtils.simulateTouchEvent('touchend', closeButton, center.x, center.y + 200);

			expect(element.shadowRoot.querySelectorAll('.is-open .header')).toHaveSize(1);
		});

		it('focused menu-button loses the focus after swipe', async () => {
			const element = await setup();
			const mapButton = element.shadowRoot.querySelector('.header__button-container').children[1];
			const closeButton = element.shadowRoot.querySelector('.close-menu');
			const center = getCenter(closeButton);

			mapButton.focus();
			expect(mapButton.matches(':focus')).toBeTrue();

			// Touch-path swipe left
			TestUtils.simulateTouchEvent('touchstart', closeButton, center.x, center.y, 2);
			TestUtils.simulateTouchEvent('touchmove', closeButton, center.x - 55, center.y, 2);
			TestUtils.simulateTouchEvent('touchend', closeButton, center.x - 200, center.y);

			expect(mapButton.matches(':focus')).toBeFalse();
		});
	});

	describe('when routing button is clicked', () => {
		it('changes the current active tool', async () => {
			const element = await setup();

			element.shadowRoot.querySelector('.header__routing-button').click();

			expect(store.getState().tools.current).toBe(Tools.ROUTING);
		});
	});

	describe('when menu button is clicked', () => {
		it('click button Theme', async () => {
			const element = await setup();
			expect(element.shadowRoot.querySelector('.header__button-container').children[0].click());
			expect(element.shadowRoot.querySelector('.header__button-container').children[0].classList.contains('is-active')).toBeTrue();
			expect(element.shadowRoot.querySelector('.header__button-container').children[1].classList.contains('is-active')).toBeFalse();
			expect(element.shadowRoot.querySelector('.header__button-container').children[2].classList.contains('is-active')).toBeFalse();
		});

		it('click button Map', async () => {
			const element = await setup();
			expect(element.shadowRoot.querySelector('.header__button-container').children[1].click());
			expect(element.shadowRoot.querySelector('.header__button-container').children[0].classList.contains('is-active')).toBeFalse();
			expect(element.shadowRoot.querySelector('.header__button-container').children[1].classList.contains('is-active')).toBeTrue();
			expect(element.shadowRoot.querySelector('.header__button-container').children[2].classList.contains('is-active')).toBeFalse();
		});

		it('click button More', async () => {
			const element = await setup();
			expect(element.shadowRoot.querySelector('.header__button-container').children[2].click());
			expect(element.shadowRoot.querySelector('.header__button-container').children[0].classList.contains('is-active')).toBeFalse();
			expect(element.shadowRoot.querySelector('.header__button-container').children[1].classList.contains('is-active')).toBeFalse();
			expect(element.shadowRoot.querySelector('.header__button-container').children[2].classList.contains('is-active')).toBeTrue();
		});

		it('updates the store', async () => {
			const element = await setup();
			expect(element.shadowRoot.querySelector('.header__button-container').children[0].click());
			expect(store.getState().mainMenu.tab).toBe(TabIds.TOPICS);
			expect(store.getState().mainMenu.open).toBe(true);
			expect(element.shadowRoot.querySelector('.header__button-container').children[1].click());
			expect(store.getState().mainMenu.tab).toBe(TabIds.MAPS);
			expect(store.getState().mainMenu.open).toBe(true);
			expect(element.shadowRoot.querySelector('.header__button-container').children[2].click());
			expect(store.getState().mainMenu.tab).toBe(TabIds.MISC);
			expect(store.getState().mainMenu.open).toBe(true);
		});

		it('updates the store in portrait mode', async () => {
			const state = {
				mainMenu: {
					open: false
				},
				media: {
					portrait: true,
					minWidth: true
				}
			};
			const element = await setup(state);
			expect(element.shadowRoot.querySelector('.header__button-container').children[0].click());
			expect(store.getState().mainMenu.tab).toBe(TabIds.TOPICS);
			expect(store.getState().mainMenu.open).toBe(true);
			expect(element.shadowRoot.querySelector('.header__button-container').children[0].click());
			expect(store.getState().mainMenu.tab).toBe(TabIds.TOPICS);
			expect(store.getState().mainMenu.open).toBe(false);

			expect(element.shadowRoot.querySelector('.header__button-container').children[1].click());
			expect(store.getState().mainMenu.tab).toBe(TabIds.MAPS);
			expect(store.getState().mainMenu.open).toBe(true);
			expect(element.shadowRoot.querySelector('.header__button-container').children[1].click());
			expect(store.getState().mainMenu.tab).toBe(TabIds.MAPS);
			expect(store.getState().mainMenu.open).toBe(false);

			expect(element.shadowRoot.querySelector('.header__button-container').children[2].click());
			expect(store.getState().mainMenu.tab).toBe(TabIds.MISC);
			expect(store.getState().mainMenu.open).toBe(true);
			expect(element.shadowRoot.querySelector('.header__button-container').children[2].click());
			expect(store.getState().mainMenu.tab).toBe(TabIds.MISC);
			expect(store.getState().mainMenu.open).toBe(false);

			expect(element.shadowRoot.querySelector('.header__button-container').children[0].click());
			expect(store.getState().mainMenu.tab).toBe(TabIds.TOPICS);
			expect(store.getState().mainMenu.open).toBe(true);
			expect(element.shadowRoot.querySelector('.header__button-container').children[1].click());
			expect(store.getState().mainMenu.tab).toBe(TabIds.MAPS);
			expect(store.getState().mainMenu.open).toBe(true);
			expect(element.shadowRoot.querySelector('.header__button-container').children[2].click());
			expect(store.getState().mainMenu.tab).toBe(TabIds.MISC);
			expect(store.getState().mainMenu.open).toBe(true);
		});
	});

	describe('input for search queries', () => {
		describe('when input changes', () => {
			it('updates the store', async () => {
				const element = await setup();

				const inputElement = element.shadowRoot.querySelector('#input');
				inputElement.value = 'foo';
				inputElement.dispatchEvent(new Event('input'));

				expect(store.getState().search.query.payload).toBe('foo');
			});

			it('opens the main menu', async () => {
				const state = {
					mainMenu: {
						open: false
					}
				};
				const element = await setup(state);

				expect(store.getState().mainMenu.open).toBeFalse();

				const inputElement = element.shadowRoot.querySelector('#input');
				inputElement.value = 'foo';
				inputElement.dispatchEvent(new Event('input'));

				expect(store.getState().mainMenu.open).toBeTrue();
			});

			it('shows and hides a clear button', async () => {
				const state = {
					media: {
						minWidth: true
					}
				};
				const element = await setup(state);

				const searchContainerElement = element.shadowRoot.querySelector('.header__search-container');
				const inputElement = element.shadowRoot.querySelector('#input');
				const clearButton = element.shadowRoot.querySelector('#clear');
				inputElement.value = 'foo';
				inputElement.dispatchEvent(new Event('input'));

				expect(searchContainerElement.classList.contains('is-clear-visible')).toBeTrue();
				expect(window.getComputedStyle(clearButton).display).toBe('flex');

				inputElement.value = '';
				inputElement.dispatchEvent(new Event('input'));

				expect(searchContainerElement.classList.contains('is-clear-visible')).toBeFalse();
				expect(window.getComputedStyle(clearButton).display).toBe('none');
			});

			it('prevents the cursor to flip around the query term on ArrowUp', async () => {
				const searchResultsCount = 5;
				const state = {
					media: {
						minWidth: true
					}
				};
				const element = await setup(state);
				for (let index = 0; index < searchResultsCount; index++) {
					const divElement = document.createElement('div');
					divElement.classList.add(Highlight_Item_Class);
					document.body.appendChild(divElement);
				}
				const arrowUpEvent = new KeyboardEvent('keydown', { key: 'ArrowUp' });
				const arrowDownEvent = new KeyboardEvent('keydown', { key: 'ArrowDown' });
				const arrowUpSpy = spyOn(arrowUpEvent, 'preventDefault').and.callThrough();
				const arrowDownSpy = spyOn(arrowDownEvent, 'preventDefault').and.callThrough();

				const inputElement = element.shadowRoot.querySelector('#input');

				inputElement.value = 'foo';
				inputElement.dispatchEvent(arrowUpEvent);
				inputElement.dispatchEvent(arrowDownEvent);

				expect(arrowUpSpy).toHaveBeenCalled();
				expect(arrowDownSpy).not.toHaveBeenCalled();
			});
		});

		describe('when input clear button is clicked', () => {
			it('updates the store', async () => {
				const element = await setup({
					search: {
						query: new EventLike('foo')
					}
				});

				element.shadowRoot.querySelector('.header__search-clear').click();

				expect(store.getState().search.query.payload).toBe('');
				expect(element.shadowRoot.querySelector('#input').matches(':focus')).toBeTrue();
			});
		});

		describe('when input is focused or blurred ', () => {
			it("disables/enables the 'observeResponsiveParameter' property", async () => {
				const state = {
					mainMenu: {
						open: false
					},
					media: {
						portrait: true,
						minWidth: true
					}
				};
				const element = await setup(state);
				const input = element.shadowRoot.querySelector('#input');

				expect(window.getComputedStyle(element.shadowRoot.querySelector('#input')).width).toBe('0px');

				input.focus();
				expect(store.getState().media.observeResponsiveParameter).toBeFalse();

				input.blur();
				expect(window.getComputedStyle(element.shadowRoot.querySelector('#input')).width).toBe('0px');
				expect(store.getState().media.observeResponsiveParameter).toBeTrue();
			});

			describe('in portrait mode', () => {
				beforeEach(function () {
					jasmine.clock().install();
				});

				afterEach(function () {
					jasmine.clock().uninstall();
				});

				it('opens the main menu when input has content', async () => {
					const state = {
						mainMenu: {
							open: false
						},
						media: {
							portrait: true,
							minWidth: true
						}
					};
					const element = await setup(state);
					const input = element.shadowRoot.querySelector('#input');
					const inputFocusButton = element.shadowRoot.querySelector('#inputFocusButton');

					inputFocusButton.click();

					expect(store.getState().mainMenu.open).toBeFalse();

					input.blur();
					input.value = 'foo';
					input.focus();

					expect(store.getState().mainMenu.open).toBeTrue();
				});

				it('hides/shows the mobile header', async () => {
					const state = {
						mainMenu: {
							open: false
						},
						media: {
							portrait: true,
							minWidth: true
						}
					};
					const element = await setup(state);
					const input = element.shadowRoot.querySelector('#input');
					const inputFocusButton = element.shadowRoot.querySelector('#inputFocusButton');

					expect(window.getComputedStyle(element.shadowRoot.querySelector('#headerMobile')).display).toBe('block');

					inputFocusButton.click();

					expect(window.getComputedStyle(element.shadowRoot.querySelector('#headerMobile')).display).toBe('none');

					input.blur();

					jasmine.clock().tick(Header.TIME_INTERVAL_MS + 100);

					expect(window.getComputedStyle(element.shadowRoot.querySelector('#headerMobile')).display).toBe('block');
				});

				it('hides/shows the clear button', async () => {
					const state = {
						mainMenu: {
							open: false
						},
						media: {
							portrait: true,
							minWidth: true
						}
					};
					const element = await setup(state);
					const searchContainerElement = element.shadowRoot.querySelector('.header__search-container');
					const input = element.shadowRoot.querySelector('#input');
					const inputFocusButton = element.shadowRoot.querySelector('#inputFocusButton');
					const clearButton = element.shadowRoot.querySelector('#clear');

					expect(window.getComputedStyle(clearButton).display).toBe('none');
					expect(searchContainerElement.classList.contains('is-clear-visible')).toBeFalse();

					inputFocusButton.click();
					input.value = 'foo';
					input.dispatchEvent(new Event('input'));

					expect(window.getComputedStyle(clearButton).display).toBe('flex');
					expect(searchContainerElement.classList.contains('is-clear-visible')).toBeTrue();

					input.blur();
					jasmine.clock().tick(Header.TIME_INTERVAL_MS + 100);

					expect(window.getComputedStyle(clearButton).display).toBe('none');
					expect(searchContainerElement.classList.contains('is-clear-visible')).toBeFalse();

					inputFocusButton.click();

					expect(window.getComputedStyle(clearButton).display).toBe('flex');
					expect(searchContainerElement.classList.contains('is-clear-visible')).toBeTrue();
				});
			});

			describe('min-width < 80em', () => {
				beforeEach(function () {
					jasmine.clock().install();
				});

				afterEach(function () {
					jasmine.clock().uninstall();
				});

				it('hides/shows the mobile header', async () => {
					const state = {
						mainMenu: {
							open: false
						},
						media: {
							portrait: false,
							minWidth: false
						}
					};
					const element = await setup(state);
					const input = element.shadowRoot.querySelector('#input');

					expect(window.getComputedStyle(element.shadowRoot.querySelector('#headerLogo')).display).toBe('block');

					input.focus();

					expect(window.getComputedStyle(element.shadowRoot.querySelector('#headerLogo')).display).toBe('none');

					input.blur();

					jasmine.clock().tick(Header.TIME_INTERVAL_MS + 100);

					expect(window.getComputedStyle(element.shadowRoot.querySelector('#headerLogo')).display).toBe('block');
				});

				it('hides/shows the clear button', async () => {
					const state = {
						mainMenu: {
							open: false
						},
						media: {
							portrait: false,
							minWidth: false
						}
					};
					const element = await setup(state);
					const searchContainerElement = element.shadowRoot.querySelector('.header__search-container');
					const input = element.shadowRoot.querySelector('#input');
					const inputFocusButton = element.shadowRoot.querySelector('#inputFocusButton');
					const clearButton = element.shadowRoot.querySelector('#clear');

					expect(window.getComputedStyle(element.shadowRoot.querySelector('.header__routing-button')).display).toBe('none');
					expect(window.getComputedStyle(clearButton).display).toBe('none');
					expect(searchContainerElement.classList.contains('is-clear-visible')).toBeFalse();

					inputFocusButton.click();
					input.value = 'foo';
					input.dispatchEvent(new Event('input'));

					expect(window.getComputedStyle(clearButton).display).toBe('flex');
					expect(searchContainerElement.classList.contains('is-clear-visible')).toBeTrue();

					input.blur();
					jasmine.clock().tick(Header.TIME_INTERVAL_MS + 100);

					expect(window.getComputedStyle(clearButton).display).toBe('none');
					expect(searchContainerElement.classList.contains('is-clear-visible')).toBeFalse();

					inputFocusButton.click();

					expect(window.getComputedStyle(clearButton).display).toBe('flex');
					expect(searchContainerElement.classList.contains('is-clear-visible')).toBeTrue();
				});
			});

			it('sets the correct tab index for the search-content-panel', async () => {
				const initialTab = TabIds.MISC;
				const state = {
					mainMenu: {
						open: false,
						tab: initialTab
					},
					media: {
						portrait: true,
						minWidth: true
					}
				};
				const element = await setup(state);
				const inputEl = element.shadowRoot.querySelector('#input');

				inputEl.focus();

				expect(store.getState().mainMenu.tab).toBe(initialTab);

				inputEl.blur();
				inputEl.value = 'foo';
				inputEl.focus();

				expect(store.getState().mainMenu.tab).toBe(TabIds.SEARCH);
			});

			describe('in portrait mode and min-width < 80em', () => {
				beforeEach(function () {
					jasmine.clock().install();
				});

				afterEach(function () {
					jasmine.clock().uninstall();
				});

				it('hide mobile header and show again', async () => {
					const state = {
						media: {
							portrait: true,
							minWidth: false
						}
					};

					const element = await setup(state);

					expect(window.getComputedStyle(element.shadowRoot.querySelector('.header__routing-button')).display).toBe('block');

					const header = element.shadowRoot.querySelector('#headerMobile');
					expect(header.classList.contains('hide')).toBeFalse();
					expect(header.classList.contains('fadein')).toBeFalse();

					element.shadowRoot.querySelector('#input').focus();

					expect(header.classList.contains('hide')).toBeTrue();
					expect(header.classList.contains('fadein')).toBeFalse();

					element.shadowRoot.querySelector('#input').blur();

					expect(header.classList.contains('hide')).toBeTrue();
					expect(header.classList.contains('fadein')).toBeFalse();

					jasmine.clock().tick(Header.TIME_INTERVAL_MS);
					/**
					 * From https://developer.mozilla.org/en-US/docs/Web/API/Window/getComputedStyle:
					 * 'The element.style object should be used to set styles on that element, or inspect styles directly added to it from JavaScript manipulation or the global style attribute.'
					 * --> So we have to test for 'style' here
					 */
					expect(header.classList.contains('hide')).toBeFalse();
					expect(header.classList.contains('fadein')).toBeTrue();
				});
			});

			describe('in landscape mode and min-width < 80em', () => {
				beforeEach(function () {
					jasmine.clock().install();
				});

				afterEach(function () {
					jasmine.clock().uninstall();
				});

				it('hide mobile header and show again', async () => {
					const state = {
						media: {
							portrait: false,
							minWidth: false
						}
					};

					const element = await setup(state);

					expect(window.getComputedStyle(element.shadowRoot.querySelector('.header__routing-button')).display).toBe('none');

					const header = element.shadowRoot.querySelector('#headerMobile');
					const logo = element.shadowRoot.querySelector('#headerLogo');
					expect(header.classList.contains('hide')).toBeFalse();
					expect(header.classList.contains('fadein')).toBeFalse();
					expect(logo.classList.contains('hide')).toBeFalse();
					expect(logo.classList.contains('fadein')).toBeFalse();

					element.shadowRoot.querySelector('#input').focus();

					expect(header.classList.contains('hide')).toBeTrue();
					expect(header.classList.contains('fadein')).toBeFalse();
					expect(logo.classList.contains('hide')).toBeTrue();
					expect(logo.classList.contains('fadein')).toBeFalse();

					element.shadowRoot.querySelector('#input').blur();

					expect(header.classList.contains('hide')).toBeTrue();
					expect(header.classList.contains('fadein')).toBeFalse();
					expect(logo.classList.contains('hide')).toBeTrue();
					expect(logo.classList.contains('fadein')).toBeFalse();

					jasmine.clock().tick(Header.TIME_INTERVAL_MS);
					/**
					 * From https://developer.mozilla.org/en-US/docs/Web/API/Window/getComputedStyle:
					 * 'The element.style object should be used to set styles on that element, or inspect styles directly added to it from JavaScript manipulation or the global style attribute.'
					 * --> So we have to test for 'style' here
					 */
					expect(header.classList.contains('hide')).toBeFalse();
					expect(header.classList.contains('fadein')).toBeTrue();
					expect(logo.classList.contains('hide')).toBeFalse();
					expect(logo.classList.contains('fadein')).toBeTrue();
				});
			});
		});
	});

	describe('when mainMenu.focusSearchField property changes', () => {
		it('sets the focus on the input field', async () => {
			const element = await setup();
			const inputEl = element.shadowRoot.querySelector('#input');

			expect(inputEl.matches(':focus')).toBeFalse();

			focusSearchField();

			expect(inputEl.matches(':focus')).toBeTrue();
		});

		it('does nothing when the mainMenu is closed', async () => {
			const element = await setup({
				mainMenu: {
					open: false
				}
			});
			const inputEl = element.shadowRoot.querySelector('#input');

			expect(inputEl.matches(':focus')).toBeFalse();

			focusSearchField();

			expect(inputEl.matches(':focus')).toBeFalse();
		});
	});

	describe('when network fetching state changes', () => {
		it('runs or pauses the border animation class', async () => {
			const element = await setup();
			expect(
				element.shadowRoot
					.querySelector('.action-button__border.animated-action-button__border')
					.classList.contains('animated-action-button__border__running')
			).toBeFalse();
			setFetching(true);
			expect(
				element.shadowRoot
					.querySelector('.action-button__border.animated-action-button__border')
					.classList.contains('animated-action-button__border__running')
			).toBeTrue();
			setFetching(false);
			expect(
				element.shadowRoot
					.querySelector('.action-button__border.animated-action-button__border')
					.classList.contains('animated-action-button__border__running')
			).toBeFalse();
		});
	});

	describe('when search query state changes', () => {
		it('adopts the states query term', async () => {
			const element = await setup();

			expect(element.shadowRoot.querySelector('#input').getAttribute('value')).toBe('');

			setQuery('foo');

			expect(element.shadowRoot.querySelector('#input').getAttribute('value')).toBe('foo');
		});
	});

	describe('when auth state change', () => {
		it('updates the authButton Button', async () => {
			const element = await setup();

			expect(element.shadowRoot.querySelectorAll('.badge-signed-in')).toHaveSize(0);
			expect(element.shadowRoot.querySelector('.header__logo-badge').innerText).toBe('header_logo_badge');
			expect(element.shadowRoot.querySelectorAll('.badges-signed-in')).toHaveSize(0);
			expect(element.shadowRoot.querySelectorAll('.badges-signed-in-icon')).toHaveSize(0);

			setSignedIn();

			expect(element.shadowRoot.querySelectorAll('.badge-signed-in')).toHaveSize(1);
			expect(element.shadowRoot.querySelector('.header__logo-badge').innerText).toBe(authService.getRoles().join(' '));
			expect(element.shadowRoot.querySelectorAll('.badges-signed-in')).toHaveSize(1);
			expect(element.shadowRoot.querySelectorAll('.badges-signed-in-icon')).toHaveSize(1);

			setSignedOut();

			expect(element.shadowRoot.querySelectorAll('.badge-signed-in')).toHaveSize(0);
			expect(element.shadowRoot.querySelector('.header__logo-badge').innerText).toBe('header_logo_badge');
			expect(element.shadowRoot.querySelectorAll('.badges-signed-in')).toHaveSize(0);
			expect(element.shadowRoot.querySelectorAll('.badges-signed-in-icon')).toHaveSize(0);
		});
	});

	describe('when orientation changes', () => {
		it("adds or removes 'data-register-for-viewport-calc' attribute", async () => {
			const state = {
				media: {
					portrait: false,
					observeResponsiveParameter: true
				}
			};
			const element = await setup(state);

			expect(element.shadowRoot.querySelectorAll(`[${REGISTER_FOR_VIEWPORT_CALCULATION_ATTRIBUTE_NAME}]`)).toHaveSize(0);
			expect(element.shadowRoot.querySelector('.header').hasAttribute(REGISTER_FOR_VIEWPORT_CALCULATION_ATTRIBUTE_NAME)).toBeFalse();

			setIsPortrait(true);

			expect(element.shadowRoot.querySelectorAll(`[${REGISTER_FOR_VIEWPORT_CALCULATION_ATTRIBUTE_NAME}]`)).toHaveSize(1);
			expect(element.shadowRoot.querySelector('.header').hasAttribute(REGISTER_FOR_VIEWPORT_CALCULATION_ATTRIBUTE_NAME)).toBeTrue();

			setIsPortrait(false);

			expect(element.shadowRoot.querySelectorAll(`[${REGISTER_FOR_VIEWPORT_CALCULATION_ATTRIBUTE_NAME}]`)).toHaveSize(0);
			expect(element.shadowRoot.querySelector('.header').hasAttribute(REGISTER_FOR_VIEWPORT_CALCULATION_ATTRIBUTE_NAME)).toBeFalse();
		});
	});
});

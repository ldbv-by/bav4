/* eslint-disable no-undef */
import { Header } from '../../../../src/modules/header/components/Header';
import { createNoInitialStateMainMenuReducer } from '../../../../src/store/mainMenu/mainMenu.reducer';
import { TestUtils } from '../../../test-utils.js';
import { $injector } from '../../../../src/injection';
import { layersReducer, createDefaultLayer } from '../../../../src/store/layers/layers.reducer';
import { networkReducer } from '../../../../src/store/network/network.reducer';
import { setFetching } from '../../../../src/store/network/network.action';
import { searchReducer } from '../../../../src/store/search/search.reducer';
import { EventLike } from '../../../../src/utils/storeUtils';
import { createNoInitialStateMediaReducer } from '../../../../src/store/media/media.reducer';
import { TabIds } from '../../../../src/domain/mainMenu';
import { modalReducer } from '../../../../src/store/modal/modal.reducer';
import { REGISTER_FOR_VIEWPORT_CALCULATION_ATTRIBUTE_NAME, TEST_ID_ATTRIBUTE_NAME } from '../../../../src/utils/markup';
import { setQuery } from '../../../../src/store/search/search.action';
import { setIsPortrait } from '../../../../src/store/media/media.action';

window.customElements.define(Header.tag, Header);

let store;

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
			...state
		};
		store = TestUtils.setupStoreAndDi(initialState, {
			mainMenu: createNoInitialStateMainMenuReducer(),
			modal: modalReducer,
			network: networkReducer,
			layers: layersReducer,
			search: searchReducer,
			media: createNoInitialStateMediaReducer()
		});
		$injector
			.registerSingleton('EnvironmentService', { isEmbedded: () => embed, isStandalone: () => standalone })
			.registerSingleton('TranslationService', { translate: (key) => key });

		return TestUtils.render(Header.tag);
	};

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
				searchTerm: null
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
			expect(window.getComputedStyle(element.shadowRoot.querySelector('.header__logo')).display).toBe('none');
			expect(window.getComputedStyle(element.shadowRoot.querySelector('#headerMobile')).display).toBe('block');
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
			expect(element.shadowRoot.querySelectorAll('.header__modal-button')).toHaveSize(1);
			expect(window.getComputedStyle(element.shadowRoot.querySelector('.header__modal-button')).display).toBe('none');

			expect(element.shadowRoot.querySelectorAll('.header__button-container')).toHaveSize(1);
			expect(element.shadowRoot.querySelector('.header__button-container').children.length).toBe(3);
			expect(element.shadowRoot.querySelector('.header__button-container').children[0].classList.contains('is-active')).toBeTrue();
			expect(element.shadowRoot.querySelector('.header__button-container').children[0].innerText).toBe('header_tab_topics_button');

			expect(element.shadowRoot.querySelector('.header__button-container').children[1].children[0].innerText).toBe('header_tab_maps_button');
			expect(element.shadowRoot.querySelector('.header__button-container').children[1].children[1].innerText).toBe('1');
			expect(element.shadowRoot.querySelector('.header__button-container').children[1].classList.contains('is-active')).toBeFalse();

			expect(element.shadowRoot.querySelector('.header__button-container').children[2].innerText).toBe('header_tab_misc_button');
			expect(element.shadowRoot.querySelector('.header__button-container').children[2].classList.contains('is-active')).toBeFalse();

			expect(element.shadowRoot.querySelector('.header__search').getAttribute('placeholder')).toBe('header_search_placeholder');

			expect(element.shadowRoot.querySelector('.header__logo-badge').innerText).toBe('header_logo_badge');

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

			expect(element.shadowRoot.querySelectorAll('.header.is-open')).toHaveSize(1);
		});

		it('focused menue-button loses the focus after swipe', async () => {
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

	describe('when modal button is clicked', () => {
		it('shows a modal window with the showcase', async () => {
			const element = await setup();

			element.shadowRoot.querySelector('.header__modal-button').click();

			expect(store.getState().modal.data.title).toBe('Showcase');
			//we expect a lit-html TemplateResult as content
			expect(store.getState().modal.data.content.strings[0]).toBe('<ba-showcase></ba-showcase>');
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
			expect(element.shadowRoot.querySelector('.header__button-container').children[1].click());
			expect(store.getState().mainMenu.tab).toBe(TabIds.MAPS);
			expect(element.shadowRoot.querySelector('.header__button-container').children[2].click());
			expect(store.getState().mainMenu.tab).toBe(TabIds.MISC);
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

				const inputElement = element.shadowRoot.querySelector('#input');
				inputElement.value = 'foo';
				inputElement.dispatchEvent(new Event('input'));

				expect(element.shadowRoot.querySelector('.header__search-clear').classList.contains('is-clear-visible')).toBeTrue();

				inputElement.value = '';
				inputElement.dispatchEvent(new Event('input'));

				expect(element.shadowRoot.querySelector('.header__search-clear').classList.contains('is-clear-visible')).toBeFalse();
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

				input.focus();

				expect(store.getState().media.observeResponsiveParameter).toBeFalse();

				input.blur();

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

					input.focus();

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

					expect(window.getComputedStyle(element.shadowRoot.querySelector('#headerMobile')).display).toBe('block');

					input.focus();

					expect(window.getComputedStyle(element.shadowRoot.querySelector('#headerMobile')).display).toBe('none');

					input.blur();

					jasmine.clock().tick(300 + 100);

					expect(window.getComputedStyle(element.shadowRoot.querySelector('#headerMobile')).display).toBe('block');
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

					expect(window.getComputedStyle(element.shadowRoot.querySelector('#headerMobile')).display).toBe('block');

					input.focus();

					expect(window.getComputedStyle(element.shadowRoot.querySelector('#headerMobile')).display).toBe('none');

					input.blur();

					jasmine.clock().tick(300 + 100);

					expect(window.getComputedStyle(element.shadowRoot.querySelector('#headerMobile')).display).toBe('block');
				});
			});

			it('sets the correct tab index for the search-content-panel', async () => {
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
				element.shadowRoot.querySelector('#input').focus();

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

					const container = element.shadowRoot.querySelector('#headerMobile');
					expect(window.getComputedStyle(container).display).toBe('block');
					expect(window.getComputedStyle(container).opacity).toBe('1');
					element.shadowRoot.querySelector('#input').focus();
					expect(window.getComputedStyle(container).display).toBe('none');
					expect(window.getComputedStyle(container).opacity).toBe('0');
					element.shadowRoot.querySelector('#input').blur();
					expect(window.getComputedStyle(container).display).toBe('block');
					expect(window.getComputedStyle(container).opacity).toBe('0');
					jasmine.clock().tick(800);
					/**
					 * From https://developer.mozilla.org/en-US/docs/Web/API/Window/getComputedStyle:
					 * 'The element.style object should be used to set styles on that element, or inspect styles directly added to it from JavaScript manipulation or the global style attribute.'
					 * --> So we have to test for 'style' here
					 */
					expect(container.style.opacity).toBe('1');
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

					const container = element.shadowRoot.querySelector('#headerMobile');
					expect(window.getComputedStyle(container).display).toBe('block');
					expect(window.getComputedStyle(container).opacity).toBe('1');
					element.shadowRoot.querySelector('#input').focus();
					expect(window.getComputedStyle(container).display).toBe('none');
					expect(window.getComputedStyle(container).opacity).toBe('0');
					element.shadowRoot.querySelector('#input').blur();
					expect(window.getComputedStyle(container).display).toBe('block');
					expect(window.getComputedStyle(container).opacity).toBe('0');
					jasmine.clock().tick(800);
					/**
					 * From https://developer.mozilla.org/en-US/docs/Web/API/Window/getComputedStyle:
					 * 'The element.style object should be used to set styles on that element, or inspect styles directly added to it from JavaScript manipulation or the global style attribute.'
					 * --> So we have to test for 'style' here
					 */
					expect(container.style.opacity).toBe('1');
				});
			});
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

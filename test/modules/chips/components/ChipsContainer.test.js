/* eslint-disable no-undef */
import { ChipsContainer } from '../../../../src/modules/chips/components/chipsContainer/ChipsContainer';
import { TestUtils } from '../../../test-utils.js';
import { $injector } from '../../../../src/injection';
import { createNoInitialStateMediaReducer } from '../../../../src/store/media/media.reducer';
import { createNoInitialStateMainMenuReducer } from '../../../../src/store/mainMenu/mainMenu.reducer';
import { chipsReducer } from '../../../../src/store/chips/chips.reducer';
import { setCurrent } from '../../../../src/store/chips/chips.action';
import { modalReducer } from '../../../../src/store/modal/modal.reducer';
import { isTemplateResult } from '../../../../src/utils/checks';

window.customElements.define(ChipsContainer.tag, ChipsContainer);

describe('ChipsContainer', () => {
	const animationTimeout = 200;

	const chipsConfiguration1 = [
		{
			id: 'ID1',
			title: 'Permanent',
			href: 'https://www.one.com',
			permanent: true,
			target: 'modal',
			observer: null,
			style: {
				colorLight: 'colorLight',
				backgroundColorLight: 'backgroundColorLight',
				colorDark: 'colorDark',
				backgroundColorDark: 'backgroundColorDark',
				icon: null
			}
		},
		{
			id: 'ID2',
			title: 'Parameter',
			href: 'https://www.two.com',
			permanent: false,
			target: 'extern',
			observer: null,
			style: {
				colorLight: 'var(--primary-color)',
				backgroundColorLight: 'var(--primary-bg-color)',
				colorDark: 'var(--primary-color)',
				backgroundColorDark: 'var(--primary-bg-color)',
				icon: null
			}
		},
		{
			id: 'ID3',
			title: 'Theme Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy',
			href: 'https://www.three.com',
			permanent: false,
			target: 'extern',
			observer: {
				geoResources: [],
				topics: ['test']
			},
			style: {
				colorLight: 'var(--primary-color)',
				backgroundColorLight: 'var(--primary-bg-color)',
				colorDark: 'var(--primary-color)',
				icon: null
			}
		},
		{
			id: 'ID4',
			title: 'GeoResource',
			href: 'https://www.four.com',
			permanent: false,
			target: 'extern',
			observer: {
				geoResources: ['6f5a389c-4ef3-4b5a-9916-475fd5c5962b', 'd0e7d4ea-62d8-46a0-a54a-09654530beed'],
				topics: []
			},
			style: {
				colorLight: 'black',
				backgroundColorLight: 'red',
				colorDark: 'white',
				backgroundColorDark: 'maroon',
				icon: '<path d="M5 8a1 1 0 1 1-2 0 1 1 0 0 1 2 0zm4 0a1 1 0 1 1-2 0 1 1 0 0 1 2 0zm3 1a1 1 0 1 0 0-2 1 1 0 0 0 0 2z"/>'
			}
		}
	];

	const chipsConfiguration2 = [
		{
			id: 'ID1',
			title: 'Permanent',
			href: 'https://www.one.com',
			permanent: true,
			target: 'modal',
			observer: null,
			style: {
				colorLight: 'var(--primary-color)',
				backgroundColorLight: 'var(--primary-bg-color)',
				colorDark: 'var(--primary-color)',
				backgroundColorDark: 'var(--primary-bg-color)',
				icon: null
			}
		},
		{
			id: 'ID4',
			title: 'GeoResource',
			href: 'https://www.four.com',
			permanent: false,
			target: 'extern',
			observer: {
				geoResources: ['6f5a389c-4ef3-4b5a-9916-475fd5c5962b', 'd0e7d4ea-62d8-46a0-a54a-09654530beed'],
				topics: []
			},
			style: {
				colorLight: 'black',
				backgroundColorLight: 'red',
				colorDark: 'white',
				backgroundColorDark: 'maroon',
				icon: '<path d="M5 8a1 1 0 1 1-2 0 1 1 0 0 1 2 0zm4 0a1 1 0 1 1-2 0 1 1 0 0 1 2 0zm3 1a1 1 0 1 0 0-2 1 1 0 0 0 0 2z"/>'
			}
		}
	];

	let store;

	const setup = (state = {}, config = {}) => {
		const { embed = false, windowMock = window } = config;
		// state of store
		const initialState = {
			chips: { current: [] },
			media: {
				portrait: true, //because of safari test bug
				minWidth: false,
				darkSchema: false,
				observeResponsiveParameter: true
			},
			mainMenu: {
				open: true,
				tab: 1
			},
			...state
		};
		store = TestUtils.setupStoreAndDi(initialState, {
			modal: modalReducer,
			media: createNoInitialStateMediaReducer(),
			chips: chipsReducer,
			mainMenu: createNoInitialStateMainMenuReducer()
		});
		$injector.registerSingleton('EnvironmentService', {
			isEmbedded: () => embed,
			getWindow: () => windowMock
		});

		return TestUtils.renderAndLogLifecycle(ChipsContainer.tag);
	};

	describe('constructor', () => {
		it('sets a default model', async () => {
			setup();
			const element = new ChipsContainer();

			expect(element.getModel()).toEqual({
				isPortrait: false,
				hasMinWidth: false,
				isDarkSchema: false,
				isOpen: false,
				currentChips: []
			});
		});
	});

	describe('when instantiated', () => {
		it('renders nothing when embedded', async () => {
			const element = await setup({}, { embed: true });

			expect(element.shadowRoot.children.length).toBe(0);
		});

		it('adds css class reflecting an open menu', async () => {
			const element = await setup({ media: { portrait: false } });

			expect(element.shadowRoot.querySelectorAll('.chips__button')).toHaveSize(0);
			expect(element.shadowRoot.querySelectorAll('.is-open')).toHaveSize(1);
		});

		it('adds css class reflecting a closed menu', async () => {
			const element = await setup({ mainMenu: { open: false } });

			expect(element.shadowRoot.querySelectorAll('.chips__button')).toHaveSize(0);
			expect(element.shadowRoot.querySelectorAll('.is-open')).toHaveSize(0);
		});

		it('adds css classes reflecting the light schema', async () => {
			const chipId0 = 'id0';
			const chipId1 = 'id01';
			const chipConfiguration = [
				{
					id: chipId0,
					title: 'Permanent',
					href: 'https://www.one.com',
					permanent: true,
					target: 'modal',
					observer: null,
					style: {
						colorLight: 'colorLight',
						backgroundColorLight: 'backgroundColorLight',
						colorDark: 'colorDark',
						backgroundColorDark: 'backgroundColorDark',
						icon: null
					}
				},
				{
					id: chipId1,
					title: 'Parameter',
					href: 'https://www.two.com',
					permanent: false,
					target: 'extern',
					observer: null,
					style: {
						colorLight: 'colorLight',
						backgroundColorLight: 'backgroundColorLight',
						colorDark: 'colorDark',
						backgroundColorDark: 'backgroundColorDark',
						icon: null
					}
				}
			];

			const element = await setup({ chips: { current: chipConfiguration } });
			const container = element.shadowRoot.querySelectorAll('#chipscontainer')[0];
			const chips = element.shadowRoot.querySelectorAll('.chips__button');
			expect(chips).toHaveSize(2);

			const chip0 = container.querySelectorAll(`.chips__${chipId0}`)[0];
			expect(window.getComputedStyle(chip0).getPropertyValue('--chip-color').trim()).toBe('colorLight');
			expect(window.getComputedStyle(chip0).getPropertyValue('--chip-background-color').trim()).toBe('backgroundColorLight');
			const chip1 = container.querySelectorAll(`.chips__${chipId1}`)[0];
			expect(window.getComputedStyle(chip1).getPropertyValue('--chip-color').trim()).toBe('colorLight');
			expect(window.getComputedStyle(chip1).getPropertyValue('--chip-background-color').trim()).toBe('backgroundColorLight');
		});

		it('adds css classes reflecting the dark schema', async () => {
			const chipId0 = 'id0';
			const chipId1 = 'id01';
			const chipConfiguration = [
				{
					id: chipId0,
					title: 'Permanent',
					href: 'https://www.one.com',
					permanent: true,
					target: 'modal',
					observer: null,
					style: {
						colorLight: 'colorLight',
						backgroundColorLight: 'backgroundColorLight',
						colorDark: 'colorDark',
						backgroundColorDark: 'backgroundColorDark',
						icon: null
					}
				},
				{
					id: chipId1,
					title: 'Parameter',
					href: 'https://www.two.com',
					permanent: false,
					target: 'extern',
					observer: null,
					style: {
						colorLight: 'colorLight',
						backgroundColorLight: 'backgroundColorLight',
						colorDark: 'colorDark',
						backgroundColorDark: 'backgroundColorDark',
						icon: null
					}
				}
			];

			const element = await setup({
				chips: { current: chipConfiguration },
				media: {
					darkSchema: true
				}
			});
			const container = element.shadowRoot.querySelectorAll('#chipscontainer')[0];
			const chips = element.shadowRoot.querySelectorAll('.chips__button');
			expect(chips).toHaveSize(2);

			const chip0 = container.querySelectorAll(`.chips__${chipId0}`)[0];
			expect(window.getComputedStyle(chip0).getPropertyValue('--chip-color').trim()).toBe('colorDark');
			expect(window.getComputedStyle(chip0).getPropertyValue('--chip-background-color').trim()).toBe('backgroundColorDark');
			const chip1 = container.querySelectorAll(`.chips__${chipId1}`)[0];
			expect(window.getComputedStyle(chip1).getPropertyValue('--chip-color').trim()).toBe('colorDark');
			expect(window.getComputedStyle(chip1).getPropertyValue('--chip-background-color').trim()).toBe('backgroundColorDark');
		});

		it('renders 4 chips', async () => {
			const element = await setup({ chips: { current: chipsConfiguration1 } });
			expect(element.shadowRoot.querySelectorAll('#chipscontainer')).toHaveSize(1);

			const scrollButtons = element.shadowRoot.querySelectorAll('.chips__scroll-button');
			expect(scrollButtons).toHaveSize(2);

			expect(element.shadowRoot.querySelectorAll('.chips__button')).toHaveSize(4);
			expect(element.shadowRoot.querySelectorAll('button.chips__button')).toHaveSize(1);
			expect(element.shadowRoot.querySelectorAll('a.chips__button')).toHaveSize(3);
			expect(element.shadowRoot.querySelectorAll('.chips__icon')).toHaveSize(1);

			const chips = element.shadowRoot.querySelectorAll('.chips__button');
			expect(chips).toHaveSize(4);

			expect(chips[0].classList.contains('chips__ID1')).toBeTrue();
			expect(chips[0].querySelector('.chips__button-text').innerText).toEqual('Permanent');

			expect(chips[1].classList.contains('chips__ID2')).toBeTrue();
			expect(chips[1].href).toEqual('https://www.two.com/');
			expect(chips[1].target).toEqual('_blank');
			expect(chips[1].querySelector('.chips__button-text').innerText).toEqual('Parameter');

			expect(chips[2].classList.contains('chips__ID3')).toBeTrue();
			expect(chips[2].href).toEqual('https://www.three.com/');
			expect(chips[2].target).toEqual('_blank');
			expect(chips[2].querySelector('.chips__button-text').innerText).toEqual(
				'Theme Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy'
			);

			expect(chips[3].classList.contains('chips__ID4')).toBeTrue();
			expect(chips[3].href).toEqual('https://www.four.com/');
			expect(chips[3].target).toEqual('_blank');
			expect(chips[3].querySelectorAll('svg path')[0].getAttribute('d')).toBe(
				'M5 8a1 1 0 1 1-2 0 1 1 0 0 1 2 0zm4 0a1 1 0 1 1-2 0 1 1 0 0 1 2 0zm3 1a1 1 0 1 0 0-2 1 1 0 0 0 0 2z'
			);
		});

		it('does not show scroll buttons', async () => {
			const element = await setup();
			const container = element.shadowRoot.querySelectorAll('#chipscontainer')[0];
			const scrollButton = element.shadowRoot.querySelectorAll('.chips__scroll-button');

			expect(container.classList.contains('show')).toBeFalse();
			expect(scrollButton).toHaveSize(2);
			expect(window.getComputedStyle(scrollButton[0]).display).toBe('none');
			expect(window.getComputedStyle(scrollButton[1]).display).toBe('none');
		});

		it('shows two scroll buttons on shortage of space', async () => {
			const element = await setup({ chips: { current: chipsConfiguration1 } });
			const container = element.shadowRoot.querySelectorAll('#chipscontainer')[0];

			// let's make the scroll buttons visible by minimizing the containers width
			container.style.width = '1px';
			await TestUtils.timeout(animationTimeout /** give the browser some time */);

			expect(container.classList.contains('show')).toBeTrue();
			const scrollButton = element.shadowRoot.querySelectorAll('.chips__scroll-button');
			expect(scrollButton).toHaveSize(2);
			expect(window.getComputedStyle(scrollButton[0]).display).toBe('block');
			expect(window.getComputedStyle(scrollButton[1]).display).toBe('block');
		});

		it('contains only non-draggable chips', async () => {
			const element = await setup({ chips: { current: chipsConfiguration1 } });
			const chips = element.shadowRoot.querySelectorAll('.chips__button');

			expect([...chips].every((e) => e.draggable === false)).toBeTrue();
		});
	});

	describe('when disconnected', () => {
		it('removes all observers', async () => {
			class ResizeObserver {
				observe() {}

				disconnect() {}
			}
			const windowMock = {
				ResizeObserver
			};
			const element = await setup({}, { windowMock: windowMock });
			const spy = spyOn(element._resizeObserver, 'disconnect');

			element.onDisconnect(); // we have to call onDisconnect manually
			expect(spy).toHaveBeenCalled();
		});
	});

	describe('when chips state change', () => {
		it('updates the displayed chips', async () => {
			const element = await setup({ chips: { current: chipsConfiguration1 } });

			expect(element.shadowRoot.querySelectorAll('#chipscontainer')).toHaveSize(1);
			expect(element.shadowRoot.querySelectorAll('.chips__scroll-button')).toHaveSize(2);
			expect(element.shadowRoot.querySelectorAll('.chips__button')).toHaveSize(4);
			expect(element.shadowRoot.querySelectorAll('button.chips__button')).toHaveSize(1);
			expect(element.shadowRoot.querySelectorAll('a.chips__button')).toHaveSize(3);
			expect(element.shadowRoot.querySelectorAll('.chips__icon')).toHaveSize(1);

			const chips = element.shadowRoot.querySelectorAll('.chips__button');
			expect(chips.length).toBe(4);

			expect(chips[0].classList.contains('chips__ID1')).toBeTrue();
			expect(chips[0].querySelector('.chips__button-text').innerText).toEqual('Permanent');

			expect(chips[1].classList.contains('chips__ID2')).toBeTrue();
			expect(chips[1].href).toEqual('https://www.two.com/');
			expect(chips[1].target).toEqual('_blank');
			expect(chips[1].querySelector('.chips__button-text').innerText).toEqual('Parameter');

			expect(chips[2].classList.contains('chips__ID3')).toBeTrue();
			expect(chips[2].href).toEqual('https://www.three.com/');
			expect(chips[2].target).toEqual('_blank');
			expect(chips[2].querySelector('.chips__button-text').innerText).toEqual(
				'Theme Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy'
			);

			expect(chips[3].classList.contains('chips__ID4')).toBeTrue();
			expect(chips[3].href).toEqual('https://www.four.com/');
			expect(chips[3].target).toEqual('_blank');

			setCurrent(chipsConfiguration2);

			expect(element.shadowRoot.querySelectorAll('.chips__button')).toHaveSize(2);
			expect(element.shadowRoot.querySelectorAll('button.chips__button')).toHaveSize(1);
			expect(element.shadowRoot.querySelectorAll('a.chips__button')).toHaveSize(1);
			expect(element.shadowRoot.querySelectorAll('.chips__icon')).toHaveSize(1);

			const chipsNew = element.shadowRoot.querySelectorAll('.chips__button');
			expect(chipsNew.length).toBe(2);

			expect(chipsNew[0].classList.contains('chips__ID1')).toBeTrue();
			expect(chipsNew[0].querySelector('.chips__button-text').innerText).toEqual('Permanent');

			expect(chipsNew[1].classList.contains('chips__ID4')).toBeTrue();
			expect(chipsNew[1].querySelector('.chips__button-text').innerText).toEqual('GeoResource');
			expect(chipsNew[1].href).toEqual('https://www.four.com/');
			expect(chipsNew[1].target).toEqual('_blank');
		});
	});

	describe('when modal button is clicked', () => {
		it('shows a modal window containing a iframe with content', async () => {
			const element = await setup({ chips: { current: chipsConfiguration1 } });

			const chips = element.shadowRoot.querySelectorAll('.chips__button');
			expect(store.getState().modal.data).toBeUndefined;

			chips[0].click();

			expect(store.getState().modal.data.title).toBe('Permanent');
			expect(isTemplateResult(store.getState().modal.data.content)).toBeTrue();

			const contentElement = TestUtils.renderTemplateResult(store.getState().modal.data.content);
			expect(contentElement.querySelector('iframe').getAttribute('allowfullscreen')).toBe('true');
			expect(contentElement.querySelector('iframe').getAttribute('webkitallowfullscreen')).toBe('true');
			expect(contentElement.querySelector('iframe').getAttribute('mozallowfullscreen')).toBe('true');
			expect(contentElement.querySelector('iframe').src).toBe('https://www.one.com/');
			expect(contentElement.querySelector('iframe').title).toBe('Permanent');
		});
	});

	describe('when scroll buttons are clicked', () => {
		const greaterThan = (number) => {
			return {
				asymmetricMatch: function (compareTo) {
					return compareTo > number;
				},

				jasmineToString: function () {
					return '<greater then: ' + number + '>';
				}
			};
		};

		const lessThan = (number) => {
			return {
				asymmetricMatch: function (compareTo) {
					return compareTo < number;
				},

				jasmineToString: function () {
					return '<greater then: ' + number + '>';
				}
			};
		};

		it('scrolls the container in the right and in the left direction', async () => {
			const element = await setup({ chips: { current: chipsConfiguration1 } });
			const container = element.shadowRoot.querySelectorAll('#chipscontainer')[0];
			// let's make the scroll buttons visible by minimizing the containers width
			container.style.width = '1px';

			// fake the property and use a spy to observe the relative left/right changes
			const scrollLeftSpy = spyOnProperty(container, 'scrollLeft', 'set').and.callThrough();
			spyOnProperty(container, 'scrollLeft', 'get').and.returnValue(0);

			await TestUtils.timeout(animationTimeout /** give the browser some time */);
			expect(container.classList.contains('show')).toBeTrue();
			const scrollButton = element.shadowRoot.querySelectorAll('.chips__scroll-button');
			// scroll right
			scrollButton[1].click();

			expect(scrollLeftSpy).toHaveBeenCalledWith(greaterThan(0));
			scrollLeftSpy.calls.reset();

			// scroll left
			scrollButton[0].click();

			expect(scrollLeftSpy).toHaveBeenCalledWith(lessThan(0));
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
			expect(element.shadowRoot.querySelectorAll('.is-portrait')).toHaveSize(0);
			expect(element.shadowRoot.querySelectorAll('.is-desktop')).toHaveSize(1);
			expect(element.shadowRoot.querySelectorAll('.is-tablet')).toHaveSize(0);
			expect(window.getComputedStyle(element.shadowRoot.querySelector('#chipscontainer')).top).toBe('8px');
		});

		it('layouts for portrait and width >= 80em', async () => {
			const state = {
				media: {
					portrait: true,
					minWidth: true
				}
			};

			const element = await setup(state);

			expect(element.shadowRoot.querySelectorAll('.is-landscape')).toHaveSize(0);
			expect(element.shadowRoot.querySelectorAll('.is-portrait')).toHaveSize(1);
			expect(element.shadowRoot.querySelectorAll('.is-desktop')).toHaveSize(1);
			expect(element.shadowRoot.querySelectorAll('.is-tablet')).toHaveSize(0);
			expect(window.getComputedStyle(element.shadowRoot.querySelector('#chipscontainer')).top).toBe('128px');
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
			expect(element.shadowRoot.querySelectorAll('.is-portrait')).toHaveSize(0);
			expect(element.shadowRoot.querySelectorAll('.is-desktop')).toHaveSize(0);
			expect(element.shadowRoot.querySelectorAll('.is-tablet')).toHaveSize(1);
			expect(window.getComputedStyle(element.shadowRoot.querySelector('#chipscontainer')).top).toBe('8px');
		});

		it('layouts for portrait and layouts for width < 80em', async () => {
			const state = {
				media: {
					portrait: true,
					minWidth: false
				}
			};

			const element = await setup(state);

			expect(element.shadowRoot.querySelectorAll('.is-landscape')).toHaveSize(0);
			expect(element.shadowRoot.querySelectorAll('.is-portrait')).toHaveSize(1);
			expect(element.shadowRoot.querySelectorAll('.is-desktop')).toHaveSize(0);
			expect(element.shadowRoot.querySelectorAll('.is-tablet')).toHaveSize(1);
			expect(window.getComputedStyle(element.shadowRoot.querySelector('#chipscontainer')).top).toBe('128px');
		});
	});
});

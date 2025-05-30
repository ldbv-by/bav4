/* eslint-disable no-undef */
import { ChipsContainer } from '../../../../src/modules/chips/components/chipsContainer/ChipsContainer';
import { TestUtils } from '../../../test-utils.js';
import { $injector } from '../../../../src/injection';
import { createNoInitialStateMediaReducer } from '../../../../src/store/media/media.reducer';
import { createNoInitialStateMainMenuReducer } from '../../../../src/store/mainMenu/mainMenu.reducer';
import { chipsReducer } from '../../../../src/store/chips/chips.reducer';
import { createNoInitialStateNavigationRailReducer } from '../../../../src/store/navigationRail/navigationRail.reducer';
import { setCurrent } from '../../../../src/store/chips/chips.action';
import { modalReducer } from '../../../../src/store/modal/modal.reducer';
import { isTemplateResult } from '../../../../src/utils/checks';
import { layersReducer } from '../../../../src/store/layers/layers.reducer';

window.customElements.define(ChipsContainer.tag, ChipsContainer);

describe('ChipsContainer', () => {
	const geoResourceId1 = 'geoResourceId1';
	const geoResourceId2 = 'geoResourceId2';

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
		},
		{
			id: 'ID5',
			title: 'Internal',
			href: geoResourceId1,
			permanent: true,
			target: 'internal',
			observer: {
				geoResources: [],
				topics: []
			},
			style: {
				colorLight: 'black',
				backgroundColorLight: 'red',
				colorDark: 'white',
				backgroundColorDark: 'maroon',
				icon: ''
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
		},
		{
			id: 'ID5',
			title: 'Internal',
			href: geoResourceId1 + ',' + geoResourceId2,
			permanent: true,
			target: 'internal',
			observer: {
				geoResources: [],
				topics: []
			},
			style: {
				colorLight: 'black',
				backgroundColorLight: 'red',
				colorDark: 'white',
				backgroundColorDark: 'maroon',
				icon: ''
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
			navigationRail: {
				open: false
			},
			layers: {
				active: []
			},
			...state
		};
		store = TestUtils.setupStoreAndDi(initialState, {
			modal: modalReducer,
			media: createNoInitialStateMediaReducer(),
			chips: chipsReducer,
			navigationRail: createNoInitialStateNavigationRailReducer(),
			mainMenu: createNoInitialStateMainMenuReducer(),
			layers: layersReducer
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
				isOpenNavigationRail: false,
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
			expect(element.shadowRoot.querySelectorAll('.is-open-navigationRail')).toHaveSize(0);
		});

		it('adds css class reflecting a closed menu', async () => {
			const element = await setup({ mainMenu: { open: false } });

			expect(element.shadowRoot.querySelectorAll('.chips__button')).toHaveSize(0);
			expect(element.shadowRoot.querySelectorAll('.is-open')).toHaveSize(0);
			expect(element.shadowRoot.querySelectorAll('.is-open-navigationRail')).toHaveSize(0);
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

		it('renders 5 chips', async () => {
			const element = await setup({ chips: { current: chipsConfiguration1 } });
			expect(element.shadowRoot.querySelectorAll('#chipscontainer')).toHaveSize(1);

			expect(element.shadowRoot.querySelectorAll('.chips__button')).toHaveSize(5);
			expect(element.shadowRoot.querySelectorAll('button.chips__button')).toHaveSize(2);
			expect(element.shadowRoot.querySelectorAll('a.chips__button')).toHaveSize(3);
			expect(element.shadowRoot.querySelectorAll('.chips__icon')).toHaveSize(1);

			const chips = element.shadowRoot.querySelectorAll('.chips__button');
			expect(chips).toHaveSize(5);

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

			expect(chips[4].classList.contains('chips__ID5')).toBeTrue();
			expect(chips[4].querySelector('.chips__button-text').innerText).toEqual('Internal');
		});

		it('contains only non-draggable chips', async () => {
			const element = await setup({ chips: { current: chipsConfiguration1 } });
			const chips = element.shadowRoot.querySelectorAll('.chips__button');

			expect([...chips].every((e) => e.draggable === false)).toBeTrue();
		});

		it('layouts with open navigation rail for portrait mode', async () => {
			const state = {
				media: {
					portrait: true,
					minWidth: false
				},
				navigationRail: {
					open: true
				}
			};

			const element = await setup(state);
			expect(element.shadowRoot.querySelectorAll('.is-open-navigationRail')).toHaveSize(0);
		});

		it('layouts open navigation rail for landscape mode', async () => {
			const state = {
				media: {
					portrait: false,
					minWidth: true
				},
				navigationRail: {
					open: true
				}
			};
			const element = await setup(state);
			expect(element.shadowRoot.querySelectorAll('.is-open-navigationRail')).toHaveSize(1);
		});
	});

	describe('when chips state change', () => {
		it('updates the displayed chips', async () => {
			const element = await setup({ chips: { current: chipsConfiguration1 } });

			expect(element.shadowRoot.querySelectorAll('#chipscontainer')).toHaveSize(1);
			expect(element.shadowRoot.querySelectorAll('.chips__button')).toHaveSize(5);
			expect(element.shadowRoot.querySelectorAll('button.chips__button')).toHaveSize(2);
			expect(element.shadowRoot.querySelectorAll('a.chips__button')).toHaveSize(3);
			expect(element.shadowRoot.querySelectorAll('.chips__icon')).toHaveSize(1);

			const chips = element.shadowRoot.querySelectorAll('.chips__button');
			expect(chips.length).toBe(5);

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

			expect(element.shadowRoot.querySelectorAll('.chips__button')).toHaveSize(3);
			expect(element.shadowRoot.querySelectorAll('button.chips__button')).toHaveSize(2);
			expect(element.shadowRoot.querySelectorAll('a.chips__button')).toHaveSize(1);
			expect(element.shadowRoot.querySelectorAll('.chips__icon')).toHaveSize(1);

			const chipsNew = element.shadowRoot.querySelectorAll('.chips__button');
			expect(chipsNew.length).toBe(3);

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

	describe('when internal button is clicked', () => {
		it('adds a layer', async () => {
			const element = await setup({ chips: { current: chipsConfiguration1 } });

			const chips = element.shadowRoot.querySelectorAll('.chips__button');
			expect(store.getState().layers.active.length).toBe(0);

			chips[4].click();

			expect(store.getState().layers.active.length).toBe(1);
			expect(store.getState().layers.active[0].id.startsWith(geoResourceId1)).toBeTrue();
			expect(store.getState().layers.active[0].geoResourceId).toBe(geoResourceId1);

			chips[4].click();

			expect(store.getState().layers.active.length).toBe(1);
		});

		it('adds two layers', async () => {
			const element = await setup({ chips: { current: chipsConfiguration2 } });

			const chips = element.shadowRoot.querySelectorAll('.chips__button');
			expect(store.getState().layers.active.length).toBe(0);

			chips[2].click();

			expect(store.getState().layers.active.length).toBe(2);
			expect(store.getState().layers.active[0].id.startsWith(geoResourceId1)).toBeTrue();
			expect(store.getState().layers.active[0].geoResourceId).toBe(geoResourceId1);
			expect(store.getState().layers.active[1].id.startsWith(geoResourceId2)).toBeTrue();
			expect(store.getState().layers.active[1].geoResourceId).toBe(geoResourceId2);
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

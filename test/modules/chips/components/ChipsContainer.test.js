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

	const chipsTest1 = [{
		'id': 'ID1',
		'title': 'Permanent',
		'href': 'https://www.one.com',
		'permanent': true,
		'target': 'modal',
		'observer': null,
		'style': {
			'colorLight': 'var(--primary-color)',
			'backgroundColorLight': 'var(--primary-bg-color)',
			'colorDark': 'var(--primary-color)',
			'backgroundColorDark': 'var(--primary-bg-color)',
			'icon': null
		}
	},
	{
		'id': 'ID2',
		'title': 'Parameter',
		'href': 'https://www.tow.com',
		'permanent': false,
		'target': 'extern',
		'observer': null,
		'style': {
			'colorLight': 'var(--primary-color)',
			'backgroundColorLight': 'var(--primary-bg-color)',
			'colorDark': 'var(--primary-color)',
			'backgroundColorDark': 'var(--primary-bg-color)',
			'icon': null
		}
	},
	{
		'id': 'ID3',
		'title': 'Theme Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy',
		'href': 'https://www.three.com',
		'permanent': false,
		'target': 'extern',
		'observer': {
			'geoResources': [
			],
			'topics': [
				'test'
			]
		},
		'style': {
			'colorLight': 'var(--primary-color)',
			'backgroundColorLight': 'var(--primary-bg-color)',
			'colorDark': 'var(--primary-color)',
			'icon': null
		}
	},
	{
		'id': 'ID4',
		'title': 'GeoResource',
		'href': 'https://www.four.com',
		'permanent': false,
		'target': 'extern',
		'observer': {
			'geoResources': [
				'6f5a389c-4ef3-4b5a-9916-475fd5c5962b',
				'd0e7d4ea-62d8-46a0-a54a-09654530beed'
			],
			'topics': [
			]
		},
		'style': {
			'colorLight': 'black',
			'backgroundColorLight': 'red',
			'colorDark': 'white',
			'backgroundColorDark': 'maroon',
			'icon': '<path d="M5 8a1 1 0 1 1-2 0 1 1 0 0 1 2 0zm4 0a1 1 0 1 1-2 0 1 1 0 0 1 2 0zm3 1a1 1 0 1 0 0-2 1 1 0 0 0 0 2z"/>'
		}
	}];

	const chipsTest2 = [{
		'id': 'ID1',
		'title': 'Permanent',
		'href': 'https://www.one.com',
		'permanent': true,
		'target': 'modal',
		'observer': null,
		'style': {
			'colorLight': 'var(--primary-color)',
			'backgroundColorLight': 'var(--primary-bg-color)',
			'colorDark': 'var(--primary-color)',
			'backgroundColorDark': 'var(--primary-bg-color)',
			'icon': null
		}
	},
	{
		'id': 'ID4',
		'title': 'GeoResource',
		'href': 'https://www.four.com',
		'permanent': false,
		'target': 'extern',
		'observer': {
			'geoResources': [
				'6f5a389c-4ef3-4b5a-9916-475fd5c5962b',
				'd0e7d4ea-62d8-46a0-a54a-09654530beed'
			],
			'topics': [
			]
		},
		'style': {
			'colorLight': 'black',
			'backgroundColorLight': 'red',
			'colorDark': 'white',
			'backgroundColorDark': 'maroon',
			'icon': '<path d="M5 8a1 1 0 1 1-2 0 1 1 0 0 1 2 0zm4 0a1 1 0 1 1-2 0 1 1 0 0 1 2 0zm3 1a1 1 0 1 0 0-2 1 1 0 0 0 0 2z"/>'
		}
	}];

	let store;

	const setup = (state = {}, config = {}) => {
		const { embed = false } = config;
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
		$injector
			.registerSingleton('EnvironmentService', { isEmbedded: () => embed });

		return TestUtils.render(ChipsContainer.tag);
	};

	describe('when instantiated', () => {

		it('contains default values in the model', async () => {
			const element = await setup();

			const model = element.getModel();

			expect(model.isPortrait).toBeFalse();
			expect(model.hasMinWidth).toBeTrue();
			expect(model.currentChips.length).toBe(0);
		});

		it('renders the view', async () => {

			const element = await setup();

			expect(element.shadowRoot.querySelectorAll('#chipscontainer')).toHaveSize(1);
			expect(element.shadowRoot.querySelectorAll('.chips__scroll-button')).toHaveSize(2);
			expect(element.shadowRoot.querySelectorAll('.chips__button')).toHaveSize(0);
			expect(element.shadowRoot.querySelectorAll('.is-open')).toHaveSize(1);
		});

		it('renders the view with closed menu', async () => {

			const element = await setup({ mainMenu: { open: false } });

			expect(element.shadowRoot.querySelectorAll('#chipscontainer')).toHaveSize(1);
			expect(element.shadowRoot.querySelectorAll('.chips__scroll-button')).toHaveSize(2);
			expect(element.shadowRoot.querySelectorAll('.chips__button')).toHaveSize(0);
			expect(element.shadowRoot.querySelectorAll('.is-open')).toHaveSize(0);
		});

		fit('with chips', async () => {

			const element = await setup({ chips: { current: chipsTest1 } });

			expect(element.shadowRoot.querySelectorAll('#chipscontainer')).toHaveSize(1);
			expect(element.shadowRoot.querySelectorAll('.chips__scroll-button')).toHaveSize(2);

			expect(element.shadowRoot.querySelectorAll('.chips__button')).toHaveSize(4);
			expect(element.shadowRoot.querySelectorAll('button.chips__button')).toHaveSize(1);
			expect(element.shadowRoot.querySelectorAll('a.chips__button')).toHaveSize(3);
			expect(element.shadowRoot.querySelectorAll('.chips__icon')).toHaveSize(1);

			const chips = element.shadowRoot.querySelectorAll('.chips__button');

			expect(chips[0].classList.contains('chips__ID1')).toBeTrue();
			expect(chips[0].querySelector('.chips__button-text').innerText).toEqual('Permanent');

			expect(chips[1].classList.contains('chips__ID2')).toBeTrue();
			expect(chips[1].href).toEqual('https://www.tow.com/');
			expect(chips[1].target).toEqual('_blank');
			expect(chips[1].querySelector('.chips__button-text').innerText).toEqual('Parameter');

			expect(chips[2].classList.contains('chips__ID3')).toBeTrue();
			expect(chips[2].href).toEqual('https://www.three.com/');
			expect(chips[2].target).toEqual('_blank');
			expect(chips[2].querySelector('.chips__button-text').innerText).toEqual('Theme Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy');

			expect(chips[3].classList.contains('chips__ID4')).toBeTrue();
			expect(chips[3].href).toEqual('https://www.four.com/');
			expect(chips[3].target).toEqual('_blank');
		});
	});

	describe('when chips state change', () => {

		it('remove tow chips', async () => {
			const element = await setup({ chips: { current: chipsTest1 } });

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
			expect(chips[1].href).toEqual('https://www.tow.com/');
			expect(chips[1].target).toEqual('_blank');
			expect(chips[1].querySelector('.chips__button-text').innerText).toEqual('Parameter');

			expect(chips[2].classList.contains('chips__ID3')).toBeTrue();
			expect(chips[2].href).toEqual('https://www.three.com/');
			expect(chips[2].target).toEqual('_blank');
			expect(chips[2].querySelector('.chips__button-text').innerText).toEqual('Theme Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy');

			expect(chips[3].classList.contains('chips__ID4')).toBeTrue();
			expect(chips[3].href).toEqual('https://www.four.com/');
			expect(chips[3].target).toEqual('_blank');

			setCurrent(chipsTest2);

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
			const element = await setup({ chips: { current: chipsTest1 } });

			const chips = element.shadowRoot.querySelectorAll('.chips__button');
			expect(store.getState().modal.data).toBeUndefined;

			chips[0].click();

			expect(store.getState().modal.data.title).toBe('Permanent');
			expect(isTemplateResult(store.getState().modal.data.content)).toBeTrue();
			//TODO test rendering of TemplateResult

		});
	});

	describe('when scroll button is clicked', () => {

		it(' scroll right and back left', async () => {
			const element = await setup({ media: { portrait: true, minWidth: true, darkSchema: false, observeResponsiveParameter: true }, chips: { current: chipsTest1 } });

			const scrollButton = element.shadowRoot.querySelectorAll('.chips__scroll-button');

			//TODO scrollElement.scrollLeft
			scrollButton[1].click();
			//TODO scrollElement.scrollLeft
			scrollButton[0].click();
			//TODO scrollElement.scrollLeft

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

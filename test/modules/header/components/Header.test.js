/* eslint-disable no-undef */
import { Header } from '../../../../src/modules/header/components/Header';
import { mainMenuReducer } from '../../../../src/modules/menu/store/mainMenu.reducer';
import { modalReducer } from '../../../../src/modules/modal/store/modal.reducer';
import { TestUtils } from '../../../test-utils.js';
import { $injector } from '../../../../src/injection';
import { OlCoordinateService } from '../../../../src/services/OlCoordinateService';
import { layersReducer } from '../../../../src/store/layers/layers.reducer';
import { networkReducer } from '../../../../src/store/network/network.reducer';
import { setFetching } from '../../../../src/store/network/network.action';
import { MainMenuTabIndex } from '../../../../src/modules/menu/components/mainMenu/MainMenu';

window.customElements.define(Header.tag, Header);

let store;


describe('Header', () => {

	const windowMock = {
		matchMedia() { }
	};

	const setup = (config = {}, open = true, tabIndex = 0, fetching = false, layers = ['test']) => {
		const { embed = false } = config;

		const state = {
			mainMenu: {
				open: open,
				tabIndex: tabIndex
			},
			network: {
				fetching: fetching,
				pendingRequests: 0
			},
			layers: {
				active: layers
			}
		};
		store = TestUtils.setupStoreAndDi(state, { mainMenu: mainMenuReducer, modal: modalReducer, network: networkReducer, layers: layersReducer });
		$injector
			.register('CoordinateService', OlCoordinateService)
			.registerSingleton('EnvironmentService', { isEmbedded: () => embed, getWindow: () => windowMock })
			.registerSingleton('SearchResultProviderService', { getLocationSearchResultProvider: () => { } })
			.registerSingleton('TranslationService', { translate: (key) => key });


		return TestUtils.render(Header.tag);
	};

	describe('responsive layout ', () => {

		it('layouts for landscape and width >= 80em', async () => {

			const matchMediaSpy = spyOn(windowMock, 'matchMedia')
				.withArgs('(orientation: portrait)').and.returnValue(TestUtils.newMediaQueryList(false))
				.withArgs('(min-width: 80em)').and.returnValue(TestUtils.newMediaQueryList(true));

			const element = await setup();

			expect(element.shadowRoot.querySelector('.is-landscape')).toBeTruthy();
			expect(element.shadowRoot.querySelector('.is-desktop')).toBeTruthy();
			expect(element.shadowRoot.querySelector('.is-tablet')).toBeFalsy();
			expect(element.shadowRoot.querySelector('.header')).toBeTruthy();
			expect(window.getComputedStyle(element.shadowRoot.querySelector('.header__logo')).display).toBe('block');
			expect(window.getComputedStyle(element.shadowRoot.querySelector('#headerMobile')).display).toBe('none');
			expect(matchMediaSpy).toHaveBeenCalledTimes(2);
		});

		it('layouts for portrait and width >= 80em', async () => {

			const matchMediaSpy = spyOn(windowMock, 'matchMedia')
				.withArgs('(orientation: portrait)').and.returnValue(TestUtils.newMediaQueryList(true))
				.withArgs('(min-width: 80em)').and.returnValue(TestUtils.newMediaQueryList(true));

			const element = await setup();

			expect(element.shadowRoot.querySelector('.is-portrait')).toBeTruthy();
			expect(element.shadowRoot.querySelector('.is-desktop')).toBeTruthy();
			expect(element.shadowRoot.querySelector('.is-tablet')).toBeFalsy();
			expect(element.shadowRoot.querySelector('.header')).toBeTruthy();
			expect(window.getComputedStyle(element.shadowRoot.querySelector('.header__logo')).display).toBe('none');
			expect(window.getComputedStyle(element.shadowRoot.querySelector('#headerMobile')).display).toBe('block');
			expect(matchMediaSpy).toHaveBeenCalledTimes(2);
		});

		it('layouts for landscape and width < 80em', async () => {

			const matchMediaSpy = spyOn(windowMock, 'matchMedia')
				.withArgs('(orientation: portrait)').and.returnValue(TestUtils.newMediaQueryList(false))
				.withArgs('(min-width: 80em)').and.returnValue(TestUtils.newMediaQueryList(false));

			const element = await setup();

			expect(element.shadowRoot.querySelector('.is-landscape')).toBeTruthy();
			expect(element.shadowRoot.querySelector('.is-desktop')).toBeFalsy();
			expect(element.shadowRoot.querySelector('.is-tablet')).toBeTruthy();
			expect(element.shadowRoot.querySelector('.header')).toBeTruthy();
			expect(window.getComputedStyle(element.shadowRoot.querySelector('.header__logo')).display).toBe('none');
			expect(window.getComputedStyle(element.shadowRoot.querySelector('#headerMobile')).display).toBe('block');
			expect(matchMediaSpy).toHaveBeenCalledTimes(2);
		});

		it('layouts for portrait and layouts for width < 80em', async () => {

			const matchMediaSpy = spyOn(windowMock, 'matchMedia')
				.withArgs('(orientation: portrait)').and.returnValue(TestUtils.newMediaQueryList(true))
				.withArgs('(min-width: 80em)').and.returnValue(TestUtils.newMediaQueryList(false));

			const element = await setup();

			expect(element.shadowRoot.querySelector('.is-portrait')).toBeTruthy();
			expect(element.shadowRoot.querySelector('.is-desktop')).toBeFalsy();
			expect(element.shadowRoot.querySelector('.is-tablet')).toBeTruthy();
			expect(element.shadowRoot.querySelector('.header')).toBeTruthy();
			expect(window.getComputedStyle(element.shadowRoot.querySelector('.header__logo')).display).toBe('none');
			expect(window.getComputedStyle(element.shadowRoot.querySelector('#headerMobile')).display).toBe('block');
			expect(matchMediaSpy).toHaveBeenCalledTimes(2);
		});

	});

	describe('when initialized', () => {

		beforeEach(function () {
			spyOn(windowMock, 'matchMedia')
				.withArgs('(orientation: portrait)').and.returnValue(TestUtils.newMediaQueryList(true))
				.withArgs('(min-width: 80em)').and.returnValue(TestUtils.newMediaQueryList(true));
		});

		it('removes a preload css class', async () => {
			const element = await setup();
			expect(element.shadowRoot.querySelector('.preload')).toBeFalsy();
		});

		it('adds header bar', async () => {
			const element = await setup();
			expect(element.shadowRoot.querySelector('.header')).toBeTruthy();
			expect(element.shadowRoot.querySelector('.header__modal-button')).toBeTruthy();

			expect(element.shadowRoot.querySelector('.header__button-container')).toBeTruthy();
			expect(element.shadowRoot.querySelector('.header__button-container').children.length).toBe(3);
			expect(element.shadowRoot.querySelector('.header__button-container').children[0].classList.contains('is-active')).toBeTrue();
			expect(element.shadowRoot.querySelector('.header__button-container').children[0].innerText).toBe('header_tab_topics_button');

			expect(element.shadowRoot.querySelector('.header__button-container').children[1].children[0].innerText).toBe('header_tab_maps_button');
			expect(element.shadowRoot.querySelector('.header__button-container').children[1].children[1].innerText).toBe('1');
			expect(element.shadowRoot.querySelector('.header__button-container').children[1].classList.contains('is-active')).toBeFalse();

			expect(element.shadowRoot.querySelector('.header__button-container').children[2].innerText).toBe('header_tab_more_button');
			expect(element.shadowRoot.querySelector('.header__button-container').children[2].classList.contains('is-active')).toBeFalse();
		});

		it('renders nothing when embedded', async () => {
			const element = await setup({ embed: true });
			expect(element.shadowRoot.children.length).toBe(0);
		});


		it('with 3 active Layers', async () => {
			const element = await setup({}, true, 0, false, ['test', 'test', 'test']);
			expect(element.shadowRoot.querySelector('.header__button-container').children[1].children[1].innerText).toBe('3');
		});

	});

	describe('when menu button clicked', () => {

		beforeEach(function () {
			spyOn(windowMock, 'matchMedia')
				.withArgs('(orientation: portrait)').and.returnValue(TestUtils.newMediaQueryList(true))
				.withArgs('(min-width: 80em)').and.returnValue(TestUtils.newMediaQueryList(true));
		});

		it('updates the store', async () => {
			const element = await setup({ mobile: false }, false);
			expect(store.getState().mainMenu.open).toBe(false);
			element.shadowRoot.querySelector('.header__button-container button:first-child').click();
			expect(store.getState().mainMenu.open).toBe(true);
			element.shadowRoot.querySelector('.header__button-container button:first-child').click();
			expect(store.getState().mainMenu.open).toBe(true);
		});
	});

	describe('when Modalbutton is clicked', () => {

		beforeEach(function () {
			spyOn(windowMock, 'matchMedia')
				.withArgs('(orientation: portrait)').and.returnValue(TestUtils.newMediaQueryList(true))
				.withArgs('(min-width: 80em)').and.returnValue(TestUtils.newMediaQueryList(true));
		});

		it('shows a modal window with the showcase', async () => {
			const element = await setup({ mobile: false });

			element.shadowRoot.querySelector('.header__modal-button').click();

			expect(store.getState().modal.title).toBe('Showcase');
		});
	});

	describe('when menu button is clicked', () => {

		beforeEach(function () {
			spyOn(windowMock, 'matchMedia')
				.withArgs('(orientation: portrait)').and.returnValue(TestUtils.newMediaQueryList(true))
				.withArgs('(min-width: 80em)').and.returnValue(TestUtils.newMediaQueryList(true));
		});

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
			const element = await setup({ mobile: false }, false);
			expect(element.shadowRoot.querySelector('.header__button-container').children[0].click());
			expect(store.getState().mainMenu.tabIndex).toBe(MainMenuTabIndex.TOPICS.id);
			expect(element.shadowRoot.querySelector('.header__button-container').children[1].click());
			expect(store.getState().mainMenu.tabIndex).toBe(MainMenuTabIndex.MAPS.id);
			expect(element.shadowRoot.querySelector('.header__button-container').children[2].click());
			expect(store.getState().mainMenu.tabIndex).toBe(MainMenuTabIndex.MORE.id);
		});

	});

	describe('when search input is focused or blurred ', () => {

		beforeEach(function () {
			jasmine.clock().install();
		});

		afterEach(function () {
			jasmine.clock().uninstall();
		});

		it('sets the correct tab index for the search-content-panel', async () => {
			const matchMediaSpy = spyOn(windowMock, 'matchMedia')
				.withArgs('(orientation: portrait)').and.returnValue(TestUtils.newMediaQueryList(true))
				.withArgs('(min-width: 80em)').and.returnValue(TestUtils.newMediaQueryList(true));

			const element = await setup();
			element.shadowRoot.querySelector('.header__search-container input').focus();

			expect(store.getState().mainMenu.tabIndex).toBe(MainMenuTabIndex.SEARCH.id);
			expect(matchMediaSpy).toHaveBeenCalledTimes(2);
		});

		it('hide mobile header and show again', async () => {
			const matchMediaSpy = spyOn(windowMock, 'matchMedia')
				.withArgs('(orientation: portrait)').and.returnValue(TestUtils.newMediaQueryList(true))
				.withArgs('(min-width: 80em)').and.returnValue(TestUtils.newMediaQueryList(false));

			const element = await setup();

			const container = element.shadowRoot.querySelector('#headerMobile');
			expect(window.getComputedStyle(container).display).toBe('block');
			expect(window.getComputedStyle(container).opacity).toBe('1');
			element.shadowRoot.querySelector('.header__search-container input').focus();
			expect(window.getComputedStyle(container).display).toBe('none');
			expect(window.getComputedStyle(container).opacity).toBe('0');
			element.shadowRoot.querySelector('.header__search-container input').blur();
			expect(window.getComputedStyle(container).display).toBe('block');
			expect(window.getComputedStyle(container).opacity).toBe('0');
			jasmine.clock().tick(800);
			/**
			 * From https://developer.mozilla.org/en-US/docs/Web/API/Window/getComputedStyle:
			 * 'The element.style object should be used to set styles on that element, or inspect styles directly added to it from JavaScript manipulation or the global style attribute.'
			 * --> So we have to test for 'style' here
			 */
			expect(container.style.opacity).toBe('1');

			expect(matchMediaSpy).toHaveBeenCalledTimes(2);
		});
	});

	describe('network fetching state', () => {

		beforeEach(function () {
			spyOn(windowMock, 'matchMedia')
				.withArgs('(orientation: portrait)').and.returnValue(TestUtils.newMediaQueryList(false))
				.withArgs('(min-width: 80em)').and.returnValue(TestUtils.newMediaQueryList(true));
		});

		it('runs or pauses the border animation class', async () => {
			const element = await setup({ mobile: false }, false);
			expect(element.shadowRoot.querySelector('.action-button__border.animated-action-button__border').classList.contains('animated-action-button__border__running')).toBeFalse();
			setFetching(true);
			expect(element.shadowRoot.querySelector('.action-button__border.animated-action-button__border').classList.contains('animated-action-button__border__running')).toBeTrue();
			setFetching(false);
			expect(element.shadowRoot.querySelector('.action-button__border.animated-action-button__border').classList.contains('animated-action-button__border__running')).toBeFalse();
		});
	});
});

/* eslint-disable no-undef */
import { Header } from '../../../../src/modules/header/components/Header';
import { contentPanelReducer } from '../../../../src/modules/menue/store/contentPanel.reducer';
import { modalReducer } from '../../../../src/modules/modal/store/modal.reducer';
import { TestUtils } from '../../../test-utils.js';
import { $injector } from '../../../../src/injection';
import { OlCoordinateService } from '../../../../src/services/OlCoordinateService';

window.customElements.define(Header.tag, Header);

let store;


describe('Header', () => {

	const setup = (config = {}, open = true) => {
		const { embed = false } = config;

		const state = {
			contentPanel: {
				open: open
			},
			modal: { title: false, content: false }
		};
		store = TestUtils.setupStoreAndDi(state, { contentPanel: contentPanelReducer, modal: modalReducer });
		$injector
			.register('CoordinateService', OlCoordinateService)
			.registerSingleton('EnvironmentService', { isEmbedded: () => embed })
			.registerSingleton('SearchResultProviderService', { getLocationSearchResultProvider: () => { } })
			.registerSingleton('TranslationService', { translate: (key) => key });


		return TestUtils.render(Header.tag);
	};

	describe('when initialized', () => {
		it('adds header bar', async () => {
			const element = await setup();
			expect(element.shadowRoot.querySelector('.header')).toBeTruthy();
			expect(element.shadowRoot.querySelector('.header__modal-button')).toBeTruthy();

			expect(element.shadowRoot.querySelector('.header__button-container')).toBeTruthy();
			expect(element.shadowRoot.querySelector('.header__button-container').children.length).toBe(3);
			expect(element.shadowRoot.querySelector('.header__button-container').children[0].innerText).toBe('header_header_topics_button');
			expect(element.shadowRoot.querySelector('.header__button-container').children[1].innerText).toBe('header_header_maps_button');
			expect(element.shadowRoot.querySelector('.header__button-container').children[2].innerText).toBe('header_header_more_button');
		});

		it('renders nothing when embedded', async () => {
			const element = await setup({ embed: true });
			expect(element.shadowRoot.children.length).toBe(0);
		});

		it('layouts for landscape', async () => {

			const matchMediaSpy = spyOn(window, 'matchMedia')
				//mock landscape
				.withArgs('(orientation: portrait)').and.returnValue(TestUtils.newMediaQueryList(false))
				.withArgs('(min-width: 80em)').and.callThrough();

			const element = await setup();
			expect(element.shadowRoot.querySelector('.landscape')).toBeTruthy();
			expect(element.shadowRoot.querySelector('.header')).toBeTruthy();
			expect(window.getComputedStyle(element.shadowRoot.querySelector('.header__logo')).display).toBe('none');
			expect(window.getComputedStyle(element.shadowRoot.querySelector('#headerMobile')).display).toBe('block');
			expect(matchMediaSpy).toHaveBeenCalledTimes(2);
		});

		it('layouts for portrait', async () => {

			const matchMediaSpy = spyOn(window, 'matchMedia')
				//mock  portrait
				.withArgs('(orientation: portrait)').and.returnValue(TestUtils.newMediaQueryList(true))
				.withArgs('(min-width: 80em)').and.callThrough();

			const element = await setup();
			expect(element.shadowRoot.querySelector('.portrait')).toBeTruthy();
			expect(element.shadowRoot.querySelector('.header')).toBeTruthy();
			expect(window.getComputedStyle(element.shadowRoot.querySelector('.header__logo')).display).toBe('none');
			expect(window.getComputedStyle(element.shadowRoot.querySelector('#headerMobile')).display).toBe('block');
			expect(matchMediaSpy).toHaveBeenCalledTimes(2);
		});

		it('layouts for width >= 80em', async () => {

			const matchMediaSpy = spyOn(window, 'matchMedia')

				//mock 
				.withArgs('(orientation: portrait)').and.callThrough()
				.withArgs('(min-width: 80em)').and.returnValue(TestUtils.newMediaQueryList(true));

			const element = await setup();
			expect(element.shadowRoot.querySelector('.is-desktop')).toBeTruthy();
			expect(element.shadowRoot.querySelector('.is-tablet')).toBeFalsy();
			expect(element.shadowRoot.querySelector('.header')).toBeTruthy();
			expect(window.getComputedStyle(element.shadowRoot.querySelector('.header__logo')).display).toBe('block');
			expect(window.getComputedStyle(element.shadowRoot.querySelector('#headerMobile')).display).toBe('none');


			expect(matchMediaSpy).toHaveBeenCalledTimes(2);
		});

		it('layouts for width < 80em', async () => {

			const matchMediaSpy = spyOn(window, 'matchMedia')

				//mock 
				.withArgs('(orientation: portrait)').and.callThrough()
				.withArgs('(min-width: 80em)').and.returnValue(TestUtils.newMediaQueryList(false));

			const element = await setup();
			expect(element.shadowRoot.querySelector('.is-desktop')).toBeFalsy();
			expect(element.shadowRoot.querySelector('.is-tablet')).toBeTruthy();
			expect(element.shadowRoot.querySelector('.header')).toBeTruthy();
			expect(window.getComputedStyle(element.shadowRoot.querySelector('.header__logo')).display).toBe('none');
			expect(window.getComputedStyle(element.shadowRoot.querySelector('#headerMobile')).display).toBe('block');
			expect(matchMediaSpy).toHaveBeenCalledTimes(2);
		});

	});

	describe('when menue button clicked', () => {
		it('it updates the store', async () => {
			const element = await setup({ mobile: false }, false);
			expect(store.getState().contentPanel.open).toBe(false);
			element.shadowRoot.querySelector('.header__button-container button:first-child').click();
			expect(store.getState().contentPanel.open).toBe(true);
			element.shadowRoot.querySelector('.header__button-container button:first-child').click();
			expect(store.getState().contentPanel.open).toBe(true);
		});
	});

	describe('when Modalbutton is clicked', () => {

		it('shows a modal window with the showcase', async () => {
			const element = await setup({ mobile: false });

			element.shadowRoot.querySelector('.header__modal-button').click();

			expect(store.getState().modal.title).toBe('Showcase');
		});
	});
	
	describe('when search is focus blur ', () => {

		beforeEach(function () {
			jasmine.clock().install();
		});
	
		afterEach(function () {
			jasmine.clock().uninstall();
		});
	
		it('hide mobile header and show again', async () => {
			const matchMediaSpy = spyOn(window, 'matchMedia')
	
				//mock 
				.withArgs('(orientation: portrait)').and.callThrough()
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
			//TODO
			// expect(window.getComputedStyle(container).opacity).toBe('1');
	
			expect(matchMediaSpy).toHaveBeenCalledTimes(2);
		});
	});
});

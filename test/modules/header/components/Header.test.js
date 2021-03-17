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

	const setup = (config = {}) => {
		const { embed = false } = config;

		const state = {
			contentPanel: {
				open: false
			},
			modal: { title: false, content: false }
		};
		store = TestUtils.setupStoreAndDi(state, { contentPanel: contentPanelReducer, modal: modalReducer });
		$injector
			.register('CoordinateService', OlCoordinateService)
			.registerSingleton('EnvironmentService', { isEmbedded : () => embed })
			.registerSingleton('SearchResultProviderService', { getLocationSearchResultProvider : () => {} });


		return TestUtils.render(Header.tag);
	};

	describe('when initialized', () => {
		it('adds header bar', async () => {
			const element = await setup();
			expect(element.shadowRoot.querySelector('.header')).toBeTruthy();
			expect(element.shadowRoot.querySelector('.header__button-container')).toBeTruthy();
			expect(element.shadowRoot.querySelector('.header__button-container button:first-child').title).toBe('Open menue');
			expect(element.shadowRoot.querySelector('.header__modal-button')).toBeTruthy();
		});

		it('renders nothing when embedded', async () => {
			const element = await setup({ embed: true });
			expect(element.shadowRoot.children.length).toBe(0);
		});
	});

	describe('when menue button clicked', () => {
		beforeEach(function () {
			jasmine.clock().install();
		});

		afterEach(function () {
			jasmine.clock().uninstall();
		});

		it('it updates the store and title attribute', async () => {
			const element = await setup({ mobile: false });

			expect(element._menueButtonLocked).toBeFalse();

			expect(store.getState().contentPanel.open).toBe(false);
			element.shadowRoot.querySelector('.header__button-container button:first-child').click();
			expect(store.getState().contentPanel.open).toBe(true);
			expect(element._menueButtonLocked).toBeTrue();
			// expect(element.shadowRoot.querySelector('.content').children[0].title).toBe('Close menue');

			// we wait 500ms in order to have an unlocked menue button
			jasmine.clock().tick(500);
			expect(element._menueButtonLocked).toBeFalse();

			element.shadowRoot.querySelector('.header__button-container button:first-child').click();
			expect(store.getState().contentPanel.open).toBe(false);
			// expect(element.shadowRoot.querySelector('.content').children[0].title).toBe('Open menue');
		});
	});

	describe('when Modalbutton is clicked', () => {

		it('shows a modal window with the showcase', async () => {
			const element = await setup({ mobile: false });

			element.shadowRoot.querySelector('.header__modal-button').click();

			expect(store.getState().modal.title).toBe('Showcase');
		});
	});

	it('layouts for landscape', async () => {
						
		const matchMediaSpy = spyOn(window, 'matchMedia')
		//mock landscape
			.withArgs('(orientation: portrait)').and.returnValue(TestUtils.newMediaQueryList(false));
		const element = await setup();
		expect(element.shadowRoot.querySelector('.landscape')).toBeTruthy();
		expect(element.shadowRoot.querySelector('.header')).toBeTruthy();
		expect(matchMediaSpy).toHaveBeenCalledTimes(1);
	});
	
	it('layouts for portrait', async () => {

		const matchMediaSpy = spyOn(window, 'matchMedia')
			//mock  portrait
			.withArgs('(orientation: portrait)').and.returnValue(TestUtils.newMediaQueryList(true));
		const element = await setup();
		expect(element.shadowRoot.querySelector('.portrait')).toBeTruthy();
		expect(element.shadowRoot.querySelector('.header')).toBeTruthy();
		expect(matchMediaSpy).toHaveBeenCalledTimes(1);
	});
	
});

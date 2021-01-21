/* eslint-disable no-undef */
import { render } from 'lit-html';
import { Header } from '../../../../src/modules/header/components/Header';
import { sidePanelReducer } from '../../../../src/modules/menue/store/sidePanel.reducer';
import { mapReducer } from '../../../../src/modules/map/store/olMap.reducer';
import { TestUtils } from '../../../test-utils.js';
import { $injector } from '../../../../src/injection';
import { OlCoordinateService } from '../../../../src/services/OlCoordinateService';

window.customElements.define(Header.tag, Header);

let store;


describe('Header', () => {

	const setup = (config = {}) => {
		const { embed = false } = config;

		const state = {
			sidePanel: {
				open: false
			}
		};
		store = TestUtils.setupStoreAndDi(state, { sidePanel: sidePanelReducer });
		$injector
			.register('CoordinateService', OlCoordinateService)
			.registerSingleton('EnvironmentService', { isEmbedded : () => embed });


		return TestUtils.render(Header.tag);
	};

	describe('when initialized', () => {
		it('adds header bar', async () => {
			const element = await setup();
			expect(element.shadowRoot.querySelector('.header')).toBeTruthy();
			expect(element.shadowRoot.querySelector('.toggle-side-panel')).toBeTruthy();
			expect(element.shadowRoot.querySelector('a').title).toBe('Open menue');
			expect(element.shadowRoot.querySelector('a').children[0].className).toBe('icon toggle-side-panel');
			expect(element.shadowRoot.querySelector('.ci-text')).toBeTruthy();
			expect(element.shadowRoot.querySelector('.ci-logo')).toBeTruthy();
			expect(element.shadowRoot.querySelector('ba-autocomplete-search')).toBeTruthy();
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

			expect(store.getState().sidePanel.open).toBe(false);
			element.shadowRoot.querySelector('.toggle-side-panel').click();
			expect(store.getState().sidePanel.open).toBe(true);
			expect(element._menueButtonLocked).toBeTrue();
			// expect(element.shadowRoot.querySelector('.content').children[0].title).toBe('Close menue');

			// we wait 500ms in order to have an unlocked menue button
			jasmine.clock().tick(500);
			expect(element._menueButtonLocked).toBeFalse();

			element.shadowRoot.querySelector('.toggle-side-panel').click();
			expect(store.getState().sidePanel.open).toBe(false);
			// expect(element.shadowRoot.querySelector('.content').children[0].title).toBe('Open menue');
		});
	});

	describe('when logo is clicked', () => {

		it('shows a modal window with the showcase', async () => {
			const element = await setup({ mobile: false });
			spyOn(element, 'createShowCase');

			element.shadowRoot.querySelector('.ci-logo').click();

			expect(element.createShowCase).toHaveBeenCalled();
		});
	});

	describe('when showcase created', () => {	
		let store;
			
		const extendedSetup = () => {
			const state = {
				mobile: false,
				map: {
					zoom: 10,
					pointerPosition: [1288239.2412306187, 6130212.561641981]
				},
				sidePanel: {
					open: false
				}
			};
			store = TestUtils.setupStoreAndDi(state, { map: mapReducer, sidePanel: sidePanelReducer });
			$injector
				.register('CoordinateService', OlCoordinateService)
				.registerSingleton('EnvironmentService', { isEmbedded : () => false });
			
			
			return TestUtils.render(Header.tag);
		};

		it('adds a div which shows some buttons', async () => {
			const element = await setup({ mobile: false });
			const container = document.createElement('div');
			const showCaseContent = element.createShowCase();
		
			render(showCaseContent, container);

			// try different approaches
			expect(container.querySelectorAll('ba-button').length).toBe(4);
			expect(container.querySelector('.buttons').childElementCount).toBe(4);
			expect(container.querySelector('#button0')).toBeTruthy();
			expect(container.querySelector('#button1')).toBeTruthy();
			expect(container.querySelector('#button2')).toBeTruthy();
			expect(container.querySelector('#button3')).toBeTruthy();
		});

		it('calls the callback, if button0 are clicked', async () => {
			const element = await extendedSetup();			
			const container = document.createElement('div');
			const showCaseContent = element.createShowCase();		

			render(showCaseContent, container);			
			container.querySelector('#button0').click();
			
			expect(store.getState().map.zoom).toBe(13);
		});

		it('calls the callback, if button1 are clicked', async () => {
			const element = await extendedSetup();			
			const container = document.createElement('div');
			const showCaseContent = element.createShowCase();		

			render(showCaseContent, container);			
			container.querySelector('#button1').click();
			
			expect(store.getState().map.zoom).toBe(11);
		});
	});


});

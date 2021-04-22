/* eslint-disable no-undef */

import { MainMenu } from '../../../../../src/modules/menu/components/mainMenu/MainMenu';
import { mainMenuReducer } from '../../../../../src/modules/menu/store/mainMenu.reducer';
import { toggle } from '../../../../../src/modules/menu/store/mainMenu.action';
import { TestUtils } from '../../../../test-utils';
import { $injector } from '../../../../../src/injection';
import { setTabIndex } from '../../../../../src/modules/menu/store/mainMenu.action';

window.customElements.define(MainMenu.tag, MainMenu);


describe('MainMenu', () => {

	const windowMock = {
		matchMedia() { }
	};

	const setup = (config = {}, open = true, tabIndex = 0) => {

		const { embed = false } = config;

		const state = {
			mainMenu: {
				open: open,
				tabIndex: tabIndex
			}
		};
		TestUtils.setupStoreAndDi(state, { mainMenu: mainMenuReducer });
		$injector
			.registerSingleton('EnvironmentService', {
				isEmbedded: () => embed,
				getWindow: () => windowMock
			})
			.registerSingleton('SearchResultProviderService', { getGeoresourceSearchResultProvider: () => { } });

		return TestUtils.render(MainMenu.tag);
	};

	describe('responsive layout ', () => {

		it('layouts for landscape and width >= 80em', async () => {

			const matchMediaSpy = spyOn(windowMock, 'matchMedia')
				.withArgs('(orientation: portrait)').and.returnValue(TestUtils.newMediaQueryList(false))
				.withArgs('(min-width: 80em)').and.returnValue(TestUtils.newMediaQueryList(true));

			const element = await setup();
			
			expect(element.shadowRoot.querySelector('.is-landscape')).toBeTruthy();
			expect(element.shadowRoot.querySelector('.is-desktop')).toBeTruthy();
			expect(element.shadowRoot.querySelector('.main-menu')).toBeTruthy();
			expect(matchMediaSpy).toHaveBeenCalledTimes(2);
		});

		it('layouts for portrait and width >= 80em', async () => {

			const matchMediaSpy = spyOn(windowMock, 'matchMedia')
				.withArgs('(orientation: portrait)').and.returnValue(TestUtils.newMediaQueryList(true))
				.withArgs('(min-width: 80em)').and.returnValue(TestUtils.newMediaQueryList(true));

			const element = await setup();

			expect(element.shadowRoot.querySelector('.is-portrait')).toBeTruthy();
			expect(element.shadowRoot.querySelector('.is-desktop')).toBeTruthy();
			expect(element.shadowRoot.querySelector('.main-menu')).toBeTruthy();
			expect(matchMediaSpy).toHaveBeenCalledTimes(2);
		});

		it('layouts for landscape and width < 80em', async () => {

			const matchMediaSpy = spyOn(windowMock, 'matchMedia')
				.withArgs('(orientation: portrait)').and.returnValue(TestUtils.newMediaQueryList(false))
				.withArgs('(min-width: 80em)').and.returnValue(TestUtils.newMediaQueryList(false));

			const element = await setup();
			
			expect(element.shadowRoot.querySelector('.is-landscape')).toBeTruthy();
			expect(element.shadowRoot.querySelector('.is-tablet')).toBeTruthy();
			expect(element.shadowRoot.querySelector('.main-menu')).toBeTruthy();
			expect(matchMediaSpy).toHaveBeenCalledTimes(2);
		});

		it('layouts for portrait and width < 80em', async () => {

			const matchMediaSpy = spyOn(windowMock, 'matchMedia')
				.withArgs('(orientation: portrait)').and.returnValue(TestUtils.newMediaQueryList(true))
				.withArgs('(min-width: 80em)').and.returnValue(TestUtils.newMediaQueryList(false));

			const element = await setup();

			expect(element.shadowRoot.querySelector('.is-portrait')).toBeTruthy();
			expect(element.shadowRoot.querySelector('.is-tablet')).toBeTruthy();
			expect(element.shadowRoot.querySelector('.main-menu')).toBeTruthy();
			expect(matchMediaSpy).toHaveBeenCalledTimes(2);
		});
	});


	describe('when initialized', () => {

		beforeEach(function () {
			spyOn(windowMock, 'matchMedia')
				.withArgs('(orientation: portrait)').and.returnValue(TestUtils.newMediaQueryList(true))
				.withArgs('(min-width: 80em)').and.returnValue(TestUtils.newMediaQueryList(true));
		});

		it('adds a div which holds the main menu and a close button', async () => {

			const element = await setup();
			expect(element.shadowRoot.querySelector('.main-menu.is-open')).toBeTruthy();
			expect(element.shadowRoot.querySelector('.main-menu__close-button')).toBeTruthy();
		});

		it('adds a container for content and shows demo content', async () => {

			const element = await setup();
			expect(element.shadowRoot.querySelector('.main-menu__container')).toBeTruthy();
			expect(element.shadowRoot.querySelector('.main-menu__container').children.length > 0).toBeTrue();
		});

		it('renders nothing when embedded', async () => {

			const element = await setup({ embed: true });
			expect(element.shadowRoot.children.length).toBe(0);
		});

		it('adds a div which holds the main menu content', async () => {

			const element = await setup();

			// expect(element.shadowRoot.querySelectorAll('.tabcontent')[0].style.display).toBe('block');

			expect(element.shadowRoot.querySelectorAll('.tabcontent').length).toBe(5);

			expect(element.shadowRoot.querySelectorAll('.tabcontent')[0].style.display).toBe('block');
			expect(element.shadowRoot.querySelectorAll('.tabcontent')[1].style.display).toBe('none');
			expect(element.shadowRoot.querySelectorAll('.tabcontent')[2].style.display).toBe('none');
			expect(element.shadowRoot.querySelectorAll('.tabcontent')[3].style.display).toBe('none');
			expect(element.shadowRoot.querySelectorAll('.tabcontent')[4].style.display).toBe('none');

		});


	});

	describe('change tab index', () => {

				
		beforeEach(function () {
			spyOn(windowMock, 'matchMedia')
				.withArgs('(orientation: portrait)').and.returnValue(TestUtils.newMediaQueryList(true))
				.withArgs('(min-width: 80em)').and.returnValue(TestUtils.newMediaQueryList(true));
		});

		it('with init 2', async () => {

			const element = await setup({}, true, 2);
			
			expect(element.shadowRoot.querySelectorAll('.tabcontent').length).toBe(5);
			expect(element.shadowRoot.querySelectorAll('.tabcontent')[0].style.display).toBe('none');
			expect(element.shadowRoot.querySelectorAll('.tabcontent')[1].style.display).toBe('none');
			expect(element.shadowRoot.querySelectorAll('.tabcontent')[2].style.display).toBe('block');
			expect(element.shadowRoot.querySelectorAll('.tabcontent')[3].style.display).toBe('none');
			expect(element.shadowRoot.querySelectorAll('.tabcontent')[4].style.display).toBe('none');
			
		});
		

		it('change tabindex form 0 to 1 to 3 to 0 to 4', async () => {

			const element = await setup();
			expect(element.shadowRoot.querySelectorAll('.tabcontent').length).toBe(5);
			expect(element.shadowRoot.querySelectorAll('.tabcontent')[0].style.display).toBe('block');
			expect(element.shadowRoot.querySelectorAll('.tabcontent')[1].style.display).toBe('none');
			expect(element.shadowRoot.querySelectorAll('.tabcontent')[2].style.display).toBe('none');
			expect(element.shadowRoot.querySelectorAll('.tabcontent')[3].style.display).toBe('none');
			expect(element.shadowRoot.querySelectorAll('.tabcontent')[4].style.display).toBe('none');
			
			setTabIndex(1);
			
			expect(element.shadowRoot.querySelectorAll('.tabcontent').length).toBe(5);
			expect(element.shadowRoot.querySelectorAll('.tabcontent')[0].style.display).toBe('none');
			expect(element.shadowRoot.querySelectorAll('.tabcontent')[1].style.display).toBe('block');
			expect(element.shadowRoot.querySelectorAll('.tabcontent')[2].style.display).toBe('none');
			expect(element.shadowRoot.querySelectorAll('.tabcontent')[3].style.display).toBe('none');
			expect(element.shadowRoot.querySelectorAll('.tabcontent')[4].style.display).toBe('none');

			setTabIndex(3);

			expect(element.shadowRoot.querySelectorAll('.tabcontent').length).toBe(5);
			expect(element.shadowRoot.querySelectorAll('.tabcontent')[0].style.display).toBe('none');
			expect(element.shadowRoot.querySelectorAll('.tabcontent')[1].style.display).toBe('none');
			expect(element.shadowRoot.querySelectorAll('.tabcontent')[2].style.display).toBe('none');
			expect(element.shadowRoot.querySelectorAll('.tabcontent')[3].style.display).toBe('block');
			expect(element.shadowRoot.querySelectorAll('.tabcontent')[4].style.display).toBe('none');

			setTabIndex(0);

			expect(element.shadowRoot.querySelectorAll('.tabcontent').length).toBe(5);
			expect(element.shadowRoot.querySelectorAll('.tabcontent')[0].style.display).toBe('block');
			expect(element.shadowRoot.querySelectorAll('.tabcontent')[1].style.display).toBe('none');
			expect(element.shadowRoot.querySelectorAll('.tabcontent')[2].style.display).toBe('none');
			expect(element.shadowRoot.querySelectorAll('.tabcontent')[3].style.display).toBe('none');
			expect(element.shadowRoot.querySelectorAll('.tabcontent')[4].style.display).toBe('none');

			setTabIndex(4);

			expect(element.shadowRoot.querySelectorAll('.tabcontent').length).toBe(5);
			expect(element.shadowRoot.querySelectorAll('.tabcontent')[0].style.display).toBe('none');
			expect(element.shadowRoot.querySelectorAll('.tabcontent')[1].style.display).toBe('none');
			expect(element.shadowRoot.querySelectorAll('.tabcontent')[2].style.display).toBe('none');
			expect(element.shadowRoot.querySelectorAll('.tabcontent')[3].style.display).toBe('none');
			expect(element.shadowRoot.querySelectorAll('.tabcontent')[4].style.display).toBe('block');
		});


	});
	describe('when close button clicked', () => {
		
		beforeEach(function () {
			spyOn(windowMock, 'matchMedia')
				.withArgs('(orientation: portrait)').and.returnValue(TestUtils.newMediaQueryList(true))
				.withArgs('(min-width: 80em)').and.returnValue(TestUtils.newMediaQueryList(true));
		});

		it('closes the main menu', async () => {

			const element = await setup();

			toggle();

			expect(element.shadowRoot.querySelector('.main-menu.is-open')).toBeNull();
			expect(element.shadowRoot.querySelector('.main-menu__close-button')).toBeTruthy();
		});
	});
});

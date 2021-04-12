/* eslint-disable no-undef */

import { ContentPanel } from '../../../../../src/modules/menu/components/contentPanel/ContentPanel';
import { contentPanelReducer } from '../../../../../src/modules/menu/store/contentPanel.reducer';
import { toggleContentPanel } from '../../../../../src/modules/menu/store/contentPanel.action';
import { TestUtils } from '../../../../test-utils';
import { $injector } from '../../../../../src/injection';
import { setTabIndex } from '../../../../../src/modules/menu/store/contentPanel.action';

window.customElements.define(ContentPanel.tag, ContentPanel);


describe('ContentPanelElement', () => {

	const windowMock = {
		matchMedia() { }
	};

	const setup = (config = {}, open = true, tabIndex = 0) => {

		const { embed = false } = config;

		const state = {
			contentPanel: {
				open: open,
				tabIndex: tabIndex
			}
		};
		TestUtils.setupStoreAndDi(state, { contentPanel: contentPanelReducer });
		$injector
			.registerSingleton('EnvironmentService', {
				isEmbedded: () => embed,
				getWindow: () => windowMock
			})
			.registerSingleton('SearchResultProviderService', { getGeoresourceSearchResultProvider: () => { } });

		return TestUtils.render(ContentPanel.tag);
	};

	describe('responsive layout ', () => {

		it('layouts for landscape and width >= 80em', async () => {

			const matchMediaSpy = spyOn(windowMock, 'matchMedia')
				.withArgs('(orientation: portrait)').and.returnValue(TestUtils.newMediaQueryList(false))
				.withArgs('(min-width: 80em)').and.returnValue(TestUtils.newMediaQueryList(true));

			const element = await setup();
			
			expect(element.shadowRoot.querySelector('.is-landscape')).toBeTruthy();
			expect(element.shadowRoot.querySelector('.is-desktop')).toBeTruthy();
			expect(element.shadowRoot.querySelector('.content-panel')).toBeTruthy();
			expect(matchMediaSpy).toHaveBeenCalledTimes(2);
		});

		it('layouts for portrait and width >= 80em', async () => {

			const matchMediaSpy = spyOn(windowMock, 'matchMedia')
				.withArgs('(orientation: portrait)').and.returnValue(TestUtils.newMediaQueryList(true))
				.withArgs('(min-width: 80em)').and.returnValue(TestUtils.newMediaQueryList(true));

			const element = await setup();

			expect(element.shadowRoot.querySelector('.is-portrait')).toBeTruthy();
			expect(element.shadowRoot.querySelector('.is-desktop')).toBeTruthy();
			expect(element.shadowRoot.querySelector('.content-panel')).toBeTruthy();
			expect(matchMediaSpy).toHaveBeenCalledTimes(2);
		});

		it('layouts for landscape and width < 80em', async () => {

			const matchMediaSpy = spyOn(windowMock, 'matchMedia')
				.withArgs('(orientation: portrait)').and.returnValue(TestUtils.newMediaQueryList(false))
				.withArgs('(min-width: 80em)').and.returnValue(TestUtils.newMediaQueryList(false));

			const element = await setup();
			
			expect(element.shadowRoot.querySelector('.is-landscape')).toBeTruthy();
			expect(element.shadowRoot.querySelector('.is-tablet')).toBeTruthy();
			expect(element.shadowRoot.querySelector('.content-panel')).toBeTruthy();
			expect(matchMediaSpy).toHaveBeenCalledTimes(2);
		});

		it('layouts for portrait and width < 80em', async () => {

			const matchMediaSpy = spyOn(windowMock, 'matchMedia')
				.withArgs('(orientation: portrait)').and.returnValue(TestUtils.newMediaQueryList(true))
				.withArgs('(min-width: 80em)').and.returnValue(TestUtils.newMediaQueryList(false));

			const element = await setup();

			expect(element.shadowRoot.querySelector('.is-portrait')).toBeTruthy();
			expect(element.shadowRoot.querySelector('.is-tablet')).toBeTruthy();
			expect(element.shadowRoot.querySelector('.content-panel')).toBeTruthy();
			expect(matchMediaSpy).toHaveBeenCalledTimes(2);
		});
	});


	describe('when initialized', () => {

		beforeEach(function () {
			spyOn(windowMock, 'matchMedia')
				.withArgs('(orientation: portrait)').and.returnValue(TestUtils.newMediaQueryList(true))
				.withArgs('(min-width: 80em)').and.returnValue(TestUtils.newMediaQueryList(true));
		});

		it('adds a div which holds the contentpanel and a close button', async () => {

			const element = await setup();
			expect(element.shadowRoot.querySelector('.content-panel.is-open')).toBeTruthy();
			expect(element.shadowRoot.querySelector('.content-panel__close-button')).toBeTruthy();
		});

		it('adds a container for content and shows demo content', async () => {

			const element = await setup();
			expect(element.shadowRoot.querySelector('.content-panel__container')).toBeTruthy();
			expect(element.shadowRoot.querySelector('.content-panel__container').children.length > 0).toBeTrue();
		});

		it('renders nothing when embedded', async () => {

			const element = await setup({ embed: true });
			expect(element.shadowRoot.children.length).toBe(0);
		});

		it('adds a div which holds the contentpanel content', async () => {

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

		it('it closes the contentpanel', async () => {

			const element = await setup();

			toggleContentPanel();

			expect(element.shadowRoot.querySelector('.content-panel.is-open')).toBeNull();
			expect(element.shadowRoot.querySelector('.content-panel__close-button')).toBeTruthy();
		});
	});
});

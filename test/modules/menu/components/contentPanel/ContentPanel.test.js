/* eslint-disable no-undef */

import { ContentPanel } from '../../../../../src/modules/menu/components/contentPanel/ContentPanel';
import { contentPanelReducer } from '../../../../../src/modules/menu/store/contentPanel.reducer';
import { toggleContentPanel } from '../../../../../src/modules/menu/store/contentPanel.action';
import { TestUtils } from '../../../../test-utils';
import { $injector } from '../../../../../src/injection';

window.customElements.define(ContentPanel.tag, ContentPanel);


describe('ContentPanelElement', () => {

	const windowMock = {
		matchMedia() { }
	};

	const setup = async (config = {}) => {

		const { embed = false } = config;

		const state = {
			contentPanel: {
				open: true
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

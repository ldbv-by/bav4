/* eslint-disable no-undef */

import { ContentPanel } from '../../../../../src/modules/menue/components/contentPanel/ContentPanel';
import { contentPanelReducer } from '../../../../../src/modules/menue/store/contentPanel.reducer';
import { toggleContentPanel } from '../../../../../src/modules/menue/store/contentPanel.action';
import { TestUtils } from '../../../../test-utils';
import { $injector } from '../../../../../src/injection';

window.customElements.define(ContentPanel.tag, ContentPanel);


describe('ContentPanelElement', () => {

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
				isEmbedded: () => embed
			})
			.registerSingleton('SearchResultProviderService', { getGeoresourceSearchResultProvider: () => { } });
		return TestUtils.render(ContentPanel.tag);
	};


	describe('when initialized', () => {
		it('adds a div which holds the contentpanel and a close button', async () => {

			const element = await setup();
			expect(element.shadowRoot.querySelector('.content-panel.is-open')).toBeTruthy();
			expect(element.shadowRoot.querySelector('.content-panel__close-button')).toBeTruthy();


		});

		it('it closes the contentpanel', async () => {

			const element = await setup();
			expect(element.shadowRoot.querySelector('.content-panel.is-open')).toBeTruthy();
			expect(element.shadowRoot.querySelector('.content-panel__close-button')).toBeTruthy();
			toggleContentPanel();
			expect(element.shadowRoot.querySelector('.content-panel.is-open')).toBeNull();
			expect(element.shadowRoot.querySelector('.content-panel__close-button')).toBeTruthy();

		});

		it('renders nothing when embedded', async () => {
			const element = await setup({ embed: true });
			expect(element.shadowRoot.children.length).toBe(0);
		});



		it('layouts for landscape', async () => {

			const matchMediaSpy = spyOn(window, 'matchMedia')
				//mock portrait
				.withArgs('(orientation: portrait)').and.returnValue(TestUtils.newMediaQueryList(false));
			const element = await setup();
			expect(element.shadowRoot.querySelector('.landscape')).toBeTruthy();
			expect(element.shadowRoot.querySelector('.content-panel')).toBeTruthy();
			expect(matchMediaSpy).toHaveBeenCalledTimes(1);
		});

		it('layouts for portrait', async () => {

			const matchMediaSpy = spyOn(window, 'matchMedia')
				//mock 
				.withArgs('(orientation: portrait)').and.returnValue(TestUtils.newMediaQueryList(true));
			const element = await setup();
			expect(element.shadowRoot.querySelector('.portrait')).toBeTruthy();
			expect(element.shadowRoot.querySelector('.content-panel')).toBeTruthy();
			expect(matchMediaSpy).toHaveBeenCalledTimes(1);
		});



	});
});

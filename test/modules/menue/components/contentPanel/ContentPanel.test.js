/* eslint-disable no-undef */

import { ContentPanel } from '../../../../../src/modules/menue/components/contentPanel/ContentPanel';
import { sidePanelReducer } from '../../../../../src/modules/menue/store/sidePanel.reducer';
import { toggleSidePanel } from '../../../../../src/modules/menue/store/sidePanel.action';
import { TestUtils } from '../../../../test-utils';
import { $injector } from '../../../../../src/injection';

window.customElements.define(ContentPanel.tag, ContentPanel);


describe('ContentPanelElement', () => {


	const setup = async (config) => {

		const { portrait = false, embed = false } = config;

		const state = {
			sidePanel: {
				open: true
			}
		};
		TestUtils.setupStoreAndDi(state, { sidePanel: sidePanelReducer });
		$injector
			.registerSingleton('EnvironmentService', {
				getScreenOrientation: () => {
					return { portrait: portrait };
				},
				isEmbedded: () => embed
			})
			.registerSingleton('SearchResultProviderService', { getGeoresourceSearchResultProvider: () => { } });
		return TestUtils.render(ContentPanel.tag);
	};


	describe('when initialized', () => {
		it('adds a div which holds the contentpanel and a close button', async () => {

			const element = await setup({ portrait: false });
			expect(element.shadowRoot.querySelector('.content-panel.is-open')).toBeTruthy();
			expect(element.shadowRoot.querySelector('.content-panel__close-button')).toBeTruthy();
            
            
		});

		it('it closes the contentpanel', async () => {
            
			const element = await setup({ portrait: false });
			expect(element.shadowRoot.querySelector('.content-panel.is-open')).toBeTruthy();
			expect(element.shadowRoot.querySelector('.content-panel__close-button')).toBeTruthy();
			toggleSidePanel();
			expect(element.shadowRoot.querySelector('.content-panel.is-open')).toBeNull();
			expect(element.shadowRoot.querySelector('.content-panel__close-button')).toBeTruthy();
        
		});

		it('renders nothing when embedded', async () => {
			const element = await setup({ embed: true });
			expect(element.shadowRoot.children.length).toBe(0);
		});

	});
});

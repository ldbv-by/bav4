import { AbstractMvuContentPanel } from '../../../../../../../src/modules/menu/components/mainMenu/content/AbstractMvuContentPanel';
import { BvvMiscContentPanel } from '../../../../../../../src/modules/menu/components/mainMenu/content/misc/BvvMiscContentPanel';
import { ThemeToggle } from '../../../../../../../src/modules/uiTheme/components/toggle/ThemeToggle';
import { TestUtils } from '../../../../../../test-utils';
import { $injector } from '../../../../../../../src/injection';

window.customElements.define(BvvMiscContentPanel.tag, BvvMiscContentPanel);

describe('MiscContentPanel', () => {

	const setup = () => {
		TestUtils.setupStoreAndDi();
		$injector.registerSingleton('TranslationService', { translate: (key) => key });
		return TestUtils.render(BvvMiscContentPanel.tag);
	};

	describe('class', () => {

		it('inherits from AbstractContentPanel', async () => {

			const element = await setup();

			expect(element instanceof AbstractMvuContentPanel).toBeTrue();
		});
	});

	describe('when initialized', () => {

		it('renders the view', async () => {
			const element = await setup();
			expect(element.shadowRoot.querySelectorAll(ThemeToggle.tag)).toHaveSize(1);
		});

		it('checks the list ', async () => {
			const element = await setup();
			expect(element.shadowRoot.querySelectorAll('.ba-list-item__header').length).toBe(3);
			expect(element.shadowRoot.querySelectorAll('a').length).toBe(9);
			expect(element.shadowRoot.querySelectorAll('[href]').length).toBe(9);
		});

		it('checks all links', async () => {
			const element = await setup();

			const links = element.shadowRoot.querySelectorAll('a');

			expect(links[0].href).toEqual('https://www.ldbv.bayern.de/hilfe.html');
			expect(links[0].target).toEqual('_blank');
			expect(links[0].querySelector('.ba-list-item__text').innerText).toEqual('menu_misc_content_panel_help');

			expect(links[1].href).toEqual('https://www.ldbv.bayern.de/service/kontakt.html');
			expect(links[1].target).toEqual('_blank');
			expect(links[1].querySelector('.ba-list-item__text').innerText).toEqual('menu_misc_content_panel_Contact');

			expect(links[2].href).toEqual('https://geoportal.bayern.de/geoportalbayern/seiten/nutzungsbedingungen.html');
			expect(links[2].target).toEqual('_blank');
			expect(links[2].querySelector('.ba-list-item__text').innerText).toEqual('menu_misc_content_panel_terms_of_use');

			expect(links[3].href).toEqual('https://geoportal.bayern.de/geoportalbayern/seiten/datenschutz.html');
			expect(links[3].target).toEqual('_blank');
			expect(links[3].querySelector('.ba-list-item__text').innerText).toEqual('menu_misc_content_panel_privacy_policy');

			expect(links[4].href).toEqual('https://geoportal.bayern.de/geoportalbayern/seiten/impressum.html');
			expect(links[4].target).toEqual('_blank');
			expect(links[4].querySelector('.ba-list-item__text').innerText).toEqual('menu_misc_content_panel_imprint');

			expect(links[5].href).toEqual('https://github.com/ldbv-by/bav4-nomigration');
			expect(links[5].target).toEqual('_blank');
			expect(links[5].querySelector('.ba-list-item__text').innerText).toEqual('menu_misc_content_panel_github');

			expect(links[6].href).toEqual('https://geodatenonline.bayern.de/geodatenonline');
			expect(links[6].target).toEqual('_blank');
			expect(links[6].querySelector('.ba-list-item__primary-text').innerText).toEqual('menu_misc_content_panel_gdo_header');
			expect(links[6].querySelector('.ba-list-item__secondary-text').innerText).toEqual('menu_misc_content_panel_gdo_text');

			expect(links[7].href).toEqual('https://www.geoportal.bayern.de/geoportalbayern');
			expect(links[7].target).toEqual('_blank');
			expect(links[7].querySelector('.ba-list-item__primary-text').innerText).toEqual('menu_misc_content_panel_gp_header');
			expect(links[7].querySelector('.ba-list-item__secondary-text').innerText).toEqual('menu_misc_content_panel_gp_text');

			expect(links[8].href).toEqual('https://www.energieatlas.bayern.de/');
			expect(links[8].target).toEqual('_blank');
			expect(links[8].querySelector('.ba-list-item__primary-text').innerText).toEqual('menu_misc_content_panel_ea_header');
			expect(links[8].querySelector('.ba-list-item__secondary-text').innerText).toEqual('menu_misc_content_panel_ea_text');
		});
	});
});

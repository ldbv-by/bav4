import { AbstractMvuContentPanel } from '../../../../../../../src/modules/menu/components/mainMenu/content/AbstractMvuContentPanel';
import { MiscContentPanel } from '../../../../../../../src/modules/menu/components/mainMenu/content/misc/MiscContentPanel';
import { ThemeToggle } from '../../../../../../../src/modules/uiTheme/components/toggle/ThemeToggle';
import { TestUtils } from '../../../../../../test-utils';
import { $injector } from '../../../../../../../src/injection';

window.customElements.define(MiscContentPanel.tag, MiscContentPanel);

describe('MiscContentPanel', () => {

	const setup = () => {
		TestUtils.setupStoreAndDi();
		$injector.registerSingleton('TranslationService', { translate: (key) => key });
		return TestUtils.render(MiscContentPanel.tag);
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
		});

		it('checks all links', async () => {
			const element = await setup();

			const links = element.shadowRoot.querySelectorAll('a');

			expect(links[0].href).toEqual('https://www.ldbv.bayern.de/hilfe.html');
			expect(links[0].target).toEqual('_blank');

			expect(links[1].href).toEqual('https://www.ldbv.bayern.de/service/kontakt.html');
			expect(links[1].target).toEqual('_blank');

			expect(links[2].href).toEqual('https://geoportal.bayern.de/geoportalbayern/seiten/nutzungsbedingungen.html');
			expect(links[2].target).toEqual('_blank');

			expect(links[3].href).toEqual('https://geoportal.bayern.de/geoportalbayern/seiten/datenschutz.html');
			expect(links[3].target).toEqual('_blank');

			expect(links[4].href).toEqual('https://geoportal.bayern.de/geoportalbayern/seiten/impressum.html');
			expect(links[4].target).toEqual('_blank');

			expect(links[5].href).toEqual('https://github.com/ldbv-by/bav4-nomigration');
			expect(links[5].target).toEqual('_blank');

			expect(links[6].href).toEqual('https://geodatenonline.bayern.de/geodatenonline');
			expect(links[6].target).toEqual('_blank');

			expect(links[7].href).toEqual('https://www.geoportal.bayern.de/geoportalbayern');
			expect(links[7].target).toEqual('_blank');

			expect(links[8].href).toEqual('https://www.geoportal.bayern.de/geoportalbayern');
			expect(links[8].target).toEqual('_blank');
		});
	});
});

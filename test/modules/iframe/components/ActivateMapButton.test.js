/* eslint-disable no-undef */
import { QueryParameters } from '../../../../src/domain/queryParameters';
import { IFrameComponents } from '../../../../src/domain/iframeComponents';
import { $injector } from '../../../../src/injection';
import { ActivateMapButton } from '../../../../src/modules/iframe/components/activateMapButton/ActivateMapButton';
import { OlMap } from '../../../../src/modules/olMap/components/OlMap';
import { TestUtils } from '../../../test-utils';

window.customElements.define(ActivateMapButton.tag, ActivateMapButton);
window.customElements.define(OlMap.tag, OlMap);

describe('ActivateMapButton', () => {
	const windowMock = {
		location: {
			get search() {
				return null;
			}
		}
	};
	const setup = (config) => {
		const { embed } = config;

		TestUtils.setupStoreAndDi();
		$injector
			.registerSingleton('EnvironmentService', { isEmbedded: () => embed, getWindow: () => windowMock })
			.registerSingleton('TranslationService', { translate: (key) => key });
		return TestUtils.render(ActivateMapButton.tag);
	};

	describe('when initialized', () => {
		it('renders Button', async () => {
			const element = await setup({ embed: true });

			expect(element.shadowRoot.styleSheets.length).toBe(2);

			expect(element.shadowRoot.querySelectorAll('.active-map__background')).toHaveSize(1);
			expect(element.shadowRoot.querySelectorAll('.active-map__button')).toHaveSize(1);
			expect(element.shadowRoot.querySelectorAll('ba-button')).toHaveSize(1);
			expect(element.shadowRoot.querySelectorAll('ba-attribution-info')).toHaveSize(1);

			expect(document.querySelectorAll(`#${ActivateMapButton.STYLE_ID}`)).toHaveSize(1);
			expect(document.querySelectorAll(`#${ActivateMapButton.STYLE_ID}`)[0].innerText).toContain(ActivateMapButton.tag);
			expect(document.querySelectorAll(`#${ActivateMapButton.STYLE_ID}`)[0].innerText).toContain(OlMap.tag);
		});

		it('renders nothing when not embedded', async () => {
			const element = await setup({}, { embed: false });

			expect(element.shadowRoot.children.length).toBe(0);
		});

		it('renders nothing when not embedded', async () => {
			const queryParam = `${QueryParameters.IFRAME_COMPONENTS}=${IFrameComponents.HIDE_ACTIVATE_MAP_BUTTON}`;
			spyOnProperty(windowMock.location, 'search').and.returnValue(queryParam);
			const element = await setup({}, { embed: true });

			expect(element.shadowRoot.children.length).toBe(0);
		});

		it('when activate map button clicked', async () => {
			const element = await setup({ embed: true });

			const button = element.shadowRoot.querySelectorAll('ba-button')[0];

			expect(element.shadowRoot.querySelectorAll('.active-map__background')[0].classList.contains('hide')).toBeFalse();
			expect(document.querySelectorAll(`#${ActivateMapButton.STYLE_ID}`)).toHaveSize(1);

			button.click();

			expect(element.shadowRoot.querySelectorAll('.active-map__background')[0].classList.contains('hide')).toBeTrue();
			expect(document.querySelectorAll(`#${ActivateMapButton.STYLE_ID}`)).toHaveSize(0);
		});
	});
});

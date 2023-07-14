/* eslint-disable no-undef */
import { QueryParameters } from '../../../../src/domain/queryParameters';
import { IFrameComponents } from '../../../../src/domain/iframeComponents';
import { $injector } from '../../../../src/injection';
import { ActivateMapButton } from '../../../../src/modules/iframe/components/activateMapButton/ActivateMapButton';
import { OlMap } from '../../../../src/modules/olMap/components/OlMap';
import { Footer } from '../../../../src/modules/footer/components/Footer';
import { TestUtils } from '../../../test-utils';

window.customElements.define(ActivateMapButton.tag, ActivateMapButton);
window.customElements.define(OlMap.tag, OlMap);

describe('ActivateMapButton', () => {
	const environmentServiceMock = {
		isEmbedded: () => {},
		getQueryParams: () => new URLSearchParams()
	};
	const setup = (config) => {
		const { embed } = config;
		environmentServiceMock.isEmbedded = () => embed;
		TestUtils.setupStoreAndDi();
		$injector.registerSingleton('EnvironmentService', environmentServiceMock).registerSingleton('TranslationService', { translate: (key) => key });
		return TestUtils.render(ActivateMapButton.tag);
	};

	describe('when initialized', () => {
		describe("we're NOT embedded", () => {
			it('renders nothing', async () => {
				const element = await setup({ embed: false });

				expect(element.shadowRoot.children.length).toBe(0);
			});
		});

		describe("we're embedded", () => {
			describe('QueryParameters.IFRAME_COMPONENTS includes IFrameComponents.ACTIVATE_MAP_BUTTON', () => {
				it('renders the button', async () => {
					const queryParam = new URLSearchParams(
						`${QueryParameters.IFRAME_COMPONENTS}=${IFrameComponents.ACTIVATE_MAP_BUTTON},${IFrameComponents.DRAW_TOOL}`
					);
					spyOn(environmentServiceMock, 'getQueryParams').and.returnValue(queryParam);
					const element = await setup({ embed: true });

					expect(element.shadowRoot.styleSheets.length).toBe(2);

					expect(element.shadowRoot.querySelectorAll('.active-map__background')).toHaveSize(1);
					expect(element.shadowRoot.querySelectorAll('.active-map__button')).toHaveSize(1);
					expect(element.shadowRoot.querySelectorAll('ba-button')).toHaveSize(1);

					expect(document.querySelectorAll(`#${ActivateMapButton.STYLE_ID}`)).toHaveSize(1);
					expect(document.querySelectorAll(`#${ActivateMapButton.STYLE_ID}`)[0].innerText).toContain(ActivateMapButton.tag);
					expect(document.querySelectorAll(`#${ActivateMapButton.STYLE_ID}`)[0].innerText).toContain(OlMap.tag);
					expect(document.querySelectorAll(`#${ActivateMapButton.STYLE_ID}`)[0].innerText).toContain(Footer.tag);
				});
			});

			describe('QueryParameters.IFRAME_COMPONENTS does NOT include IFrameComponents.ACTIVATE_MAP_BUTTON', () => {
				it('renders nothing', async () => {
					const queryParam = new URLSearchParams(`${QueryParameters.IFRAME_COMPONENTS}=${IFrameComponents.DRAW_TOOL}`);
					spyOn(environmentServiceMock, 'getQueryParams').and.returnValue(queryParam);
					const element = await setup({ embed: true });

					expect(element.shadowRoot.children.length).toBe(0);
				});
			});
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

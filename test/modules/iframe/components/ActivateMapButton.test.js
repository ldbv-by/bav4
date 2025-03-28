/* eslint-disable no-undef */
import { QueryParameters } from '../../../../src/domain/queryParameters';
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
			describe('QueryParameters.EC_MAP_ACTIVATION is present', () => {
				it('renders the button', async () => {
					const queryParam = new URLSearchParams(`${QueryParameters.EC_MAP_ACTIVATION}=''`);
					spyOn(environmentServiceMock, 'getQueryParams').and.returnValue(queryParam);
					const element = await setup({ embed: true });

					expect(element.shadowRoot.styleSheets.length).toBe(2);

					expect(element.shadowRoot.querySelectorAll('.active-map__background')).toHaveSize(1);
					expect(element.shadowRoot.querySelectorAll('.active-map__button')).toHaveSize(1);
					expect(element.shadowRoot.querySelectorAll('ba-button')).toHaveSize(1);

					const button = element.shadowRoot.querySelector('ba-button');
					expect(button.label).toBe('iframe_activate_map_button');
					expect(button.title).toBe('iframe_activate_map_button_title');

					expect(document.querySelectorAll(`#${ActivateMapButton.STYLE_ID}`)).toHaveSize(1);
					expect(document.querySelectorAll(`#${ActivateMapButton.STYLE_ID}`)[0].innerText).toContain(ActivateMapButton.tag);
					expect(document.querySelectorAll(`#${ActivateMapButton.STYLE_ID}`)[0].innerText).toContain(OlMap.tag);
					expect(document.querySelectorAll(`#${ActivateMapButton.STYLE_ID}`)[0].innerText).toContain(Footer.tag);
				});
			});

			describe('QueryParameters.EC_MAP_ACTIVATION is present and has a value other then `false`', () => {
				it('renders the button', async () => {
					const queryParam = new URLSearchParams(`${QueryParameters.EC_MAP_ACTIVATION}=''`);
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

			describe('QueryParameters.EC_MAP_ACTIVATION is not present', () => {
				it('renders nothing', async () => {
					const queryParam = new URLSearchParams();
					spyOn(environmentServiceMock, 'getQueryParams').and.returnValue(queryParam);
					const element = await setup({ embed: true });

					expect(element.shadowRoot.children.length).toBe(0);
				});
			});
			describe('QueryParameters.EC_MAP_ACTIVATION has a value of `false`', () => {
				it('renders nothing', async () => {
					const queryParam = new URLSearchParams(`${QueryParameters.EC_MAP_ACTIVATION}=false`);
					spyOn(environmentServiceMock, 'getQueryParams').and.returnValue(queryParam);
					const element = await setup({ embed: true });

					expect(element.shadowRoot.children.length).toBe(0);
				});
			});
		});

		it('when activate map button clicked', async () => {
			const queryParam = new URLSearchParams(`${QueryParameters.EC_MAP_ACTIVATION}=''`);
			spyOn(environmentServiceMock, 'getQueryParams').and.returnValue(queryParam);
			const element = await setup({ embed: true });
			const removeInertAttr = spyOn(element, '_removeInertAttr');

			const button = element.shadowRoot.querySelectorAll('ba-button')[0];

			expect(element.shadowRoot.querySelectorAll('.active-map__background')[0].classList.contains('hide')).toBeFalse();
			expect(document.querySelectorAll(`#${ActivateMapButton.STYLE_ID}`)).toHaveSize(1);

			button.click();

			expect(element.shadowRoot.querySelectorAll('.active-map__background')[0].classList.contains('hide')).toBeTrue();
			expect(document.querySelectorAll(`#${ActivateMapButton.STYLE_ID}`)).toHaveSize(0);

			expect(removeInertAttr).toHaveBeenCalled();
		});

		describe('_addInertAttr', () => {
			it('adds the inert attribute to the map element', async () => {
				const queryParam = new URLSearchParams(`${QueryParameters.EC_MAP_ACTIVATION}=true`);
				spyOn(environmentServiceMock, 'getQueryParams').and.returnValue(queryParam);
				const element = await setup({ embed: true });

				const mapElement = document.createElement('div');
				mapElement.setAttribute('id', 'ol-map');
				element.shadowRoot.append(mapElement);

				expect(element.shadowRoot.querySelector(`#ol-map`).hasAttribute('inert')).toBeFalse();
				element._addInertAttr();
				expect(element.shadowRoot.querySelector(`#ol-map`).hasAttribute('inert')).toBeTrue();
			});
		});

		describe('_removeInertAttr', () => {
			it('removes the inert attribute to the map element', async () => {
				const queryParam = new URLSearchParams(`${QueryParameters.EC_MAP_ACTIVATION}=true`);
				spyOn(environmentServiceMock, 'getQueryParams').and.returnValue(queryParam);
				const element = await setup({ embed: true });

				const mapElement = document.createElement('div');
				mapElement.setAttribute('id', 'ol-map');
				mapElement.setAttribute('inert', '');
				element.shadowRoot.append(mapElement);

				expect(element.shadowRoot.querySelector(`#ol-map`).hasAttribute('inert')).toBeTrue();
				element._removeInertAttr();
				expect(element.shadowRoot.querySelector(`#ol-map`).hasAttribute('inert')).toBeFalse();
			});
		});
	});
});

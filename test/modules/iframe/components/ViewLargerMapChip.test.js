import { QueryParameters } from '../../../../src/domain/queryParameters';
import { $injector } from '../../../../src/injection';
import { ViewLargerMapChip } from '../../../../src/modules/iframe/components/chips/ViewLargerMapChip';
import { indicateChange } from '../../../../src/store/stateForEncoding/stateForEncoding.action';
import { stateForEncodingReducer } from '../../../../src/store/stateForEncoding/stateForEncoding.reducer';
import { TestUtils } from '../../../test-utils';

window.customElements.define(ViewLargerMapChip.tag, ViewLargerMapChip);

describe('ViewLargerMapChip', () => {
	const shareServiceMock = {
		encodeState: () => {}
	};

	const environmentServiceMock = {
		isEmbedded: () => {},
		getQueryParams: () => new URLSearchParams()
	};

	const setup = async (state = {}, config = {}) => {
		const { embed = true } = config;
		environmentServiceMock.isEmbedded = () => embed;
		TestUtils.setupStoreAndDi(state, { stateForEncoding: stateForEncodingReducer });
		$injector
			.registerSingleton('TranslationService', { translate: (key) => key })
			.registerSingleton('EnvironmentService', environmentServiceMock)
			.registerSingleton('ShareService', shareServiceMock);
		const element = await TestUtils.render(ViewLargerMapChip.tag, config);

		return element;
	};

	describe('when instantiated', () => {
		it('has a model with default values', async () => {
			await setup();
			const model = new ViewLargerMapChip().getModel();

			expect(model).toEqual({
				href: ''
			});
		});
	});

	describe('when initialized', () => {
		it('renders nothing when default mode', async () => {
			const queryParam = new URLSearchParams(`${QueryParameters.EC_LINK_TO_APP}=true`);
			spyOn(environmentServiceMock, 'getQueryParams').and.returnValue(queryParam);
			const element = await setup({}, { embed: false });

			expect(element.shadowRoot.children.length).toBe(0);
		});

		describe('QueryParameters.ACTIVATE_MAP_BUTTON is present and has a value other then `false`', () => {
			it('renders the button', async () => {
				const expectedUrl = 'http://this.is.a.url/?forTestCase';
				const queryParam = new URLSearchParams(`${QueryParameters.EC_LINK_TO_APP}=''`);
				spyOn(environmentServiceMock, 'getQueryParams').and.returnValue(queryParam);
				const shareServiceSpy = spyOn(shareServiceMock, 'encodeState').and.returnValue(expectedUrl);
				const element = await setup({ embed: true });

				expect(element.shadowRoot.styleSheets.length).toBe(2);
				expect(element.shadowRoot.styleSheets[1].cssRules.item(0).cssText).toContain('.chips__icon {');

				expect(element.shadowRoot.querySelectorAll('.chips__button')).toHaveSize(1);
				expect(element.shadowRoot.querySelector('.chips__button').getAttribute('aria-label')).toBe('iframe_view_larger_map_chip');
				const link = element.shadowRoot.querySelectorAll('.chips__button');
				expect(link[0].target).toBe('_blank');

				expect(element.shadowRoot.querySelectorAll('.chips__icon')).toHaveSize(1);
				expect(element.shadowRoot.querySelectorAll('.chips__button-text')).toHaveSize(1);
				expect(element.shadowRoot.querySelectorAll('.chips__icon')).toHaveSize(1);
				expect(shareServiceSpy).toHaveBeenCalled();
			});
		});

		describe('QueryParameters.EC_LINK_TO_APP is not present', () => {
			it('renders nothing', async () => {
				const queryParam = new URLSearchParams();
				spyOn(environmentServiceMock, 'getQueryParams').and.returnValue(queryParam);
				const element = await setup({ embed: true });

				expect(element.shadowRoot.children.length).toBe(0);
			});
		});

		describe('QueryParameters.EC_LINK_TO_APP has a value of `false`', () => {
			it('renders nothing', async () => {
				const queryParam = new URLSearchParams(`${QueryParameters.EC_LINK_TO_APP}=false`);
				spyOn(environmentServiceMock, 'getQueryParams').and.returnValue(queryParam);
				const element = await setup({ embed: true });

				expect(element.shadowRoot.children.length).toBe(0);
			});
		});
	});

	describe('when state changes', () => {
		it('updates the view', async () => {
			const queryParam = new URLSearchParams(`${QueryParameters.EC_LINK_TO_APP}=true`);
			spyOn(environmentServiceMock, 'getQueryParams').and.returnValue(queryParam);
			let count = 0;
			spyOn(shareServiceMock, 'encodeState').and.callFake(() => {
				return `http://this.is.a.url/${count++}`;
			});
			const element = await setup();
			const link = element.shadowRoot.querySelectorAll('.chips__button');
			expect(link[0].href).toBe('http://this.is.a.url/0');

			indicateChange();

			expect(link[0].href).toBe('http://this.is.a.url/1');
		});
	});
});

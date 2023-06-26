import { IFrameComponents } from '../../../../src/domain/iframeComponents';
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
		it('renders the view', async () => {
			const expectedUrl = 'http://this.is.a.url/?forTestCase';
			const shareServiceSpy = spyOn(shareServiceMock, 'encodeState').and.returnValue(expectedUrl);
			const element = await setup();

			expect(element.shadowRoot.styleSheets.length).toBe(2);
			expect(element.shadowRoot.styleSheets[1].cssRules.item(0).cssText).toContain('.chips__icon {');

			expect(element.shadowRoot.querySelectorAll('.chips__button')).toHaveSize(1);
			const link = element.shadowRoot.querySelectorAll('.chips__button');
			expect(link[0].href).toBe(expectedUrl);
			expect(link[0].target).toBe('_blank');

			expect(element.shadowRoot.querySelectorAll('.chips__icon')).toHaveSize(1);
			expect(element.shadowRoot.querySelectorAll('.chips__button-text')).toHaveSize(1);
			expect(element.shadowRoot.querySelectorAll('.chips__icon')).toHaveSize(1);

			expect(shareServiceSpy).toHaveBeenCalled();
		});

		it('renders nothing when default mode', async () => {
			const element = await setup({}, { embed: false });

			expect(element.shadowRoot.children.length).toBe(0);
		});
	});

	describe('QueryParameters.IFRAME_COMPONENTS includes IFrameComponents.VIEW_LARGER_MAP_CHIP', () => {
		it('renders the button', async () => {
			const queryParam = new URLSearchParams(QueryParameters.IFRAME_COMPONENTS + '=' + IFrameComponents.VIEW_LARGER_MAP_CHIP + ',foo,bar');
			spyOn(environmentServiceMock, 'getQueryParams').and.returnValue(queryParam);
			const element = await setup({ embed: true });

			expect(element.shadowRoot.styleSheets.length).toBe(2);
			expect(element.shadowRoot.styleSheets[1].cssRules.item(0).cssText).toContain('.chips__icon {');

			expect(element.shadowRoot.querySelectorAll('.chips__button')).toHaveSize(1);
			const link = element.shadowRoot.querySelectorAll('.chips__button');
			expect(link[0].target).toBe('_blank');

			expect(element.shadowRoot.querySelectorAll('.chips__icon')).toHaveSize(1);
			expect(element.shadowRoot.querySelectorAll('.chips__button-text')).toHaveSize(1);
			expect(element.shadowRoot.querySelectorAll('.chips__icon')).toHaveSize(1);
		});
	});

	describe('QueryParameters.IFRAME_COMPONENTS does NOT include IFrameComponents.VIEW_LARGER_MAP_CHIP', () => {
		it('renders nothing', async () => {
			const queryParam = new URLSearchParams(`${QueryParameters.IFRAME_COMPONENTS}=${IFrameComponents.DRAW_TOOL}`);
			spyOn(environmentServiceMock, 'getQueryParams').and.returnValue(queryParam);
			const element = await setup({ embed: true });

			expect(element.shadowRoot.children.length).toBe(0);
		});
	});

	describe('when state changes', () => {
		it('updates the view', async () => {
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

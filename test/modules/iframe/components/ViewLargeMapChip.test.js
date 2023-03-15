import { $injector } from '../../../../src/injection';
import { ViewLargeMapChip } from '../../../../src/modules/iframe/components/viewLargeMapChip/ViewLargeMapChip';
import { indicateChange } from '../../../../src/store/stateForEncoding/stateForEncoding.action';
import { stateForEncodingReducer } from '../../../../src/store/stateForEncoding/stateForEncoding.reducer';
import { TestUtils } from '../../../test-utils';

window.customElements.define(ViewLargeMapChip.tag, ViewLargeMapChip);

describe('ViewLargeMapChip', () => {
	const shareServiceMock = {
		encodeState: () => {}
	};

	const setup = async (state = {}, config = {}) => {
		const { embed = true } = config;

		TestUtils.setupStoreAndDi(state, { stateForEncoding: stateForEncodingReducer });
		$injector
			.registerSingleton('TranslationService', { translate: (key) => key })
			.registerSingleton('EnvironmentService', { isEmbedded: () => embed })
			.registerSingleton('ShareService', shareServiceMock);
		const element = await TestUtils.render(ViewLargeMapChip.tag, config);

		return element;
	};

	describe('when instantiated', () => {
		it('has a model with default values', async () => {
			await setup();
			const model = new ViewLargeMapChip().getModel();

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

import { $injector } from '../../../../src/injection';
import { ViewLargeMapChip } from '../../../../src/modules/iframe/components/viewLargeMapChip/ViewLargeMapChip';
import { TestUtils } from '../../../test-utils';
import { PathParameters } from '../../../../src/domain/pathParameters';

window.customElements.define(ViewLargeMapChip.tag, ViewLargeMapChip);

describe('ViewLargeMapChip', () => {
	const shareServiceMock = {
		encodeState: () => {}
	};

	const setup = async (state = {}, config = {}) => {
		const { embed = true } = config;

		TestUtils.setupStoreAndDi(state, {});
		$injector
			.registerSingleton('TranslationService', { translate: (key) => key })
			.registerSingleton('EnvironmentService', {
				isEmbedded: () => embed
			})
			.registerSingleton('ShareService', shareServiceMock);
		const element = await TestUtils.render(ViewLargeMapChip.tag, config);

		return element;
	};

	describe('when instantiated', () => {
		it('properly implements abstract methods', async () => {
			const element = await setup();

			expect(element.getLabel()).toBe('iframe_view_large_map_chip');
		});
	});

	describe('when initialized', () => {
		it('renders the view', async () => {
			const expectedUrl = 'http://this.is.a.url/?forTestCase';
			const shareServiceSpy = spyOn(shareServiceMock, 'encodeState').and.returnValue(expectedUrl);
			const element = await setup();

			expect(element.isVisible()).toBeTrue();

			expect(element.shadowRoot.querySelectorAll('.chips__button')).toHaveSize(1);
			const link = element.shadowRoot.querySelectorAll('.chips__button');
			expect(link[0].href).toEqual('http://this.is.a.url/?forTestCase');
			expect(link[0].target).toEqual('_blank');

			expect(element.shadowRoot.querySelectorAll('.chips__icon')).toHaveSize(1);
			expect(element.shadowRoot.querySelectorAll('.chips__button-text')).toHaveSize(1);
			expect(shareServiceSpy).toHaveBeenCalled();
		});

		it('renders for default mode', async () => {
			const element = await setup({}, { embed: false });

			expect(element.isVisible()).toBeFalse();
		});

		it('renders for embedded mode', async () => {
			const element = await setup({}, { embed: true });

			expect(element.isVisible()).toBeTrue();
		});
	});
});

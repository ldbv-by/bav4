import { $injector } from '../../../../src/injection';
import { ViewLargeMapChip } from '../../../../src/modules/chips/components/assistChips/ViewLargeMapChip';
import { TestUtils } from '../../../test-utils';
import baSvg from '../../../../src/modules/chips/components/assistChips/assets/ba.svg';

window.customElements.define(ViewLargeMapChip.tag, ViewLargeMapChip);

describe('ViewLargeMapChip', () => {
	const shareServiceMock = {
		encodeState() {
			return 'http://this.is.a.url/?forTestCase';
		}
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

			expect(element.getLabel()).toBe('chips_assist_view_large_map');
			expect(element.getIcon()).toBe(baSvg);
		});
	});

	describe('when initialized', () => {
		it('renders the view', async () => {
			const element = await setup();

			expect(element.isVisible()).toBeTrue();

			expect(element.shadowRoot.querySelectorAll('.chips__button')).toHaveSize(1);
			const link = element.shadowRoot.querySelectorAll('.chips__button');
			expect(link[0].href).toEqual('http://this.is.a.url/?forTestCase');
			expect(link[0].target).toEqual('_blank');

			expect(element.shadowRoot.querySelectorAll('.chips__icon')).toHaveSize(1);
			expect(element.shadowRoot.querySelectorAll('.chips__button-text')).toHaveSize(1);
		});
	});

	describe('embedded layout ', () => {
		it('layouts for default mode', async () => {
			const element = await setup({}, { embed: false });

			expect(element.isVisible()).toBeFalse();
		});

		it('layouts for embedded mode', async () => {
			const element = await setup({}, { embed: true });

			expect(element.isVisible()).toBeTrue();
		});
	});
});

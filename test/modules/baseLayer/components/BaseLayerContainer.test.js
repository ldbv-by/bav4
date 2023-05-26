import { $injector } from '../../../../src/injection';
import { BaseLayerContainer } from '../../../../src/modules/baseLayer/components/container/BaseLayerContainer';
import { BaseLayerSwitcher } from '../../../../src/modules/baseLayer/components/switcher/BaseLayerSwitcher';
import { TestUtils } from '../../../test-utils';

window.customElements.define(BaseLayerContainer.tag, BaseLayerContainer);

describe('BaseLayerSwitcher', () => {
	const setup = async (state = {}) => {
		TestUtils.setupStoreAndDi(state);

		$injector.registerSingleton('TranslationService', { translate: (key) => key });

		return TestUtils.render(BaseLayerContainer.tag);
	};

	describe('when instantiated', () => {
		it('has a model containing default values', async () => {
			await setup();
			const model = new BaseLayerContainer().getModel();

			expect(model).toEqual({
				categories: {
					raster: ['atkis', 'luftbild_labels', 'tk', 'historisch', 'atkis_sw'],
					vector: [
						'by_style_standard',
						'by_style_grau',
						'by_style_nacht',
						'by_style_hoehenlinien',
						'by_style_luftbild',
						'by_style_wandern',
						'by_style_radln'
					]
				}
			});
		});
	});

	describe('when initialized ', () => {
		it('renders two BaseLayerSwitcher instances', async () => {
			const element = await setup();

			expect(element.shadowRoot.querySelectorAll(BaseLayerSwitcher.tag)).toHaveSize(2);
			expect(element.shadowRoot.querySelectorAll(BaseLayerSwitcher.tag)[0].configuration).toEqual({
				managed: ['atkis', 'luftbild_labels', 'tk', 'historisch', 'atkis_sw'],
				all: [
					'atkis',
					'luftbild_labels',
					'tk',
					'historisch',
					'atkis_sw',
					'by_style_standard',
					'by_style_grau',
					'by_style_nacht',
					'by_style_hoehenlinien',
					'by_style_luftbild',
					'by_style_wandern',
					'by_style_radln'
				]
			});
			expect(element.shadowRoot.querySelectorAll(BaseLayerSwitcher.tag)[1].configuration).toEqual({
				managed: [
					'by_style_standard',
					'by_style_grau',
					'by_style_nacht',
					'by_style_hoehenlinien',
					'by_style_luftbild',
					'by_style_wandern',
					'by_style_radln'
				],
				all: [
					'atkis',
					'luftbild_labels',
					'tk',
					'historisch',
					'atkis_sw',
					'by_style_standard',
					'by_style_grau',
					'by_style_nacht',
					'by_style_hoehenlinien',
					'by_style_luftbild',
					'by_style_wandern',
					'by_style_radln'
				]
			});
		});
	});
});

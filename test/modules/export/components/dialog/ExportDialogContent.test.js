import { $injector } from '../../../../../src/injection';
import { ExportDialogContent } from '../../../../../src/modules/export/components/dialog/ExportDialogContent';
import { ExportItem } from '../../../../../src/modules/export/components/dialog/ExportItem';
import { TestUtils } from '../../../../test-utils';

window.customElements.define(ExportDialogContent.tag, ExportDialogContent);
window.customElements.define(ExportItem.tag, ExportItem);

describe('ExportDialogContent', () => {
	const setup = (state = {}) => {
		TestUtils.setupStoreAndDi(state, {});

		// services needed for ExportItem components
		$injector
			.registerSingleton('ExportVectorDataService', {
				forData: () => '<foo-bar></foo-bar>'
			})
			.registerSingleton('SourceTypeService', {
				forData: () => 'foo/bar'
			})
			.registerSingleton('TranslationService', { translate: (key) => key });

		return TestUtils.render(ExportDialogContent.tag);
	};

	describe('when instantiated', () => {
		it('has a model with default values', async () => {
			const element = await setup();
			const model = element.getModel();
			expect(model).toEqual({ exportData: null });
		});
	});

	describe('when initialized', () => {
		it('renders the component', async () => {
			const element = await setup();
			element.exportData = '<kml/>';

			expect(element.shadowRoot.querySelectorAll('ba-export-item')).toHaveSize(4);
		});
	});
});

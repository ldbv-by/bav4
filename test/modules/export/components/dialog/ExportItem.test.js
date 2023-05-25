import { $injector } from '../../../../../src/injection';
import { ExportItem } from '../../../../../src/modules/export/components/dialog/ExportItem';
import { TestUtils } from '../../../../test-utils';

window.customElements.define(ExportItem.tag, ExportItem);

describe('ExportItem', () => {
	const setup = (state = {}) => {
		TestUtils.setupStoreAndDi(state, {});

		$injector
			.registerSingleton('ExportVectorDataService', {
				forData: () => '<foo-bar></foo-bar>'
			})
			.registerSingleton('SourceTypeService', {
				forData: () => 'foo/bar'
			})
			.registerSingleton('TranslationService', { translate: (key) => key });

		return TestUtils.render(ExportItem.tag);
	};

	describe('when instantiated', () => {
		it('has a model with default values', async () => {
			const element = await setup();
			const model = element.getModel();
			expect(model).toEqual({ exportType: null, selectedSrid: null, exportData: null });
		});
	});

	describe('when initialized', () => {
		it('renders the component', async () => {
			const element = await setup();
			element.exportType = { sourceType: 'foo', mediaType: 'bar', fileExtension: 'baz', srids: [42, 21, 1] };
			element.exportData = '<baz/>';

			expect(element.shadowRoot.querySelector('.export-item__label').innerText).toBe('export_item_label_foo');
			expect(element.shadowRoot.querySelector('.export-item__description').innerText).toBe('export_item_description_foo');
			expect(element.shadowRoot.querySelector('label').innerText).toBe('export_item_srid_selection');
			expect(element.shadowRoot.querySelectorAll('select option')).toHaveSize(3);
			expect(element.shadowRoot.querySelector('ba-button').label).toBe('export_item_download_foo');
		});

		describe('with srids', () => {
			it('renders a single srid as predefined srid', async () => {
				const element = await setup();
				element.exportType = { sourceType: 'foo', mediaType: 'bar', fileExtension: 'baz', srids: [42] };
				element.exportData = '<baz/>';

				expect(element.shadowRoot.querySelectorAll('select option')).toHaveSize(1);
				expect(element.shadowRoot.querySelector('select').disabled).toBeTrue();
				expect(element.shadowRoot.querySelector('label').innerText).toBe('export_item_srid_selection_disabled');
			});

			it('renders the first srid as default srid', async () => {
				const element = await setup();
				element.exportType = { sourceType: 'foo', mediaType: 'bar', fileExtension: 'baz', srids: [42, 21, 1] };
				element.exportData = '<baz/>';

				expect(element.shadowRoot.querySelectorAll('select option')).toHaveSize(3);
				expect(element.shadowRoot.querySelector('select').value).toBe('42');
				expect(element.shadowRoot.querySelector('label').innerText).toBe('export_item_srid_selection');
			});
		});
	});
});

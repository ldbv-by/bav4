import { $injector } from '../../../../../src/injection';
import { ExportItem } from '../../../../../src/modules/export/components/dialog/ExportItem';
import { TestUtils } from '../../../../test-utils';

window.customElements.define(ExportItem.tag, ExportItem);

describe('ExportItem', () => {
	const fileSaveServiceMock = {
		saveAs: () => {}
	};

	const setup = (state = {}) => {
		TestUtils.setupStoreAndDi(state, {});

		$injector
			.registerSingleton('ExportVectorDataService', {
				forData: () => '<foo-bar></foo-bar>'
			})
			.registerSingleton('TranslationService', { translate: (key) => key })
			.registerSingleton('FileSaveService', fileSaveServiceMock);

		return TestUtils.render(ExportItem.tag);
	};

	describe('when instantiated', () => {
		it('has a model with default values', async () => {
			await setup();
			const model = new ExportItem().getModel();

			expect(model).toEqual({ exportType: null, selectedSrid: null, exportData: null });
		});
	});

	describe('when initialized', () => {
		it('renders the component', async () => {
			const element = await setup();
			element.exportType = { sourceTypeName: 'foo', mediaType: 'bar', srids: [42, 21, 1] };
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
				element.exportType = { sourceTypeName: 'foo', mediaType: 'bar', srids: [42] };
				element.exportData = '<baz/>';

				expect(element.shadowRoot.querySelectorAll('select option')).toHaveSize(1);
				expect(element.shadowRoot.querySelectorAll('.ba-form-element.disabled')).toHaveSize(1);
				expect(element.shadowRoot.querySelector('select').disabled).toBeTrue();
				expect(element.shadowRoot.querySelector('label').innerText).toBe('export_item_srid_selection_disabled');
			});

			it('renders the first srid as default srid', async () => {
				const element = await setup();
				element.exportType = { sourceTypeName: 'foo', mediaType: 'bar', srids: [42, 21, 1] };
				element.exportData = '<baz/>';

				expect(element.shadowRoot.querySelectorAll('select option')).toHaveSize(3);
				expect(element.shadowRoot.querySelector('select').value).toBe('42');
				expect(element.shadowRoot.querySelector('label').innerText).toBe('export_item_srid_selection');
				expect(element.shadowRoot.querySelectorAll('.ba-form-element.disabled')).toHaveSize(0);
			});
		});
	});

	describe('when srid is changed', () => {
		it('changes the model', async () => {
			const element = await setup();
			element.exportType = { sourceTypeName: 'foo', mediaType: 'bar', srids: [42, 21, 1] };
			element.exportData = '<baz/>';
			const selectElement = element.shadowRoot.querySelector('select');

			expect(element.shadowRoot.querySelectorAll('select option')).toHaveSize(3);
			expect(selectElement.value).toBe('42');

			selectElement.value = 21;
			selectElement.dispatchEvent(new Event('change'));

			expect(element.getModel().selectedSrid).toBe(21);
		});
	});

	describe('when download-button is clicked', () => {
		it('saves the file', async () => {
			const element = await setup();
			const saveAsSpy = spyOn(fileSaveServiceMock, 'saveAs').and.callFake(() => {});
			element.exportType = { sourceTypeName: 'foo', mediaType: 'bar', srids: [42, 21, 1] };
			element.exportData = '<baz/>';
			const downloadButton = element.shadowRoot.querySelector('ba-button');

			downloadButton.click();

			expect(saveAsSpy).toHaveBeenCalledWith('<foo-bar></foo-bar>', 'bar');
		});
	});
});

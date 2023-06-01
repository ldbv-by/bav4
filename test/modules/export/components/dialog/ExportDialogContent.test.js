import { SourceTypeName } from '../../../../../src/domain/sourceType';
import { $injector } from '../../../../../src/injection';
import { ExportDialogContent } from '../../../../../src/modules/export/components/dialog/ExportDialogContent';
import { ExportItem } from '../../../../../src/modules/export/components/dialog/ExportItem';
import { MediaType } from '../../../../../src/services/HttpService';
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
			.registerSingleton('ConfigService', {
				forData: () => 'foo/bar'
			})
			.registerSingleton('TranslationService', { translate: (key) => key })
			.registerSingleton('FileSaveService', { saveAs: () => {} });

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

	describe('getExportTypes', () => {
		it('creates a list of available exportTypes', async () => {
			const element = await setup();
			const exportTypes = element.getExportTypes();

			expect(exportTypes).toHaveSize(4);
			expect(exportTypes[0]).toEqual(
				jasmine.objectContaining({ sourceTypeName: SourceTypeName.KML, mediaType: MediaType.KML, fileExtension: 'kml', srids: [4326] })
			);
			expect(exportTypes[1]).toEqual(
				jasmine.objectContaining({ sourceTypeName: SourceTypeName.GPX, mediaType: MediaType.GPX, fileExtension: 'gpx', srids: [4326] })
			);
			expect(exportTypes[2]).toEqual(
				jasmine.objectContaining({ sourceTypeName: SourceTypeName.GEOJSON, mediaType: MediaType.GeoJSON, fileExtension: 'geojson', srids: [4326] })
			);
			expect(exportTypes[3]).toEqual(
				jasmine.objectContaining({
					sourceTypeName: SourceTypeName.EWKT,
					mediaType: MediaType.TEXT_PLAIN,
					fileExtension: 'txt',
					srids: [4326, 3857, 25832, 25833]
				})
			);
		});
	});
});

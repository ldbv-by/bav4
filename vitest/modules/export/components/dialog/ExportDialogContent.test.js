import { SourceTypeName } from '@src/domain/sourceType';
import { $injector } from '@src/injection';
import { ExportDialogContent } from '@src/modules/export/components/dialog/ExportDialogContent';
import { MediaType } from '@src/domain/mediaTypes';
import { TestUtils } from '@test/test-utils';
import { createNoInitialStateMediaReducer } from '@src/store/media/media.reducer';

window.customElements.define(ExportDialogContent.tag, ExportDialogContent);

describe('ExportDialogContent', () => {
	const projectionServiceMock = {
		getProjections: () => [4326, 3857]
	};

	const setup = (state = {}) => {
		// state of store
		const initialState = {
			media: {
				portrait: false
			},
			...state
		};
		TestUtils.setupStoreAndDi(initialState, {
			media: createNoInitialStateMediaReducer()
		});

		// services needed for ExportItem components
		$injector
			.registerSingleton('ExportVectorDataService', {
				forData: () => '<foo-bar></foo-bar>'
			})
			.registerSingleton('ProjectionService', projectionServiceMock);

		return TestUtils.render(ExportDialogContent.tag);
	};

	describe('when instantiated', () => {
		it('has a model with default values', async () => {
			await setup();
			const model = new ExportDialogContent().getModel();

			expect(model).toEqual({ exportData: null, isPortrait: false, exportTypes: null });
		});
	});

	describe('when initialized', () => {
		it('renders the component', async () => {
			const projSpy = vi.spyOn(projectionServiceMock, 'getProjections').mockImplementation(() => []);
			const element = await setup();
			element.exportData = '<kml/>';

			expect(element.shadowRoot.querySelectorAll('ba-export-item')).toHaveLength(4);
			expect(projSpy).toHaveBeenCalled();
		});
	});

	describe('_getExportTypes', () => {
		it('creates a list of available exportTypes', async () => {
			const element = await setup();
			const projSpy = vi.spyOn(projectionServiceMock, 'getProjections').mockImplementation(() => [42, 21]);
			const exportTypes = element._getExportTypes();

			expect(projSpy).toHaveBeenCalled();
			expect(exportTypes).toHaveLength(4);
			expect(exportTypes[0]).toEqual(expect.objectContaining({ sourceTypeName: SourceTypeName.KML, mediaType: MediaType.KML, srids: [4326] }));
			expect(exportTypes[1]).toEqual(expect.objectContaining({ sourceTypeName: SourceTypeName.GPX, mediaType: MediaType.GPX, srids: [4326] }));
			expect(exportTypes[2]).toEqual(
				expect.objectContaining({ sourceTypeName: SourceTypeName.GEOJSON, mediaType: MediaType.GeoJSON, srids: [4326] })
			);
			expect(exportTypes[3]).toEqual(
				expect.objectContaining({
					sourceTypeName: SourceTypeName.EWKT,
					mediaType: MediaType.TEXT_PLAIN,
					srids: [42, 21]
				})
			);
		});
	});

	describe('responsive layout ', () => {
		it('layouts for landscape', async () => {
			const state = {
				media: {
					portrait: false
				}
			};

			const element = await setup(state);

			expect(element.shadowRoot.querySelectorAll('.is-landscape')).toHaveLength(1);
			expect(element.shadowRoot.querySelectorAll('.is-portrait')).toHaveLength(0);
		});

		it('layouts for portrait', async () => {
			const state = {
				media: {
					portrait: true
				}
			};

			const element = await setup(state);

			expect(element.shadowRoot.querySelectorAll('.is-landscape')).toHaveLength(0);
			expect(element.shadowRoot.querySelectorAll('.is-portrait')).toHaveLength(1);
		});
	});
});

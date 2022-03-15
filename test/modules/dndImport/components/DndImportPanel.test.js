import { $injector } from '../../../../src/injection';
import { DndImportPanel } from '../../../../src/modules/dndImport/components/DndImportPanel';
import { SourceType, SourceTypeMaxFileSize, SourceTypeName, SourceTypeResultStatus } from '../../../../src/services/domain/sourceType';
import { MediaType } from '../../../../src/services/HttpService';
import { importReducer } from '../../../../src/store/import/import.reducer';
import { createNoInitialStateMediaReducer } from '../../../../src/store/media/media.reducer';
import { LevelTypes } from '../../../../src/store/notifications/notifications.action';
import { notificationReducer } from '../../../../src/store/notifications/notifications.reducer';
import { TestUtils } from '../../../test-utils';


window.customElements.define(DndImportPanel.tag, DndImportPanel);

describe('DndImportPanel', () => {
	let store;

	const sourceTypeService = {
		forUrl() { },
		forData() { },
		forBlob() { }
	};
	const setup = (state) => {

		const initialState = {
			media: {
				portrait: false
			},
			notifications: {
				latest: null
			},
			import: {
				latest: null
			},
			...state
		};

		store = TestUtils.setupStoreAndDi(initialState, {
			import: importReducer,
			notifications: notificationReducer,
			media: createNoInitialStateMediaReducer()
		});
		$injector
			.registerSingleton('TranslationService', { translate: (key) => key })
			.registerSingleton('SourceTypeService', sourceTypeService);
		return TestUtils.render(DndImportPanel.tag);
	};


	describe('when instantiated', () => {

		it('has a model containing default values', async () => {
			await setup();
			const model = new DndImportPanel().getModel();

			expect(model).toEqual({
				dropzoneContent: null,
				isActive: false
			});
		});
	});

	describe('when initialized', () => {

		it('has a dropzone', async () => {

			const element = await setup();

			expect(element.shadowRoot.querySelector('#dropzone')).toBeTruthy();
		});

		it('dropzone is hidden', async () => {

			const element = await setup();
			const dropzone = element.shadowRoot.querySelector('#dropzone');
			expect(dropzone.style.getPropertyValue('display')).toBe('');
		});
	});

	describe('when drag&drop elements', () => {
		const defaultDataTransferMock = {
			files: [],
			types: [],
			getData: () => { }
		};
		const simulateDragDropEvent = (type, dataTransfer, eventSource = document, preventDefaultFunction = () => { }, stopPropagationFunction = () => { }) => {

			const eventType = type;
			const event = new Event(eventType);
			event.preventDefault = preventDefaultFunction;
			event.stopPropagation = stopPropagationFunction;
			event.dataTransfer = dataTransfer;

			eventSource.dispatchEvent(event);
		};

		describe('on dragenter', () => {

			it('prevents default-handling and stops propagation', async () => {
				const preventDefaultSpy = jasmine.createSpy('preventDefault');
				const stopPropagationSpy = jasmine.createSpy('stopPropagation');
				const dataTransferMock = { ...defaultDataTransferMock, types: ['some'] };
				const element = await setup();


				simulateDragDropEvent('dragenter', dataTransferMock, document, preventDefaultSpy, stopPropagationSpy);

				expect(element).toBeTruthy();
				expect(preventDefaultSpy).toHaveBeenCalled();
				expect(stopPropagationSpy).toHaveBeenCalled();
			});

			it('updates the model for a dragged text', async () => {
				const dataTransferMock = { ...defaultDataTransferMock, types: ['text/plain'], getData: () => 'foo' };
				const element = await setup();

				simulateDragDropEvent('dragenter', dataTransferMock);

				expect(element.getModel().dropzoneContent).toBe('dndImport_import_textcontent');
				expect(element.getModel().isActive).toBeTrue();
			});

			it('updates the model for a dragged file', async () => {
				const dataTransferMock = { ...defaultDataTransferMock, types: ['Files'] };
				const element = await setup();

				simulateDragDropEvent('dragenter', dataTransferMock);

				expect(element.getModel().dropzoneContent).toBe('dndImport_import_filecontent');
				expect(element.getModel().isActive).toBeTrue();
			});

			it('updates the model for a unknown dragged type', async () => {
				const dataTransferMock = { ...defaultDataTransferMock, types: ['some'] };
				const element = await setup();

				simulateDragDropEvent('dragenter', dataTransferMock);

				expect(element.getModel().dropzoneContent).toBe('dndImport_import_unknown');
				expect(element.getModel().isActive).toBeTrue();
			});

			it('does NOT update the model for a dragged but empty type', async () => {
				const dataTransferMock = { ...defaultDataTransferMock };
				const element = await setup();

				simulateDragDropEvent('dragenter', dataTransferMock);

				expect(element.getModel().dropzoneContent).toBeNull();
				expect(element.getModel().isActive).toBeFalse();
			});

			it('does NOT update the model for a dragged but undefined types', async () => {
				const dataTransferMock = { ...defaultDataTransferMock, types: undefined };
				const element = await setup();

				simulateDragDropEvent('dragenter', dataTransferMock);

				expect(element.getModel().dropzoneContent).toBeNull();
				expect(element.getModel().isActive).toBeFalse();
			});
		});

		describe('on dragover', () => {
			it('prevents default-handling and stops propagation', async () => {
				const preventDefaultSpy = jasmine.createSpy('preventDefault');
				const stopPropagationSpy = jasmine.createSpy('stopPropagation');
				const dataTransferMock = { ...defaultDataTransferMock, types: ['some'] };
				const element = await setup();
				const dropZone = element.shadowRoot.querySelector('#dropzone');

				simulateDragDropEvent('dragover', dataTransferMock, dropZone, preventDefaultSpy, stopPropagationSpy);

				expect(preventDefaultSpy).toHaveBeenCalled();
				expect(stopPropagationSpy).toHaveBeenCalled();
			});
		});

		describe('on dragleave', () => {
			it('prevents default-handling and stops propagation', async () => {
				const preventDefaultSpy = jasmine.createSpy('preventDefault');
				const stopPropagationSpy = jasmine.createSpy('stopPropagation');
				const dataTransferMock = { ...defaultDataTransferMock, types: ['some'] };
				const element = await setup();
				const dropZone = element.shadowRoot.querySelector('#dropzone');

				simulateDragDropEvent('dragleave', dataTransferMock, dropZone, preventDefaultSpy, stopPropagationSpy);

				expect(element).toBeTruthy();
				expect(preventDefaultSpy).toHaveBeenCalled();
				expect(stopPropagationSpy).toHaveBeenCalled();
			});

			it('updates the model', async () => {
				const dataTransferMock = { ...defaultDataTransferMock, types: ['Files'] };
				const element = await setup();
				const dropZone = element.shadowRoot.querySelector('#dropzone');

				simulateDragDropEvent('dragenter', dataTransferMock);

				expect(element.getModel().dropzoneContent).toBe('dndImport_import_filecontent');
				expect(element.getModel().isActive).toBeTrue();

				simulateDragDropEvent('dragleave', dataTransferMock, dropZone);

				expect(element.getModel().dropzoneContent).toBeNull();
				expect(element.getModel().isActive).toBeFalse();

			});

		});

		describe('on drop', () => {
			it('prevents default-handling and stops propagation', async () => {
				const preventDefaultSpy = jasmine.createSpy('preventDefault');
				const stopPropagationSpy = jasmine.createSpy('stopPropagation');
				const dataTransferMock = { ...defaultDataTransferMock, types: ['some'] };
				const element = await setup();
				const dropZone = element.shadowRoot.querySelector('#dropzone');

				simulateDragDropEvent('drop', dataTransferMock, dropZone, preventDefaultSpy, stopPropagationSpy);

				expect(element).toBeTruthy();
				expect(preventDefaultSpy).toHaveBeenCalled();
				expect(stopPropagationSpy).toHaveBeenCalled();
			});

			it('updates the import-store with a dropped text', async () => {
				const dataTransferMock = { ...defaultDataTransferMock, types: ['text/plain'], getData: () => '<kml>foo</kml>' };
				const sourceTypeKml = new SourceType(SourceTypeName.KML);
				const sourceTypeResultMock = { status: SourceTypeResultStatus.OK, sourceType: sourceTypeKml };
				const dataSpy = spyOn(sourceTypeService, 'forData').and.callFake(() => sourceTypeResultMock);
				const element = await setup();
				const dropZone = element.shadowRoot.querySelector('#dropzone');

				simulateDragDropEvent('drop', dataTransferMock, dropZone);

				expect(dataSpy).toHaveBeenCalledWith('<kml>foo</kml>');
				expect(store.getState().import.latest.payload.data).toBe('<kml>foo</kml>');
				expect(store.getState().import.latest.payload.sourceType).toBe(sourceTypeKml);
				expect(store.getState().import.latest.payload.url).toBeNull();
			});

			it('updates the import-store with a dropped file as URL', async (done) => {
				const dataTransferMock = { ...defaultDataTransferMock, types: ['text/plain'], getData: () => 'https://foo.bar/baz' };
				const sourceTypeKml = new SourceType(SourceTypeName.KML);
				const sourceTypeResultMock = { status: SourceTypeResultStatus.OK, sourceType: sourceTypeKml };
				const urlSpy = spyOn(sourceTypeService, 'forUrl').and.callFake(() => sourceTypeResultMock);
				const element = await setup();
				const dropZone = element.shadowRoot.querySelector('#dropzone');

				simulateDragDropEvent('drop', dataTransferMock, dropZone);

				expect(urlSpy).toHaveBeenCalledWith('https://foo.bar/baz');
				setTimeout(() => {
					expect(store.getState().import.latest.payload.data).toBeNull();
					expect(store.getState().import.latest.payload.sourceType).toBe(sourceTypeKml);
					expect(store.getState().import.latest.payload.url).toBe('https://foo.bar/baz');
					done();
				});

			});

			it('emits a notification for a dropped but unsupported file as url', async (done) => {
				const dataTransferMock = { ...defaultDataTransferMock, types: ['text/plain'], getData: () => 'https://foo.bar/unsupported' };
				const sourceTypeResultMock = { status: SourceTypeResultStatus.UNSUPPORTED_TYPE };
				const urlSpy = spyOn(sourceTypeService, 'forUrl').and.callFake(() => sourceTypeResultMock);
				const element = await setup();
				const dropZone = element.shadowRoot.querySelector('#dropzone');

				simulateDragDropEvent('drop', dataTransferMock, dropZone);

				expect(urlSpy).toHaveBeenCalledWith('https://foo.bar/unsupported');
				setTimeout(() => {
					expect(store.getState().notifications.latest.payload.content).toBe('dndImport_import_unsupported');
					expect(store.getState().notifications.latest.payload.level).toEqual(LevelTypes.WARN);
					expect(store.getState().import.latest).toBeNull();
					done();
				});

			});

			it('emits a notification for a dropped but too large file as url', async (done) => {
				const dataTransferMock = { ...defaultDataTransferMock, types: ['text/plain'], getData: () => 'https://foo.bar/too_large' };
				const sourceTypeResultMock = { status: SourceTypeResultStatus.MAX_SIZE_EXCEEDED };
				const urlSpy = spyOn(sourceTypeService, 'forUrl').and.callFake(() => sourceTypeResultMock);
				const element = await setup();
				const dropZone = element.shadowRoot.querySelector('#dropzone');

				simulateDragDropEvent('drop', dataTransferMock, dropZone);

				expect(urlSpy).toHaveBeenCalledWith('https://foo.bar/too_large');
				setTimeout(() => {
					expect(store.getState().notifications.latest.payload.content).toBe('dndImport_import_max_size_exceeded');
					expect(store.getState().notifications.latest.payload.level).toEqual(LevelTypes.WARN);
					expect(store.getState().import.latest).toBeNull();
					done();
				});

			});

			it('emits a notification for a dropped but unknown, errornous resource as url', async (done) => {
				const dataTransferMock = { ...defaultDataTransferMock, types: ['text/plain'], getData: () => 'https://foo.bar/other_error' };
				const sourceTypeResultMock = { status: SourceTypeResultStatus.OTHER };
				const urlSpy = spyOn(sourceTypeService, 'forUrl').and.callFake(() => sourceTypeResultMock);
				const element = await setup();
				const dropZone = element.shadowRoot.querySelector('#dropzone');

				simulateDragDropEvent('drop', dataTransferMock, dropZone);

				expect(urlSpy).toHaveBeenCalledWith('https://foo.bar/other_error');
				setTimeout(() => {
					expect(store.getState().notifications.latest.payload.content).toBe('dndImport_import_unknown');
					expect(store.getState().notifications.latest.payload.level).toEqual(LevelTypes.ERROR);
					expect(store.getState().import.latest).toBeNull();
					done();
				});

			});

			it('emits a notification for a dropped but unsupported text', async () => {
				const dataTransferMock = { ...defaultDataTransferMock, types: ['text/plain'], getData: () => '<foo>unsupported</foo>' };
				const sourceTypeResultMock = { status: SourceTypeResultStatus.UNSUPPORTED_TYPE, sourceType: null };
				spyOn(sourceTypeService, 'forData').and.callFake(() => sourceTypeResultMock);
				const element = await setup();
				const dropZone = element.shadowRoot.querySelector('#dropzone');

				simulateDragDropEvent('drop', dataTransferMock, dropZone);

				expect(store.getState().notifications.latest.payload.content).toBe('dndImport_import_unsupported');
				expect(store.getState().notifications.latest.payload.level).toEqual(LevelTypes.WARN);
				expect(store.getState().import.latest).toBeNull();
			});

			it('emits a notification for failing while detecting sourceType of a dropped text', async () => {
				const dataTransferMock = { ...defaultDataTransferMock, types: ['text/plain'], getData: () => '<foo>some</foo>' };
				const sourceTypeResultMock = { status: SourceTypeResultStatus.OTHER, sourceType: null };
				spyOn(sourceTypeService, 'forData').and.callFake(() => sourceTypeResultMock);
				const element = await setup();
				const dropZone = element.shadowRoot.querySelector('#dropzone');

				simulateDragDropEvent('drop', dataTransferMock, dropZone);

				expect(store.getState().notifications.latest.payload.content).toBe('dndImport_import_unknown');
				expect(store.getState().notifications.latest.payload.level).toEqual(LevelTypes.ERROR);
				expect(store.getState().import.latest).toBeNull();
			});


			it('updates the import-store with a dropped text-file', async (done) => {
				const textFileMock = TestUtils.newBlob('<kml>foo</kml>', MediaType.TEXT_PLAIN);
				const sourceTypeKml = new SourceType(SourceTypeName.KML);
				const dataTransferMock = { ...defaultDataTransferMock, types: ['Files'], files: [textFileMock] };
				const sourceTypeResultMock = { status: SourceTypeResultStatus.OK, sourceType: sourceTypeKml };
				spyOn(sourceTypeService, 'forBlob').and.resolveTo(sourceTypeResultMock);
				const element = await setup();
				const dropZone = element.shadowRoot.querySelector('#dropzone');

				expect(store.getState().import.latest).toBeNull();
				simulateDragDropEvent('drop', dataTransferMock, dropZone);

				setTimeout(() => {
					expect(store.getState().import.latest.payload.data).toBe('<kml>foo</kml>');
					expect(store.getState().import.latest.payload.sourceType).toBe(sourceTypeKml);
					expect(store.getState().import.latest.payload.url).toBeNull();
					done();
				});

			});


			it('updates the import-store with a dropped kml-file', async (done) => {
				const kmlFileMock = TestUtils.newBlob('<kml>foo</kml>', MediaType.KML);
				const sourceTypeKml = new SourceType(SourceTypeName.KML);
				const dataTransferMock = { ...defaultDataTransferMock, types: ['Files'], files: [kmlFileMock] };
				const sourceTypeResultMock = { status: SourceTypeResultStatus.OK, sourceType: sourceTypeKml };
				spyOn(sourceTypeService, 'forBlob').and.resolveTo(sourceTypeResultMock);
				const element = await setup();
				const dropZone = element.shadowRoot.querySelector('#dropzone');

				simulateDragDropEvent('drop', dataTransferMock, dropZone);
				setTimeout(() => {
					expect(store.getState().import.latest.payload.data).toBe('<kml>foo</kml>');
					expect(store.getState().import.latest.payload.sourceType).toBe(sourceTypeKml);
					expect(store.getState().import.latest.payload.url).toBeNull();
					done();
				});
			});

			it('updates the import-store with a dropped gpx-file', async (done) => {
				const gpxFileMock = TestUtils.newBlob('<gpx>foo</gpx>', MediaType.GPX);
				const sourceTypeGpx = new SourceType(SourceTypeName.GPX);
				const dataTransferMock = { ...defaultDataTransferMock, types: ['Files'], files: [gpxFileMock] };
				const sourceTypeResultMock = { status: SourceTypeResultStatus.OK, sourceType: sourceTypeGpx };
				spyOn(sourceTypeService, 'forBlob').and.resolveTo(sourceTypeResultMock);
				const element = await setup();
				const dropZone = element.shadowRoot.querySelector('#dropzone');

				simulateDragDropEvent('drop', dataTransferMock, dropZone);
				setTimeout(() => {
					expect(store.getState().import.latest.payload.data).toBe('<gpx>foo</gpx>');
					expect(store.getState().import.latest.payload.sourceType).toBe(sourceTypeGpx);
					expect(store.getState().import.latest.payload.url).toBeNull();
					done();
				});

			});


			it('updates the import-store with a dropped geojson-file', async (done) => {
				const geoJSONFileMock = TestUtils.newBlob('{type:foo}', MediaType.GeoJSON);
				const sourceTypeGeoJSON = new SourceType(SourceTypeName.GEOJSON);
				const dataTransferMock = { ...defaultDataTransferMock, types: ['Files'], files: [geoJSONFileMock] };
				const sourceTypeResultMock = { status: SourceTypeResultStatus.OK, sourceType: sourceTypeGeoJSON };
				spyOn(sourceTypeService, 'forBlob').and.resolveTo(sourceTypeResultMock);
				const element = await setup();
				const dropZone = element.shadowRoot.querySelector('#dropzone');

				simulateDragDropEvent('drop', dataTransferMock, dropZone);
				setTimeout(() => {
					expect(store.getState().import.latest.payload.data).toBe('{type:foo}');
					expect(store.getState().import.latest.payload.sourceType).toBe(sourceTypeGeoJSON);
					expect(store.getState().import.latest.payload.url).toBeNull();
					done();
				});

			});

			it('emits a notification for a unreadable dropped file', async (done) => {
				const fileMock = {
					type: MediaType.KML, text: () => {
						throw new Error('some');
					}
				};
				const dataTransferMock = { ...defaultDataTransferMock, types: ['Files'], files: [fileMock] };
				const element = await setup();
				const dropZone = element.shadowRoot.querySelector('#dropzone');

				simulateDragDropEvent('drop', dataTransferMock, dropZone);
				setTimeout(() => {
					expect(store.getState().notifications.latest.payload.content).toBe('dndImport_import_file_error');
					expect(store.getState().notifications.latest.payload.level).toEqual(LevelTypes.ERROR);
					expect(store.getState().import.latest).toBeNull();
					done();
				});
			});

			it('does nothing for a unknown dropped type', async () => {
				const dataTransferMock = { ...defaultDataTransferMock, types: ['some'] };
				const element = await setup();
				const dropZone = element.shadowRoot.querySelector('#dropzone');

				simulateDragDropEvent('drop', dataTransferMock, dropZone);

				expect(store.getState().notifications.latest).toBeNull();
				expect(store.getState().import.latest).toBeNull();
			});

			it('does nothing for a dropped but empty type', async () => {
				const dataTransferMock = { ...defaultDataTransferMock, types: null };
				const element = await setup();
				const dropZone = element.shadowRoot.querySelector('#dropzone');

				simulateDragDropEvent('drop', dataTransferMock, dropZone);

				expect(store.getState().notifications.latest).toBeNull();
				expect(store.getState().import.latest).toBeNull();
			});

			it('does nothing for a empty dropped type', async () => {
				const dataTransferMock = { ...defaultDataTransferMock };
				const element = await setup();
				const dropZone = element.shadowRoot.querySelector('#dropzone');

				simulateDragDropEvent('drop', dataTransferMock, dropZone);
				expect(store.getState().notifications.latest).toBeNull();
				expect(store.getState().import.latest).toBeNull();

			});

			it('emits a notification for a dropped but empty file', async () => {
				const dataTransferMock = { ...defaultDataTransferMock, types: ['Files'], files: [] };
				const element = await setup();
				const dropZone = element.shadowRoot.querySelector('#dropzone');

				simulateDragDropEvent('drop', dataTransferMock, dropZone);

				expect(store.getState().notifications.latest.payload.content).toBe('dndImport_import_no_file_found');
				expect(store.getState().notifications.latest.payload.level).toEqual(LevelTypes.WARN);
				expect(store.getState().import.latest).toBeNull();
			});

			it('emits a notification for a dropped but unsupported file', async (done) => {
				const htmlFileMock = TestUtils.newBlob('foo', MediaType.TEXT_HTML);
				const dataTransferMock = { ...defaultDataTransferMock, types: ['Files'], files: [htmlFileMock] };
				const sourceTypeResultMock = { status: SourceTypeResultStatus.UNSUPPORTED_TYPE, sourceType: null };
				spyOn(sourceTypeService, 'forBlob').and.resolveTo(sourceTypeResultMock);
				const element = await setup();
				const dropZone = element.shadowRoot.querySelector('#dropzone');

				simulateDragDropEvent('drop', dataTransferMock, dropZone);

				setTimeout(() => {
					expect(store.getState().notifications.latest.payload.content).toBe('dndImport_import_unsupported');
					expect(store.getState().notifications.latest.payload.level).toEqual(LevelTypes.WARN);
					expect(store.getState().import.latest).toBeNull();
					done();
				});
			});

			it('emits a notification for a dropped but too large file', async (done) => {
				const bigFileMock = TestUtils.newBlob('foo', MediaType.KML, SourceTypeMaxFileSize + 1);
				const dataTransferMock = { ...defaultDataTransferMock, types: ['Files'], files: [bigFileMock] };
				const sourceTypeResultMock = { status: SourceTypeResultStatus.MAX_SIZE_EXCEEDED, sourceType: null };
				spyOn(sourceTypeService, 'forBlob').and.resolveTo(sourceTypeResultMock);
				const element = await setup();
				const dropZone = element.shadowRoot.querySelector('#dropzone');

				simulateDragDropEvent('drop', dataTransferMock, dropZone);
				setTimeout(() => {
					expect(store.getState().notifications.latest.payload.content).toBe('dndImport_import_max_size_exceeded');
					expect(store.getState().notifications.latest.payload.level).toEqual(LevelTypes.WARN);
					expect(store.getState().import.latest).toBeNull();
					done();
				});

			});

			it('emits a notification for a dropped but unknown file', async (done) => {
				const unknownFileMock = TestUtils.newBlob('foo', '');
				const dataTransferMock = { ...defaultDataTransferMock, types: ['Files'], files: [unknownFileMock] };
				const sourceTypeResultMock = { status: SourceTypeResultStatus.OTHER, sourceType: null };
				spyOn(sourceTypeService, 'forBlob').and.resolveTo(sourceTypeResultMock);
				const element = await setup();
				const dropZone = element.shadowRoot.querySelector('#dropzone');

				simulateDragDropEvent('drop', dataTransferMock, dropZone);
				setTimeout(() => {
					expect(store.getState().notifications.latest.payload.content).toBe('dndImport_import_unknown');
					expect(store.getState().notifications.latest.payload.level).toEqual(LevelTypes.ERROR);
					expect(store.getState().import.latest).toBeNull();
					done();
				});

			});

			it('updates the model', async () => {
				const dataTransferMock = { ...defaultDataTransferMock, types: ['some'] };
				const element = await setup();
				const dropZone = element.shadowRoot.querySelector('#dropzone');

				simulateDragDropEvent('dragenter', dataTransferMock);
				expect(element.getModel().isActive).toBeTrue();

				simulateDragDropEvent('drop', dataTransferMock, dropZone);

				expect(element.getModel().dropzoneContent).toBeNull();
				expect(element.getModel().isActive).toBeFalse();
			});
		});
	});
});

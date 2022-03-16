import { $injector } from '../../../../../src/injection';
import { ImportToolContent } from '../../../../../src/modules/toolbox/components/importToolContent/ImportToolContent';
import { AbstractToolContent } from '../../../../../src/modules/toolbox/components/toolContainer/AbstractToolContent';
import { SourceType, SourceTypeMaxFileSize, SourceTypeName, SourceTypeResultStatus } from '../../../../../src/services/domain/sourceType';
import { MediaType } from '../../../../../src/services/HttpService';
import { importReducer } from '../../../../../src/store/import/import.reducer';
import { createNoInitialStateMediaReducer } from '../../../../../src/store/media/media.reducer';
import { modalReducer } from '../../../../../src/store/modal/modal.reducer';
import { LevelTypes } from '../../../../../src/store/notifications/notifications.action';
import { notificationReducer } from '../../../../../src/store/notifications/notifications.reducer';
import { TestUtils } from '../../../../test-utils';

window.customElements.define(ImportToolContent.tag, ImportToolContent);

describe('ImportToolContent', () => {
	let store;
	const windowMock = {
		matchMedia() { }
	};

	const sourceTypeService = {
		forUrl() { },
		forData() { },
		forBlob() { }
	};
	const setup = async (config = {}) => {
		const { embed = false, isTouch = false } = config;
		const initialState = {
			notifications: {
				latest: null
			},
			import: {
				latest: null
			},
			media: {
				portrait: false
			}
		};
		store = TestUtils.setupStoreAndDi(initialState, { import: importReducer, notifications: notificationReducer, modal: modalReducer, media: createNoInitialStateMediaReducer() });
		$injector
			.registerSingleton('EnvironmentService', {
				isEmbedded: () => embed,
				getWindow: () => windowMock,
				isTouch: () => isTouch
			})
			.registerSingleton('TranslationService', { translate: (key) => key })
			.registerSingleton('SourceTypeService', sourceTypeService);

		return TestUtils.render(ImportToolContent.tag);
	};


	describe('class', () => {

		it('inherits from AbstractToolContent', async () => {

			const element = await setup();

			expect(element instanceof AbstractToolContent).toBeTrue();
		});
	});

	describe('when instantiated', () => {

		it('has a model with default values', async () => {
			const element = await setup();
			const model = element.getModel();

			expect(model).toEqual({
				mode: null
			});
		});
	});

	describe('when uploading a file', () => {
		it('updates the import-store with a kml-file', async (done) => {
			const filesMock = [TestUtils.newBlob('<kml>foo</kml>', MediaType.KML)];
			const sourceTypeKml = new SourceType(SourceTypeName.KML);
			const sourceTypeResultMock = { status: SourceTypeResultStatus.OK, sourceType: sourceTypeKml };
			spyOn(sourceTypeService, 'forBlob').and.resolveTo(sourceTypeResultMock);

			const element = await setup();
			const fileUploadInput = element.shadowRoot.querySelector('#fileupload');
			spyOnProperty(fileUploadInput, 'files').and.returnValue(filesMock);

			fileUploadInput.dispatchEvent(new Event('change'));
			expect(fileUploadInput).toBeTruthy();

			setTimeout(() => {
				expect(store.getState().import.latest.payload.data).toBe('<kml>foo</kml>');
				expect(store.getState().import.latest.payload.sourceType).toBe(sourceTypeKml);
				expect(store.getState().import.latest.payload.url).toBeNull();
				done();
			});
		});

		it('emits a notification for a unsupported file', async (done) => {
			const htmlFileMock = [TestUtils.newBlob('foo', MediaType.TEXT_HTML)];
			const sourceTypeResultMock = { status: SourceTypeResultStatus.UNSUPPORTED_TYPE, sourceType: null };
			spyOn(sourceTypeService, 'forBlob').and.resolveTo(sourceTypeResultMock);
			const element = await setup();

			const fileUploadInput = element.shadowRoot.querySelector('#fileupload');
			spyOnProperty(fileUploadInput, 'files').and.returnValue([htmlFileMock]);

			fileUploadInput.dispatchEvent(new Event('change'));
			expect(fileUploadInput).toBeTruthy();

			setTimeout(() => {
				expect(store.getState().notifications.latest.payload.content).toBe('toolbox_import_unsupported');
				expect(store.getState().notifications.latest.payload.level).toEqual(LevelTypes.WARN);
				expect(store.getState().import.latest).toBeNull();
				done();
			});

		});

		it('emits a notification for a too large file', async (done) => {
			const bigFileMock = TestUtils.newBlob('foo', MediaType.KML, SourceTypeMaxFileSize + 1);

			const sourceTypeResultMock = { status: SourceTypeResultStatus.MAX_SIZE_EXCEEDED, sourceType: null };
			spyOn(sourceTypeService, 'forBlob').and.resolveTo(sourceTypeResultMock);
			const element = await setup();
			const fileUploadInput = element.shadowRoot.querySelector('#fileupload');
			spyOnProperty(fileUploadInput, 'files').and.returnValue([bigFileMock]);

			fileUploadInput.dispatchEvent(new Event('change'));
			expect(fileUploadInput).toBeTruthy();

			setTimeout(() => {
				expect(store.getState().notifications.latest.payload.content).toBe('toolbox_import_max_size_exceeded');
				expect(store.getState().notifications.latest.payload.level).toEqual(LevelTypes.WARN);
				expect(store.getState().import.latest).toBeNull();
				done();
			});

		});

		it('emits a notification for a unknown file', async (done) => {
			const unknownFileMock = TestUtils.newBlob('foo', '');

			const sourceTypeResultMock = { status: SourceTypeResultStatus.OTHER, sourceType: null };
			spyOn(sourceTypeService, 'forBlob').and.resolveTo(sourceTypeResultMock);

			const element = await setup();
			const fileUploadInput = element.shadowRoot.querySelector('#fileupload');
			spyOnProperty(fileUploadInput, 'files').and.returnValue([unknownFileMock]);

			fileUploadInput.dispatchEvent(new Event('change'));
			expect(fileUploadInput).toBeTruthy();

			setTimeout(() => {
				expect(store.getState().notifications.latest.payload.content).toBe('toolbox_import_unknown');
				expect(store.getState().notifications.latest.payload.level).toEqual(LevelTypes.ERROR);
				expect(store.getState().import.latest).toBeNull();
				done();
			});

		});

		it('emits a notification for a unreadable file', async (done) => {
			const fileMock = {
				type: MediaType.KML, text: () => {
					throw new Error('some');
				}
			};
			spyOn(sourceTypeService, 'forBlob').and.throwError('some');
			const element = await setup();
			const fileUploadInput = element.shadowRoot.querySelector('#fileupload');
			spyOnProperty(fileUploadInput, 'files').and.returnValue([fileMock]);

			fileUploadInput.dispatchEvent(new Event('change'));
			expect(fileUploadInput).toBeTruthy();

			setTimeout(() => {
				expect(store.getState().notifications.latest.payload.content).toBe('toolbox_import_file_error');
				expect(store.getState().notifications.latest.payload.level).toEqual(LevelTypes.ERROR);
				expect(store.getState().import.latest).toBeNull();
				done();
			});
		});

		it('does nothing when no file is selected', async (done) => {
			const element = await setup();
			const fileUploadInput = element.shadowRoot.querySelector('#fileupload');
			spyOnProperty(fileUploadInput, 'files').and.returnValue([]);

			fileUploadInput.dispatchEvent(new Event('change'));
			expect(fileUploadInput).toBeTruthy();

			setTimeout(() => {
				expect(store.getState().notifications.latest).toBeNull();
				expect(store.getState().import.latest).toBeNull();
				done();
			});
		});
	});
});

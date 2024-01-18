import { MediaType } from '../../../../../src/domain/mediaTypes';
import { SourceType, SourceTypeMaxFileSize, SourceTypeName, SourceTypeResultStatus } from '../../../../../src/domain/sourceType';
import { $injector } from '../../../../../src/injection';
import { ImportToolContent } from '../../../../../src/modules/toolbox/components/importToolContent/ImportToolContent';
import { AbstractToolContent } from '../../../../../src/modules/toolbox/components/toolContainer/AbstractToolContent';
import { importReducer } from '../../../../../src/store/import/import.reducer';
import { createNoInitialStateMediaReducer } from '../../../../../src/store/media/media.reducer';
import { modalReducer } from '../../../../../src/store/modal/modal.reducer';
import { LevelTypes } from '../../../../../src/store/notifications/notifications.action';
import { notificationReducer } from '../../../../../src/store/notifications/notifications.reducer';
import { TEST_ID_ATTRIBUTE_NAME } from '../../../../../src/utils/markup';
import { TestUtils } from '../../../../test-utils';
import { findAllBySelector } from '../../../../../src/utils/markup';

window.customElements.define(ImportToolContent.tag, ImportToolContent);

describe('ImportToolContent', () => {
	let store;
	const windowMock = {
		matchMedia() {}
	};

	const sourceTypeService = {
		forUrl() {},
		forData() {},
		forBlob() {}
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
		store = TestUtils.setupStoreAndDi(initialState, {
			import: importReducer,
			notifications: notificationReducer,
			modal: modalReducer,
			media: createNoInitialStateMediaReducer()
		});
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

	describe('checks touch layout', () => {
		it('layouts for non-touch devices', async () => {
			const element = await setup();

			const splitText = element.shadowRoot.querySelector('.ba-tool-container__split-text');
			expect(window.getComputedStyle(splitText).display).toBe('block');

			const dragDropPreview = element.shadowRoot.querySelector('.drag-drop-preview');
			expect(window.getComputedStyle(dragDropPreview).display).toBe('block');
			expect(element.shadowRoot.querySelectorAll('.tool-container__button')[0].hasAttribute(TEST_ID_ATTRIBUTE_NAME)).toBeTrue();
		});

		it('layouts for touch devices', async () => {
			const touchConfig = {
				embed: false,
				isTouch: true
			};
			const element = await setup(touchConfig);

			const splitText = element.shadowRoot.querySelector('.ba-tool-container__split-text');
			expect(window.getComputedStyle(splitText).display).toBe('none');

			const dragDropPreview = element.shadowRoot.querySelector('.drag-drop-preview');
			expect(window.getComputedStyle(dragDropPreview).display).toBe('none');
			expect(element.shadowRoot.querySelectorAll('.tool-container__button')[0].hasAttribute(TEST_ID_ATTRIBUTE_NAME)).toBeTrue();
		});
	});

	describe('when instantiated', () => {
		it('has a model with default values', async () => {
			await setup();
			const model = new ImportToolContent().getModel();

			expect(model).toEqual({
				mode: null
			});
		});
	});

	describe('when highlight-search-button is clicked', () => {
		it('highlights the search input element of the ba-header component', async () => {
			const element = await setup();

			const inputElement = document.createElement('input');
			inputElement.id = 'input';
			const header = document.createElement('ba-header');
			header.append(inputElement);
			element.parentElement.append(header);
			const button = element.shadowRoot.querySelector('#highlightSearchButton');
			const input = findAllBySelector(element.parentElement, '#input');
			const attention = findAllBySelector(element.parentElement, '.attention');

			expect(input).toHaveSize(1);
			expect(attention).toHaveSize(0);
			expect(findAllBySelector(element.parentElement, '#input')[0]?.matches(':focus')).toBeFalse();

			button.click();

			const attention1 = findAllBySelector(element.parentElement, '.attention');
			expect(attention1).toHaveSize(1);
			expect(findAllBySelector(element.parentElement, '#input')[0]?.matches(':focus')).toBeTrue();

			input[0].dispatchEvent(new Event('animationend'));

			const attention2 = findAllBySelector(element.parentElement, '.attention');
			expect(attention2).toHaveSize(0);
			expect(findAllBySelector(element.parentElement, '#input')[0]?.matches(':focus')).toBeTrue();
		});

		it('does nothing when input element is not available', async () => {
			const element = await setup();
			const button = element.shadowRoot.querySelector('#highlightSearchButton');
			const input = findAllBySelector(element.parentElement, '#input');
			const attention = findAllBySelector(element.parentElement, '.attention');

			expect(input).toHaveSize(0);
			expect(attention).toHaveSize(0);

			button.click();

			const attention1 = findAllBySelector(element.parentElement, '.attention');
			expect(attention1).toHaveSize(0);
		});
	});

	describe('when uploading a file', () => {
		it('updates the import-store with a kml-file', async () => {
			const filesMock = [TestUtils.newBlob('<kml>foo</kml>', MediaType.KML)];
			const sourceTypeKml = new SourceType(SourceTypeName.KML);
			const sourceTypeResultMock = { status: SourceTypeResultStatus.OK, sourceType: sourceTypeKml };
			spyOn(sourceTypeService, 'forBlob').and.resolveTo(sourceTypeResultMock);

			const element = await setup();
			const fileUploadInput = element.shadowRoot.querySelector('#fileupload');
			spyOnProperty(fileUploadInput, 'files').and.returnValue(filesMock);

			fileUploadInput.dispatchEvent(new Event('change'));
			expect(fileUploadInput).toBeTruthy();

			await TestUtils.timeout();
			expect(store.getState().import.latest.payload.data).toBe('<kml>foo</kml>');
			expect(store.getState().import.latest.payload.sourceType).toBe(sourceTypeKml);
			expect(store.getState().import.latest.payload.url).toBeNull();
		});

		it('emits a notification for a unsupported file', async () => {
			const htmlFileMock = [TestUtils.newBlob('foo', MediaType.TEXT_HTML)];
			const sourceTypeResultMock = { status: SourceTypeResultStatus.UNSUPPORTED_TYPE, sourceType: null };
			spyOn(sourceTypeService, 'forBlob').and.resolveTo(sourceTypeResultMock);
			const element = await setup();

			const fileUploadInput = element.shadowRoot.querySelector('#fileupload');
			spyOnProperty(fileUploadInput, 'files').and.returnValue([htmlFileMock]);

			fileUploadInput.dispatchEvent(new Event('change'));
			expect(fileUploadInput).toBeTruthy();

			await TestUtils.timeout();
			expect(store.getState().notifications.latest.payload.content).toBe('toolbox_import_unsupported');
			expect(store.getState().notifications.latest.payload.level).toEqual(LevelTypes.WARN);
			expect(store.getState().import.latest).toBeNull();
		});

		it('emits a notification for a too large file', async () => {
			const bigFileMock = TestUtils.newBlob('foo', MediaType.KML, SourceTypeMaxFileSize + 1);

			const sourceTypeResultMock = { status: SourceTypeResultStatus.MAX_SIZE_EXCEEDED, sourceType: null };
			spyOn(sourceTypeService, 'forBlob').and.resolveTo(sourceTypeResultMock);
			const element = await setup();
			const fileUploadInput = element.shadowRoot.querySelector('#fileupload');
			spyOnProperty(fileUploadInput, 'files').and.returnValue([bigFileMock]);

			fileUploadInput.dispatchEvent(new Event('change'));
			expect(fileUploadInput).toBeTruthy();

			await TestUtils.timeout();
			expect(store.getState().notifications.latest.payload.content).toBe('toolbox_import_max_size_exceeded');
			expect(store.getState().notifications.latest.payload.level).toEqual(LevelTypes.WARN);
			expect(store.getState().import.latest).toBeNull();
		});

		it('emits a notification for a unknown file', async () => {
			const unknownFileMock = TestUtils.newBlob('foo', '');

			const sourceTypeResultMock = { status: SourceTypeResultStatus.OTHER, sourceType: null };
			spyOn(sourceTypeService, 'forBlob').and.resolveTo(sourceTypeResultMock);

			const element = await setup();
			const fileUploadInput = element.shadowRoot.querySelector('#fileupload');
			spyOnProperty(fileUploadInput, 'files').and.returnValue([unknownFileMock]);

			fileUploadInput.dispatchEvent(new Event('change'));
			expect(fileUploadInput).toBeTruthy();

			await TestUtils.timeout();
			expect(store.getState().notifications.latest.payload.content).toBe('toolbox_import_unknown');
			expect(store.getState().notifications.latest.payload.level).toEqual(LevelTypes.ERROR);
			expect(store.getState().import.latest).toBeNull();
		});

		it('emits a notification for a unreadable file', async () => {
			const fileMock = {
				type: MediaType.KML,
				text: () => {
					throw new Error('some');
				}
			};
			spyOn(sourceTypeService, 'forBlob').and.throwError('some');
			const element = await setup();
			const fileUploadInput = element.shadowRoot.querySelector('#fileupload');
			spyOnProperty(fileUploadInput, 'files').and.returnValue([fileMock]);

			fileUploadInput.dispatchEvent(new Event('change'));
			expect(fileUploadInput).toBeTruthy();

			await TestUtils.timeout();
			expect(store.getState().notifications.latest.payload.content).toBe('toolbox_import_file_error');
			expect(store.getState().notifications.latest.payload.level).toEqual(LevelTypes.ERROR);
			expect(store.getState().import.latest).toBeNull();
		});

		it('does nothing when no file is selected', async () => {
			const element = await setup();
			const fileUploadInput = element.shadowRoot.querySelector('#fileupload');
			spyOnProperty(fileUploadInput, 'files').and.returnValue([]);

			fileUploadInput.dispatchEvent(new Event('change'));
			expect(fileUploadInput).toBeTruthy();

			await TestUtils.timeout();
			expect(store.getState().notifications.latest).toBeNull();
			expect(store.getState().import.latest).toBeNull();
		});

		it('clears the file-value on focus of label-element', async () => {
			const element = await setup();
			const fileUploadInput = element.shadowRoot.querySelector('#fileupload');
			const inputLabel = fileUploadInput.closest('label');
			const valueSpy = spyOnProperty(fileUploadInput, 'value', 'set').and.callThrough();

			inputLabel.dispatchEvent(new Event('focus'));

			expect(valueSpy).toHaveBeenCalledWith('');
		});
	});
});

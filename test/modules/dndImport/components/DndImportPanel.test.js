import { $injector } from '../../../../src/injection';
import { DndImportPanel } from '../../../../src/modules/dndImport/components/DndImportPanel';
import { createNoInitialStateMediaReducer } from '../../../../src/store/media/media.reducer';
import { LevelTypes } from '../../../../src/store/notifications/notifications.action';
import { notificationReducer } from '../../../../src/store/notifications/notifications.reducer';
import { TestUtils } from '../../../test-utils';


window.customElements.define(DndImportPanel.tag, DndImportPanel);

describe('FeatureInfoPanel', () => {
	let store;
	const setup = (state) => {

		const initialState = {
			media: {
				portrait: false
			},
			notifications: {
				notification: null
			},
			...state
		};

		store = TestUtils.setupStoreAndDi(initialState, {
			notifications: notificationReducer,
			media: createNoInitialStateMediaReducer()
		});
		$injector
			.registerSingleton('TranslationService', { translate: (key) => key });
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
		const defaultDataTransferMock = { files: [],
			types: [],
			getData: () => {} };
		const simulateDragDropEvent = (type, dataTransfer, eventSource = document, preventDefaultFunction = () => { }, stopPropagationFunction = () => {}) => {

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

			it('updates the model for a dragged but empty type', async () => {
				const dataTransferMock = { ...defaultDataTransferMock };
				const element = await setup();

				simulateDragDropEvent('dragenter', dataTransferMock);

				expect(element.getModel().dropzoneContent).toBe('dndImport_import_unknown');
				expect(element.getModel().isActive).toBeTrue();
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

			it('emits a notification for a dropped text', async () => {
				const dataTransferMock = { ...defaultDataTransferMock, types: ['text/plain'], getData: () => 'foo' };
				const element = await setup();
				const dropZone = element.shadowRoot.querySelector('#dropzone');

				simulateDragDropEvent('drop', dataTransferMock, dropZone);

				expect(store.getState().notifications.latest.payload.content.values[0]).toBe('foo');
				expect(store.getState().notifications.latest.payload.level).toEqual(LevelTypes.INFO);
			});

			it('emits a notification for a dropped file', async () => {
				const fileMock = { text: () => 'foo' };
				const dataTransferMock = { ...defaultDataTransferMock, types: ['Files'], files: [fileMock] };
				const element = await setup();
				const dropZone = element.shadowRoot.querySelector('#dropzone');

				simulateDragDropEvent('drop', dataTransferMock, dropZone);
				setTimeout(() => {
					expect(store.getState().notifications.latest.payload.content.values[0]).toBe('foo...');
					expect(store.getState().notifications.latest.payload.level).toEqual(LevelTypes.INFO);
				});
			});

			it('emits a notification for a unreadable dropped file', async () => {
				const fileMock = { text: () => {
					throw new Error('some') ;
				} };
				const dataTransferMock = { ...defaultDataTransferMock, types: ['Files'], files: [fileMock] };
				const element = await setup();
				const dropZone = element.shadowRoot.querySelector('#dropzone');

				simulateDragDropEvent('drop', dataTransferMock, dropZone);
				setTimeout(() => {
					expect(store.getState().notifications.latest.payload.content).toBe('dndImport_import_file_error');
					expect(store.getState().notifications.latest.payload.level).toEqual(LevelTypes.ERROR);
				});
			});

			it('does nothing for a unknown dropped type', async () => {
				const dataTransferMock = { ...defaultDataTransferMock, types: ['some'] };
				const element = await setup();
				const dropZone = element.shadowRoot.querySelector('#dropzone');

				simulateDragDropEvent('drop', dataTransferMock, dropZone);
				setTimeout(() => {
					expect(store.getState().notifications.latest).toBeUndefined();
				});
			});

			it('emits a notification for a dropped but empty file', async () => {
				const dataTransferMock = { ...defaultDataTransferMock, types: ['Files'], files: [] };
				const element = await setup();
				const dropZone = element.shadowRoot.querySelector('#dropzone');

				simulateDragDropEvent('drop', dataTransferMock, dropZone);
				setTimeout(() => {
					expect(store.getState().notifications.latest.payload.content).toBe('dndImport_import_no_file_found');
					expect(store.getState().notifications.latest.payload.level).toEqual(LevelTypes.WARN);
				});
			});

			it('updates the model', async () => {
				const dataTransferMock = { ...defaultDataTransferMock };
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

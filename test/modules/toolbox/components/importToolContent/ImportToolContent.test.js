import { $injector } from '../../../../../src/injection';
import { ImportToolContent } from '../../../../../src/modules/toolbox/components/importToolContent/ImportToolContent';
import { AbstractToolContent } from '../../../../../src/modules/toolbox/components/toolContainer/AbstractToolContent';
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
	const setup = async (config = {}) => {
		const { embed = false, isTouch = false } = config;
		const initialState = {
			notifications: {
				notification: null
			},
			media: {
				portrait: false
			}
		};
		store = TestUtils.setupStoreAndDi(initialState, { notifications: notificationReducer, modal: modalReducer, media: createNoInitialStateMediaReducer() });
		$injector
			.registerSingleton('EnvironmentService', {
				isEmbedded: () => embed,
				getWindow: () => windowMock,
				isTouch: () => isTouch
			})
			.registerSingleton('TranslationService', { translate: (key) => key });

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
		it('emits a notification', async (done) => {
			const element = await setup();


			const fileUploadInput = element.shadowRoot.querySelector('#fileupload');

			fileUploadInput.dispatchEvent(new Event('change'));
			expect(fileUploadInput).toBeTruthy();

			setTimeout(() => {
				expect(store.getState().notifications.latest.payload.content).toBe('toolbox_import_data_sucess_notification');
				expect(store.getState().notifications.latest.payload.level).toEqual(LevelTypes.INFO);
				done();
			});
		});
	});
});

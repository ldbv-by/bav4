import { $injector } from '../../src/injection';
import { notificationReducer } from '../../src/store/notifications/notifications.reducer';
import { importReducer } from '../../src/store/import/import.reducer';
import { TestUtils } from '../test-utils';
import { provide } from '../../src/plugins/i18n/importPlugin.provider.js';
import { ImportPlugin } from '../../src/plugins/ImportPlugin';

describe('ImportPlugin', () => {

	const importServiceMock = {
		importVectorDataFromUrl: async () => {},
		importVectorData: () => {}
	};

	const sourceTypeServiceMock = {
		forURL: () => false,
		forData: () => false
	};

	const translationServiceMock = {
		register() { },
		translate: (key) => key
	};

	const setup = (state) => {

		const store = TestUtils.setupStoreAndDi(state, {
			import: importReducer,
			notifications: notificationReducer
		});
		$injector
			.registerSingleton('ImportService', importServiceMock)
			.registerSingleton('SourceTypeService', sourceTypeServiceMock)
			.registerSingleton('TranslationService', translationServiceMock);
		return store;
	};

	describe('constructor', () => {

		it('registers an i18n provider', async () => {
			const translationServiceSpy = spyOn(translationServiceMock, 'register');
			setup();

			new ImportPlugin();

			expect(translationServiceSpy).toHaveBeenCalledWith('importPluginProvider', provide);
		});
	});

	describe('when import.url property changes', () => {


	});

});

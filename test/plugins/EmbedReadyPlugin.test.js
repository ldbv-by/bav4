import { TestUtils } from '../test-utils.js';
import { $injector } from '../../src/injection/index.js';
import { layersReducer } from '../../src/store/layers/layers.reducer.js';
import { EmbedReadyPlugin } from '../../src/plugins/EmbedReadyPlugin.js';
import { setReady } from '../../src/store/layers/layers.action.js';

describe('EmbedReadyPlugin', () => {
	const environmentServiceMock = {
		isEmbedded: () => false
	};

	const setup = (state = {}) => {
		const store = TestUtils.setupStoreAndDi(state, {
			layers: layersReducer
		});
		$injector.registerSingleton('EnvironmentService', environmentServiceMock);
		const loadingContainer = document.createElement('div');
		loadingContainer.id = 'loading-container';
		document.body.appendChild(loadingContainer);

		return store;
	};

	afterEach(() => {
		/*
		 * Manually clearing document.body between tests, because
		 * when tests happen to run on the same worker they'll likely cause flaky behavior.
		 */
		const loadingContainer = document.getElementById('loading-container');
		if (loadingContainer) {
			loadingContainer.remove();
		}
	});

	describe('register', () => {
		describe('when layer is ready', () => {
			it('hides the loading-container in embedded mode', async () => {
				const store = setup();
				const instanceUnderTest = new EmbedReadyPlugin();

				spyOn(environmentServiceMock, 'isEmbedded').and.returnValue(true);
				// In async tests, removing elements from DOM is not immediate => spy to check if it was called
				await instanceUnderTest.register(store);
				setReady();

				expect(document.getElementById('loading-container').style.display).toBe('none');
				expect(instanceUnderTest._unsubscribeFn).toBeNull();
			});

			it('keeps the loading-container while layer is not ready in embedded mode', async () => {
				const store = setup();
				const instanceUnderTest = new EmbedReadyPlugin();

				spyOn(environmentServiceMock, 'isEmbedded').and.returnValue(true);
				await instanceUnderTest.register(store);

				expect(document.getElementById('loading-container').style.display).toBe('');
				expect(instanceUnderTest._unsubscribeFn).toBeDefined();
				expect(instanceUnderTest._unsubscribeFn).not.toBeNull();
			});

			it('does not observe for a loading-container when not in embedded mode', async () => {
				const store = setup();
				const instanceUnderTest = new EmbedReadyPlugin();

				await instanceUnderTest.register(store);

				expect(instanceUnderTest._unsubscribeFn).toBeUndefined();
			});
		});
	});
});

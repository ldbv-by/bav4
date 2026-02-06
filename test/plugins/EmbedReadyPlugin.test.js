import { TestUtils } from '../test-utils.js';
import { $injector } from '../../src/injection/index.js';
import { layersReducer } from '../../src/store/layers/layers.reducer.js';
import { EmbedReadyPlugin } from '../../src/plugins/EmbedReadyPlugin.js';
import { setReady } from '../../src/store/layers/layers.action.js';

describe('EmbedReadyPlugin', () => {
	const environmentServiceMock = {
		isEmbeddedAsIframe: () => false
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
			it('removes the loading-container in embedded mode', async () => {
				const store = setup();
				const instanceUnderTest = new EmbedReadyPlugin();
				const loadingContainer = document.getElementById('loading-container');

				spyOn(environmentServiceMock, 'isEmbedded').and.returnValue(true);
				// In async tests, removing elements from DOM is not immediate => spy to check if it was called
				const removeSpy = spyOn(loadingContainer, 'remove');
				await instanceUnderTest.register(store);
				setReady();

				expect(removeSpy).toHaveBeenCalledTimes(1);
				expect(instanceUnderTest._unsubscribeFn).toBeNull();
			});

			it('keeps the loading-container while layer is not ready in embedded mode', async () => {
				const store = setup();
				const instanceUnderTest = new EmbedReadyPlugin();
				const loadingContainer = document.getElementById('loading-container');

				spyOn(environmentServiceMock, 'isEmbeddedAsIframe').and.returnValue(true);
				const removeSpy = spyOn(loadingContainer, 'remove');
				await instanceUnderTest.register(store);

				expect(removeSpy).toHaveBeenCalledTimes(0);
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

import { TestUtils } from '../test-utils.js';
import { $injector } from '../../src/injection/index.js';
import { GlobalErrorPlugin } from '../../src/plugins/GlobalErrorPlugin.js';
import { notificationReducer } from '../../src/store/notifications/notifications.reducer.js';
import { UnavailableGeoResourceError } from '../../src/domain/errors.js';
import { LevelTypes } from '../../src/store/notifications/notifications.action.js';

describe('GlobalErrorPlugin', () => {
	const setup = () => {
		const store = TestUtils.setupStoreAndDi(
			{},
			{
				notifications: notificationReducer
			}
		);
		$injector.registerSingleton('TranslationService', { translate: (key, params = []) => `${key}${params.length ? ` [${params.join(',')}]` : ''}` });
		return store;
	};

	describe('register', () => {
		it('registers a `beforeunload` and a `unhandledrejection` event listener', async () => {
			const store = setup();
			const spy = spyOn(window, 'addEventListener');
			const instanceUnderTest = new GlobalErrorPlugin();

			await instanceUnderTest.register(store);

			expect(spy).toHaveBeenCalledWith('error', jasmine.any(Function));
			expect(spy).toHaveBeenCalledWith('unhandledrejection', jasmine.any(Function));
		});
	});

	describe('handles different error type', () => {
		let errors;
		/**
		 * We have to tweak jasmine's global error catching behavior to be able to test our global error handling.
		 * See also: https://github.com/jasmine/jasmine/blob/main/spec/core/GlobalErrorsSpec.js
		 */
		beforeEach(() => {
			errors = new jasmine.GlobalErrors();
			errors.setOverrideListener(
				() => {},
				() => {}
			);
			errors.install();
		});
		afterEach(() => {
			errors.uninstall();
		});

		describe('UnavailableGeoResourceError', () => {
			it('handles an UnavailableGeoResourceError with code 401', async () => {
				const store = setup();
				const message = 'message';
				const geoResourceId = 'geoResourceId';
				const httpStatus = 401;
				const instanceUnderTest = new GlobalErrorPlugin();
				await instanceUnderTest.register(store);
				const event = new ErrorEvent('error', { error: new UnavailableGeoResourceError(message, geoResourceId, httpStatus) });

				window.dispatchEvent(event);

				expect(store.getState().notifications.latest.payload.content).toBe(
					'global_geoResource_not_available [geoResourceId,global_geoResource_unauthorized]'
				);
				expect(store.getState().notifications.latest.payload.level).toEqual(LevelTypes.WARN);
			});

			it('handles an UnavailableGeoResourceError with code 403', async () => {
				const store = setup();
				const message = 'message';
				const geoResourceId = 'geoResourceId';
				const httpStatus = 403;
				const instanceUnderTest = new GlobalErrorPlugin();
				await instanceUnderTest.register(store);
				const event = new ErrorEvent('error', { error: new UnavailableGeoResourceError(message, geoResourceId, httpStatus) });

				window.dispatchEvent(event);

				expect(store.getState().notifications.latest.payload.content).toBe(
					'global_geoResource_not_available [geoResourceId,global_geoResource_forbidden]'
				);
				expect(store.getState().notifications.latest.payload.level).toEqual(LevelTypes.WARN);
			});

			it('handles an UnavailableGeoResourceError without code', async () => {
				const store = setup();
				const message = 'message';
				const geoResourceId = 'geoResourceId';
				const instanceUnderTest = new GlobalErrorPlugin();
				await instanceUnderTest.register(store);
				const event = new ErrorEvent('error', { error: new UnavailableGeoResourceError(message, geoResourceId) });

				window.dispatchEvent(event);

				expect(store.getState().notifications.latest.payload.content).toBe('global_geoResource_not_available [geoResourceId]');
				expect(store.getState().notifications.latest.payload.level).toEqual(LevelTypes.WARN);
			});
		});

		describe('any other Error', () => {
			describe('synchronously thrown', () => {
				it('emits an error notification', async () => {
					const store = setup();
					const message = 'message';
					const instanceUnderTest = new GlobalErrorPlugin();
					await instanceUnderTest.register(store);
					const event = new ErrorEvent('error', { error: new Error(message) });

					window.dispatchEvent(event);

					expect(store.getState().notifications.latest.payload.content).toBe('global_generic_exception');
					expect(store.getState().notifications.latest.payload.level).toEqual(LevelTypes.ERROR);
				});
			});
			describe('thrown by promise rejection', () => {
				it('emits an error notification', async () => {
					const store = setup();
					const message = 'message';
					const instanceUnderTest = new GlobalErrorPlugin();
					await instanceUnderTest.register(store);

					await expectAsync(Promise.reject(new Error(message)));
					await TestUtils.timeout();
					await TestUtils.timeout();

					expect(store.getState().notifications.latest.payload.content).toBe('global_generic_exception');
					expect(store.getState().notifications.latest.payload.level).toEqual(LevelTypes.ERROR);
				});
			});
		});
	});
});

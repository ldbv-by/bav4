import { TestUtils } from '@test/test-utils.js';
import { $injector } from '@src/injection/index.js';
import { GlobalErrorPlugin } from '@src/plugins/GlobalErrorPlugin.js';
import { notificationReducer } from '@src/store/notifications/notifications.reducer.js';
import { UnavailableGeoResourceError } from '@src/domain/errors.js';
import { LevelTypes } from '@src/store/notifications/notifications.action.js';
import { observe } from '@src/utils/storeUtils.js';
import { layersReducer } from '@src/store/layers/layers.reducer.js';
import { addLayer } from '@src/store/layers/layers.action.js';
import { GeoResourceAuthenticationType } from '@src/domain/geoResources.js';

describe('GlobalErrorPlugin', () => {
	let instanceUnderTest;
	let store;
	beforeEach(() => {
		store = setup();
		instanceUnderTest = new GlobalErrorPlugin();
	});

	afterEach(() => {
		// we need to unregister all event listener, so they won't influence the next test
		instanceUnderTest._unregisterListeners();
	});

	const geoResourceService = {
		byId() {
			return null;
		}
	};
	const environmentService = {
		isEmbeddedAsWC() {
			return false;
		}
	};
	const setup = () => {
		const defaultStore = TestUtils.setupStoreAndDi(
			{},
			{
				notifications: notificationReducer,
				layers: layersReducer
			}
		);
		$injector
			.registerSingleton('TranslationService', { translate: (key, params = []) => `${key}${params.length ? ` [${params.join(',')}]` : ''}` })
			.registerSingleton('GeoResourceService', geoResourceService)
			.registerSingleton('EnvironmentService', environmentService);
		return defaultStore;
	};

	describe('class', () => {
		it('defines constant values', () => {
			expect(GlobalErrorPlugin.THROTTLE_NOTIFICATION_DELAY_MS).toBe(3000);
		});
	});

	describe('register', () => {
		it('registers a `beforeunload` and a `unhandledrejection` event listener', async () => {
			const store = setup();
			const spy = vi.spyOn(window, 'addEventListener').mockImplementation(() => {});
			const instanceUnderTest = new GlobalErrorPlugin();

			await instanceUnderTest.register(store);

			expect(spy).toHaveBeenCalledWith('error', expect.any(Function));
			expect(spy).toHaveBeenCalledWith('unhandledrejection', expect.any(Function));
		});
	});

	describe('handles different error type', () => {
		describe('UnavailableGeoResourceError', () => {
			describe('and the GeoResource is known', () => {
				describe('and requires authentication', () => {
					it('removes all associated layers from the layers s-o-s', async () => {
						const message = 'message';
						const geoResourceId = 'geoResourceId';
						const geoResourceLabel = 'geoResourceLabel';
						const httpStatus = 401;
						const byIdSpy = vi
							.spyOn(geoResourceService, 'byId')
							.mockReturnValue({ label: geoResourceLabel, authenticationType: GeoResourceAuthenticationType.BAA });
						await instanceUnderTest.register(store);
						addLayer('id0', { geoResourceId: geoResourceId });
						addLayer('id1', { geoResourceId: geoResourceId });
						const event = new ErrorEvent('error', { error: new UnavailableGeoResourceError(message, geoResourceId, httpStatus) });
						expect(store.getState().layers.active).toHaveLength(2);

						window.dispatchEvent(event);

						expect(byIdSpy).toHaveBeenCalledExactlyOnceWith(geoResourceId);
						expect(store.getState().layers.active).toHaveLength(0);
					});
				});

				describe('and does NOT require authentication', () => {
					it('does NOT remove all associated layers from the layers s-o-s', async () => {
						const message = 'message';
						const geoResourceId = 'geoResourceId';
						const geoResourceLabel = 'geoResourceLabel';
						const httpStatus = 401;
						const byIdSpy = vi.spyOn(geoResourceService, 'byId').mockReturnValue({ label: geoResourceLabel, authenticationType: null });
						await instanceUnderTest.register(store);
						addLayer('id0', { geoResourceId: geoResourceId });
						addLayer('id1', { geoResourceId: geoResourceId });
						const event = new ErrorEvent('error', { error: new UnavailableGeoResourceError(message, geoResourceId, httpStatus) });
						expect(store.getState().layers.active).toHaveLength(2);
						window.dispatchEvent(event);
						expect(store.getState().layers.active).toHaveLength(2);
						expect(byIdSpy).toHaveBeenCalledExactlyOnceWith(geoResourceId);
					});
				});

				it('handles an UnavailableGeoResourceError with code 401', async () => {
					const message = 'message';
					const geoResourceId = 'geoResourceId';
					const geoResourceLabel = 'geoResourceLabel';
					const httpStatus = 401;
					const byIdSpy = vi.spyOn(geoResourceService, 'byId').mockReturnValue({ label: geoResourceLabel });
					await instanceUnderTest.register(store);
					const event = new ErrorEvent('error', { error: new UnavailableGeoResourceError(message, geoResourceId, httpStatus) });

					window.dispatchEvent(event);

					expect(store.getState().notifications.latest.payload.content).toBe(
						'global_geoResource_not_available [geoResourceLabel,global_geoResource_unauthorized]'
					);
					expect(store.getState().notifications.latest.payload.level).toEqual(LevelTypes.WARN);
					expect(byIdSpy).toHaveBeenCalledExactlyOnceWith(geoResourceId);
				});

				it('handles an UnavailableGeoResourceError with code 403', async () => {
					const message = 'message';
					const geoResourceId = 'geoResourceId';
					const geoResourceLabel = 'geoResourceLabel';
					const httpStatus = 403;
					const byIdSpy = vi.spyOn(geoResourceService, 'byId').mockReturnValue({ label: geoResourceLabel });
					await instanceUnderTest.register(store);
					const event = new ErrorEvent('error', { error: new UnavailableGeoResourceError(message, geoResourceId, httpStatus) });

					window.dispatchEvent(event);

					expect(store.getState().notifications.latest.payload.content).toBe(
						'global_geoResource_not_available [geoResourceLabel,global_geoResource_forbidden]'
					);
					expect(store.getState().notifications.latest.payload.level).toEqual(LevelTypes.WARN);
					expect(byIdSpy).toHaveBeenCalledExactlyOnceWith(geoResourceId);
				});

				it('handles an UnavailableGeoResourceError without code', async () => {
					const message = 'message';
					const geoResourceId = 'geoResourceId';
					const geoResourceLabel = 'geoResourceLabel';
					const byIdSpy = vi.spyOn(geoResourceService, 'byId').mockReturnValue({ label: geoResourceLabel });
					await instanceUnderTest.register(store);
					const event = new ErrorEvent('error', { error: new UnavailableGeoResourceError(message, geoResourceId) });

					window.dispatchEvent(event);

					expect(store.getState().notifications.latest.payload.content).toBe('global_geoResource_not_available [geoResourceLabel]');
					expect(store.getState().notifications.latest.payload.level).toEqual(LevelTypes.WARN);
					expect(byIdSpy).toHaveBeenCalledExactlyOnceWith(geoResourceId);
				});
			});

			describe('and the GeoResource is unknown', () => {
				it('handles an UnavailableGeoResourceError with code 401', async () => {
					const message = 'message';
					const geoResourceId = 'geoResourceId';
					const httpStatus = 401;
					await instanceUnderTest.register(store);
					const event = new ErrorEvent('error', { error: new UnavailableGeoResourceError(message, geoResourceId, httpStatus) });

					window.dispatchEvent(event);

					expect(store.getState().notifications.latest.payload.content).toBe(
						'global_geoResource_not_available [geoResourceId,global_geoResource_unauthorized]'
					);
					expect(store.getState().notifications.latest.payload.level).toEqual(LevelTypes.WARN);
				});

				it('handles an UnavailableGeoResourceError with code 403', async () => {
					const message = 'message';
					const geoResourceId = 'geoResourceId';
					const httpStatus = 403;
					await instanceUnderTest.register(store);
					const event = new ErrorEvent('error', { error: new UnavailableGeoResourceError(message, geoResourceId, httpStatus) });

					window.dispatchEvent(event);

					expect(store.getState().notifications.latest.payload.content).toBe(
						'global_geoResource_not_available [geoResourceId,global_geoResource_forbidden]'
					);
					expect(store.getState().notifications.latest.payload.level).toEqual(LevelTypes.WARN);
				});

				it('handles an UnavailableGeoResourceError without code', async () => {
					const message = 'message';
					const geoResourceId = 'geoResourceId';
					await instanceUnderTest.register(store);
					const event = new ErrorEvent('error', { error: new UnavailableGeoResourceError(message, geoResourceId) });

					window.dispatchEvent(event);

					expect(store.getState().notifications.latest.payload.content).toBe('global_geoResource_not_available [geoResourceId]');
					expect(store.getState().notifications.latest.payload.level).toEqual(LevelTypes.WARN);
				});
			});
		});

		describe('any other Error', () => {
			describe('in default mode', () => {
				describe('synchronously thrown', () => {
					it('emits an error notification', async () => {
						const message = 'message';

						await instanceUnderTest.register(store);
						const emitGenericNotificationThrottledSpy = vi.spyOn(instanceUnderTest, '_emitThrottledGenericNotification').mockImplementation(() => {});

						window.dispatchEvent(new ErrorEvent('error', { error: new Error(message) }));
						expect(emitGenericNotificationThrottledSpy).toHaveBeenCalledTimes(1);
					});
				});

				describe('thrown by promise rejection', () => {
					it('emits an error notification', async () => {
						const message = 'message';
						await instanceUnderTest.register(store);
						const emitGenericNotificationThrottledSpy = vi.spyOn(instanceUnderTest, '_emitThrottledGenericNotification').mockImplementation(() => {});

						await expect(Promise.reject(new Error(message)));
						await TestUtils.timeout(100 /**give the plugin some time to catch the error */);

						expect(emitGenericNotificationThrottledSpy).toHaveBeenCalledTimes(1);
					});
				});
			});

			describe('embedded as WC', () => {
				describe('synchronously thrown', () => {
					it('does nothing', async () => {
						vi.spyOn(environmentService, 'isEmbeddedAsWC').mockReturnValue(true);
						const message = 'message';

						await instanceUnderTest.register(store);
						const emitGenericNotificationThrottledSpy = vi.spyOn(instanceUnderTest, '_emitThrottledGenericNotification').mockImplementation(() => {});

						window.dispatchEvent(new ErrorEvent('error', { error: new Error(message) }));
						expect(emitGenericNotificationThrottledSpy).not.toHaveBeenCalledTimes(1);
					});
				});

				describe('thrown by promise rejection', () => {
					it('does nothing', async () => {
						vi.spyOn(environmentService, 'isEmbeddedAsWC').mockReturnValue(true);
						const message = 'message';
						await instanceUnderTest.register(store);
						const emitGenericNotificationThrottledSpy = vi.spyOn(instanceUnderTest, '_emitThrottledGenericNotification').mockImplementation(() => {});

						await expect(Promise.reject(new Error(message)));
						await TestUtils.timeout(100 /**give the plugin some time to catch the error */);

						expect(emitGenericNotificationThrottledSpy).not.toHaveBeenCalledTimes(1);
					});
				});
			});
		});
	});

	describe('_emitThrottledGenericNotification', () => {
		it('emits notifications throttled', async () => {
			const onLatestChanged = vi.fn();
			observe(store, (state) => state.notifications.latest, onLatestChanged);

			// call multiple times to test throttling
			instanceUnderTest._emitThrottledGenericNotification();
			instanceUnderTest._emitThrottledGenericNotification();
			instanceUnderTest._emitThrottledGenericNotification();

			expect(onLatestChanged).toHaveBeenCalledTimes(1);
			expect(store.getState().notifications.latest.payload.content).toBe('global_generic_exception');
			expect(store.getState().notifications.latest.payload.level).toEqual(LevelTypes.ERROR);
		});
	});
});

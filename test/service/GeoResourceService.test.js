/* eslint-disable no-undef */
import {
	FALLBACK_GEORESOURCE_ID_0,
	FALLBACK_GEORESOURCE_ID_1,
	FALLBACK_GEORESOURCE_ID_2,
	FALLBACK_GEORESOURCE_ID_3,
	FALLBACK_GEORESOURCE_LABEL_0,
	FALLBACK_GEORESOURCE_LABEL_1,
	FALLBACK_GEORESOURCE_LABEL_2,
	FALLBACK_GEORESOURCE_LABEL_3,
	GeoResourceService
} from '../../src/services/GeoResourceService';
import {
	AggregateGeoResource,
	GeoResourceFuture,
	VectorGeoResource,
	VectorSourceType,
	WmsGeoResource,
	XyzGeoResource
} from '../../src/domain/geoResources';
import { loadBvvGeoResourceById, loadBvvGeoResources, loadExternalGeoResource } from '../../src/services/provider/geoResource.provider';
import { $injector } from '../../src/injection';
import { loadBvvFileStorageResourceById } from '../../src/services/provider/fileStorage.provider';
import { TestUtils } from '../test-utils';
import { createDefaultLayerProperties, layersReducer } from '../../src/store/layers/layers.reducer';
import { bvv401InterceptorProvider } from '../../src/services/provider/auth.provider';

describe('GeoResourceService', () => {
	const loadExampleGeoResources = async () => {
		const wms0 = new WmsGeoResource(
			'bodendenkmal',
			'Bodendenkmal',
			'https://geoservices.bayern.de/wms/v1/ogc_denkmal.cgi',
			'bodendenkmalO',
			'image/png'
		);
		const wms1 = new WmsGeoResource(
			'baudenkmal',
			'Baudenkmal',
			'https://geoservices.bayern.de/wms/v1/ogc_denkmal.cgi',
			'bauensembleO,einzeldenkmalO',
			'image/png'
		);
		const wms2 = new WmsGeoResource('dop80', 'DOP 80 Farbe', 'https://geoservices.bayern.de/wms/v2/ogc_dop80_oa.cgi?', 'by_dop80c', 'image/png');
		const xyz0 = new XyzGeoResource('atkis_sw', 'Webkarte s/w', 'https://intergeo{31-37}.bayernwolke.de/betty/g_atkisgray/{z}/{x}/{y}');
		const aggregate0 = new AggregateGeoResource('aggregate0', 'Aggregate', ['xyz0', 'wms0']);

		return [wms0, wms1, wms2, xyz0, aggregate0];
	};

	const environmentService = {
		isStandalone: () => {}
	};
	const authService = {
		isSignedIn: () => {},
		getRoles: () => {}
	};

	let store;

	const setup = (provider = loadExampleGeoResources, byIdProviders, authResponseInterceptorProvider, state = {}) => {
		store = TestUtils.setupStoreAndDi(state, {
			layers: layersReducer
		});
		$injector.registerSingleton('EnvironmentService', environmentService).registerSingleton('AuthService', authService);
		return new GeoResourceService(provider, byIdProviders, authResponseInterceptorProvider);
	};
	const xyzGeoResource = new XyzGeoResource('xyzId', 'xyzLabel', 'xyzUrl');

	it('exports constant values', async () => {
		expect(FALLBACK_GEORESOURCE_ID_0).toBe('tpo');
		expect(FALLBACK_GEORESOURCE_ID_1).toBe('tpo_mono');
		expect(FALLBACK_GEORESOURCE_ID_2).toBe('bmde_vector');
		expect(FALLBACK_GEORESOURCE_ID_3).toBe('bmde_vector_relief');
		expect(FALLBACK_GEORESOURCE_LABEL_0).toBe('TopPlusOpen');
		expect(FALLBACK_GEORESOURCE_LABEL_1).toBe('TopPlusOpen monochrome');
		expect(FALLBACK_GEORESOURCE_LABEL_2).toBe('Web Vektor');
		expect(FALLBACK_GEORESOURCE_LABEL_3).toBe('Web Vektor Relief');
	});

	describe('init', () => {
		it('initializes the service and proxifies all GeoResource', async () => {
			const instanceUnderTest = setup();
			const proxifySpy = spyOn(instanceUnderTest, '_proxify').and.callThrough();
			expect(instanceUnderTest._geoResources).toBeNull();

			const georesources = await instanceUnderTest.init();

			//georesources from provider
			expect(georesources.length).toBe(5);
			expect(proxifySpy).toHaveBeenCalledTimes(5);
		});

		it('initializes the service with default providers', async () => {
			setup(); // provide required infrastructure
			const instanceUnderTest = new GeoResourceService();
			expect(instanceUnderTest._provider).toEqual(loadBvvGeoResources);
			expect(instanceUnderTest._byIdProvider).toEqual([loadExternalGeoResource, loadBvvFileStorageResourceById, loadBvvGeoResourceById]);
			expect(instanceUnderTest._authResponseInterceptorProvider).toEqual(bvv401InterceptorProvider);
		});

		it('initializes the service with custom providers', async () => {
			const customProvider = async () => {};
			const customByIdProvider0 = async () => {};
			const customByIdProvider1 = async () => {};
			const customAuthResponseInterceptorProvider = () => {};
			const instanceUnderTest = setup(customProvider, [customByIdProvider0, customByIdProvider1], customAuthResponseInterceptorProvider);
			expect(instanceUnderTest._provider).toEqual(customProvider);
			expect(instanceUnderTest._byIdProvider).toEqual([customByIdProvider0, customByIdProvider1]);
			expect(instanceUnderTest._authResponseInterceptorProvider).toEqual(customAuthResponseInterceptorProvider);
		});

		it('just provides GeoResources when already initialized', async () => {
			const instanceUnderTest = setup();
			instanceUnderTest._geoResources = [xyzGeoResource];

			const georesources = await instanceUnderTest.init();

			expect(georesources.length).toBe(1);
		});

		describe('provider cannot fulfill', () => {
			it('loads two fallback geoResources when we are in standalone mode', async () => {
				spyOn(environmentService, 'isStandalone').and.returnValue(true);
				const instanceUnderTest = setup(async () => {
					throw new Error('GeoResources could not be loaded');
				});
				const warnSpy = spyOn(console, 'warn');

				expect(instanceUnderTest._geoResources).toBeNull();

				const georesources = await instanceUnderTest.init();

				expect(georesources.length).toBe(4);
				expect(georesources[0].id).toBe(FALLBACK_GEORESOURCE_ID_0);
				expect(georesources[0].label).toBe(FALLBACK_GEORESOURCE_LABEL_0);
				expect(georesources[0].getAttribution()[0].copyright[0].label).toBe('Bundesamt für Kartographie und Geodäsie (2024)');
				expect(georesources[0].getAttribution()[0].copyright[0].url).toBe('https://www.bkg.bund.de/');
				expect(georesources[0].getAttribution()[0].copyright[1].label).toBe('Datenquellen');
				expect(georesources[0].getAttribution()[0].copyright[1].url).toBe('https://sg.geodatenzentrum.de/web_public/Datenquellen_TopPlus_Open.pdf');
				expect(georesources[1].id).toBe(FALLBACK_GEORESOURCE_ID_1);
				expect(georesources[1].label).toBe(FALLBACK_GEORESOURCE_LABEL_1);
				expect(georesources[1].getAttribution()[0].copyright[0].label).toBe('Bundesamt für Kartographie und Geodäsie (2024)');
				expect(georesources[1].getAttribution()[0].copyright[0].url).toBe('https://www.bkg.bund.de/');
				expect(georesources[1].getAttribution()[0].copyright[1].label).toBe('Datenquellen');
				expect(georesources[1].getAttribution()[0].copyright[1].url).toBe('https://sg.geodatenzentrum.de/web_public/Datenquellen_TopPlus_Open.pdf');
				expect(warnSpy).toHaveBeenCalledWith('GeoResources could not be fetched from backend. Using fallback geoResources ...');
			});

			it('logs an error when we are NOT in standalone mode', async () => {
				spyOn(environmentService, 'isStandalone').and.returnValue(false);
				const instanceUnderTest = setup(async () => {
					throw new Error('GeoResources could not be loaded');
				});
				const errorSpy = spyOn(console, 'error');

				const topics = await instanceUnderTest.init();

				expect(topics).toEqual([]);
				expect(errorSpy).toHaveBeenCalledWith('GeoResources could not be fetched from backend.', jasmine.anything());
			});
		});
	});

	describe('all', () => {
		it('provides all GeoResources', () => {
			const instanceUnderTest = setup();
			instanceUnderTest._geoResources = [xyzGeoResource];

			const geoResources = instanceUnderTest.all();

			expect(geoResources.length).toBe(1);
		});

		it('logs a warn statement when service hat not been initialized', () => {
			const instanceUnderTest = setup();
			const warnSpy = spyOn(console, 'warn');

			expect(instanceUnderTest.all()).toEqual([]);
			expect(warnSpy).toHaveBeenCalledWith('GeoResourceService not yet initialized');
		});
	});

	describe('byId', () => {
		it('provides a GeoResource by its id', () => {
			const instanceUnderTest = setup();
			instanceUnderTest._geoResources = [xyzGeoResource];

			const geoResource = instanceUnderTest.byId('xyzId');

			expect(geoResource).toBeTruthy();
		});

		it('provides null if for an unknown id', () => {
			const instanceUnderTest = setup();
			instanceUnderTest._geoResources = [xyzGeoResource];

			const geoResource = instanceUnderTest.byId('something');

			expect(geoResource).toBeNull();
		});

		it('provides null if for null or undefined id', () => {
			const instanceUnderTest = setup();
			instanceUnderTest._geoResources = [xyzGeoResource];

			expect(instanceUnderTest.byId(null)).toBeNull();
			expect(instanceUnderTest.byId(undefined)).toBeNull();
		});

		it('logs a warn statement when when service hat not been initialized', () => {
			const instanceUnderTest = setup();
			const warnSpy = spyOn(console, 'warn');

			expect(instanceUnderTest.byId('unknownId')).toBeNull();
			expect(warnSpy).toHaveBeenCalledWith('GeoResourceService not yet initialized');
		});
	});

	describe('addOrReplace', () => {
		it('adds a GeoResource', async () => {
			const instanceUnderTest = setup();
			const proxifySpy = spyOn(instanceUnderTest, '_proxify').and.callThrough();
			instanceUnderTest._geoResources = [];
			const geoResource = new WmsGeoResource('wms', 'Wms', 'https://some.url', 'someLayer', 'image/png');

			const result = instanceUnderTest.addOrReplace(geoResource);

			expect(instanceUnderTest._geoResources.length).toBe(1);
			expect(instanceUnderTest._geoResources[0]).toEqual(geoResource);
			expect(proxifySpy).toHaveBeenCalledWith(geoResource);
			expect(result[GeoResourceService.proxyIdentifier]).toBeTrue();
			expect(result).toEqual(geoResource);
		});

		it('replaces a GeoResource', async () => {
			const instanceUnderTest = setup();
			const geoResourceId = 'geoResId';
			const geoResource = new WmsGeoResource(geoResourceId, 'Wms', 'https://some.url', 'someLayer', 'image/png');
			instanceUnderTest._geoResources = [geoResource];
			const geoResource2 = new VectorGeoResource(geoResourceId, 'Vector', VectorSourceType.GEOJSON);

			const result = instanceUnderTest.addOrReplace(geoResource2);

			expect(instanceUnderTest._geoResources.length).toBe(1);
			expect(instanceUnderTest._geoResources[0]).toEqual(geoResource2);
			expect(result[GeoResourceService.proxyIdentifier]).toBeTrue();
			expect(result).toEqual(geoResource2);
		});

		it("updates the slice-of-state 'layers'", () => {
			const geoResourceId0 = 'geoResourceId0';
			const geoResourceId1 = 'geoResourceId1';
			const layerProperties0 = { ...createDefaultLayerProperties(), id: 'id0', geoResourceId: geoResourceId0 };
			const layerProperties1 = { ...createDefaultLayerProperties(), id: 'id1', geoResourceId: geoResourceId1 };
			const geoResource0 = new WmsGeoResource(geoResourceId0, 'Wms', 'https://some.url', 'someLayer', 'image/png');
			const instanceUnderTest = setup(null, null, null, {
				layers: {
					active: [layerProperties0, layerProperties1]
				}
			});
			instanceUnderTest._geoResources = [geoResource0];

			instanceUnderTest.addOrReplace(geoResource0);

			expect(store.getState().layers.active[0].grChangedFlag.payload).toBe(geoResourceId0);
			expect(store.getState().layers.active[1].grChangedFlag).toBeNull();
		});
	});

	describe('asyncById', () => {
		it('adds a GeoResourceFuture to the internal cache and returns it', async () => {
			const id = 'id';
			const expectedFuture = new GeoResourceFuture(id, () => {});
			const customByIdProvider0 = () => null;
			const customByIdProvider1 = () => expectedFuture;
			const instanceUnderTest = setup(async () => [], [customByIdProvider0, customByIdProvider1]);
			await instanceUnderTest.init();

			const future = instanceUnderTest.asyncById(id);

			expect(future).toEqual(expectedFuture);
			expect(instanceUnderTest._geoResources[0]).toEqual(expectedFuture);
		});

		it('returns null when no byIdProvider can fulfill', async () => {
			const customByIdProvider0 = async () => null;
			const customByIdProvider1 = async () => null;
			const instanceUnderTest = setup(async () => [], [customByIdProvider0, customByIdProvider1]);
			await instanceUnderTest.init();

			const future = instanceUnderTest.asyncById('foo');

			expect(future).toBeNull();
			expect(instanceUnderTest._geoResources).toHaveSize(0);
		});
	});

	describe('isAllowed', () => {
		describe('GeoResource is unknown', () => {
			it('returns `true`', async () => {
				const geoResourceId = 'id';
				const instanceUnderTest = setup();
				spyOn(instanceUnderTest, 'byId').withArgs(geoResourceId).and.returnValue(null);

				expect(instanceUnderTest.isAllowed(geoResourceId)).toBeTrue();
			});
		});

		describe('User is signed in', () => {
			describe('and has the wrong role', () => {
				it('returns `false`', async () => {
					spyOn(authService, 'getRoles').and.returnValue(['TEST']);
					const geoResourceId = 'id';
					const geoResource = { authRoles: ['FOO', 'BAR'] };
					const instanceUnderTest = setup();
					spyOn(instanceUnderTest, 'byId').withArgs(geoResourceId).and.returnValue(geoResource);

					expect(instanceUnderTest.isAllowed(geoResourceId)).toBeFalse();
				});
			});
			describe('and has a suitable role', () => {
				it('returns `true`', async () => {
					spyOn(authService, 'getRoles').and.returnValue(['BAR']);
					const geoResourceId = 'id';
					const geoResource = { authRoles: ['FOO', 'BAR'] };
					const instanceUnderTest = setup();
					spyOn(instanceUnderTest, 'byId').withArgs(geoResourceId).and.returnValue(geoResource);

					expect(instanceUnderTest.isAllowed(geoResourceId)).toBeTrue();
				});
			});
			describe('and GeoResource is NOT restricted', () => {
				it('returns `true`', async () => {
					spyOn(authService, 'getRoles').and.returnValue(['BAR']);
					const geoResourceId = 'id';
					const geoResource = { authRoles: [] };
					const instanceUnderTest = setup();
					spyOn(instanceUnderTest, 'byId').withArgs(geoResourceId).and.returnValue(geoResource);

					expect(instanceUnderTest.isAllowed(geoResourceId)).toBeTrue();
				});
			});
		});

		describe('AggregateGeoResource', () => {
			describe('the AggregateGeoResource defines roles', () => {
				it('returns `false`', async () => {
					const aggGeoResourceId = 'aggGeoResourceId';
					const instanceUnderTest = setup();
					spyOn(authService, 'getRoles').and.returnValue(['TEST']);
					spyOn(instanceUnderTest, 'byId').and.callFake((id) => {
						switch (id) {
							case aggGeoResourceId:
								return new AggregateGeoResource(aggGeoResourceId, 'label', ['geoResourceId0', 'geoResourceId1']).setAuthRoles(['TEST']);
						}
					});

					expect(instanceUnderTest.isAllowed(aggGeoResourceId)).toBeTrue();
				});
			});

			describe('one or more referenced GeoResources are accessible', () => {
				it('returns `false`', async () => {
					const aggGeoResourceId = 'aggGeoResourceId';
					const geoResourceId0 = 'geoResourceId0';
					const geoResourceId1 = 'geoResourceId1';
					const instanceUnderTest = setup();
					spyOn(authService, 'getRoles').and.returnValue([]);
					spyOn(instanceUnderTest, 'byId').and.callFake((id) => {
						switch (id) {
							case aggGeoResourceId:
								return new AggregateGeoResource(aggGeoResourceId, 'label', [geoResourceId0, geoResourceId1]);
							case geoResourceId0:
								return { authRoles: [] };
							case geoResourceId1:
								return { authRoles: ['FOO'] };
						}
					});

					expect(instanceUnderTest.isAllowed(aggGeoResourceId)).toBeFalse();
				});
			});

			describe('all referenced GeoResources are accessible', () => {
				it('returns `false`', async () => {
					const aggGeoResourceId = 'aggGeoResourceId';
					const geoResourceId0 = 'geoResourceId0';
					const geoResourceId1 = 'geoResourceId1';
					const instanceUnderTest = setup();
					spyOn(authService, 'getRoles').and.returnValue([]);
					spyOn(instanceUnderTest, 'byId').and.callFake((id) => {
						switch (id) {
							case aggGeoResourceId:
								return new AggregateGeoResource(aggGeoResourceId, 'label', [geoResourceId0, geoResourceId1]);
							case geoResourceId0:
								return { authRoles: [] };
							case geoResourceId1:
								return { authRoles: [] };
						}
					});

					expect(instanceUnderTest.isAllowed(aggGeoResourceId)).toBeTrue();
				});
			});
		});
	});

	describe('getKeywords', () => {
		it('returns the auth roles as keywords', async () => {
			const geoResourceId = 'id';
			const geoResource = { authRoles: ['Foo', 'Bar'] };
			const instanceUnderTest = setup();
			spyOn(instanceUnderTest, 'byId').withArgs(geoResourceId).and.returnValue(geoResource);

			expect(instanceUnderTest.getKeywords(geoResourceId)).toEqual(['Foo', 'Bar']);
		});
		describe('and GeoResource is unknown', () => {
			it('returns an empty list', async () => {
				spyOn(authService, 'isSignedIn').and.returnValue(true);
				const geoResourceId = 'id';
				const instanceUnderTest = setup();
				spyOn(instanceUnderTest, 'byId').withArgs(geoResourceId).and.returnValue(null);

				expect(instanceUnderTest.getKeywords(geoResourceId)).toEqual([]);
			});
		});

		describe('AggregateGeoResource', () => {
			describe('the AggregateGeoResource contains roles on its own', () => {
				it('returns the auth roles as keywords', async () => {
					const aggGeoResourceId = 'aggGeoResourceId';
					const instanceUnderTest = setup();
					spyOn(instanceUnderTest, 'byId').and.callFake((id) => {
						switch (id) {
							case aggGeoResourceId:
								return new AggregateGeoResource(aggGeoResourceId, 'label', ['geoResourceId0', 'geoResourceId1']).setAuthRoles(['TEST']);
						}
					});

					expect(instanceUnderTest.getKeywords(aggGeoResourceId)).toEqual(['TEST']);
				});
			});

			describe('the AggregateGeoResource does not contain roles', () => {
				it('returns a unique list of all keywords of the referenced GeoResources', async () => {
					const aggGeoResourceId = 'aggGeoResourceId';
					const geoResourceId0 = 'geoResourceId0';
					const geoResourceId1 = 'geoResourceId1';
					const instanceUnderTest = setup();
					spyOn(instanceUnderTest, 'byId').and.callFake((id) => {
						switch (id) {
							case aggGeoResourceId:
								return new AggregateGeoResource(aggGeoResourceId, 'label', [geoResourceId0, geoResourceId1]);
							case geoResourceId0:
								return { authRoles: ['FOO'] };
							case geoResourceId1:
								return { authRoles: ['FOO', 'BAR'] };
						}
					});

					expect(instanceUnderTest.getKeywords(aggGeoResourceId)).toEqual(['FOO', 'BAR']);
				});
			});
		});
	});

	describe('getAuthResponseInterceptorForGeoResource', () => {
		describe('and GeoResource is known', () => {
			it('returns a response interceptor for that GeoResource', async () => {
				const geoResourceId = 'id';
				const geoResource = { authRoles: ['TEST'] };
				const responseInterceptor = () => {};
				const authResponseInterceptorProvider = jasmine.createSpy().withArgs(['TEST'], geoResourceId).and.returnValue(responseInterceptor);
				const instanceUnderTest = setup(null, null, authResponseInterceptorProvider);
				spyOn(instanceUnderTest, 'byId').withArgs(geoResourceId).and.returnValue(geoResource);

				const result = instanceUnderTest.getAuthResponseInterceptorForGeoResource(geoResourceId);

				expect(result).toEqual(responseInterceptor);
			});

			describe('and GeoResource is unknown', () => {
				it('returns `false`', async () => {
					const geoResourceId = 'id';
					const responseInterceptor = () => {};
					const authResponseInterceptorProvider = jasmine.createSpy().withArgs([], geoResourceId).and.returnValue(responseInterceptor);
					const instanceUnderTest = setup(null, null, authResponseInterceptorProvider);
					spyOn(instanceUnderTest, 'byId').withArgs(geoResourceId).and.returnValue(null);

					const result = instanceUnderTest.getAuthResponseInterceptorForGeoResource(geoResourceId);

					expect(result).toEqual(responseInterceptor);
				});
			});
		});
	});

	describe('resolve', () => {
		it('returns all connected GeoResources', () => {
			const instanceUnderTest = setup();

			const geoResource0 = new WmsGeoResource('id0', 'label0', 'https://some.url', 'someLayer', 'image/png');
			const geoResource1 = new WmsGeoResource('id1', 'label1', 'https://some.url', 'someLayer', 'image/png');
			const geoResource2 = new AggregateGeoResource('id2', 'label2', [geoResource1.id]);
			const geoResource3 = new AggregateGeoResource('id3', 'label3', [geoResource2.id, 'unknown']);
			const unregisteredGeoResource = new WmsGeoResource('unregistered', 'label0', 'https://some.url', 'someLayer', 'image/png');

			instanceUnderTest._geoResources = [geoResource0, geoResource1, geoResource2, geoResource3];

			expect(instanceUnderTest.resolve(geoResource3)).toEqual([geoResource1]);
			expect(instanceUnderTest.resolve(geoResource0)).toEqual([geoResource0]);
			expect(instanceUnderTest.resolve(null)).toEqual([]);
			expect(instanceUnderTest.resolve(unregisteredGeoResource)).toEqual([unregisteredGeoResource]);
		});
	});

	describe('_proxify', () => {
		it('returns an observable GeoResource', () => {
			const instanceUnderTest = setup();
			const geoResource0 = new WmsGeoResource('id', 'Wms', 'https://some.url', 'someLayer', 'image/png');

			const observableGr0 = instanceUnderTest._proxify(geoResource0);

			expect(observableGr0[GeoResourceService.proxyIdentifier]).toBeTrue();

			const observableGr1 = instanceUnderTest._proxify(observableGr0);

			expect(observableGr1[GeoResourceService.proxyIdentifier]).toBeTrue();
		});

		describe('observable GeoResource', () => {
			it("updates the slice-of-state 'layers' when property 'label' changes", () => {
				const geoResourceId0 = 'geoResourceId0';
				const geoResourceId1 = 'geoResourceId1';
				const layerProperties0 = { ...createDefaultLayerProperties(), id: 'id0', geoResourceId: geoResourceId0 };
				const layerProperties1 = { ...createDefaultLayerProperties(), id: 'id1', geoResourceId: geoResourceId1 };
				const geoResource0 = new WmsGeoResource(geoResourceId0, 'Wms', 'https://some.url', 'someLayer', 'image/png');
				const instanceUnderTest = setup(null, null, null, {
					layers: {
						active: [layerProperties0, layerProperties1]
					}
				});
				const observableGeoResource = instanceUnderTest._proxify(geoResource0);

				observableGeoResource.setLabel('foo');

				expect(store.getState().layers.active[0].grChangedFlag.payload).toBe(geoResourceId0);
				expect(store.getState().layers.active[1].grChangedFlag).toBeNull();
			});

			it("does not updates the slice-of-state 'layers' for other properties", () => {
				const geoResourceId0 = 'geoResourceId0';
				const geoResourceId1 = 'geoResourceId1';
				const layerProperties0 = { ...createDefaultLayerProperties(), id: 'id0', geoResourceId: geoResourceId0 };
				const layerProperties1 = { ...createDefaultLayerProperties(), id: 'id1', geoResourceId: geoResourceId1 };
				const geoResource0 = new WmsGeoResource(geoResourceId0, 'Wms', 'https://some.url', 'someLayer', 'image/png');
				const instanceUnderTest = setup(null, null, null, {
					layers: {
						active: [layerProperties0, layerProperties1]
					}
				});
				const observableGeoResource = instanceUnderTest._proxify(geoResource0);

				observableGeoResource.setOpacity(0.5);

				expect(store.getState().layers.active[0].grChangedFlag).toBeNull();
				expect(store.getState().layers.active[1].grChangedFlag).toBeNull();
			});
		});
	});
});

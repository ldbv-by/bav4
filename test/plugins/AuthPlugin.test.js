import { TestUtils } from '../test-utils.js';
import { $injector } from '../../src/injection/index.js';
import { AuthPlugin } from '../../src/plugins/AuthPlugin.js';
import { authReducer } from '../../src/store/auth/auth.reducer.js';
import { setSignedIn, setSignedOut } from '../../src/store/auth/auth.action.js';
import { layersReducer, createDefaultLayerProperties } from '../../src/store/layers/layers.reducer.js';

describe('AuthPlugin', () => {
	const environmentService = {
		isStandalone: () => false
	};
	const authService = {
		async init() {}
	};
	const configService = {
		getValue() {}
	};
	const geoResourceService = {
		isAllowed() {}
	};
	const setup = (initialState = {}) => {
		const store = TestUtils.setupStoreAndDi(initialState, {
			auth: authReducer,
			layers: layersReducer
		});
		$injector
			.registerSingleton('EnvironmentService', environmentService)
			.registerSingleton('AuthService', authService)
			.registerSingleton('ConfigService', configService)
			.registerSingleton('GeoResourceService', geoResourceService);

		return store;
	};

	describe('register', () => {
		it('initializes the AuthService', async () => {
			const store = setup();
			const spy = spyOn(authService, 'init');
			const instanceUnderTest = new AuthPlugin();

			await instanceUnderTest.register(store);

			expect(spy).toHaveBeenCalled();
		});

		it('catches the error of the AuthService and throws an error regarding the backend availability', async () => {
			const store = setup();
			const error = new Error('something got wrong');
			spyOn(authService, 'init').and.rejectWith(error);
			const backendUrl = 'https://foo.bar';
			spyOn(configService, 'getValue').withArgs('BACKEND_URL').and.returnValue(backendUrl);
			const instanceUnderTest = new AuthPlugin();

			await expectAsync(instanceUnderTest.register(store)).toBeRejectedWith(
				new Error(
					`A requested endpoint of the backend is not available. Is the backend running and properly configured (current BACKEND_URL=${backendUrl})?`,
					{ cause: error }
				)
			);
		});

		describe('when standalone mode', () => {
			it('does nothing', async () => {
				const store = setup();
				spyOn(environmentService, 'isStandalone').and.returnValue(true);
				const spy = spyOn(authService, 'init');
				const instanceUnderTest = new AuthPlugin();

				await instanceUnderTest.register(store);

				expect(spy).not.toHaveBeenCalled();
			});
		});
	});

	describe('when auth "signedIn" property changes', () => {
		describe('triggered by the user', () => {
			it('removes now non-accessible layers', async () => {
				const layer0 = { ...createDefaultLayerProperties(), id: 'id0', geoResourceId: 'geoResourceId0' };
				const layer1 = { ...createDefaultLayerProperties(), id: 'id1', geoResourceId: 'geoResourceId1' };
				const store = setup({
					auth: {
						signedIn: true
					},
					layers: {
						active: [layer0, layer1]
					}
				});
				spyOn(geoResourceService, 'isAllowed').and.callFake((geoResourceId) => {
					return geoResourceId === layer1.geoResourceId ? false : true;
				});
				const instanceUnderTest = new AuthPlugin();
				await instanceUnderTest.register(store);

				setSignedOut(true);

				expect(store.getState().layers.active.length).toBe(1);
				expect(store.getState().layers.active[0].id).toBe(layer0.id);
			});
		});

		describe('NOT triggered by the user', () => {
			it('does nothing', async () => {
				const layer0 = { ...createDefaultLayerProperties(), id: 'id0', geoResourceId: 'geoResourceId0' };
				const layer1 = { ...createDefaultLayerProperties(), id: 'id1', geoResourceId: 'geoResourceId1' };
				const store = setup({
					auth: {
						signedIn: true
					},
					layers: {
						active: [layer0, layer1]
					}
				});
				const instanceUnderTest = new AuthPlugin();
				await instanceUnderTest.register(store);

				setSignedOut(false);

				expect(store.getState().layers.active.length).toBe(2);
			});
		});

		it('does nothing on sign-in', async () => {
			const layer0 = { ...createDefaultLayerProperties(), id: 'id0', geoResourceId: 'geoResourceId0' };
			const layer1 = { ...createDefaultLayerProperties(), id: 'id1', geoResourceId: 'geoResourceId1' };
			const store = setup({
				layers: {
					active: [layer0, layer1]
				}
			});
			const instanceUnderTest = new AuthPlugin();
			await instanceUnderTest.register(store);

			setSignedIn();

			expect(store.getState().layers.active.length).toBe(2);
		});
	});
});

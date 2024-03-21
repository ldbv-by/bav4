import { TestUtils } from '../test-utils.js';
import { $injector } from '../../src/injection/index.js';
import { AuthPlugin } from '../../src/plugins/AuthPlugin.js';

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
	const setup = () => {
		TestUtils.setupStoreAndDi();
		$injector
			.registerSingleton('EnvironmentService', environmentService)
			.registerSingleton('AuthService', authService)
			.registerSingleton('ConfigService', configService);
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
});

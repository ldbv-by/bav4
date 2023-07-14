import { $injector } from '../../../src/injection';
import { getBvvIconUrlFactory } from '../../../src/services/provider/iconUrl.provider';

describe('IconUrl provider', () => {
	describe('Bvv IconUrl provider', () => {
		const configService = {
			getValueAsPath: () => {}
		};

		beforeAll(() => {
			$injector.registerSingleton('ConfigService', configService);
		});

		it('returns a factory function', async () => {
			const iconName = 'fooBar';
			const backendUrl = 'https://backend.url/';
			const color = [42, 21, 0];
			const configServiceSpy = spyOn(configService, 'getValueAsPath').withArgs('BACKEND_URL').and.returnValue(backendUrl);

			const factoryFunction = getBvvIconUrlFactory(iconName);

			expect(factoryFunction(color)).toBe('https://backend.url/icons/42,21,0/fooBar.png');
			expect(configServiceSpy).toHaveBeenCalled();
		});

		it('logs a warning when backend url is not available', async () => {
			const configServiceSpy = spyOn(configService, 'getValueAsPath').withArgs('BACKEND_URL').and.throwError();
			const consoleSpy = spyOn(console, 'warn').and.callFake(() => {});
			const iconName = 'fooBar';
			const color = [42, 21, 0];

			const factoryFunction = getBvvIconUrlFactory(iconName);
			expect(factoryFunction(color)).toBeNull();
			expect(configServiceSpy).toHaveBeenCalled();
			expect(consoleSpy).toHaveBeenCalledWith('No backend-information available.');
		});
	});
});

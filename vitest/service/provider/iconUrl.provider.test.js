import { $injector } from '@src/injection';
import { getBvvIconUrlFactory } from '@src/services/provider/iconUrl.provider';

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
			const configServiceSpy = vi.spyOn(configService, 'getValueAsPath').mockReturnValue(backendUrl);

			const factoryFunction = getBvvIconUrlFactory(iconName);

			expect(factoryFunction(color)).toBe('https://backend.url/icons/42,21,0/fooBar.png');
			expect(configServiceSpy).toHaveBeenCalledWith('BACKEND_URL');
		});

		it('logs a warning when backend url is not available', async () => {
			const configServiceSpy = vi.spyOn(configService, 'getValueAsPath').mockThrow(new Error('Something got wrong'));
			const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
			const iconName = 'fooBar';
			const color = [42, 21, 0];

			const factoryFunction = getBvvIconUrlFactory(iconName);
			expect(factoryFunction(color)).toBeNull();
			expect(configServiceSpy).toHaveBeenCalledWith('BACKEND_URL');
			expect(consoleSpy).toHaveBeenCalledWith('No backend-information available.');
		});
	});
});

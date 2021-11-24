import { $injector } from '../../../src/injection';
import { getBvvIconsUrl } from '../../../src/services/provider/iconUrl.provider';

describe('IconUrl provider', () => {

	const configService = {
		getValueAsPath: () => { }
	};


	beforeAll(() => {
		$injector
			.registerSingleton('ConfigService', configService);
	});

	it('returns a url for icon id and color', async () => {
		const id = 'foo';
		const color = [0, 0, 0];
		const backendUrl = 'https://backend.url/';
		const configServiceSpy = spyOn(configService, 'getValueAsPath').withArgs('BACKEND_URL').and.returnValue(backendUrl);

		const iconUrl = await getBvvIconsUrl(id, color);

		expect(configServiceSpy).toHaveBeenCalled();
		expect(iconUrl).toBe('https://backend.url/icons/0,0,0/foo');

	});
});

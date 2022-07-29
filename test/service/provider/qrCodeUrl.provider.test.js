import { $injector } from '../../../src/injection';
import { bvvQrCodeProvider } from '../../../src/services/provider/qrCodeUrlProvider';

describe('QrCode provider', () => {

	describe('Bvv QrCode provider', () => {

		const configService = {
			getValueAsPath: () => { }
		};

		beforeAll(() => {
			$injector
				.registerSingleton('ConfigService', configService);
		});

		it('returns a qrCode URL', () => {
			const urlShorteningServiceUrl = 'https://shortening.url';
			const urlToEncode = 'https://encode.me';
			const expectedQrCodeUrl = `${urlShorteningServiceUrl}?url=${encodeURIComponent(urlToEncode)}`;
			const configServiceSpy = spyOn(configService, 'getValueAsPath').withArgs('SHORTENING_SERVICE_URL').and.returnValue(urlShorteningServiceUrl);

			const qrCodeUrl = bvvQrCodeProvider(urlToEncode);

			expect(configServiceSpy).toHaveBeenCalled();
			expect(qrCodeUrl).toBe(expectedQrCodeUrl);
		});

		it('returns a qrCode URL for a already shortened URL', () => {
			const urlShorteningServiceUrl = 'https://shortening.url';
			const urlToEncode = `${urlShorteningServiceUrl}/foo`;
			const expectedQrCodeUrl = `${urlToEncode}.png`;
			const configServiceSpy = spyOn(configService, 'getValueAsPath').withArgs('SHORTENING_SERVICE_URL').and.returnValue(urlShorteningServiceUrl);

			const qrCodeUrl = bvvQrCodeProvider(urlToEncode);

			expect(configServiceSpy).toHaveBeenCalled();
			expect(qrCodeUrl).toBe(expectedQrCodeUrl);
		});

		it('passes the error of the underlying config service', () => {
			const urlToEncode = 'https://encode.me';
			spyOn(configService, 'getValueAsPath').withArgs('SHORTENING_SERVICE_URL').and.throwError('Unknown key');

			expect(() => bvvQrCodeProvider(urlToEncode)).toThrowError(Error, 'Unknown key');
		});
	});
});

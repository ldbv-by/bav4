import { $injector } from '@src/injection';
import { bvvQrCodeProvider } from '@src/services/provider/qrCodeUrlProvider';

describe('QrCode provider', () => {
	describe('Bvv QrCode provider', () => {
		const configService = {
			getValueAsPath: () => {}
		};

		beforeAll(() => {
			$injector.registerSingleton('ConfigService', configService);
		});

		it('returns a qrCode URL', () => {
			const urlShorteningServiceUrl = 'https://shortening.url';
			const urlToEncode = 'https://encode.me';
			const expectedQrCodeUrl = `${urlShorteningServiceUrl}?url=${encodeURIComponent(urlToEncode)}`;
			const configServiceSpy = vi.spyOn(configService, 'getValueAsPath').mockReturnValue(urlShorteningServiceUrl);

			const qrCodeUrl = bvvQrCodeProvider(urlToEncode);

			expect(configServiceSpy).toHaveBeenCalledWith('SHORTENING_SERVICE_URL');
			expect(qrCodeUrl).toBe(expectedQrCodeUrl);
		});

		it('returns a qrCode URL for an already shortened URL', () => {
			const urlShorteningServiceUrl = 'https://shortening.url';
			const urlToEncode = `${urlShorteningServiceUrl}/foo`;
			const expectedQrCodeUrl = `${urlToEncode}.png`;
			const configServiceSpy = vi.spyOn(configService, 'getValueAsPath').mockReturnValue(urlShorteningServiceUrl);

			const qrCodeUrl = bvvQrCodeProvider(urlToEncode);

			expect(configServiceSpy).toHaveBeenCalledWith('SHORTENING_SERVICE_URL');
			expect(qrCodeUrl).toBe(expectedQrCodeUrl);
		});

		it('passes the error of the underlying config service', () => {
			const urlToEncode = 'https://encode.me';
			vi.spyOn(configService, 'getValueAsPath').mockThrow(new Error('Unknown key'));

			expect(() => bvvQrCodeProvider(urlToEncode)).toThrowError(Error, 'Unknown key');
		});
	});
});

import { domPurifySanitizeHtml } from '../../src/services/provider/sanitizeHtml.provider';
import { SecurityService } from '../../src/services/SecurityService';

describe('SecurityService', () => {
	const setup = (provider = domPurifySanitizeHtml) => {
		return new SecurityService(provider);
	};
	describe('init', () => {

		it('initializes the service with custom provider', async () => {
			const customProvider = () => { };
			const instanceUnderTest = setup(customProvider);
			expect(instanceUnderTest._sanitizeHtmlProvider).toBeDefined();
			expect(instanceUnderTest._sanitizeHtmlProvider).toEqual(customProvider);
		});

		it('initializes the service with default provider', async () => {
			const instanceUnderTest = new SecurityService();
			expect(instanceUnderTest._sanitizeHtmlProvider).toEqual(domPurifySanitizeHtml);
		});

		it('provides the sanitized html', async () => {
			const mockedResult = 'foo';
			const instanceUnderTest = setup(() => {
				return mockedResult;
			});
			const mockHtml = 'bar';

			const result = instanceUnderTest.sanitizeHtml(mockHtml);

			expect(result).toEqual(mockedResult);
		});
	});

});

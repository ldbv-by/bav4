import { domPurifySanitizeHtml } from '@src/services/provider/sanitizeHtml.provider';
import { SecurityService } from '@src/services/SecurityService';

describe('SecurityService', () => {
	const setup = (provider = domPurifySanitizeHtml) => {
		return new SecurityService(provider);
	};
	describe('init', () => {
		it('initializes the service with custom provider', async () => {
			const customProvider = () => {};
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
	describe('createHtmlFromString', () => {
		afterEach(() => {
			vi.unstubAllGlobals();
		});

		it('creates trusted html from the sanitized input', () => {
			const untrustedHtml = '<script>alert("unsafe")</script>';
			const sanitizedHtml = '<p>safe</p>';
			const sanitizeHtml = vi.fn(() => sanitizedHtml);
			const createPolicy = vi.fn((_policyName, rules) => rules);
			vi.stubGlobal('trustedTypes', { createPolicy });
			const instanceUnderTest = setup(sanitizeHtml);

			const result = instanceUnderTest.createHtmlFromString(untrustedHtml);

			expect(createPolicy).toHaveBeenCalledWith('ba-untrustedString-policy', expect.objectContaining({ createHTML: expect.any(Function) }));
			expect(sanitizeHtml).toHaveBeenCalledWith(untrustedHtml);
			expect(result).toBe(sanitizedHtml);
		});

		it('sanitizes html when Trusted Types are unavailable', () => {
			const untrustedHtml = '<script>alert("unsafe")</script>';
			const sanitizedHtml = '<p>safe</p>';
			const sanitizeHtml = vi.fn(() => sanitizedHtml);
			vi.stubGlobal('trustedTypes', undefined);
			const instanceUnderTest = setup(sanitizeHtml);

			const result = instanceUnderTest.createHtmlFromString(untrustedHtml);

			expect(sanitizeHtml).toHaveBeenCalledWith(untrustedHtml);
			expect(result).toBe(sanitizedHtml);
		});
	});

	describe('sanitizeAndCleanHtml', () => {
		it('removes styles, ids, classes and formatting whitespace from sanitized html', () => {
			const inputHtml =
				'<div style="color:red" id="danger" class="keep">\n\t<p class="foo" id="bar" style="font-weight:bold">Hello</p>\n</div><style>.bad{color:red}</style><script></script>';
			const instanceUnderTest = setup((html) => html);

			const result = instanceUnderTest.sanitizeAndCleanHtml(inputHtml);

			expect(result).toBe('<div><p>Hello</p></div>');
		});

		it('keeps sanitized text content while stripping attributes', () => {
			const inputHtml = '<section id="section">\n  \n  <a href="https://example.com" class="link" style="color: blue">Link</a>\n</section>';
			const instanceUnderTest = setup((html) => html);

			const result = instanceUnderTest.sanitizeAndCleanHtml(inputHtml);

			expect(result).toBe('<section><a href="https://example.com">Link</a></section>');
		});
	});
});

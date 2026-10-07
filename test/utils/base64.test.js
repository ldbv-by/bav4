import { encodeBase64, decodeBase64 } from '@src/utils/base64';

describe('encodeBase64', () => {
	it('encodes a string as Base64', () => {
		expect(encodeBase64('Hello, world!')).toBe('SGVsbG8sIHdvcmxkIQ==');
	});

	it('safely encodes umlauts and other Unicode characters', () => {
		expect(encodeBase64('München – Grüße')).toBe('TcO8bmNoZW4g4oCTIEdyw7zDn2U=');
	});

	it('encodes an empty string', () => {
		expect(encodeBase64('')).toBe('');
	});
});

describe('decodeBase64', () => {
	it('decodes a Base64 string', () => {
		expect(decodeBase64('SGVsbG8sIHdvcmxkIQ==')).toBe('Hello, world!');
	});

	it('safely decodes umlauts and other Unicode characters', () => {
		expect(decodeBase64('TcO8bmNoZW4g4oCTIEdyw7zDn2U=')).toBe('München – Grüße');
	});

	it('round-trips Unicode text correctly', () => {
		const value = 'Äpfel, Öl, Übergröße, Straße';

		expect(decodeBase64(encodeBase64(value))).toBe(value);
	});
});

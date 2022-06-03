import { BaaCredentialService } from '../../src/services/BaaCredentialService';

describe('BaaService', () => {

	let instanceUnderTest;

	beforeEach(() => {
		instanceUnderTest = new BaaCredentialService();
	});

	describe('addOrReplace', () => {

		it('adds a credential object base64-encoded', () => {
			const url = 'http://foo.bar/';
			const credential = {
				username: 'username',
				password: 'password'

			};
			const credentialEncoded = btoa(JSON.stringify({ ...credential }));

			const result = instanceUnderTest.addOrReplace(url, credential);

			expect(instanceUnderTest._credentials.get(url)).toBe(credentialEncoded);
			expect(result).toBeTrue();
		});

		it('accepts only valid urls', () => {
			const url = 'some';
			const credential = {
				username: 'username',
				password: 'password'
			};

			const result = instanceUnderTest.addOrReplace(url, credential);

			expect(result).toBeFalse();
		});

		it('accepts only a complete credential', () => {
			const url = 'http://foo.bar/';

			expect(instanceUnderTest.addOrReplace(url)).toBeFalse();
			expect(instanceUnderTest.addOrReplace(url, { username: 'username' })).toBeFalse();
			expect(instanceUnderTest.addOrReplace(url, { password: 'password' })).toBeFalse();
		});

		it('normalizes the url parameter', () => {
			const url = 'http://foo.bar';
			const urlNormalized = 'http://foo.bar/';
			const credential = {
				username: 'username',
				password: 'password'
			};

			instanceUnderTest.addOrReplace(url, credential);

			expect(instanceUnderTest._credentials.get(urlNormalized)).toBeDefined();
		});
	});

	describe('addOrReplace', () => {

		it('return a credential object decoded', () => {
			const url = 'http://foo.bar/';
			const credential = {
				username: 'username',
				password: 'password'

			};
			instanceUnderTest._credentials.set(url, btoa(JSON.stringify({ ...credential })));

			const result = instanceUnderTest.get(url);

			expect(result).toEqual(credential);
		});

		it('accepts only valid urls', () => {
			const url = 'http://foo.bar/';
			const credential = {
				username: 'username',
				password: 'password'

			};
			instanceUnderTest._credentials.set(url, btoa(JSON.stringify({ ...credential })));

			const result = instanceUnderTest.get('some');

			expect(result).toBeNull();
		});


		it('returns NULL when url is unknown', () => {
			const url = 'http://foo.bar/';
			const credential = {
				username: 'username',
				password: 'password'

			};
			instanceUnderTest._credentials.set(url, btoa(JSON.stringify({ ...credential })));

			const result = instanceUnderTest.get('http://fo.bar/');

			expect(result).toBeNull();
		});

		it('normalizes the url parameter', () => {
			const url = 'http://foo.bar';
			const urlNormalized = 'http://foo.bar/';
			const credential = {
				username: 'username',
				password: 'password'

			};
			instanceUnderTest._credentials.set(urlNormalized, btoa(JSON.stringify({ ...credential })));

			const result = instanceUnderTest.get(url);

			expect(result).toEqual(credential);
		});
	});

	describe('_normalizeUrl', () => {

		it('normalizes a URL', () => {

			expect(instanceUnderTest._normalizeUrl('http://foo.bar/')).toBe('http://foo.bar/');
			expect(instanceUnderTest._normalizeUrl('http://foo.bar')).toBe('http://foo.bar/');
			expect(instanceUnderTest._normalizeUrl('http://foo.bar/?=')).toBe('http://foo.bar/');
			expect(instanceUnderTest._normalizeUrl('http://foo.bar/?foo=bar')).toBe('http://foo.bar/');
			expect(instanceUnderTest._normalizeUrl('http://foo.bar/foo.cgi?%27;')).toBe('http://foo.bar/foo.cgi');
		});
	});
});

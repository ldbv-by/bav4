import { BaaCredentialService } from '../../src/services/BaaCredentialService';

describe('BaaService', () => {

	let instanceUnderTest;

	beforeEach(() => {
		instanceUnderTest = new BaaCredentialService();
	});

	describe('addOrReplace', () => {

		it('adds a credential object base64-encoded', async () => {
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

		it('accepts only valid urls', async () => {
			const url = 'some';
			const credential = {
				username: 'username',
				password: 'password'
			};

			const result = instanceUnderTest.addOrReplace(url, credential);

			expect(result).toBeFalse();
		});

		it('accepts only a complete credential', async () => {
			const url = 'http://foo.bar/';

			expect(instanceUnderTest.addOrReplace(url)).toBeFalse();
			expect(instanceUnderTest.addOrReplace(url, { username: 'username' })).toBeFalse();
			expect(instanceUnderTest.addOrReplace(url, { password: 'password' })).toBeFalse();
		});

		it('normalizes the url parameter', async () => {
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

		it('return a credential object decoded', async () => {
			const url = 'http://foo.bar/';
			const credential = {
				username: 'username',
				password: 'password'

			};
			instanceUnderTest._credentials.set(url, btoa(JSON.stringify({ ...credential })));

			const result = instanceUnderTest.get(url);

			expect(result).toEqual(credential);
		});

		it('accepts only valid urls', async () => {
			const url = 'http://foo.bar/';
			const credential = {
				username: 'username',
				password: 'password'

			};
			instanceUnderTest._credentials.set(url, btoa(JSON.stringify({ ...credential })));

			const result = instanceUnderTest.get('some');

			expect(result).toBeNull();
		});


		it('returns NULL when url is unknown', async () => {
			const url = 'http://foo.bar/';
			const credential = {
				username: 'username',
				password: 'password'

			};
			instanceUnderTest._credentials.set(url, btoa(JSON.stringify({ ...credential })));

			const result = instanceUnderTest.get('http://fo.bar/');

			expect(result).toBeNull();
		});

		it('normalizes the url parameter', async () => {
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
});

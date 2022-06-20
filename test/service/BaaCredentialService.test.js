import { $injector } from '../../src/injection';
import { BaaCredentialService } from '../../src/services/BaaCredentialService';

describe('BaaService', () => {

	const urlService = {
		originAndPathname() { }
	};

	beforeAll(() => {
		$injector
			.registerSingleton('UrlService', urlService);
	});

	describe('addOrReplace', () => {

		it('adds a credential object base64-encoded', () => {
			const url = 'http://foo.bar/';
			const spy = spyOn(urlService, 'originAndPathname').withArgs(url).and.returnValue(url);
			const credential = {
				username: 'username',
				password: 'password'

			};
			const credentialEncoded = btoa(JSON.stringify({ ...credential }));
			const instanceUnderTest = new BaaCredentialService();

			const result = instanceUnderTest.addOrReplace(url, credential);

			expect(instanceUnderTest._credentials.get(url)).toBe(credentialEncoded);
			expect(result).toBeTrue();
			expect(spy).toHaveBeenCalled();
		});

		it('accepts only valid urls', () => {
			const instanceUnderTest = new BaaCredentialService();
			const url = 'some';
			const credential = {
				username: 'username',
				password: 'password'
			};

			const result = instanceUnderTest.addOrReplace(url, credential);

			expect(result).toBeFalse();
		});

		it('accepts only a complete credential', () => {
			const instanceUnderTest = new BaaCredentialService();
			const url = 'http://foo.bar/';

			expect(instanceUnderTest.addOrReplace(url)).toBeFalse();
			expect(instanceUnderTest.addOrReplace(url, { username: 'username' })).toBeFalse();
			expect(instanceUnderTest.addOrReplace(url, { password: 'password' })).toBeFalse();
		});
	});

	describe('addOrReplace', () => {

		it('return a credential object decoded', () => {
			const url = 'http://foo.bar/';
			const spy = spyOn(urlService, 'originAndPathname').withArgs(url).and.returnValue(url);
			const credential = {
				username: 'username',
				password: 'password'

			};
			const instanceUnderTest = new BaaCredentialService();
			instanceUnderTest._credentials.set(url, btoa(JSON.stringify({ ...credential })));

			const result = instanceUnderTest.get(url);

			expect(result).toEqual(credential);
			expect(spy).toHaveBeenCalled();
		});

		it('accepts only valid urls', () => {
			const instanceUnderTest = new BaaCredentialService();
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
			const instanceUnderTest = new BaaCredentialService();
			const url = 'http://foo.bar/';
			const credential = {
				username: 'username',
				password: 'password'

			};
			instanceUnderTest._credentials.set(url, btoa(JSON.stringify({ ...credential })));

			const result = instanceUnderTest.get('http://fo.bar/');

			expect(result).toBeNull();
		});
	});
});

import { BaaService } from '../../src/services/BaaService';
import { baaCredentialFromUI, bvvBaaCredentialVerify } from '../../src/services/provider/baa.provider';

describe('BaaService', () => {

	const setup = (baaCredentialProvider = baaCredentialFromUI, baaCredentialsVerifyProvider = bvvBaaCredentialVerify) => {
		return new BaaService(baaCredentialProvider, baaCredentialsVerifyProvider);
	};

	describe('constructor', () => {

		it('initializes the service with default provider', async () => {
			const service = new BaaService();

			expect(service._baaCredentialProvider).toEqual(baaCredentialFromUI);
			expect(service._baaCredentialVerifyProvider).toEqual(bvvBaaCredentialVerify);
		});

		it('initializes the service with custom provider', async () => {
			const customBaaCredentialProvider = async () => { };
			const customBaaCredentialVerifyProvider = async () => { };

			const instanceUnderTest = setup(customBaaCredentialProvider, customBaaCredentialVerifyProvider);

			expect(instanceUnderTest._baaCredentialProvider).toEqual(customBaaCredentialProvider);
			expect(instanceUnderTest._baaCredentialVerifyProvider).toEqual(customBaaCredentialVerifyProvider);
		});
	});

	describe('get', () => {

		it('resolves with a credential object', async () => {
			const url = 'http://foo.bar';
			const credential = {
				username: 'username',
				password: 'password'

			};
			const customBaaCredentialProvider = jasmine.createSpy().withArgs(url).and.resolveTo(credential);
			const service = new BaaService(customBaaCredentialProvider);

			expect(await service.get(url)).toEqual(credential);
		});

		it('rejects with no reason', async () => {
			const url = 'http://foo.bar';
			const customBaaCredentialProvider = jasmine.createSpy().withArgs(url).and.rejectWith();
			const service = new BaaService(customBaaCredentialProvider);

			try {
				await service.get(url);
				throw new Error('Promise should not be resolved');
			}
			catch (reason) {
				expect(customBaaCredentialProvider).toHaveBeenCalled();
				expect(reason).toBeUndefined;
			}
		});

		it('rejects when parameter "url" is not valid', async () => {
			const url = 'foo';
			const customBaaCredentialProvider = jasmine.createSpy();
			const service = new BaaService(customBaaCredentialProvider);
			const warnSpy = spyOn(console, 'warn');

			try {
				await service.get(url);
				throw new Error('Promise should not be resolved');
			}
			catch (reason) {
				expect(customBaaCredentialProvider).not.toHaveBeenCalled();
				expect(reason).toBeUndefined;
				expect(warnSpy).toHaveBeenCalledOnceWith(`${url} is not a valid HTTP URL`);
			}
		});
	});

	describe('verify', () => {

		it('resolves with a credential object', async () => {
			const url = 'http://foo.bar';
			const credential = {
				username: 'username',
				password: 'password'

			};
			const customBaaCredentialVerifyProvider = jasmine.createSpy().withArgs(url, credential).and.resolveTo(credential);
			const service = new BaaService(null, customBaaCredentialVerifyProvider);

			expect(await service.verify(url, credential)).toEqual(credential);
		});

		it('rejects with http status', async () => {
			const url = 'http://foo.bar';
			const credential = {
				username: 'username',
				password: 'password'

			};
			const httpStatus = 401;
			const customBaaCredentialVerifyProvider = jasmine.createSpy().withArgs(url, credential).and.rejectWith(httpStatus);
			const service = new BaaService(null, customBaaCredentialVerifyProvider);

			try {
				await service.verify(url, credential);
				throw new Error('Promise should not be resolved');
			}
			catch (reason) {
				expect(reason).toBe(httpStatus);
			}
		});


		it('rejects when parameter "url" is not valid', async () => {
			const url = 'foo';
			const credential = {
				username: 'username',
				password: 'password'

			};
			const customBaaCredentialVerifyProvider = jasmine.createSpy();
			const service = new BaaService(null, customBaaCredentialVerifyProvider);
			const warnSpy = spyOn(console, 'warn');

			try {
				await service.verify(url, credential);
				throw new Error('Promise should not be resolved');
			}
			catch (reason) {
				expect(customBaaCredentialVerifyProvider).not.toHaveBeenCalled();
				expect(reason).toBeUndefined;
				expect(warnSpy).toHaveBeenCalledOnceWith(`${url} is not a valid HTTP URL`);
			}
		});
	});
});

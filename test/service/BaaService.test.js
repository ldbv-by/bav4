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
			const url = 'foo';
			const credential = {
				username: 'username',
				password: 'password'

			};
			const customProvider = jasmine.createSpy().withArgs(url).and.resolveTo(credential);
			const service = new BaaService(customProvider);

			expect(await service.get(url)).toEqual(credential);
		});

		it('rejects with no reason', async () => {
			const url = 'foo';
			const customProvider = jasmine.createSpy().withArgs(url).and.rejectWith(undefined);
			const service = new BaaService(customProvider);

			try {
				await service.get(url);
				throw new Error('Promise should not be resolved');
			}
			catch (reason) {
				expect(customProvider).toHaveBeenCalled();
				expect(reason).toBeUndefined;
			}
		});
	});
});

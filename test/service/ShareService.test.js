import { ShareService } from '../../src/services/ShareService';

describe('ShareService', () => {

	describe('copy to clipboard', () => {
		it('calls Clipboard API', async () => {
			const mockNavigator = { clipboard: {} };
			mockNavigator.clipboard.writeText = jasmine.createSpy().and.returnValue(Promise.resolve('success'));
			const mockWindow = { isSecureContext: true, navigator: mockNavigator };


			const instanceUnderTest = new ShareService(mockWindow);
			const resolved = await instanceUnderTest.copyToClipboard('foo');
			expect(resolved).toBe('success');

			expect(mockNavigator.clipboard.writeText).toHaveBeenCalledWith('foo');
		});

		it('rejects when Clipboard API is not available', (done) => {
			const mockNavigator = { clipboard: {} };
			mockNavigator.clipboard.writeText = jasmine.createSpy().and.returnValue(Promise.resolve('success'));
			const mockWindow = { isSecureContext: false, navigator: mockNavigator };


			const instanceUnderTest = new ShareService(mockWindow);
			instanceUnderTest.copyToClipboard('foo')
				.then(() => {
					done(new Error('Promise should not be resolved'));
				}, (reason) => {
					expect(reason.message).toBe('Clipboard API is not available');
					expect(mockNavigator.clipboard.writeText).not.toHaveBeenCalled();
					done();
				});
		});
	});
});

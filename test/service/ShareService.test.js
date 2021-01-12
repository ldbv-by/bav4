import { ShareService } from '../../src/services/ShareService';

describe('ShareService', () => {

	describe('copy to clipboard', () => {
		it('calls clipboard api', () => {
			const mockNavigator = { clipboard: {} };
			mockNavigator.clipboard.writeText = jasmine.createSpy();

			let instanceUnderTest = new ShareService(mockNavigator);
			instanceUnderTest.copyToClipboard('foo');

			expect(mockNavigator.clipboard.writeText).toHaveBeenCalledWith('foo');
		});
	});
});
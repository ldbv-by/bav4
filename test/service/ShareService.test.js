import { ShareService } from '../../src/services/ShareService';
import { $injector } from '../../src/injection';

describe('ShareService', () => {

	describe('copy to clipboard', () => {
		it('calls clipboard api', () => {
			$injector
				.registerSingleton('TranslationService', { translate: (key) => key });

			const mockNavigator = { clipboard: {} };
			mockNavigator.clipboard.writeText = jasmine.createSpy();

			let instanceUnderTest = new ShareService(mockNavigator);
			instanceUnderTest.copyToClipboard('foo');

			expect(mockNavigator.clipboard.writeText).toHaveBeenCalledWith('foo');
		});
	});
});
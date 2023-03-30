import { $injector } from '../../src/injection';
import { MapFeedbackService } from '../../src/services/MapFeedbackService';

describe('MapFeedbackService', () => {
	const setup = () => {
		return new MapFeedbackService();
	};

	afterEach(() => {
		$injector.reset();
	});

	describe('getCategories', () => {
		it('provides categories', async () => {
			const instanceUnderTest = setup();

			const result = await instanceUnderTest.getCategories();

			expect(result).toEqual(['Foo', 'Bar']);
		});
	});

	describe('save', () => {
		it('saves a MapFeedback entity', async () => {
			const instanceUnderTest = setup();
			const mockFeedback = { foo: 'bar' };

			const result = await instanceUnderTest.save(mockFeedback);

			expect(result).toBeTrue();
		});
	});
});

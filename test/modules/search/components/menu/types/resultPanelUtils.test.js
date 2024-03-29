import { requestData } from '../../../../../../src/modules/search/components/menu/types/resultPanelUtils';

describe('requestData', () => {
	describe('query term length >= minimum lenght', () => {
		it('returns thr result of the provider', async () => {
			const provider = async () => {
				return ['bar'];
			};

			const result = await requestData('foo', provider, 3);

			expect(result.length).toBe(1);
			expect(result[0]).toBe('bar');
		});
	});

	describe('query term length < minimum lenght', () => {
		it('returns empty array', async () => {
			const result = await requestData('q', 2);

			expect(result.length).toBe(0);
		});
	});

	describe('query term length null or undefined', () => {
		it('returns empty array', async () => {
			const result = await requestData(null, 10);

			expect(result.length).toBe(0);
		});
	});

	describe('provider throws an error', () => {
		it('returns empty array and logs an error statement', async () => {
			const error = new Error('foo');
			const provider = async () => {
				throw error;
			};
			const errorSpy = spyOn(console, 'error');

			const result = await requestData('foobar', provider, 0);

			expect(result.length).toBe(0);
			expect(errorSpy).toHaveBeenCalledWith(error);
		});
	});
});

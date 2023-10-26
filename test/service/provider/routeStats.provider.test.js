import { bvvRouteStatsProvider } from '../../../src/services/provider/routeStats.provider';

describe('Route statistics provider', () => {
	describe('Bvv route statistics provider', () => {
		it('calculates the statistics for a route', async () => {
			const mockRoute = {};
			expect(bvvRouteStatsProvider(mockRoute)).toBeDefined();
		});
	});
});

import { Proj4JsService } from '../../src/services/Proj4JsService';

describe('Proj4JsService', () => {

	describe('constructor', () => {

		it('initializes the service', async () => {
			const proj4Provider = jasmine.createSpy().and.returnValue([]);

			const instanceUnderTest = new Proj4JsService(proj4Provider);

			expect(proj4Provider).toHaveBeenCalled();
			expect(instanceUnderTest.getProjections()).toEqual([4326, 3857]);
		});

		it('initializes the service with default provider', async () => {
			const instanceUnderTest = new Proj4JsService();
			expect(instanceUnderTest.getProjections()).toEqual([4326, 3857, 25832, 25833]);
		});
	});
});

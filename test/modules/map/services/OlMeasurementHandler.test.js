import { OlMeasurementHandler } from '../../../../src/modules/map/services/OlMeasurementHandler';


describe('OlMeasurementHandler', () => {

	it('has two methods', async () => {
		expect(new OlMeasurementHandler()).toBeTruthy();
		expect(new OlMeasurementHandler().activate).toBeTruthy();
		expect(new OlMeasurementHandler().deactivate).toBeTruthy();
	});

});
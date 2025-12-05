import { WcEvents } from '../../src/domain/wcEvents';

describe('WcEvents', () => {
	it('provides an enum of all valid events pf the public web component', () => {
		expect(Object.keys(WcEvents).length).toBe(4);

		expect(WcEvents.LOAD).toBe('baLoad');
		expect(WcEvents.CHANGE).toBe('baChange');
		expect(WcEvents.GEOMETRY_CHANGE).toBe('baGeometryChange');
		expect(WcEvents.FEATURE_SELECT).toBe('baFeatureSelect');
	});
});

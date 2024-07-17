import { WcEvents } from '../../src/domain/wcEvents';

describe('WcEvents', () => {
	it('provides an enum of all valid events pf the public web component', () => {
		expect(Object.keys(WcEvents).length).toBe(3);

		expect(WcEvents.LOAD).toBe('ba-load');
		expect(WcEvents.GEOMETRY_CHANGE).toBe('ba-geometry-change');
		expect(WcEvents.FEATURE_SELECT).toBe('ba-feature-select');
	});
});

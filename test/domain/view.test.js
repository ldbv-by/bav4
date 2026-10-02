import { ViewMode } from '@src/domain/view';

describe('GeometryType', () => {
	it('is an enum representing available view modes', () => {
		expect(Object.entries(ViewMode).length).toBe(2);
		expect(Object.isFrozen(ViewMode)).toBe(true);
		expect(ViewMode.D2).toEqual('2d');
		expect(ViewMode.D3).toEqual('3d');
	});
});

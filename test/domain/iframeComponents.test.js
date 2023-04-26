import { IFrameComponents } from '../../src/domain/iframeComponents';

describe('QueryParameters', () => {
	it('provides an enum of all valid query parameters', () => {
		expect(Object.keys(IFrameComponents).length).toBe(3);

		expect(IFrameComponents.DRAW_TOOL).toBe('draw-tool');
		expect(IFrameComponents.ACTIVATE_MAP_BUTTON).toBe('activate-map-button');
		expect(IFrameComponents.VIEW_LARGER_MAP_CHIP).toBe('view-larger-map-chip');
	});
});

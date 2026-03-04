import { calculateVisibleViewport } from '../../src/utils/viewport.js';

describe('calculateVisibleViewport', () => {
	const getViewportElement = () => {
		return { getBoundingClientRect: () => DOMRect.fromRect({ x: 0, y: 0, width: 1000, height: 1000 }) };
	};

	it('calculates an visibleRectangle besides a leftSidePanel', () => {
		const leftSidePanelMock = { getBoundingClientRect: () => DOMRect.fromRect({ x: 0, y: 0, width: 100, height: 1000 }) };
		const overlappingElements = [leftSidePanelMock];

		const visibleRectangle = calculateVisibleViewport(getViewportElement(), overlappingElements);

		expect(visibleRectangle.left).toBe(100);
		expect(visibleRectangle.top).toBe(0);
		expect(visibleRectangle.right).toBe(1000);
		expect(visibleRectangle.bottom).toBe(1000);
	});

	it('calculates an visibleRectangle besides a leftSidePanel and a bottomPanel', () => {
		const leftSidePanelMock = { getBoundingClientRect: () => DOMRect.fromRect({ x: 0, y: 0, width: 100, height: 1000 }) };
		const bottomPanelMock = { getBoundingClientRect: () => DOMRect.fromRect({ x: 100, y: 900, width: 800, height: 100 }) };
		const overlappingElements = [leftSidePanelMock, bottomPanelMock];

		const visibleRectangle = calculateVisibleViewport(getViewportElement(), overlappingElements);

		expect(visibleRectangle.left).toBe(100);
		expect(visibleRectangle.top).toBe(0);
		expect(visibleRectangle.right).toBe(900);
		expect(visibleRectangle.bottom).toBe(900);
	});

	it('calculates an visibleRectangle besides a leftSidePanel and a rightSideBottomPanel', () => {
		const leftSidePanelMock = { getBoundingClientRect: () => DOMRect.fromRect({ x: 0, y: 0, width: 100, height: 1000 }) };
		const rightSideBottomPanelMock = { getBoundingClientRect: () => DOMRect.fromRect({ x: 800, y: 900, width: 200, height: 100 }) };
		const overlappingElements = [leftSidePanelMock, rightSideBottomPanelMock];

		const visibleRectangle = calculateVisibleViewport(getViewportElement(), overlappingElements);

		expect(visibleRectangle.left).toBe(100);
		expect(visibleRectangle.top).toBe(0);
		expect(visibleRectangle.right).toBe(800);
		expect(visibleRectangle.bottom).toBe(1000);
	});

	it('calculates an visibleRectangle besides a topPanel and a bottomPanel', () => {
		const topPanelMock = { getBoundingClientRect: () => DOMRect.fromRect({ x: 0, y: 0, width: 1000, height: 300 }) };
		const bottomPanelMock = { getBoundingClientRect: () => DOMRect.fromRect({ x: 0, y: 700, width: 1000, height: 300 }) };
		const overlappingElements = [topPanelMock, bottomPanelMock];

		const visibleRectangle = calculateVisibleViewport(getViewportElement(), overlappingElements);

		expect(visibleRectangle.left).toBe(0);
		expect(visibleRectangle.top).toBe(300);
		expect(visibleRectangle.right).toBe(1000);
		expect(visibleRectangle.bottom).toBe(700);
	});

	it('calculates an visibleRectangle besides a leftSidePanel and a overlappingLeftSidePanel', () => {
		const leftSidePanelMock = { getBoundingClientRect: () => DOMRect.fromRect({ x: 0, y: 0, width: 100, height: 1000 }) };
		const overlappingLeftSidePanelMock = { getBoundingClientRect: () => DOMRect.fromRect({ x: 0, y: 0, width: 200, height: 500 }) };
		const overlappingElements = [leftSidePanelMock, overlappingLeftSidePanelMock];

		const visibleRectangle = calculateVisibleViewport(getViewportElement(), overlappingElements);

		expect(visibleRectangle.left).toBe(200);
		expect(visibleRectangle.top).toBe(0);
		expect(visibleRectangle.right).toBe(1000);
		expect(visibleRectangle.bottom).toBe(1000);
	});

	it('calculates an visibleRectangle besides a centered element', () => {
		const centeredElementMock = { getBoundingClientRect: () => DOMRect.fromRect({ x: 450, y: 450, width: 100, height: 100 }) };
		const overlappingElements = [centeredElementMock];

		const visibleRectangle = calculateVisibleViewport(getViewportElement(), overlappingElements);

		expect(visibleRectangle.left).toBe(550);
		expect(visibleRectangle.top).toBe(0);
		expect(visibleRectangle.right).toBe(1000);
		expect(visibleRectangle.bottom).toBe(1000);
	});

	it('calculates an visibleRectangle besides an empty element', () => {
		const emptyElementMock = { getBoundingClientRect: () => DOMRect.fromRect({ x: 0, y: 0, width: 0, height: 0 }) };
		const overlappingElements = [emptyElementMock];

		const visibleRectangle = calculateVisibleViewport(getViewportElement(), overlappingElements);

		expect(visibleRectangle.left).toBe(0);
		expect(visibleRectangle.top).toBe(0);
		expect(visibleRectangle.right).toBe(1000);
		expect(visibleRectangle.bottom).toBe(1000);
	});

	it('calculates an visibleRectangle besides an disjoint element', () => {
		const emptyElementMock = { getBoundingClientRect: () => DOMRect.fromRect({ x: -300, y: 0, width: 300, height: 1000 }) };
		const overlappingElements = [emptyElementMock];

		const visibleRectangle = calculateVisibleViewport(getViewportElement(), overlappingElements);

		expect(visibleRectangle.left).toBe(0);
		expect(visibleRectangle.top).toBe(0);
		expect(visibleRectangle.right).toBe(1000);
		expect(visibleRectangle.bottom).toBe(1000);
	});

	it('calculates an visibleRectangle besides an partiallyOverlappingLeftSidePanel', () => {
		const partiallyOverlappingLeftSidePanelMock = { getBoundingClientRect: () => DOMRect.fromRect({ x: -50, y: 0, width: 300, height: 1000 }) };
		const overlappingElements = [partiallyOverlappingLeftSidePanelMock];

		const visibleRectangle = calculateVisibleViewport(getViewportElement(), overlappingElements);

		expect(visibleRectangle.left).toBe(250);
		expect(visibleRectangle.top).toBe(0);
		expect(visibleRectangle.right).toBe(1000);
		expect(visibleRectangle.bottom).toBe(1000);
	});
});

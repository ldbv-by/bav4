import { cleanRectangleByElementsProvider } from '../../../src/services/provider/view.provider';

describe('calculateCleanRectangle', () => {
	const getBase = () => {
		return { getBoundingClientRect: () => DOMRect.fromRect({ x: 0, y: 0, width: 1000, height: 1000 }) };
	};

	it('calculates an cleanRectangle besides a leftSidePanel', () => {
		const leftSidePanelMock = { getBoundingClientRect: () => DOMRect.fromRect({ x: 0, y: 0, width: 100, height: 1000 }) };
		const dirtyElements = [leftSidePanelMock];

		const cleanRectangle = cleanRectangleByElementsProvider(getBase(), dirtyElements);

		expect(cleanRectangle.left).toBe(100);
		expect(cleanRectangle.top).toBe(0);
		expect(cleanRectangle.right).toBe(1000);
		expect(cleanRectangle.bottom).toBe(1000);
	});

	it('calculates an cleanRectangle besides a leftSidePanel and a bottomPanel', () => {
		const leftSidePanelMock = { getBoundingClientRect: () => DOMRect.fromRect({ x: 0, y: 0, width: 100, height: 1000 }) };
		const bottomPanelMock = { getBoundingClientRect: () => DOMRect.fromRect({ x: 100, y: 900, width: 800, height: 100 }) };
		const dirtyElements = [leftSidePanelMock,	bottomPanelMock];

		const cleanRectangle = cleanRectangleByElementsProvider(getBase(), dirtyElements);

		expect(cleanRectangle.left).toBe(100);
		expect(cleanRectangle.top).toBe(0);
		expect(cleanRectangle.right).toBe(900);
		expect(cleanRectangle.bottom).toBe(900);
	});

	it('calculates an cleanRectangle besides a leftSidePanel and a rightSideBottomPanel', () => {
		const leftSidePanelMock = { getBoundingClientRect: () => DOMRect.fromRect({ x: 0, y: 0, width: 100, height: 1000 }) };
		const rightSideBottomPanelMock = { getBoundingClientRect: () => DOMRect.fromRect({ x: 800, y: 900, width: 200, height: 100 }) };
		const dirtyElements = [leftSidePanelMock,	rightSideBottomPanelMock];

		const cleanRectangle = cleanRectangleByElementsProvider(getBase(), dirtyElements);

		expect(cleanRectangle.left).toBe(100);
		expect(cleanRectangle.top).toBe(0);
		expect(cleanRectangle.right).toBe(800);
		expect(cleanRectangle.bottom).toBe(1000);
	});


	it('calculates an cleanRectangle besides a topPanel and a bottomPanel', () => {
		const topPanelMock = { getBoundingClientRect: () => DOMRect.fromRect({ x: 0, y: 0, width: 1000, height: 300 }) };
		const bottomPanelMock = { getBoundingClientRect: () => DOMRect.fromRect({ x: 0, y: 700, width: 1000, height: 300 }) };
		const dirtyElements = [topPanelMock,	bottomPanelMock];

		const cleanRectangle = cleanRectangleByElementsProvider(getBase(), dirtyElements);

		expect(cleanRectangle.left).toBe(0);
		expect(cleanRectangle.top).toBe(300);
		expect(cleanRectangle.right).toBe(1000);
		expect(cleanRectangle.bottom).toBe(700);
	});

	it('calculates an cleanRectangle besides a leftSidePanel and a overlappingLeftSidePanel', () => {
		const leftSidePanelMock = { getBoundingClientRect: () => DOMRect.fromRect({ x: 0, y: 0, width: 100, height: 1000 }) };
		const overlappingLeftSidePanelMock = { getBoundingClientRect: () => DOMRect.fromRect({ x: 0, y: 0, width: 200, height: 500 }) };
		const dirtyElements = [leftSidePanelMock,	overlappingLeftSidePanelMock];

		const cleanRectangle = cleanRectangleByElementsProvider(getBase(), dirtyElements);

		expect(cleanRectangle.left).toBe(200);
		expect(cleanRectangle.top).toBe(0);
		expect(cleanRectangle.right).toBe(1000);
		expect(cleanRectangle.bottom).toBe(1000);
	});

	it('calculates an cleanRectangle besides a centered element', () => {
		const centeredElementMock = { getBoundingClientRect: () => DOMRect.fromRect({ x: 450, y: 450, width: 100, height: 100 }) };
		const dirtyElements = [centeredElementMock];

		const cleanRectangle = cleanRectangleByElementsProvider(getBase(), dirtyElements);

		expect(cleanRectangle.left).toBe(550);
		expect(cleanRectangle.top).toBe(0);
		expect(cleanRectangle.right).toBe(1000);
		expect(cleanRectangle.bottom).toBe(1000);
	});


	it('calculates an cleanRectangle besides an empty element', () => {
		const emptyElementMock = { getBoundingClientRect: () => DOMRect.fromRect({ x: 0, y: 0, width: 0, height: 0 }) };
		const dirtyElements = [emptyElementMock];

		const cleanRectangle = cleanRectangleByElementsProvider(getBase(), dirtyElements);

		expect(cleanRectangle.left).toBe(0);
		expect(cleanRectangle.top).toBe(0);
		expect(cleanRectangle.right).toBe(1000);
		expect(cleanRectangle.bottom).toBe(1000);
	});

	it('calculates an cleanRectangle besides an disjoint element', () => {
		const emptyElementMock = { getBoundingClientRect: () => DOMRect.fromRect({ x: -300, y: 0, width: 300, height: 1000 }) };
		const dirtyElements = [emptyElementMock];

		const cleanRectangle = cleanRectangleByElementsProvider(getBase(), dirtyElements);

		expect(cleanRectangle.left).toBe(0);
		expect(cleanRectangle.top).toBe(0);
		expect(cleanRectangle.right).toBe(1000);
		expect(cleanRectangle.bottom).toBe(1000);
	});

	it('calculates an cleanRectangle besides an partiallyOverlappingLeftSidePanel', () => {
		const partiallyOverlappingLeftSidePanelMock = { getBoundingClientRect: () => DOMRect.fromRect({ x: -50, y: 0, width: 300, height: 1000 }) };
		const dirtyElements = [partiallyOverlappingLeftSidePanelMock];

		const cleanRectangle = cleanRectangleByElementsProvider(getBase(), dirtyElements);

		expect(cleanRectangle.left).toBe(250);
		expect(cleanRectangle.top).toBe(0);
		expect(cleanRectangle.right).toBe(1000);
		expect(cleanRectangle.bottom).toBe(1000);
	});
});

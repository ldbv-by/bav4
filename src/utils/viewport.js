/**
 * Calculates a visible rectangle, where the base element is not overlapped by any specified element
 * @param {HTMLElement} baseElement
 * @param {Array<HTMLElement>} overlappingElements
 * @returns {DOMRect}
 */
export const calculateVisibleViewport = (baseElement, overlappingElements) => {
	const baseRectangle = baseElement.getBoundingClientRect();
	const overlappingRectangles = overlappingElements.map(e => e.getBoundingClientRect());

	const isEmpty = (domRect) => {
		return domRect.left >= domRect.right || domRect.top >= domRect.bottom;
	};

	const clone = (domRect) => {
		return DOMRect.fromRect({ x: domRect.x, y: domRect.y, width: domRect.width, height: domRect.height });
	};

	const fromBounds = (left, top, right, bottom) => {
		return DOMRect.fromRect({ x: left, y: top, width: right - left, height: bottom - top });
	};

	const intersect = (base, other) => {
		if (isEmpty(base) || isEmpty(other)) {
			return DOMRect.fromRect();
		}

		const x1 = Math.max(base.left, other.left);
		const x2 = Math.min(base.right, other.right);
		const y1 = Math.max(base.top, other.top);
		const y2 = Math.min(base.bottom, other.bottom);
		// If width or height is 0, the intersection was empty.
		return DOMRect.fromRect({ x: x1, y: y1, width: Math.max(0, x2 - x1), height: Math.max(0, y2 - y1) });
	};

	const subtract = (base, other) => {

		const result = [];
		other = intersect(other, base);
		if (isEmpty(other)) {
			return [clone(base)];
		}

		const leftStrip = fromBounds(base.left, base.top, other.left, base.bottom);
		if (!isEmpty(leftStrip)) {
			result.push(leftStrip);
		}

		const upperInsideStrip = fromBounds(other.left, base.top, other.right, other.top);
		if (!isEmpty(upperInsideStrip)) {
			result.push(upperInsideStrip);
		}

		const lowerInsideStrip = fromBounds(other.left, other.bottom, other.right, base.bottom);
		if (!isEmpty(lowerInsideStrip)) {
			result.push(lowerInsideStrip);
		}

		const rightStrip = fromBounds(other.right, base.top, base.right, base.bottom);

		if (!isEmpty(rightStrip)) {
			result.push(rightStrip);
		}

		return result;
	};

	const subtractAll = (base, others) => {
		const subtractOthers = (previousResult, other) => {
			return previousResult.map(r => subtract(r, other)).flat();
		};

		const getArea = (rect) => rect.width * rect.height;
		const byAreaThenXThenY = (a, b) => getArea(a) - getArea(b) || a.x - b.x || a.y - b.y;

		return others.reduce(subtractOthers, [base]).sort(byAreaThenXThenY);
	};

	const candidates = subtractAll(baseRectangle, overlappingRectangles);

	return candidates[candidates.length - 1];
};



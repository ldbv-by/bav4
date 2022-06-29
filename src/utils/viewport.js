/**
 * Calculates a rectangle, where the element, which defines the viewport, is not overlapped by any specified element
 * @param {HTMLElement} viewportElement the HTMLElement, which defines the max. available viewport
 * @param {Array<HTMLElement>} overlappingElements
 * @returns {DOMRect}
 */
export const calculateVisibleViewport = (viewportElement, overlappingElements) => {
	const viewportRectangle = viewportElement.getBoundingClientRect();
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

	const intersect = (that, other) => {
		if (isEmpty(that) || isEmpty(other)) {
			return DOMRect.fromRect();
		}

		const x1 = Math.max(that.left, other.left);
		const x2 = Math.min(that.right, other.right);
		const y1 = Math.max(that.top, other.top);
		const y2 = Math.min(that.bottom, other.bottom);
		// If width or height is 0, the intersection was empty.
		return DOMRect.fromRect({ x: x1, y: y1, width: Math.max(0, x2 - x1), height: Math.max(0, y2 - y1) });
	};

	const subtract = (that, other) => {

		const result = [];
		other = intersect(other, that);
		if (isEmpty(other)) {
			return [clone(that)];
		}

		const leftStrip = fromBounds(that.left, that.top, other.left, that.bottom);
		if (!isEmpty(leftStrip)) {
			result.push(leftStrip);
		}

		const upperInsideStrip = fromBounds(other.left, that.top, other.right, other.top);
		if (!isEmpty(upperInsideStrip)) {
			result.push(upperInsideStrip);
		}

		const lowerInsideStrip = fromBounds(other.left, other.bottom, other.right, that.bottom);
		if (!isEmpty(lowerInsideStrip)) {
			result.push(lowerInsideStrip);
		}

		const rightStrip = fromBounds(other.right, that.top, that.right, that.bottom);

		if (!isEmpty(rightStrip)) {
			result.push(rightStrip);
		}

		return result;
	};

	const subtractAll = (that, others) => {
		const subtractOthers = (previousResult, other) => {
			return previousResult.map(r => subtract(r, other)).flat();
		};

		const getArea = (rect) => rect.width * rect.height;
		const byAreaThenXThenY = (a, b) => getArea(a) - getArea(b) || a.x - b.x || a.y - b.y;

		return others.reduce(subtractOthers, [that]).sort(byAreaThenXThenY);
	};

	const candidates = subtractAll(viewportRectangle, overlappingRectangles);

	return candidates[candidates.length - 1];
};



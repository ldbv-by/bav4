/**
 * @module utils/multiplyMatrices
 */
/**
 * Simple matrix (and vector) multiplication
 * A is m x n. B is n x p. product is m x p.
 *
 * based on https://www.w3.org/TR/css-color-4/multiply-matrices.js
 * added error handling for dimensions
 * @author Lea Verou 2020 MIT License
 * @author @thiloSchlemmer
 *
 * @param {Array<Number>|Array<Array<Number>>} A
 * @param {Array<Number>|Array<Array<Number>>} B
 * @returns {Array<Number>|Array<Array<Number>>}
 */
export const multiplyMatrices = (A, B) => {
	if (!Array.isArray(A) || !Array.isArray(B)) {
		throw new TypeError('A and B must be Arrays');
	}

	const wasVectorA = !Array.isArray(A[0]); // true, if A 1D (e.g. [a,b,c])
	const wasVectorB = !Array.isArray(B[0]); // true, if B 1D (e.g. [a,b,c])

	const rowsA = A.length;
	const rowsB = B.length;

	if (rowsA === 0 || rowsB === 0) {
		throw new Error('Empty matrix not supported');
	}

	// normalized input: A as array of rows, B as array of rows
	if (wasVectorA) A = [A];
	if (wasVectorB) B = B.map((x) => [x]);

	const colsA = A[0].length;
	const colsB = B[0].length;

	if (colsA !== rowsB) {
		throw new Error(`Incompatible Dimensions: A is ${rowsA}x${colsA}, B is ${rowsB}x${colsB}`);
	}

	const B_cols = Array.from({ length: colsB }, (_, j) => B.map((row) => row[j] || 0));

	const product = A.map((row) => B_cols.map((col) => row.reduce((sum, val, i) => sum + (val || 0) * (col[i] || 0), 0)));

	// return value based on source value dimension:
	if (wasVectorA && wasVectorB) return product[0][0]; // Skalar
	if (wasVectorA) return product[0]; // 1D-Array (Row vector)
	if (wasVectorB) return product.map((r) => r[0]); // 1D-Array (Column vector)
	return product;
};

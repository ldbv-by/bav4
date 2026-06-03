import { describe, it, expect } from 'vitest';
import { multiplyMatrices } from '@src/utils/multiplyMatrices.js';

export const matrices = {
	// small & simple matrices
	A2x2: [
		[1, 2],
		[3, 4]
	],
	B2x2: [
		[5, 6],
		[7, 8]
	],
	// vectors (1D)
	v3: [1, 2, 3],
	w3: [4, 5, 6],
	// Matrices 3x2 & 2x3
	M3x2: [
		[1, 2],
		[3, 4],
		[5, 6]
	],
	N2x3: [
		[7, 8, 9],
		[10, 11, 12]
	],
	// Jagged arrays (odd row length) — should be filled with 0
	jaggedA: [[1, 2, 3], [4]],
	jaggedB: [[5], [6, 7]],
	// Empty
	empty: []
};

describe('multiplyMatrices', () => {
	it('multiplies 2x2 matrices', () => {
		expect(multiplyMatrices(matrices.A2x2, matrices.B2x2)).toEqual([
			[19, 22],
			[43, 50]
		]);
	});

	it('multiplies row vector (1x3) with column vector (3x1) -> skalar', () => {
		expect(multiplyMatrices([1, 2, 3], [4, 5, 6])).toBe(32);
	});

	it('multiplies row vector with 3x2 matrix -> 1D-Array (row vector)', () => {
		const res = multiplyMatrices(matrices.M3x2, matrices.N2x3);
		expect(res).toEqual([
			[27, 30, 33],
			[61, 68, 75],
			[95, 106, 117]
		]);
	});

	it('multiplies matrix with vector (column vector) -> 1D-Array (column vector)', () => {
		const matrix = [
			[1, 0, 2],
			[0, 3, -1]
		];
		const vector = [3, 4, 5]; // 3x1
		expect(multiplyMatrices(matrix, vector)).toEqual([13, 7]);
	});
});

describe('multiplyMatrices - edge cases and error handling', () => {
	it('throws error on non-array input', () => {
		expect(() => multiplyMatrices([[1, 2, 3]], 'foo')).toThrow('A and B must be Arrays');
		expect(() => multiplyMatrices([[1, 2, 3]], null)).toThrow('A and B must be Arrays');
		expect(() => multiplyMatrices(null, null)).toThrow('A and B must be Arrays');
	});

	it('throws error on incompatible dimension', () => {
		expect(() =>
			multiplyMatrices(
				[[1, 2, 3]],
				[
					[1, 2],
					[3, 4]
				]
			)
		).toThrow('Incompatible Dimensions: A is 1x3, B is 2x2');
	});

	it('throws error on empty matrices', () => {
		expect(() => multiplyMatrices(matrices.empty, matrices.B2x2)).toThrow('Empty matrix not supported');
		expect(() => multiplyMatrices(matrices.A2x2, matrices.empty)).toThrow('Empty matrix not supported');
	});

	it('handles jagged arrays with filling with 0', () => {
		// jaggedA is 2x3; jaggedB 2x2
		// build a compatible partner: jaggedA (2x3) * B (3x2) => we craft B
		const B = [
			[1, 0],
			[0, 1],
			[2, 3]
		];
		const result = multiplyMatrices(matrices.jaggedA, B);
		// Berechnung:
		// row0: [1,2,3] * B => [1*1 + 2*0 + 3*2, 1*0 + 2*1 + 3*3] = [7, 11]
		// row1: [4,0,0] * B => [4*1 + 0 + 0, 0 + 0 + 0] = [4, 0]
		expect(result).toEqual([
			[7, 11],
			[4, 0]
		]);
	});

	it('multiplies 1D-Array * 2D-Array (Row vector * matrix)', () => {
		const rowVec = [1, 2];
		const mat = [
			[3, 4, 5],
			[6, 7, 8]
		]; // 2x3
		expect(multiplyMatrices(rowVec, mat)).toEqual([15, 18, 21]);
	});
});

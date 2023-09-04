/* eslint-disable no-undef */
import { $injector } from '../../src/injection/index.js';
import { createUniqueId, round, toLocaleString } from '../../src/utils/numberUtils.js';

describe('Unit test functions from numberUtils.js', () => {
	describe('round(value, decimals)', () => {
		const numberToRound = 123.456789;

		it('rounds a number without decimal if not specified', () => {
			expect(round(numberToRound)).toBe(123);
		});

		it('takes how many wanted decimals into account', () => {
			expect(round(numberToRound, 0)).toBe(123);
			expect(round(numberToRound, 1)).toBe(123.5);
			expect(round(numberToRound, 2)).toBe(123.46);
			expect(round(numberToRound, 3)).toBe(123.457);
			expect(round(numberToRound, 4)).toBe(123.4568);
			expect(round(numberToRound, 5)).toBe(123.45679);
			expect(round(numberToRound, 6)).toBe(123.456789);
			expect(round(numberToRound, 7)).toBe(123.456789);

			expect(round(numberToRound, -1)).toBe(120);
			expect(round(numberToRound, -2)).toBe(100);
		});

		it('returns undefined for a string containg text', () => {
			expect(round('not a number')).toBe(undefined);
		});

		it('returns undefined for an empty string', () => {
			expect(round('')).toBe(undefined);
		});

		it('returns undefined if input value is null or undefined', () => {
			expect(round(null)).toBe(undefined);
			expect(round(undefined)).toBe(undefined);
		});

		it('rounds a stringified number correctly', () => {
			expect(round('' + numberToRound)).toBe(123);
		});
	});

	describe('createUniqueId', () => {
		it('creates a (pseudo) unique id', () => {
			expect(createUniqueId()).toBeInstanceOf(Number);
			expect(createUniqueId()).not.toBe(createUniqueId());
		});
	});

	describe('toLocaleString', () => {
		const configService = {
			getValue: () => {}
		};

		beforeAll(() => {
			$injector.registerSingleton('ConfigService', configService);
		});

		describe('DI is available', () => {
			it('formates a number according to the current "DEFAULT_LANG" property', () => {
				spyOn(configService, 'getValue').withArgs('DEFAULT_LANG').and.returnValue('de');
				expect(toLocaleString(5.5)).toBe('5,5');
			});

			it('returns undefined when value is not a number', () => {
				spyOn(configService, 'getValue').withArgs('DEFAULT_LANG').and.returnValue('de');
				expect(toLocaleString('foo')).toBeUndefined();
			});
		});

		describe('DI is NOT available', () => {
			it('formates a number according to the current "DEFAULT_LANG" property', () => {
				spyOn(configService, 'getValue').and.throwError();
				expect(toLocaleString(5.5)).toBe('5.5');
			});

			it('returns undefined when value is not a number', () => {
				expect(toLocaleString('foo')).toBeUndefined();
			});
		});
	});
});

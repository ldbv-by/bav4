import { $injector } from '@src/injection/index.js';
import { createUniqueId, round, toLocaleString } from '@src/utils/numberUtils.js';

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

		it('returns undefined for a string containing text that is not a number', () => {
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
			expect(createUniqueId()).toBeTypeOf('number');
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
			it('formats a number according to the current "DEFAULT_LANG" property', () => {
				const getValueSpy = vi.spyOn(configService, 'getValue').mockReturnValue('de');

				expect(toLocaleString(5.5)).toBe('5,5');
				expect(toLocaleString(5000.5)).toBe('5000,5');
				expect(getValueSpy).toHaveBeenCalledWith('DEFAULT_LANG');
			});

			it('formats a string representing a number according to the current "DEFAULT_LANG" property', () => {
				const getValueSpy = vi.spyOn(configService, 'getValue').mockReturnValue('de');
				expect(toLocaleString('5.5')).toBe('5,5');
				expect(toLocaleString('5000.5')).toBe('5000,5');
				expect(getValueSpy).toHaveBeenCalledWith('DEFAULT_LANG');
			});

			it('formats a number according to the current "DEFAULT_LANG" property with custom fractionDigits parameter', () => {
				const getValueSpy = vi.spyOn(configService, 'getValue').mockReturnValue('de');

				expect(toLocaleString(5.5555, 1)).toBe('5,6');
				expect(getValueSpy).toHaveBeenCalledWith('DEFAULT_LANG');
			});

			it('returns undefined when value is not a number', () => {
				const getValueSpy = vi.spyOn(configService, 'getValue').mockReturnValue('de');

				expect(toLocaleString('foo')).toBeUndefined();
				expect(getValueSpy).not.toHaveBeenCalled();
			});
		});

		describe('DI is NOT available', () => {
			it('formats a number according to the current "DEFAULT_LANG" property', () => {
				vi.spyOn(configService, 'getValue').mockImplementation(() => {
					throw new Error();
				});
				expect(toLocaleString(5.5)).toBe('5.5');
				expect(toLocaleString(5000.5)).toBe('5000.5');
			});

			it('formats a string representing a number according to the current "DEFAULT_LANG" property', () => {
				vi.spyOn(configService, 'getValue').mockImplementation(() => {
					throw new Error();
				});
				expect(toLocaleString('5.5')).toBe('5.5');
				expect(toLocaleString('5000.5')).toBe('5000.5');
			});

			it('formats a number according to the current "DEFAULT_LANG" property with custom fractionDigits parameter', () => {
				vi.spyOn(configService, 'getValue').mockImplementation(() => {
					throw new Error();
				});
				expect(toLocaleString(5.5555, 1)).toBe('5.6');
				expect(toLocaleString(5000.5)).toBe('5000.5');
			});

			it('formats a string representing a number according to the current "DEFAULT_LANG" property', () => {
				vi.spyOn(configService, 'getValue').mockImplementation(() => {
					throw new Error();
				});
				expect(toLocaleString('5.5')).toBe('5.5');
			});

			it('returns undefined when value is not a number', () => {
				expect(toLocaleString('foo')).toBeUndefined();
			});
		});
	});
});

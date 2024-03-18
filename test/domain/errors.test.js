import { BaRuntimeError, UnavailableGeoResourceError } from '../../src/domain/errors';

describe('BaRuntimeError', () => {
	describe('constructor', () => {
		it('instantiates with required args', () => {
			const message = 'message';
			const error = new BaRuntimeError(message);

			expect(error.message).toBe(message);
			expect(error.cause).toBeUndefined();
			expect(error.name).toBe('BaRuntimeError');
		});

		it('instantiates with optional args', () => {
			const cause = new Error('foo');
			const message = 'message';
			const error = new BaRuntimeError(message, { cause: cause });

			expect(error.cause).toEqual(cause);
		});
	});
});

describe('UnavailableGeoResourceError', () => {
	describe('constructor', () => {
		it('instantiates with required args', () => {
			const message = 'message';
			const geoResourceId = 'geoResourceId';
			const error = new UnavailableGeoResourceError(message, geoResourceId);

			expect(error.message).toBe(message);
			expect(error.geoResourceId).toBe(geoResourceId);
			expect(error.httpStatus).toBeNull();
			expect(error.cause).toBeUndefined();
			expect(error.name).toBe('UnavailableGeoResourceError');
		});

		it('instantiates with optional args', () => {
			const cause = new Error('foo');
			const message = 'message';
			const geoResourceId = 'geoResourceId';
			const httpStatus = 401;
			const error = new UnavailableGeoResourceError(message, geoResourceId, 401, { cause: cause });

			expect(error.httpStatus).toBe(httpStatus);
			expect(error.cause).toEqual(cause);
		});
	});
});

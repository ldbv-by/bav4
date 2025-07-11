import { appendQueryParams, getOrigin, getOriginAndPathname, getPathParams, queryParamsToString, setQueryParams } from '../../src/utils/urlUtils';

describe('urlUtils', () => {
	describe('getOriginAndPathname', () => {
		it('extracts the origin following by the pathname of an URL', () => {
			expect(getOriginAndPathname('http://foo.bar')).toBe('http://foo.bar');
			expect(getOriginAndPathname('http://foo.bar/?=')).toBe('http://foo.bar');
			expect(getOriginAndPathname('http://foo.bar/?foo=bar')).toBe('http://foo.bar');
			expect(getOriginAndPathname('http://foo.bar:1234/?foo=bar')).toBe('http://foo.bar:1234');
			expect(getOriginAndPathname('http://foo.bar/some')).toBe('http://foo.bar/some');
			expect(getOriginAndPathname('http://foo.bar/some/')).toBe('http://foo.bar/some/');
			expect(getOriginAndPathname('http://foo.bar/some/?=')).toBe('http://foo.bar/some/');
			expect(getOriginAndPathname('http://foo.bar/some?foo=bar')).toBe('http://foo.bar/some');
			expect(getOriginAndPathname('http://foo.bar:1234/some/?foo=bar')).toBe('http://foo.bar:1234/some/');
		});

		it('throws a TypeError when parameter is not valid', () => {
			expect(() => getOriginAndPathname('foo')).toThrowError(TypeError);
		});
	});

	describe('getOrigin', () => {
		it('extracts the origin of an URL', () => {
			expect(getOrigin('http://foo.bar')).toBe('http://foo.bar');
			expect(getOrigin('http://foo.bar/?=')).toBe('http://foo.bar');
			expect(getOrigin('http://foo.bar/?foo=bar')).toBe('http://foo.bar');
			expect(getOrigin('http://foo.bar:1234/?foo=bar')).toBe('http://foo.bar:1234');
			expect(getOrigin('http://foo.bar/some')).toBe('http://foo.bar');
			expect(getOrigin('http://foo.bar/some/')).toBe('http://foo.bar');
			expect(getOrigin('http://foo.bar/some/?=')).toBe('http://foo.bar');
			expect(getOrigin('http://foo.bar/some/?foo=bar')).toBe('http://foo.bar');
			expect(getOrigin('http://foo.bar:1234/some/?foo=bar')).toBe('http://foo.bar:1234');
		});

		it('throws a TypeError when parameter is not valid', () => {
			expect(() => getOrigin('foo')).toThrowError(TypeError);
		});
	});

	describe('getPathParams', () => {
		it('extracts the path parameters of an URL', () => {
			expect(getPathParams('http://foo.bar')).toEqual([]);
			expect(getPathParams('http://foo.bar/')).toEqual([]);
			expect(getPathParams('http://foo.bar/?=')).toEqual([]);
			expect(getPathParams('http://foo.bar/?foo=bar')).toEqual([]);
			expect(getPathParams('http://foo.bar:1234/?foo=bar')).toEqual([]);
			expect(getPathParams('http://foo.bar/some')).toEqual(['some']);
			expect(getPathParams('http://foo.bar/some/thing.html')).toEqual(['some', 'thing.html']);
			expect(getPathParams('http://foo.bar/some//thing')).toEqual(['some', 'thing']);
		});

		it('throws a TypeError when parameter is not valid', () => {
			expect(() => getPathParams('foo')).toThrowError(TypeError);
		});
	});

	describe('appendQueryParams', () => {
		it('appends query parameters to an existing url', () => {
			expect(appendQueryParams('http://foo.bar?some=thing')).toBe('http://foo.bar/?some=thing');
			expect(appendQueryParams('http://foo.bar?some=thing', { foo: 'bar' })).toBe('http://foo.bar/?some=thing&foo=bar');
			expect(appendQueryParams('http://foo.bar?some=thing', { some: 'thing' })).toBe('http://foo.bar/?some=thing&some=thing');
		});

		it('throws a TypeError when parameter is not valid', () => {
			expect(() => appendQueryParams('foo')).toThrowError(TypeError);
		});
	});

	describe('setQueryParams', () => {
		it('sets to or removes query parameters from an existing url', () => {
			expect(setQueryParams('http://foo.bar?some=thing')).toBe('http://foo.bar/?some=thing');
			expect(setQueryParams('http://foo.bar?some=thing', { foo: 'bar' })).toBe('http://foo.bar/?some=thing&foo=bar');
			expect(setQueryParams('http://foo.bar?some=thing', { some: 'thing' })).toBe('http://foo.bar/?some=thing');
			expect(setQueryParams('http://foo.bar?some=thing&some=thing2', { some: 'thing3' })).toBe('http://foo.bar/?some=thing3');
			expect(setQueryParams('http://foo.bar?some=thing&some=thing2', { some: null })).toBe('http://foo.bar/?');
		});

		it('throws a TypeError when parameter is not valid', () => {
			expect(() => setQueryParams('foo')).toThrowError(TypeError);
		});
	});

	describe('queryParamsToString', () => {
		it('builds a query string from query parameters', () => {
			expect(queryParamsToString({ one: 42, two: '(((plz+=+12345)))', three: ['a', 'b'] })).toBe(
				`one=42&two=${encodeURIComponent('(((plz+=+12345)))')}&three=${encodeURIComponent('a,b')}`
			);
		});
	});
});

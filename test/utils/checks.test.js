import { html } from 'lit-html';
import { isCoordinate, isHttpUrl, isNumber, isObject, isPromise, isString, isTemplateResult } from '../../src/utils/checks';

describe('provides checks for commons types', () => {

	it('checks for an object', () => {
		expect(isObject()).toBeFalse();
		expect(isObject(null)).toBeFalse();
		expect(isObject([21])).toBeFalse();
		expect(isObject('some')).toBeFalse();
		expect(isObject(5)).toBeFalse();

		expect(isObject({})).toBeTrue();
	});

	it('checks for a string', () => {
		expect(isString()).toBeFalse();
		expect(isString(null)).toBeFalse();
		expect(isString(123)).toBeFalse();
		expect(isString({})).toBeFalse();

		expect(isString('true')).toBeTrue();
		expect(isString(String('true'))).toBeTrue();
	});

	it('checks for a number (strict)', () => {
		expect(isNumber()).toBeFalse();
		expect(isNumber(null)).toBeFalse();
		expect(isNumber('123')).toBeFalse();
		expect(isNumber({})).toBeFalse();

		expect(isNumber(123)).toBeTrue();
		expect(isNumber(123.123)).toBeTrue();
		expect(isNumber(Number(123))).toBeTrue();
	});

	it('checks for a number (strings allowed)', () => {
		expect(isNumber(undefined, false)).toBeFalse();
		expect(isNumber(null, false)).toBeFalse();
		expect(isNumber({}, false)).toBeFalse();
		expect(isNumber('', false)).toBeFalse();

		expect(isNumber('123', false)).toBeTrue();
		expect(isNumber('123.123', false)).toBeTrue();
		expect(isNumber(123, false)).toBeTrue();
		expect(isNumber(123.123, false)).toBeTrue();
		expect(isNumber(Number(123), false)).toBeTrue();
	});

	it('checks for a coordinate', () => {
		expect(isCoordinate()).toBeFalse();
		expect(isCoordinate(null)).toBeFalse();
		expect(isCoordinate([21])).toBeFalse();
		expect(isCoordinate({})).toBeFalse();
		expect(isCoordinate(['21', 42])).toBeFalse();
		expect(isCoordinate(['21', '42'])).toBeFalse();
		expect(isCoordinate([1, 2, 3])).toBeFalse();

		expect(isCoordinate([21, 42])).toBeTrue();
	});

	it('checks for a promise', () => {
		expect(isPromise()).toBeFalse();
		expect(isPromise(null)).toBeFalse();
		expect(isPromise([21])).toBeFalse();
		expect(isPromise({})).toBeFalse();
		expect(isPromise('some')).toBeFalse();
		expect(isPromise(5)).toBeFalse();

		expect(isPromise(Promise.resolve())).toBeTrue();
	});

	it('checks for a lit-html TemplateResult', () => {
		expect(isTemplateResult()).toBeFalse();
		expect(isTemplateResult(null)).toBeFalse();
		expect(isTemplateResult([21])).toBeFalse();
		expect(isTemplateResult({})).toBeFalse();
		expect(isTemplateResult('some')).toBeFalse();
		expect(isTemplateResult(5)).toBeFalse();

		expect(isTemplateResult(html`foo`)).toBeTrue();
	});

	it('checks for a URL', () => {
		expect(isHttpUrl()).toBeFalse();
		expect(isHttpUrl(null)).toBeFalse();
		expect(isHttpUrl([21])).toBeFalse();
		expect(isHttpUrl({})).toBeFalse();
		expect(isHttpUrl('some')).toBeFalse();
		expect(isHttpUrl(5)).toBeFalse();
		expect(isHttpUrl('haha://some.thing')).toBeFalse();

		expect(isHttpUrl('http://some.thing')).toBeTrue();
		expect(isHttpUrl('https://some.thing')).toBeTrue();
		expect(isHttpUrl('http://some.thing.else')).toBeTrue();
		expect(isHttpUrl('https://some.thing/else')).toBeTrue();
	});
});

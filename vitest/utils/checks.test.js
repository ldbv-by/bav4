import { html } from 'lit-html';
import { isCoordinate, isExternalGeoResourceId, isHttpUrl, isNumber, isObject, isPromise, isString, isTemplateResult, isFunction, isCoordinateLike, isHexColor, isBoolean } from '../../src/utils/checks';

describe('provides checks for commons types', () => {
    it('checks for an object', () => {
        expect(isObject()).toBe(false);
        expect(isObject(null)).toBe(false);
        expect(isObject([21])).toBe(false);
        expect(isObject('some')).toBe(false);
        expect(isObject(5)).toBe(false);
        expect(isObject([])).toBe(false);

        expect(isObject({})).toBe(true);
    });

    it('checks for a string', () => {
        expect(isString()).toBe(false);
        expect(isString(null)).toBe(false);
        expect(isString(123)).toBe(false);
        expect(isString({})).toBe(false);
        expect(isString([])).toBe(false);

        expect(isString('true')).toBe(true);
        expect(isString(String('true'))).toBe(true);
    });

    it('checks for a boolean', () => {
        expect(isBoolean()).toBe(false);
        expect(isBoolean(null)).toBe(false);
        expect(isBoolean(123)).toBe(false);
        expect(isBoolean({})).toBe(false);
        expect(isBoolean([])).toBe(false);
        expect(isBoolean('true')).toBe(false);

        expect(isBoolean(true)).toBe(true);
        expect(isBoolean(false)).toBe(true);
        expect(isBoolean(Boolean(false))).toBe(true);
    });

    it('checks if a string valid hex color representation', () => {
        expect(isHexColor()).toBe(false);
        expect(isHexColor(null)).toBe(false);
        expect(isHexColor(123)).toBe(false);
        expect(isHexColor({})).toBe(false);
        expect(isHexColor([])).toBe(false);

        expect(isHexColor('#ff00')).toBe(false);
        expect(isHexColor('#ff0000')).toBe(true);
        expect(isHexColor('#ff0000CC')).toBe(false);
        expect(isHexColor('#ff0000CC', false)).toBe(false);
        expect(isHexColor('#ff0000CC', true)).toBe(true);
    });

    it('checks for a function', () => {
        expect(isFunction()).toBe(false);
        expect(isFunction(null)).toBe(false);
        expect(isFunction(123)).toBe(false);
        expect(isFunction({})).toBe(false);
        expect(isFunction([])).toBe(false);

        expect(isFunction(() => { })).toBe(true);
        expect(isFunction(function () { })).toBe(true);
    });

    it('checks for a number (strict)', () => {
        expect(isNumber()).toBe(false);
        expect(isNumber(null)).toBe(false);
        expect(isNumber('123')).toBe(false);
        expect(isNumber({})).toBe(false);
        expect(isNumber([])).toBe(false);

        expect(isNumber(123)).toBe(true);
        expect(isNumber(123.123)).toBe(true);
        expect(isNumber(Number(123))).toBe(true);
    });

    it('checks for a number (strings allowed)', () => {
        expect(isNumber(undefined, false)).toBe(false);
        expect(isNumber(null, false)).toBe(false);
        expect(isNumber({}, false)).toBe(false);
        expect(isNumber([], false)).toBe(false);
        expect(isNumber('', false)).toBe(false);

        expect(isNumber('123', false)).toBe(true);
        expect(isNumber('123.123', false)).toBe(true);
        expect(isNumber(123, false)).toBe(true);
        expect(isNumber(123.123, false)).toBe(true);
        expect(isNumber(Number(123), false)).toBe(true);
    });

    it('checks for a coordinate', () => {
        expect(isCoordinate()).toBe(false);
        expect(isCoordinate(null)).toBe(false);
        expect(isCoordinate([21])).toBe(false);
        expect(isCoordinate({})).toBe(false);
        expect(isCoordinate(['21', 42])).toBe(false);
        expect(isCoordinate(['21', '42'])).toBe(false);
        expect(isCoordinate([1, 2, 3])).toBe(false);

        expect(isCoordinate([21, 42])).toBe(true);
    });

    it('checks for a coordinate like', () => {
        expect(isCoordinateLike()).toBe(false);
        expect(isCoordinateLike(null)).toBe(false);
        expect(isCoordinateLike([21])).toBe(false);
        expect(isCoordinateLike({})).toBe(false);
        expect(isCoordinateLike(['21', 42])).toBe(false);
        expect(isCoordinateLike(['21', '42'])).toBe(false);
        expect(isCoordinateLike([1, 2, 3])).toBe(true);
        expect(isCoordinateLike([21, 42])).toBe(true);
    });

    it('checks for a promise', () => {
        expect(isPromise()).toBe(false);
        expect(isPromise(null)).toBe(false);
        expect(isPromise([21])).toBe(false);
        expect(isPromise({})).toBe(false);
        expect(isPromise('some')).toBe(false);
        expect(isPromise(5)).toBe(false);

        expect(isPromise(Promise.resolve())).toBe(true);
    });

    it('checks for a lit-html TemplateResult', () => {
        expect(isTemplateResult()).toBe(false);
        expect(isTemplateResult(null)).toBe(false);
        expect(isTemplateResult([21])).toBe(false);
        expect(isTemplateResult({})).toBe(false);
        expect(isTemplateResult('some')).toBe(false);
        expect(isTemplateResult(5)).toBe(false);

        expect(isTemplateResult(html `foo`)).toBe(true);
    });

    it('checks for a URL', () => {
        expect(isHttpUrl()).toBe(false);
        expect(isHttpUrl(null)).toBe(false);
        expect(isHttpUrl([21])).toBe(false);
        expect(isHttpUrl({})).toBe(false);
        expect(isHttpUrl('some')).toBe(false);
        expect(isHttpUrl(5)).toBe(false);
        expect(isHttpUrl('haha://some.thing')).toBe(false);

        expect(isHttpUrl('http://some.thing')).toBe(true);
        expect(isHttpUrl('https://some.thing')).toBe(true);
        expect(isHttpUrl('http://some.thing.else')).toBe(true);
        expect(isHttpUrl('https://some.thing/else')).toBe(true);
    });

    it('checks for an external GeoResource id', () => {
        expect(isExternalGeoResourceId()).toBe(false);
        expect(isExternalGeoResourceId(null)).toBe(false);
        expect(isExternalGeoResourceId([21])).toBe(false);
        expect(isExternalGeoResourceId({})).toBe(false);
        expect(isExternalGeoResourceId('some')).toBe(false);
        expect(isExternalGeoResourceId(5)).toBe(false);
        expect(isExternalGeoResourceId('haha://some.thing')).toBe(false);

        expect(isExternalGeoResourceId('http://some.thing')).toBe(true);
        expect(isExternalGeoResourceId('https://some.thing')).toBe(true);
        expect(isExternalGeoResourceId('http://some.thing.else')).toBe(true);
        expect(isExternalGeoResourceId('https://some.thing/else')).toBe(true);
        expect(isExternalGeoResourceId('https://some.thing/else||layer||name)')).toBe(true);
    });
});

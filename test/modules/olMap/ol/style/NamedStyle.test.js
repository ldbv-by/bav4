import { describe, expect } from 'vitest';
import { NamedStyle } from '@src/modules/olMap/ol/style/NamedStyle';
import Style from 'ol/style/Style';
import { Circle } from 'ol/geom';
import Stroke from 'ol/style/Stroke';
import Fill from 'ol/style/Fill';

describe('NamedStyle', () => {
	describe('constructor', () => {
		it('initializes an instance of NamedStyle', () => {
			const options = {};
			const classUnderTest = new NamedStyle('foo', options);

			expect(classUnderTest).toBeInstanceOf(NamedStyle);
		});

		it('initializes a default style with options', () => {
			const options = {};
			const classUnderTest = new NamedStyle('foo', options);

			expect(classUnderTest.getGeometry).toBeDefined();
			expect(classUnderTest.getStroke).toBeDefined();
			expect(classUnderTest.getFill).toBeDefined();
			expect(classUnderTest.getRenderer).toBeDefined();
			expect(classUnderTest.getText).toBeDefined();
		});

		it('has a name property', () => {
			const options = {};
			const classUnderTest = new NamedStyle('fooBar', options);

			expect(classUnderTest.name).toBe('fooBar');
		});

		it('propagates options to Style class', () => {
			const fill = new Fill({
				color: 'rgba(255,255,255,0.4)'
			});
			const stroke = new Stroke({
				color: '#3399CC',
				width: 1.25
			});

			const options = {
				image: new Circle({
					fill: fill,
					stroke: stroke,
					radius: 5
				}),
				fill: fill,
				stroke: stroke
			};

			const classUnderTest = new NamedStyle('fooBar', options);

			expect(classUnderTest.name).toBe('fooBar');
			expect(classUnderTest.getStroke()).toBe(stroke);
			expect(classUnderTest.getFill()).toBe(fill);
		});
	});
});

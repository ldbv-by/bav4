
import { highlightFeatureStyleFunction, highlightTemporaryFeatureStyleFunction, nullStyleFunction } from '../../../../../../../src/modules/map/components/olMap/handler/highlight/StyleUtils';
import { Point } from 'ol/geom';
import { Feature } from 'ol';


describe('highlightStyleFunction', () => {
	it('should create a svg-icon style for a point-feature', () => {
		const geometry = new Point([0, 0]);
		const feature = new Feature({ geometry: geometry });

		const styles = highlightFeatureStyleFunction(feature);

		expect(styles).toBeTruthy();
		expect(styles.length).toBe(1);

		const highlightStyle = styles[0];
		expect(highlightStyle.getImage()).toBeTruthy();
	});

	it('should create a svg-icon style for a temporary point-feature', () => {
		const geometry = new Point([0, 0]);
		const feature = new Feature({ geometry: geometry });

		const styles = highlightTemporaryFeatureStyleFunction(feature);

		expect(styles).toBeTruthy();
		expect(styles.length).toBe(1);

		const highlightStyle = styles[0];
		expect(highlightStyle.getImage()).toBeTruthy();
	});

});


describe('nullStyleFunction', () => {
	it('should create a empty style', () => {
		const geometry = new Point([0, 0]);
		const feature = new Feature({ geometry: geometry });

		const styles = nullStyleFunction(feature);

		expect(styles).toBeTruthy();
		expect(styles.length).toBe(1);

		const nullStyle = styles[0];
		expect(nullStyle.getFill()).toBeFalsy();
		expect(nullStyle.getStroke()).toBeFalsy();
		expect(nullStyle.getImage()).toBeFalsy();
	});
});

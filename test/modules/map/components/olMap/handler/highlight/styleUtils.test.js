
import { highlightFeatureStyleFunction, highlightTemporaryFeatureStyleFunction } from '../../../../../../../src/modules/map/components/olMap/handler/highlight/styleUtils';
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

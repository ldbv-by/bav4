
import { accuracyStyleFunction, positionStyleFunction } from '../../../../../../../src/modules/map/components/olMap/handler/geolocation/StyleUtils';
import { Point, Circle } from 'ol/geom';
import { Feature } from 'ol';


describe('accuracyStyleFunction', () => {
	const geometry = new Point([0, 0]);
	const feature = new Feature({ geometry: geometry });
	it('should create a style', () => {

		const styles = accuracyStyleFunction(feature);

		expect(styles).toBeTruthy();
		expect(styles.length).toBe(1);
	});
});

describe('positionStyleFunction', () => {
	const geometry = new Circle([[0, 0], 10]);
	const feature = new Feature({ geometry: geometry });
	it('should create a stylefunction', () => {

		const styles = positionStyleFunction(feature);

		expect(styles).toBeTruthy();
		expect(styles.length).toBe(1);
	});
});
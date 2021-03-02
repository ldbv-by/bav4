
import { geolocationStyleFunction } from '../../../../../../../src/modules/map/components/olMap/handler/geolocation/StyleUtils';
import { Point, Circle } from 'ol/geom';
import { Feature } from 'ol';


describe('geolocationStyleFunction', () => {
	it('should create a style for a point-feature', () => {
		const geometry = new Point([0, 0]);
		const feature = new Feature({ geometry: geometry });

		const styles = geolocationStyleFunction(feature);

		expect(styles).toBeTruthy();
		expect(styles.length).toBe(1);
	});

	it('should create a style for a Circle-feature', () => {
		const geometry = new Circle([[0, 0], 10]);
		const feature = new Feature({ geometry: geometry });
		
		const styles = geolocationStyleFunction(feature);

		expect(styles).toBeTruthy();
		expect(styles.length).toBe(1);
	});
});

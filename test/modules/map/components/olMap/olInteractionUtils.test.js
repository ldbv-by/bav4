import Style from 'ol/style/Style';
import { getFeatureSnapOption } from '../../../../../src/modules/map/components/olMap/olInteractionUtils';
import { modifyStyleFunction } from '../../../../../src/modules/map/components/olMap/olStyleUtils';

describe('olInteractionUtils', () => {

	describe('when using getFeatureSnapOption', () => {
		it('returns a object with a filter-function, which returns true for the defined layer', () => {
			const mockLayer = {};

			const option = getFeatureSnapOption(mockLayer);
			expect(option.layerFilter(mockLayer)).toBeTrue();

		});

		it('returns a object with a filter-function, which returns true for the defined (modified) layer', () => {
			const mockModifiedLayer = { getStyle: () => modifyStyleFunction };
			const mockNotModifiedLayer = { getStyle: () => () => [new Style()] };

			expect(getFeatureSnapOption(mockModifiedLayer, true).layerFilter(mockModifiedLayer)).toBeTrue();

			expect(getFeatureSnapOption(mockModifiedLayer, true).layerFilter(mockNotModifiedLayer)).toBeFalse();

		});
	});
});

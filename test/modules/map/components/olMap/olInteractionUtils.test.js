import { Point } from 'ol/geom';
import Style from 'ol/style/Style';
import { getFeatureSnapOption, getSelectableFeatures, getSnapState, InteractionSnapType, removeSelectedFeatures } from '../../../../../src/modules/map/components/olMap/olInteractionUtils';
import { modifyStyleFunction } from '../../../../../src/modules/map/components/olMap/olStyleUtils';

describe('olInteractionUtils', () => {

	describe('when using getFeatureSnapOption', () => {
		it('returns a object with a filter-function, which returns true for the defined layer', () => {
			const mockLayer = {};
			const aDifferentLayer = {};

			const option = getFeatureSnapOption(mockLayer);
			expect(option.layerFilter(mockLayer)).toBeTrue();
			expect(option.layerFilter(aDifferentLayer)).toBeFalse();

		});

		it('returns a object with a filter-function, which returns true for the defined (modified) layer', () => {
			const mockModifiedLayer = { getStyle: () => () => [new Style()] };
			const aDifferentLayer = { getStyle: () => () => [new Style()] };

			const option = getFeatureSnapOption(mockModifiedLayer, true);
			expect(option.layerFilter(mockModifiedLayer)).toBeFalse();
			spyOn(mockModifiedLayer, 'getStyle').and.returnValue(modifyStyleFunction);
			expect(option.layerFilter(mockModifiedLayer)).toBeTrue();

			expect(option).toBeTruthy();
			expect(option.layerFilter).toBeTruthy();
			expect(option.layerFilter(aDifferentLayer)).toBeFalse();

		});
	});
});

describe('getSnapState', () => {
	it('detects a snap on a edge', () => {
		const pixel = {};
		const mockLayer = {};
		const mockFeature = {
			getGeometry: () => {
				return new Point([0, 0]);
			},
			get: () => {
				return [{
					getGeometry: () => {
						return new Point([1, 1]);
					}
				}];
			}
		};
		let count = 0;
		const mapMock = {
			forEachFeatureAtPixel: (pixel, featureFunction) => {
				if (count === 0) {
					count = 1;
					return featureFunction(mockFeature, null);
				}
				return;
			}
		};

		expect(getSnapState(mapMock, mockLayer, pixel)).toBe(InteractionSnapType.EGDE);
	});


	it('detects a snap on a vertex', () => {
		const pixel = {};
		const mockLayer = {};
		const mockFeature = {
			getGeometry: () => {
				return new Point([0, 0]);
			},
			get: () => {
				return [{
					getGeometry: () => {
						return new Point([0, 0]);
					}
				}];
			}
		};
		let count = 0;
		const mapMock = {
			forEachFeatureAtPixel: (pixel, featureFunction) => {
				if (count === 0) {
					count = 1;
					return featureFunction(mockFeature, null);
				}
				return;
			}
		};

		expect(getSnapState(mapMock, mockLayer, pixel)).toBe(InteractionSnapType.VERTEX);
	});

	it('detects a snap on a face', () => {
		const pixel = {};
		const mockLayer = {};
		const mockFeature = {
			getGeometry: () => {
				return new Point([0, 0]);
			},
			get: () => {
				return [{
					getGeometry: () => {
						return new Point([0, 0]);
					}
				}];
			}
		};
		let count = 0;
		const mapMock = {
			forEachFeatureAtPixel: (pixel, featureFunction) => {
				if (count === 0) {
					count = 1;
					return featureFunction(mockFeature, mockLayer);
				}
				return;
			}
		};

		expect(getSnapState(mapMock, mockLayer, pixel)).toBe(InteractionSnapType.FACE);
	});
});

describe('getSelectableFeatures', () => {
	it('returns a selectable feature', () => {
		const pixel = {};
		const mockLayer = {};
		const mockFeature = {};
		const mapMock = {
			forEachFeatureAtPixel: (pixel, featureFunction) => {
				return featureFunction(mockFeature, mockLayer);
			}
		};

		expect(getSelectableFeatures(mapMock, mockLayer, pixel)).toContain(mockFeature);
	});


	it('returns NOT a selectable feature', () => {
		const pixel = {};
		const mockLayer = {};
		const aDifferentLayer = {};
		const mockFeature = {};
		const mapMock = {
			forEachFeatureAtPixel: (pixel, featureFunction) => {
				return featureFunction(mockFeature, aDifferentLayer);
			}
		};

		expect(getSelectableFeatures(mapMock, mockLayer, pixel)).toEqual([]);
	});

});

describe('removeSelectedFeatures', () => {
	it('removes features from layer', () => {
		const mockSource = {
			hasFeature: () => true,
			removeFeature: () => { }
		};
		const removeSpy = spyOn(mockSource, 'removeFeature');
		const mockLayer = { getSource: () => mockSource };
		const featuresToRemove = [{}, {}, {}, {}];

		removeSelectedFeatures(featuresToRemove, mockLayer);

		expect(removeSpy).toHaveBeenCalledTimes(4);
	});

	it('before removing, calls additionalAction', () => {
		const mockSource = {
			hasFeature: () => true,
			removeFeature: () => { }
		};
		const mock = { additionalAction: () => { } };
		const removeSpy = spyOn(mockSource, 'removeFeature');
		const additionalSpy = spyOn(mock, 'additionalAction');
		const mockLayer = { getSource: () => mockSource };
		const featuresToRemove = [{}, {}, {}, {}];

		removeSelectedFeatures(featuresToRemove, mockLayer, mock.additionalAction);

		expect(removeSpy).toHaveBeenCalledTimes(4);
		expect(additionalSpy).toHaveBeenCalledTimes(4);
	});
});

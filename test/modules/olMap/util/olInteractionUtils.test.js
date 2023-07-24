import { MapBrowserEvent } from 'ol';
import { Point } from 'ol/geom';
import MapBrowserEventType from 'ol/MapBrowserEventType';
import Style from 'ol/style/Style';
import { $injector } from '../../../../src/injection';
import {
	getFeatureSnapOption,
	getModifyOptions,
	getSelectableFeatures,
	getSelectOptions,
	getSnapState,
	getSnapTolerancePerDevice,
	InteractionSnapType,
	InteractionStateType,
	removeSelectedFeatures
} from '../../../../src/modules/olMap/utils/olInteractionUtils';
import { modifyStyleFunction } from '../../../../src/modules/olMap/utils/olStyleUtils';
import { TestUtils } from '../../../test-utils';

const environmentService = {
	isStandalone: () => false,
	isTouch: () => false
};
beforeAll(() => {
	TestUtils.setupStoreAndDi();
	$injector.registerSingleton('EnvironmentService', environmentService);
});

describe('olInteractionUtils', () => {
	describe('enum InteractionStateType', () => {
		it('is an enum with a value', () => {
			expect(Object.entries(InteractionStateType).length).toBe(5);
			expect(Object.isFrozen(InteractionStateType)).toBeTrue();
			expect(InteractionStateType.ACTIVE).toEqual('active');
			expect(InteractionStateType.DRAW).toEqual('draw');
			expect(InteractionStateType.MODIFY).toEqual('modify');
			expect(InteractionStateType.SELECT).toEqual('select');
			expect(InteractionStateType.OVERLAY).toEqual('overlay');
		});
	});

	describe('enum InteractionSnapType', () => {
		it('is an enum with a value', () => {
			expect(Object.entries(InteractionSnapType).length).toBe(5);
			expect(Object.isFrozen(InteractionSnapType)).toBeTrue();
			expect(InteractionSnapType.FIRSTPOINT).toEqual('firstPoint');
			expect(InteractionSnapType.LASTPOINT).toEqual('lastPoint');
			expect(InteractionSnapType.VERTEX).toEqual('vertex');
			expect(InteractionSnapType.EDGE).toEqual('edge');
			expect(InteractionSnapType.FACE).toEqual('face');
		});
	});

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
			expect(option.layerFilter(mockModifiedLayer)).toBeTrue();
			spyOn(mockModifiedLayer, 'getStyle').and.returnValue(modifyStyleFunction);
			expect(option.layerFilter(mockModifiedLayer)).toBeTrue();

			expect(option).toBeTruthy();
			expect(option.layerFilter).toBeTruthy();
			expect(option.layerFilter(aDifferentLayer)).toBeFalse();
		});
	});

	describe('when using getSelectOption', () => {
		it('returns a object with a layer-filter, which returns true for the defined layer', () => {
			const mockLayer = { a: 'b' };
			const aDifferentLayer = {};

			const selectOptions = getSelectOptions(mockLayer);

			expect(selectOptions.layers).toEqual(jasmine.any(Function));
			expect(selectOptions.layers(mockLayer)).toBeTrue();
			expect(selectOptions.layers(aDifferentLayer)).toBeFalse();
		});

		it('returns a object with a feature-filter, which returns true for the defined layer', () => {
			const mockLayer = {};
			const aDifferentLayer = {};
			const featureStub = {};

			const option = getSelectOptions(mockLayer);
			const featureFilter = option.filter;
			expect(featureFilter(featureStub, mockLayer)).toBe(featureStub);
			expect(featureFilter(featureStub, aDifferentLayer)).toBeNull();
		});
	});

	describe('when using getModifyOptions', () => {
		it("returns a object with a delete-condition for 'singleClick and noModifierKeys' ", () => {
			const featuresStub = {};

			const modifyOptions = getModifyOptions(featuresStub);
			const singleClickEvent = new MapBrowserEvent(MapBrowserEventType.SINGLECLICK, null, new MouseEvent(''));
			const noSingleClickEvent = new MapBrowserEvent(MapBrowserEventType.DBLCLICK, null, new MouseEvent(''));
			expect(modifyOptions.deleteCondition).toEqual(jasmine.any(Function));
			expect(modifyOptions.deleteCondition(singleClickEvent)).toBeTrue();
			expect(modifyOptions.deleteCondition(noSingleClickEvent)).toBeFalse();
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
					return [
						{
							getGeometry: () => {
								return new Point([1, 1]);
							}
						}
					];
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

			expect(getSnapState(mapMock, mockLayer, pixel)).toBe(InteractionSnapType.EDGE);
		});

		it('detects a snap on a vertex', () => {
			const pixel = {};
			const mockLayer = {};
			const mockFeature = {
				getGeometry: () => {
					return new Point([0, 0]);
				},
				get: () => {
					return [
						{
							getGeometry: () => {
								return new Point([0, 0]);
							}
						}
					];
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
					return [
						{
							getGeometry: () => {
								return new Point([0, 0]);
							}
						}
					];
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
				removeFeature: () => {}
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
				removeFeature: () => {}
			};
			const mock = { additionalAction: () => {} };
			const removeSpy = spyOn(mockSource, 'removeFeature');
			const additionalSpy = spyOn(mock, 'additionalAction');
			const mockLayer = { getSource: () => mockSource };
			const featuresToRemove = [{}, {}, {}, {}];

			removeSelectedFeatures(featuresToRemove, mockLayer, mock.additionalAction);

			expect(removeSpy).toHaveBeenCalledTimes(4);
			expect(additionalSpy).toHaveBeenCalledTimes(4);
		});
	});

	describe('getSnapTolerancePerDevice', () => {
		it('isTouch() resolves in higher snapTolerance', () => {
			const environmentSpy = spyOn(environmentService, 'isTouch').and.returnValue(true);

			expect(getSnapTolerancePerDevice()).toBe(12);
			expect(environmentSpy).toHaveBeenCalled();
		});

		it('isTouch() resolves in lower snapTolerance', () => {
			const environmentSpy = spyOn(environmentService, 'isTouch').and.returnValue(false);

			expect(getSnapTolerancePerDevice()).toBe(4);
			expect(environmentSpy).toHaveBeenCalled();
		});
	});
});

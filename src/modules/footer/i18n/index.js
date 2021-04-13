
import { coordinateSelectProvide } from './coordinateSelect.provider';
import { provide as baseLayerInfoProvider } from './baseLayerInfo.provider'; 
import { provide as attributionInfoProvider } from './attributionInfo.provider'; 
import { $injector } from '../../../injection';
const { TranslationService: translationService } = $injector.inject('TranslationService');
translationService.register('coordinateSelectProvider', coordinateSelectProvide);
translationService.register('baseLayerInfoProvider', baseLayerInfoProvider);
translationService.register('attributionInfoProvider', attributionInfoProvider);


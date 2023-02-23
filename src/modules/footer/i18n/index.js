import { coordinateSelectProvide } from './coordinateSelect.provider';
import { provide as baseLayerInfoProvider } from './baseLayerInfo.provider';
import { $injector } from '../../../injection';
const { TranslationService: translationService } = $injector.inject('TranslationService');
translationService.register('coordinateSelectProvider', coordinateSelectProvide);
translationService.register('baseLayerInfoProvider', baseLayerInfoProvider);

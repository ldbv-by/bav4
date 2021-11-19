import { provide as layerInfoProvider } from './layerInfo.provider';
import { $injector } from '../../../injection';
const { TranslationService: translationService } = $injector.inject('TranslationService');
translationService.register('layerInfoProvider', layerInfoProvider);

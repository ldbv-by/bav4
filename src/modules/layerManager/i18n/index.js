import { provide as layerManagerProvide } from './layerManager.provider';
import { $injector } from '../../../injection';
const { TranslationService: translationService } = $injector.inject('TranslationService');
translationService.register('layerManagerProvider', layerManagerProvide);

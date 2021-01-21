
import { provide } from './map.provider';
import { layerManagerProvide } from './layerManager.provider';
import { $injector } from '../../../injection';
const { TranslationService: translationService } = $injector.inject('TranslationService');
translationService.register('mapProvider', provide);
translationService.register('layerManagerProvider', layerManagerProvide);

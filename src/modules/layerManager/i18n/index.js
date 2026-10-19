import { $injector } from '../../../injection';
import { provide as layerManagerProvide } from './layerManager.provider';

const { TranslationService: translationService } = $injector.inject('TranslationService');
translationService.register('layerManagerProvider', layerManagerProvide);

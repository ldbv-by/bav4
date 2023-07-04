import { provide } from './baseLayer.provider';
import { $injector } from '../../../injection';
const { TranslationService: translationService } = $injector.inject('TranslationService');
translationService.register('baselayerProvider', provide);

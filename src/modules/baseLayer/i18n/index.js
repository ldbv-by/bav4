import { $injector } from '../../../injection';
import { provide } from './baseLayer.provider';

const { TranslationService: translationService } = $injector.inject('TranslationService');
translationService.register('baselayerProvider', provide);

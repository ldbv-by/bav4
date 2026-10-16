import { $injector } from '../../../injection';
import { provide } from './iframe.provider';

const { TranslationService: translationService } = $injector.inject('TranslationService');
translationService.register('iframeProvider', provide);

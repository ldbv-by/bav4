import { provide as routingProvider } from './routing.provider';
import { $injector } from '../../../injection';
const { TranslationService: translationService } = $injector.inject('TranslationService');
translationService.register('routingProvider', routingProvider);

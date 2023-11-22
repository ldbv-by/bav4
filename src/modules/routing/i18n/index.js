import { provide as routingContextProvider } from './routingContext.provider';
import { $injector } from '../../../injection';
const { TranslationService: translationService } = $injector.inject('TranslationService');
translationService.register('routingContextProvider', routingContextProvider);

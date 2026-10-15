import { $injector } from '../../../injection';
import { provide as routingContextProvider } from './routingContext.provider';

const { TranslationService: translationService } = $injector.inject('TranslationService');
translationService.register('routingContextProvider', routingContextProvider);

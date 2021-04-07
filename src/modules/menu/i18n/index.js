import { provide as menuProvider } from './menu.provider';
import { $injector } from '../../../injection';
const { TranslationService: translationService } = $injector.inject('TranslationService');
translationService.register('toolboxProvider', menuProvider);

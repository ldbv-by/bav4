import { $injector } from '../../../injection';
import { provide as menuProvider } from './menu.provider';

const { TranslationService: translationService } = $injector.inject('TranslationService');
translationService.register('menuProvider', menuProvider);

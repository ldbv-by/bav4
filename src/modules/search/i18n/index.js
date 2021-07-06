import { provide as searchProvider } from './search.provider';
import { $injector } from '../../../injection';
const { TranslationService: translationService } = $injector.inject('TranslationService');
translationService.register('searchProvider', searchProvider);

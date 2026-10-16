import { $injector } from '../../../injection';
import { provide as searchProvider } from './search.provider';

const { TranslationService: translationService } = $injector.inject('TranslationService');
translationService.register('searchProvider', searchProvider);

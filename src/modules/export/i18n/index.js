import { provide as exportProvider } from './export.provider';
import { $injector } from '../../../injection';
const { TranslationService: translationService } = $injector.inject('TranslationService');
translationService.register('exportProvider', exportProvider);

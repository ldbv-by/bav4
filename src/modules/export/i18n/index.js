import { $injector } from '../../../injection';
import { provide as exportProvider } from './export.provider';

const { TranslationService: translationService } = $injector.inject('TranslationService');
translationService.register('exportProvider', exportProvider);

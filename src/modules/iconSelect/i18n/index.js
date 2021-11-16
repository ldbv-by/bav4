
import { $injector } from '../../../injection';
import { provide as iconSelectProvider } from './iconSelect.provider';
const { TranslationService: translationService } = $injector.inject('TranslationService');
translationService.register('iconSelectProvider', iconSelectProvider);


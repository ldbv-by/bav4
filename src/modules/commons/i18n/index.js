import { $injector } from '../../../injection';
import { provide as spinnerProvider } from './spinner.provider';
const { TranslationService: translationService } = $injector.inject('TranslationService');
translationService.register('spinnerProvider', spinnerProvider);

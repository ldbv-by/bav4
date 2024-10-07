import { $injector } from '../../../injection';
import { provide as spinnerProvider } from './spinner.provider';
import { provide as valueSelectProvider } from './valueSelect.provider';
const { TranslationService: translationService } = $injector.inject('TranslationService');
translationService.register('spinnerProvider', spinnerProvider);
translationService.register('valueSelectProvider', valueSelectProvider);

import { $injector } from '../../../injection';
import { provide as spinnerProvider } from './spinner.provider';
import { provide as valueSelectProvider } from './valueSelect.provider';
import { provide as coordinateInfoProvider } from './coordinateInfo.provider';
const { TranslationService: translationService } = $injector.inject('TranslationService');
translationService.register('spinnerProvider', spinnerProvider);
translationService.register('valueSelectProvider', valueSelectProvider);
translationService.register('coordinateInfoProvider', coordinateInfoProvider);

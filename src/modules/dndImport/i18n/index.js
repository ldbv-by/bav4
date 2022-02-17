
import { provide } from './dndImport.provider';
import { $injector } from '../../../injection';
const { TranslationService: translationService } = $injector.inject('TranslationService');
translationService.register('dndImportProvider', provide);

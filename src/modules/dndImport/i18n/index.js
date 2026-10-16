import { $injector } from '../../../injection';
import { provide } from './dndImport.provider';

const { TranslationService: translationService } = $injector.inject('TranslationService');
translationService.register('dndImportProvider', provide);

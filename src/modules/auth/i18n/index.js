import { provide } from './baacredential.provider';
import { $injector } from '../../../injection';
const { TranslationService: translationService } = $injector.inject('TranslationService');
translationService.register('baacredential', provide);

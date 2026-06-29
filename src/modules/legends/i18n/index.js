import { provide } from './legends.provider';
import { $injector } from '../../../injection';

const { TranslationService: translationService } = $injector.inject('TranslationService');
translationService.register('legendsProvider', provide);

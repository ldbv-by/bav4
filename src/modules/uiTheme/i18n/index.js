import { provide } from './uiTheme.provider';
import { $injector } from '../../../injection';
const { TranslationService: translationService } = $injector.inject('TranslationService');
translationService.register('uiThemeProvider', provide);

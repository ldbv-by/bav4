import { $injector } from '../../../../src/injection';
import {
  InclineType,
  initSurfaceTypes,
  initAnotherTypeTypes,
  altitudeProfileAttributeTypes,
  getAltitudeProfileAttributeType,
} from '../../../../src/modules/altitudeProfile/utils/AltitudeProfileUtils';

$injector.registerSingleton('TranslationService', { translate: (key) => key });

describe('Unit test functions AltitudeProfileUtils.js', () => {
  describe('check InclineType', () => {
    const inclineType = InclineType.Flat;

    it('check InclineType length', () => {
      expect(Object.keys(inclineType).length).toBe(4);
    });

    it('check InclineType possible values', () => {
      expect(InclineType.Flat).toBe('Flat');
      expect(InclineType.Steep).toBe('Steep');
    });
  });

  describe('check SurfaceType', () => {
    initSurfaceTypes();

    it('check SurfaceType length', () => {
      expect(altitudeProfileAttributeTypes()['surface'].length).toBe(3);
    });

    it("check SurfaceType ['asphalt'] to have certain values", () => {
      const { _name, _lightColor, _darkColor } = getAltitudeProfileAttributeType('surface', 'asphalt');

      expect(_name).toBe('asphalt');
      expect(_lightColor).toBe('#222222');
      expect(_darkColor).toBe('#444444');
    });
  });

  describe('check AnotherType', () => {
    initAnotherTypeTypes();

    it('check AnotherType length', () => {
      expect(altitudeProfileAttributeTypes()['anotherType'].length).toBe(4);
    });

    it("check AnotherType ['missing'] to have certain values", () => {
      const { _name, _lightColor, _darkColor } = getAltitudeProfileAttributeType('anotherType', 'missing');

      expect(_name).toBe('missing');
      expect(_lightColor).toBe('#2222ee');
      expect(_darkColor).toBe('#ee2222');
    });
  });
});

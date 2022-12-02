export const hereStartsSteep = 0.02;
export const flatColor = '#66eeff';
export const steepColor = '#ee4444';

export const InclineType = {
  Flat: 'Flat',
  Steep: 'Steep',
};

export const startSteep = (gradientBg, xPoint) => {
  gradientBg.addColorStop(xPoint, flatColor);
  gradientBg.addColorStop(xPoint, steepColor);
  return InclineType.Steep;
};

export const startFlat = (gradientBg, xPoint) => {
  gradientBg.addColorStop(xPoint, steepColor);
  gradientBg.addColorStop(xPoint, flatColor);
  return InclineType.Flat;
};

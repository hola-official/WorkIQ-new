import Fingerprint2 from 'fingerprintjs2';

export const getFingerprint = () => {
  return new Promise((resolve) => {
    Fingerprint2.get((components) => {
      const values = components.map(component => component.value);
      const fingerprint = Fingerprint2.x64hash128(values.join(''), 31);
      resolve(fingerprint);
    });
  });
};
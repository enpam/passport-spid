import { SignedXml } from 'xml-crypto';

export const sign = (
  xml: string,
  options: {
    privateKey: string | Buffer;
    signatureAlgorithm: string;
    nodeName: string;
    certificate?: string;
    action?: 'prepend' | 'append';
  },
) => {
  const { privateKey, signatureAlgorithm, nodeName, certificate, action } =
    options;
  const sig = new SignedXml();
  sig.signingKey = privateKey;
  if (certificate)
    sig.keyInfoProvider = {
      file: '',
      getKey: () => Buffer.from(privateKey),
      getKeyInfo: () =>
        `<X509Data><X509Certificate>${certificate}</X509Certificate></X509Data>`,
    };
  sig.signatureAlgorithm = `http://www.w3.org/2001/04/xmldsig-more#rsa-${signatureAlgorithm}`;
  sig.addReference(
    `//*[local-name(.)='${nodeName}']`,
    [
      'http://www.w3.org/2000/09/xmldsig#enveloped-signature',
      'http://www.w3.org/2001/10/xml-exc-c14n#',
    ],
    `http://www.w3.org/2001/04/xmlenc#${signatureAlgorithm}`,
  );
  sig.computeSignature(xml, {
    location: { reference: '', action: action ?? 'append' },
  });
  return sig.getSignedXml();
};

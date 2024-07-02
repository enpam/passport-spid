import { IDPConfig } from './types';
import { parseDom } from './xml';
import { NS } from './const';

export const getIdentityProviders = (
  xml: string,
  httpPost: boolean,
): IDPConfig[] => {
  const dom = parseDom(xml);
  const idps = Array.from(
    dom.getElementsByTagNameNS(NS.SAML_METADATA, 'EntityDescriptor'),
  );
  const binding =
    'urn:oasis:names:tc:SAML:2.0:bindings:' +
    (httpPost ? 'HTTP-POST' : 'HTTP-Redirect');

  return idps.map((idp) => {
    const getLocation = (tag: string) =>
      Array.from(idp.getElementsByTagNameNS(NS.SAML_METADATA, tag))
        .find((x) => x.getAttribute('Binding') === binding)
        ?.getAttribute('Location');

    let whichPathXml = () => {
      if (idp.getAttribute('entityID') === 'https://idp.namirialtsp.com/idp') {
        return idp.getElementsByTagNameNS(NS.SIG, 'X509Certificate').item(1)
          ?.textContent
      } else {  
        return idp.getElementsByTagNameNS(NS.SIG, 'X509Certificate').item(0)
          ?.textContent
      }
    }

    return {
      entityId: idp.getAttribute('entityID'),
      cert: whichPathXml(),
      entryPoint: getLocation('SingleSignOnService'),
      logoutUrl: getLocation('SingleLogoutService'),
    };
  });
};

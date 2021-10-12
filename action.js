/**
* Handler that will be called during the execution of a PostLogin flow.
*
* @param {Event} event - Details about the user and the context in which they are logging in.
* @param {PostLoginAPI} api - Interface whose methods can be used to change the behavior of the login.
*/
const SESSION_TOKEN_SECRET = 'this-is-a-very-secret-token';
const CONSENT_FORM_URL = 'https://example-consent-form-vercel.vercel.app';
exports.onExecutePostLogin = async (event, api) => {

   const sessionToken = api.redirect.encodeToken({
    secret: SESSION_TOKEN_SECRET,
    payload: {
      iss: `https://${event.request.hostname}/`,
    },
  });

  api.redirect.sendUserTo(CONSENT_FORM_URL, {
    query: {
      session_token: sessionToken,
      redirect_uri: `https://${event.request.hostname}/continue`,
    },
  });

};


/**
* Handler that will be invoked when this action is resuming after an external redirect. If your
* onExecutePostLogin function does not perform a redirect, this function can be safely ignored.
*
* @param {Event} event - Details about the user and the context in which they are logging in.
* @param {PostLoginAPI} api - Interface whose methods can be used to change the behavior of the login.
*/
exports.onContinuePostLogin = async (event, api) => {
  let decodedToken;
  try {
    decodedToken = api.redirect.validateToken({
      secret: SESSION_TOKEN_SECRET,
      tokenParameterName: 'session_token',
    });
  } catch (error) {
    console.log(error.message);
    return api.access.deny('Error occurred during redirect.');
  }

  const customClaims = decodedToken.other;

  for (const [key, value] of Object.entries(customClaims)) {
    api.user.setUserMetadata(key, value);
  }
};
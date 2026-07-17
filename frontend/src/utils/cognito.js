import {
  CognitoUserPool,
  CognitoUser,
  AuthenticationDetails,
  CognitoUserAttribute
} from 'amazon-cognito-identity-js';

const poolData = {
  UserPoolId: 'ap-southeast-1_jA2Em5Bbm',
  ClientId: '3eq2ua6do9comfb41mk41lb634'
};

export const userPool = new CognitoUserPool(poolData);

/**
 * Signs up a new Customer with email, password, and name.
 */
export const signUpUser = (email, password, name) => {
  return new Promise((resolve, reject) => {
    const attributeList = [];

    // Add standard email attribute
    attributeList.push(new CognitoUserAttribute({
      Name: 'email',
      Value: email
    }));

    // Add standard name attribute
    if (name) {
      attributeList.push(new CognitoUserAttribute({
        Name: 'name',
        Value: name
      }));
    }

    userPool.signUp(email, password, attributeList, null, (err, result) => {
      if (err) {
        return reject(err);
      }
      resolve(result.user);
    });
  });
};

/**
 * Confirms registration using the code sent to the user's email.
 */
export const confirmUserSignUp = (email, code) => {
  return new Promise((resolve, reject) => {
    const cognitoUser = new CognitoUser({
      Username: email,
      Pool: userPool
    });

    cognitoUser.confirmRegistration(code, true, (err, result) => {
      if (err) {
        return reject(err);
      }
      resolve(result);
    });
  });
};

/**
 * Resends the confirmation code to the user's email.
 */
export const resendConfirmationCode = (email) => {
  return new Promise((resolve, reject) => {
    const cognitoUser = new CognitoUser({
      Username: email,
      Pool: userPool
    });

    cognitoUser.resendConfirmationCode((err, result) => {
      if (err) {
        return reject(err);
      }
      resolve(result);
    });
  });
};

/**
 * Authenticates a user (both Customer and Admin).
 * Returns the session data containing token details.
 */
export const signInUser = (email, password) => {
  return new Promise((resolve, reject) => {
    const authDetails = new AuthenticationDetails({
      Username: email,
      Password: password
    });

    const cognitoUser = new CognitoUser({
      Username: email,
      Pool: userPool
    });

    cognitoUser.authenticateUser(authDetails, {
      onSuccess: (result) => {
        resolve({
          idToken: result.getIdToken().getJwtToken(),
          accessToken: result.getAccessToken().getJwtToken(),
          refreshToken: result.getRefreshToken().getToken(),
          payload: result.getIdToken().payload
        });
      },
      onFailure: (err) => {
        reject(err);
      },
      newPasswordRequired: (userAttributes, requiredAttributes) => {
        // Handle forcing a new password if Cognito requires it (common for new Admins created by Console)
        resolve({
          newPasswordRequired: true,
          cognitoUser,
          userAttributes,
          requiredAttributes
        });
      }
    });
  });
};

/**
 * Completes new password challenge for new users when forced by Cognito.
 */
export const completeNewPasswordChallenge = (cognitoUser, newPassword, attributes) => {
  return new Promise((resolve, reject) => {
    cognitoUser.completeNewPasswordChallenge(newPassword, attributes, {
      onSuccess: (result) => {
        resolve({
          idToken: result.getIdToken().getJwtToken(),
          accessToken: result.getAccessToken().getJwtToken(),
          refreshToken: result.getRefreshToken().getToken(),
          payload: result.getIdToken().payload
        });
      },
      onFailure: (err) => {
        reject(err);
      }
    });
  });
};

import {
  CognitoUserPool,
  CognitoUser,
  AuthenticationDetails,
  CognitoUserAttribute,
} from "amazon-cognito-identity-js";
import { config } from "../config";

const pool = new CognitoUserPool({
  UserPoolId: config.userPoolId,
  ClientId: config.userPoolClientId,
});

export function signUp(email, password) {
  const attributes = [new CognitoUserAttribute({ Name: "email", Value: email })];
  return new Promise((resolve, reject) => {
    pool.signUp(email, password, attributes, null, (err, result) => {
      if (err) return reject(err);
      resolve(result);
    });
  });
}

export function confirmSignUp(email, code) {
  const user = new CognitoUser({ Username: email, Pool: pool });
  return new Promise((resolve, reject) => {
    user.confirmRegistration(code, true, (err, result) => {
      if (err) return reject(err);
      resolve(result);
    });
  });
}

export function login(email, password) {
  const user = new CognitoUser({ Username: email, Pool: pool });
  user.setAuthenticationFlowType("USER_PASSWORD_AUTH");
  const authDetails = new AuthenticationDetails({ Username: email, Password: password });

  return new Promise((resolve, reject) => {
    user.authenticateUser(authDetails, {
      onSuccess: (session) => resolve(session),
      onFailure: (err) => reject(err),
    });
  });
}

export function changePassword(oldPassword, newPassword) {
  const user = pool.getCurrentUser();
  return new Promise((resolve, reject) => {
    user.getSession((sessionErr) => {
      if (sessionErr) return reject(sessionErr);
      user.changePassword(oldPassword, newPassword, (err, result) => {
        if (err) return reject(err);
        resolve(result);
      });
    });
  });
}

export function getCurrentSession() {
  const user = pool.getCurrentUser();
  if (!user) return Promise.resolve(null);

  return new Promise((resolve, reject) => {
    user.getSession((err, session) => {
      if (err) return reject(err);
      resolve(session);
    });
  });
}

export function forgotPassword(email) {
  const user = new CognitoUser({ Username: email, Pool: pool });
  return new Promise((resolve, reject) => {
    user.forgotPassword({
      onSuccess: (result) => resolve(result),
      onFailure: (err) => reject(err),
    });
  });
}

export function confirmForgotPassword(email, code, newPassword) {
  const user = new CognitoUser({ Username: email, Pool: pool });
  return new Promise((resolve, reject) => {
    user.confirmPassword(code, newPassword, {
      onSuccess: () => resolve(),
      onFailure: (err) => reject(err),
    });
  });
}

export function resendConfirmationCode(email) {
  const user = new CognitoUser({ Username: email, Pool: pool });
  return new Promise((resolve, reject) => {
    user.resendConfirmationCode((err, result) => {
      if (err) return reject(err);
      resolve(result);
    });
  });
}

export function logout() {
  const user = pool.getCurrentUser();
  if (user) user.signOut();
}
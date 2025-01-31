import jwt from "jsonwebtoken";
import jwksClient from "jwks-rsa";
import * as dotenv from 'dotenv';
dotenv.config();

const client = jwksClient({
  jwksUri: `https://cognito-idp.${process.env.COGNITO_REGION}.amazonaws.com/${process.env.COGNITO_USER_POOL_ID}/.well-known/jwks.json`,
  timeout: 5000,
});
function getKey(header: any, callback: any) {
  client.getSigningKey(header.kid, (err, key) => {
    if (err) {
      return callback(err, null);
    }
    const signingKey = key?.getPublicKey();
    callback(null, signingKey);
  });
}

export const validateToken = (token: string): Promise<any> => {
  return new Promise((resolve, reject) => {
    try {
      jwt.verify(token, getKey, { algorithms: ["RS256"] }, (err, decoded) => {
        if (err) {
          return reject(err.message || "Invalid token");
        }
        resolve(decoded);
      });
    } catch (error) {
      console.error("Unexpected error during token validation:", error);
      reject("Unexpected error during token validation");
    }
  });
};

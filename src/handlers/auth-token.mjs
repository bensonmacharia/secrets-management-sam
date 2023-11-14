import { GetSecretValueCommand, SecretsManagerClient } from "@aws-sdk/client-secrets-manager";

const clientsecret = new SecretsManagerClient();

// Get the secrets manager name from environment variables
const secretsManagerName = process.env.SECRET_MANAGER;

/**
 * A HTTP post method for getting auth token.
 */
export const authTokenrHandler = async (event) => {
    if (event.httpMethod !== 'GET') {
        throw new Error(`getAuthToken only accepts GET method, you tried: ${event.httpMethod}`);
    }
    // All log statements are written to CloudWatch
    console.info('received:', event);

    // Fetch the Auth secret string from AWS Secrets Manager 
    const secret_value = await clientsecret.send(new GetSecretValueCommand({
        SecretId: secretsManagerName,
    }));
    const auth_token = JSON.parse(secret_value.SecretString);
    console.info('Secret-String: ', auth_token);

    // Generate basic auth token and return in response data
    const username = auth_token.username;
    const password = auth_token.authtoken;
    const authToken = 'Basic ' + new Buffer(username + ':' + password).toString('base64');

    var message = "Successfully authenticated. Use the token below to access other endpoints.";
    var status_code = 200;

    const responseData = {
        message: message,
        token: authToken
    }

    const response = {
        statusCode: status_code,
        body: JSON.stringify(responseData)
    };

    // All log statements are written to CloudWatch
    console.info(`response from: ${event.path} statusCode: ${response.statusCode} body: ${response.body}`);
    return response;
};

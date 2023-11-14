import { GetSecretValueCommand, SecretsManagerClient } from "@aws-sdk/client-secrets-manager";
import { SQSClient, ReceiveMessageCommand } from "@aws-sdk/client-sqs";

const clientsecret = new SecretsManagerClient();
const clientsqs = new SQSClient();

// Get the secrets manager name from environment variables
const secretsManagerName = process.env.SECRET_MANAGER;
const sqsQueueURL = process.env.QUEUE_URL

/**
 * A HTTP get method to get all notes from an SQS Queue.
 */
export const getAllNotesHandler = async (event) => {
    if (event.httpMethod !== 'GET') {
        throw new Error(`getAllItems only accept GET method, you tried: ${event.httpMethod}`);
    }
    // All log statements are written to CloudWatch
    console.info('received:', event);

    // Get token from the authorization header
    const authheader = await event.headers.Authorization;
    
    if (!authheader) {
        throw new Error(`Authorization token required.`);
    }

    const auth = new Buffer.from(authheader.split(' ')[1], 'base64').toString().split(':');
    const user = auth[0];
    const pass = auth[1];

    // Fetch the Auth secret string from AWS Secrets Manager 
    const secret_value = await clientsecret.send(new GetSecretValueCommand({
        SecretId: secretsManagerName,
    }));
    const auth_token = JSON.parse(secret_value.SecretString);

    const username = auth_token.username;
    const password = auth_token.authtoken;

    // Check if decoded token has same username and password as fetched from secret manager
    if ((user != username) || (pass != password)) {
        throw new Error(`Authorization credentials invalid. Try again`);
    }

    const params = {
        QueueUrl: sqsQueueURL,
        MaxNumberOfMessages: 10
    };

    // Fetch all messages from the queue
    try {
        const resp = await clientsqs.send(new ReceiveMessageCommand(params));
        var items = JSON.parse(JSON.stringify(resp));
    } catch (err) {
        console.log("Error", err);
    }

    const response = {
        statusCode: 200,
        body: JSON.stringify(items)
    };

    // All log statements are written to CloudWatch
    console.info(`response from: ${event.path} statusCode: ${response.statusCode} body: ${response.body}`);
    return response;
}

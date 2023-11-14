import { GetSecretValueCommand, SecretsManagerClient } from "@aws-sdk/client-secrets-manager";
import { SQSClient, SendMessageCommand } from "@aws-sdk/client-sqs";

const clientsecret = new SecretsManagerClient();
const clientsqs = new SQSClient();

// Get the secrets manager name from environment variables
const secretsManagerName = process.env.SECRET_MANAGER;
// Get the SQS queue URL from environment variables
const sqsQueueURL = process.env.QUEUE_URL

/**
 * A HTTP post method to add a message to an SQS Queue.
 */
export const addNoteHandler = async (event) => {

    if (event.httpMethod !== 'POST') {
        throw new Error(`postMethod only accepts POST method, you tried: ${event.httpMethod} method.`);
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

    // Get note from the body of the request
    const body = JSON.parse(event.body);
    const note = body.note;

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
        DelaySeconds: 0,
        QueueUrl: sqsQueueURL,
        MessageBody: note
    };

    // Add a message into the SQS queue
    try {
        const resp = await clientsqs.send(new SendMessageCommand(params));
        var items = JSON.parse(JSON.stringify(resp));
    } catch (err) {
        console.log("Error", err);
    }

    const responseData = {
        message: "Note sent to the Queue successfully",
        note: {
            Message: body.note,
            MessageId: items.MessageId,
            MD5OfMessageBody: items.MD5OfMessageBody
        }
    }

    const response = {
        statusCode: 200,
        body: JSON.stringify(responseData)
    };

    // All log statements are written to CloudWatch
    console.info(`response from: ${event.path} statusCode: ${response.statusCode} message: ${response.message} body: ${response.body}`);
    return response;
};

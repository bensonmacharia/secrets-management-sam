# Secure Secrets Management with AWS Secrets Manager

This project contains source code and supporting files for a serverless application that can be deployed with the AWS Serverless Application Model (AWS SAM) command line interface (CLI). This aims at demonstrating the capbilities of AWS Secrets Manager in storing, retrieving, and managing secrets within AWS.

The application uses several AWS resources, including Lambda functions, an API Gateway API, Amazon SQS tables and Secrets Manager. These resources are defined in the `template.yaml` file in this project.

## Deploy application

To build and deploy the application for the first time, run the following in your shell:

```bash
$ git clone https://github.com/bensonmacharia/secrets-management-sam.git
$ cd secrets-management-sam
$ sam build
$ sam deploy --guided
```

The first command will build the source of your application. The second command will package and deploy your application to AWS, with a series of prompts.

## Cleanup

To delete the application that you created, use the AWS CLI. Run the following:

```bash
sam delete --stack-name sam-secrets-management-app
```

## Writeup

For a complete guide on how to create this application, see the [Secure Secrets Management on AWS SAM with AWS Secrets Manager](https://bmacharia.com/secure-secrets-management-on-aws-sam-with-aws-secrets-manager/).
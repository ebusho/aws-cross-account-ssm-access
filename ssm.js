const { fromTemporaryCredentials } = require("@aws-sdk/credential-providers");
const { SSMClient, GetParameterCommand } = require("@aws-sdk/client-ssm");

async function getSSMData() {
  try {
    const region = process.env.AWS_REGION;
    const roleArn = process.env.AWS_ROLE_ARN;
    const roleSessionName = process.env.AWS_ROLE_SESSION_NAME;
    const parameterStoreName = process.env.AWS_PARAMETER_STORE_NAME;

    // The default implicit credentials provider is NodeProviderChain:
    // https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/Package/-aws-sdk-credential-providers/#fromNodeProviderChain
    // which gives precedence to environment variables as needed in our use-case:
    // - AWS_PROFILE env variable (in local dev environment)
    // - and then to AWS_WEB_IDENTITY_TOKEN_FILE (in K8s pod)
    const client = new SSMClient({
      region,
      credentials: fromTemporaryCredentials({ // assume role, as SSM is in different account
        params: {
          RoleArn: roleArn,
          RoleSessionName: roleSessionName
        },
        clientConfig: { region }
      })
    });

    const input = {
      Name: parameterStoreName,
      WithDecryption: true
    };
    const command = new GetParameterCommand(input);

    const response = await client.send(command);

    return JSON.parse(response.Parameter.Value)
  } catch (err) {
    throw new Error(err.message)
  }
}

module.exports = {
  getSSMData
}

import { secretsmanager } from '@pulumi/aws';
import { Output, output, jsonParse } from '@pulumi/pulumi';

export const sm = (() => {

  const up = (prjName: (_: string) => string) => {
    // Get the existing secrets in AWS Secrets Manager for masterUsername and masterPassword.
    const getSecretsManagerSecret = (name: string) => output(
      secretsmanager.getSecret({ name })
    ).apply(
      (secret) => secretsmanager.getSecretVersion({ secretId: secret.arn })
    ).apply(
      (secretVer) => jsonParse(secretVer.secretString) as Output<
        { [key: string]: Output<string> }
      >
    );
    const envSecrets = getSecretsManagerSecret(prjName('env-vars'));

    return {
      envSecrets,
    }
  }

  return {
    up,
  }

})()

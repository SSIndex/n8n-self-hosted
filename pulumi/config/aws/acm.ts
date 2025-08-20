import { acm as aws_acm } from '@pulumi/aws';
import { OutputInstance } from '@pulumi/pulumi';


export const acm = (() => {
  const up = (domainName: string) => {
    const certificateArn: OutputInstance<string> = aws_acm.getCertificateOutput({
      domain: domainName,
      mostRecent: true,
    }).apply(cert => cert.arn);

    return {
      certificateArn
    };
  };

  return {
    up,
  };
})();
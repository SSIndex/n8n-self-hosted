import { prjName } from './config/utils';
import { acmUp, elbUp, iamUp, rdsUp, s3Up, smUp, vpcUp } from './config/aws';


// export const appDir = zippedApp(
//   '../../rails' as const,
//   /spec|.env|docker-compose.dev.yml|/gi
// );

export const appDir = './n8n-selfhosted.zip'

export const { vpc, rdsSecurityGroup, dbSubnets } = vpcUp(prjName, null);

export const { instanceProfileRole, instanceProfile } = iamUp(prjName);

export const { envSecrets } = smUp(prjName);

export const { certificateArn } = acmUp('pulse.ssindex.com');

export const { appBucket, appBucketObject } = s3Up(
  prjName,
  appDir
);

export const { auroraCluster, auroraInstance } = rdsUp(
  dbSubnets,
  envSecrets,
  rdsSecurityGroup,
  prjName
);

export const { application, appVersion, environment } = elbUp(
  appBucket,
  appBucketObject,
  auroraCluster,
  auroraInstance,
  certificateArn,
  envSecrets,
  instanceProfile,
  rdsSecurityGroup,
  vpc,
  prjName,
  'production'
);


// Stack Exports
export const appEndpointUrl = environment.endpointUrl;
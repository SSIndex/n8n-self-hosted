import { ec2, elasticbeanstalk, iam, rds, s3, getRegion } from '@pulumi/aws';
import { ec2 as ec2x } from '@pulumi/awsx';
import { Output, OutputInstance } from '@pulumi/pulumi';

type TElbSetting = {
  name: string,
  namespace: string,
  resource?: string,
  value: string | Output<string> | Promise<string>
};

type TEnvironmentNames = 'production' | 'demo';

type TEnvironmentSettings = {
  autoscaling: TElbSetting[],
  scheduledActions: TElbSetting[]
};

type TEnvConfig = Record<TEnvironmentNames, TEnvironmentSettings>;

export const elb = (() => {

  const up = (
    appBucket: s3.BucketV2,
    appBucketObject: s3.BucketObjectv2,
    auroraCluster: rds.Cluster,
    auroraInstance: rds.ClusterInstance,
    certificateArn: OutputInstance<string> | null,
    envSecrets: Output<{[key: string]: Output<string>}>,
    instanceProfile: iam.InstanceProfile,
    rdsSecurityGroup: ec2.SecurityGroup,
    vpc: ec2x.Vpc,
    prjName: (_: string) => string,
    envName: TEnvironmentNames,
  ) => {
    // Create an AWS Elastic Beanstalk app for a Dockerized Rails application.
    const application = new elasticbeanstalk.Application(prjName('app'));

    // Create a new application version for the Docker application`
    const appVersion = new elasticbeanstalk.ApplicationVersion(prjName('app-version'), {
      application: application.name,
      bucket: appBucket.id,
      key: appBucketObject.id,
    });

    const envConfigs: TEnvConfig = {
      production: {
        autoscaling: [{
            namespace: 'aws:autoscaling:launchconfiguration',
            name: 'InstanceType',
            value: 't2.medium'
          }, {
            namespace: 'aws:autoscaling:asg',
            name: 'MinSize',
            value: '3',
          }, {
            namespace: 'aws:autoscaling:asg',
            name: 'MaxSize',
            value: '9',
          }],
        scheduledActions: [{ // WeeklyCapacityIncrease
          namespace: 'aws:autoscaling:scheduledaction',
          resource: 'WeeklyCapacityIncrease',
          name: 'StartTime',
          value: `${(new Date()).toISOString()}`
        }, {
          namespace: 'aws:autoscaling:scheduledaction',
          resource: 'WeeklyCapacityIncrease',
          name: 'MaxSize',
          value: '5'
        }, {
          namespace: 'aws:autoscaling:scheduledaction',
          resource: 'WeeklyCapacityIncrease',
          name: 'MinSize',
          value: '2'
        }, {
          namespace: 'aws:autoscaling:scheduledaction',
          resource: 'WeeklyCapacityIncrease',
          name: 'DesiredCapacity',
          value: '3'
        }, {
          namespace: 'aws:autoscaling:scheduledaction',
          resource: 'WeeklyCapacityIncrease',
          name: 'Recurrence',
          value: '30 6 * * 1-5' // Monday - Friday at 06:30 GMT (Maybe adjust to GMT-4 for santiago)
        }, {
          namespace: 'aws:autoscaling:scheduledaction',
          resource: 'WeeklyCapacityIncrease',
          name: 'Suspend',
          value: 'false'
        }, { // WeeklyCapacityDecrease
          namespace: 'aws:autoscaling:scheduledaction',
          resource: 'WeeklyCapacityDecrease',
          name: 'StartTime',
          value: `${(new Date()).toISOString()}`
        }, {
          namespace: 'aws:autoscaling:scheduledaction',
          resource: 'WeeklyCapacityDecrease',
          name: 'MaxSize',
          value: '0'
        }, {
          namespace: 'aws:autoscaling:scheduledaction',
          resource: 'WeeklyCapacityDecrease',
          name: 'MinSize',
          value: '0'
        }, {
          namespace: 'aws:autoscaling:scheduledaction',
          resource: 'WeeklyCapacityDecrease',
          name: 'DesiredCapacity',
          value: '0'
        }, {
          namespace: 'aws:autoscaling:scheduledaction',
          resource: 'WeeklyCapacityDecrease',
          name: 'Recurrence',
          value: '30 19 * * 1-5' // Monday - Friday at 19:30 GMT (Maybe adjust to GMT-4 for santiago)
        }, {
          namespace: 'aws:autoscaling:scheduledaction',
          resource: 'WeeklyCapacityDecrease',
          name: 'Suspend',
          value: 'false'
        }],
      },
      demo: {
        autoscaling: [{
            namespace: 'aws:autoscaling:launchconfiguration',
            name: 'InstanceType',
            value: 't2.medium'
          }, {
            namespace: 'aws:autoscaling:asg',
            name: 'MinSize',
            value: '1',
          }, {
            namespace: 'aws:autoscaling:asg',
            name: 'MaxSize',
            value: '1',
          }],
        scheduledActions: [{ // WeeklyCapacityIncrease
          namespace: 'aws:autoscaling:scheduledaction',
          resource: 'WeeklyCapacityIncrease',
          name: 'StartTime',
          value: `${(new Date()).toISOString()}`
        }, {
          namespace: 'aws:autoscaling:scheduledaction',
          resource: 'WeeklyCapacityIncrease',
          name: 'MaxSize',
          value: '1'
        }, {
          namespace: 'aws:autoscaling:scheduledaction',
          resource: 'WeeklyCapacityIncrease',
          name: 'MinSize',
          value: '1'
        }, {
          namespace: 'aws:autoscaling:scheduledaction',
          resource: 'WeeklyCapacityIncrease',
          name: 'DesiredCapacity',
          value: '1'
        }, {
          namespace: 'aws:autoscaling:scheduledaction',
          resource: 'WeeklyCapacityIncrease',
          name: 'Recurrence',
          value: '30 6 * * 1-5' // Monday - Friday at 06:30 GMT (Maybe adjust to GMT-4 for santiago)
        }, {
          namespace: 'aws:autoscaling:scheduledaction',
          resource: 'WeeklyCapacityIncrease',
          name: 'Suspend',
          value: 'false'
        }, { // WeeklyCapacityDecrease
          namespace: 'aws:autoscaling:scheduledaction',
          resource: 'WeeklyCapacityDecrease',
          name: 'StartTime',
          value: `${(new Date()).toISOString()}`
        }, {
          namespace: 'aws:autoscaling:scheduledaction',
          resource: 'WeeklyCapacityDecrease',
          name: 'MaxSize',
          value: '0'
        }, {
          namespace: 'aws:autoscaling:scheduledaction',
          resource: 'WeeklyCapacityDecrease',
          name: 'MinSize',
          value: '0'
        }, {
          namespace: 'aws:autoscaling:scheduledaction',
          resource: 'WeeklyCapacityDecrease',
          name: 'DesiredCapacity',
          value: '0'
        }, {
          namespace: 'aws:autoscaling:scheduledaction',
          resource: 'WeeklyCapacityDecrease',
          name: 'Recurrence',
          value: '30 19 * * 1-5' // Monday - Friday at 19:30 GMT (Maybe adjust to GMT-4 for santiago)
        }, {
          namespace: 'aws:autoscaling:scheduledaction',
          resource: 'WeeklyCapacityDecrease',
          name: 'Suspend',
          value: 'false'
        }],
      },
    };

    const certificateSettings: TElbSetting[] = (certificateArn == null) ? [] : [{
      namespace: 'aws:elbv2:listener:80',
      name: 'ListenerEnabled',
      value: 'false',
    }, {
      namespace: 'aws:elbv2:listener:443',
      name: 'Protocol',
      value: 'HTTPS',
    }, {
      namespace: 'aws:elbv2:listener:443',
      name: 'ListenerEnabled',
      value: 'true',
    }, {
      namespace: 'aws:elbv2:listener:443',
      name: 'SSLCertificateArns',
      value: certificateArn.apply(certId => certId || ''),
    }, {
      namespace: 'aws:elb:loadbalancer',
      name: 'LoadBalancerHTTPSPort',
      value: '443',
    }];

    const autoscalingSettings: TElbSetting[] = [{
      namespace: 'aws:autoscaling:launchconfiguration',
      name: 'IamInstanceProfile',
      value: instanceProfile.name,
    }, {
      namespace: 'aws:autoscaling:launchconfiguration',
      name: 'SecurityGroups',
      value: rdsSecurityGroup.id,
    }, {
      namespace: 'aws:autoscaling:asg',
      name: 'Availability Zones',
      value: `Any 2`,
    }, 
    ...envConfigs[envName].autoscaling,
    // ...envConfigs[envName].scheduledActions,
    ];

    const envVarsSettings: TElbSetting[] = [{
      namespace: 'aws:elasticbeanstalk:application:environment',
      name: 'AWS_ACCESS_KEY_ID',
      value: envSecrets.apply((secrets: {[key: string]: Output<string>}) => secrets[prjName('awsAccessKeyId')]),
    },{
      namespace: 'aws:elasticbeanstalk:application:environment',
      name: 'AWS_BUCKET',
      value: appBucket.id,
    }, {
      namespace: 'aws:elasticbeanstalk:application:environment',
      name: 'AWS_REGION',
      value: getRegion().then(region => region.name || 'us-east-1'),
    }, {
      namespace: 'aws:elasticbeanstalk:application:environment',
      name: 'AWS_SECRET_ACCESS_KEY',
      value: envSecrets.apply((secrets: {[key: string]: Output<string>}) => secrets[prjName('awsSecretAccessKey')]),
    }, {
      namespace: 'aws:elasticbeanstalk:application:environment',
      name: 'DB_USERNAME',
      value: auroraCluster.masterUsername.apply(value => value || ''),
    }, {
      namespace: 'aws:elasticbeanstalk:application:environment',
      name: 'DB_PASSWORD',
      value: auroraCluster.masterPassword.apply(value => value || ''),
    }, {
      namespace: 'aws:elasticbeanstalk:application:environment',
      name: 'DB_HOST',
      value: auroraCluster.endpoint.apply(value => value || ''),
    }, {
      namespace: 'aws:elasticbeanstalk:application:environment',
      name: 'DB_NAME',
      value: envSecrets.apply((secrets: {[key: string]: Output<string>}) => secrets[prjName('DbName')]),
    }, {
      namespace: 'aws:elasticbeanstalk:application:environment',
      name: 'SMTP_ADDRESS',
      value: envSecrets.apply((secrets: {[key: string]: Output<string>}) => secrets[prjName('SmtpAddress')]),
    }, {
      namespace: 'aws:elasticbeanstalk:application:environment',
      name: 'SMTP_PASSWORD',
      value: envSecrets.apply((secrets: {[key: string]: Output<string>}) => secrets[prjName('SmtpPassword')]),
    }, {
      namespace: 'aws:elasticbeanstalk:application:environment',
      name: 'SMTP_USER',
      value: envSecrets.apply((secrets: {[key: string]: Output<string>}) => secrets[prjName('SmtpUser')]),
    }, {
      namespace: 'aws:elasticbeanstalk:application:environment',
      name: 'ENV_COMMAND',
      value: envSecrets.apply((secrets: {[key: string]: Output<string>}) => secrets[prjName('EnvCommand')]),
    }, {
      namespace: 'aws:elasticbeanstalk:application:environment',
      name: 'RACK_ENV',
      value: envSecrets.apply((secrets: {[key: string]: Output<string>}) => secrets[prjName('RackEnv')]),
    }, {
      namespace: 'aws:elasticbeanstalk:application:environment',
      name: 'RAILS_ENV',
      value: envSecrets.apply((secrets: {[key: string]: Output<string>}) => secrets[prjName('RailsEnv')]),
    }, {
      namespace: 'aws:elasticbeanstalk:application:environment',
      name: 'RAILS_SERVE_STATIC_FILES',
      value: envSecrets.apply((secrets: {[key: string]: Output<string>}) => secrets[prjName('RailsServeStaticFiles')]),
    }, {
      namespace: 'aws:elasticbeanstalk:application:environment',
      name: 'RAILS_FORCE_SSL',
      value: envSecrets.apply((secrets: {[key: string]: Output<string>}) => secrets[prjName('RailsForceSSL')]),
    }, {
      namespace: 'aws:elasticbeanstalk:application:environment',
      name: 'LAST_PULUMI_UP',
      value: `${(new Date()).toISOString()}`,
    }, {
      namespace: 'aws:elasticbeanstalk:application:environment',
      name: 'RAILS_MASTER_KEY',
      value: envSecrets.apply((secrets: {[key: string]: Output<string>}) => secrets[prjName('RailsMasterKey')]),
    }];

    const networkAndReportingSettings: TElbSetting[] = [{
      namespace: 'aws:elasticbeanstalk:environment',
      name: 'LoadBalancerType',
      value: 'application',
    }, {
      namespace: 'aws:elasticbeanstalk:environment',
      name: 'EnvironmentType',
      value: 'LoadBalanced'
    }, {
      namespace: 'aws:elasticbeanstalk:healthreporting:system',
      name: 'SystemType',
      value: 'enhanced'
    }, {
      namespace: 'aws:ec2:vpc',
      name: 'VPCId',
      value: vpc.vpcId,
    }, {
      namespace: 'aws:ec2:vpc',
      name: 'AssociatePublicIpAddress',
      value: 'true'
    }, {
      namespace: 'aws:ec2:vpc',
      name: 'Subnets',
      value: vpc.publicSubnetIds.apply((t: string[]) => t.join(', ')),
    }];

    // Create an AWS Elastic Beanstalk environment for a Dockerized Rails application.
    const environment = new elasticbeanstalk.Environment(prjName('env'), {
      application: application.name,
      version: appVersion,
      solutionStackName: elasticbeanstalk.getSolutionStackOutput({
        nameRegex: '64bit Amazon Linux.*running Docker$',
        mostRecent: true,
      }).apply(stack => stack.name || ''),
      settings: [
        ...autoscalingSettings,
        ...certificateSettings,
        ...envVarsSettings,
        ...networkAndReportingSettings
      ] as TElbSetting[],
    }, { dependsOn: [ vpc, appBucket, application, appVersion, auroraInstance ], });

    return {
      application,
      appVersion,
      environment,
    }
  }

  return {
    up,
  }
})()
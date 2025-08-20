import { ec2, rds as aws_rds } from '@pulumi/aws';
import { Output } from '@pulumi/pulumi';

export const rds = (() => {
  const auroraEngine: aws_rds.EngineType = 'aurora-postgresql' as aws_rds.EngineType;

  const up = (
    dbSubnets: aws_rds.SubnetGroup,
    envSecrets: Output<{[key: string]: Output<string>}>,
    rdsSecurityGroup: ec2.SecurityGroup,
    prjName: (_: string) => string
  ) => {
    // Create Amazon Aurora Serverless V2 compatible PostgreSQL cluster.
    const auroraCluster: aws_rds.Cluster = new aws_rds.Cluster(
      prjName(
        'aurora-serverless-v2-cluster'
      ), {
        engine: auroraEngine,
        engineMode: 'provisioned',
        engineVersion: '15.2',
        masterUsername: envSecrets.apply((secrets: {[key: string]: Output<string>}) => secrets[prjName('DbUsername')]),
        masterPassword: envSecrets.apply((secrets: {[key: string]: Output<string>}) => secrets[prjName('DbPassword')]),
        skipFinalSnapshot: true,
        serverlessv2ScalingConfiguration: {
          maxCapacity: 5,
          minCapacity: 1,
        },
          vpcSecurityGroupIds: [rdsSecurityGroup.id],
          dbSubnetGroupName: dbSubnets.id,
        }
    );

    const auroraInstance = new aws_rds.ClusterInstance(
      prjName(
        'aurora-serverless-v2-instance'
      ), {
        clusterIdentifier: auroraCluster.id,
        instanceClass: 'db.serverless',
        engine: auroraEngine,
        engineVersion: auroraCluster.engineVersion,
        publiclyAccessible: true,
      }, {
        dependsOn: [ auroraCluster ],
      }
    );

    return {
      auroraCluster,
      auroraInstance,
    }
  }

  const clone = (
    sourceCluster: aws_rds.Cluster,
    prjName: (_: string) => string
  ) => {
    // Create a snapshot of the Aurora cluster
    const snapshotName = `aurora-cluster-snapshot-${(new Date()).toLocaleDateString()}`
    const auroraSnapshot = new aws_rds.ClusterSnapshot(prjName('auroraSnapshot'), {
      dbClusterIdentifier: sourceCluster.id,
      dbClusterSnapshotIdentifier: snapshotName,
      tags: {
        Name: snapshotName,
      },
    }, { dependsOn: [ sourceCluster ] });


    const clonedCluster = new aws_rds.Cluster(prjName(
      'aurora-serverless-v2-cloned-cluster'
    ), {
      snapshotIdentifier: auroraSnapshot.id,
      engine: sourceCluster.engine.apply(engine => engine as aws_rds.EngineType || auroraEngine),
      masterUsername: sourceCluster.masterUsername.apply(masterUsername => masterUsername || ''),
      masterPassword: sourceCluster.masterPassword.apply(masterPassword => masterPassword || ''),
      preferredBackupWindow: sourceCluster.preferredBackupWindow,
      serverlessv2ScalingConfiguration: {
        maxCapacity: 5,
        minCapacity: 1,
      },
      vpcSecurityGroupIds: sourceCluster.vpcSecurityGroupIds,
      dbSubnetGroupName: sourceCluster.dbSubnetGroupName,
      skipFinalSnapshot: true,
    }, { dependsOn: [ auroraSnapshot, sourceCluster ], deleteBeforeReplace: true });
    
    // Define the primary instance of the cloned RDS cluster
    const clonedInstance = new aws_rds.ClusterInstance(prjName(
      'aurora-serverless-v2-cloned-instance'
    ), {
      clusterIdentifier: clonedCluster.id,
      instanceClass: 'db.serverless',
      engine: clonedCluster.engine.apply(engine => engine as aws_rds.EngineType || auroraEngine),
      engineVersion: clonedCluster.engineVersion,
      publiclyAccessible: true,
    }, { dependsOn: [ clonedCluster ] });

    return {
      clonedCluster,
      clonedInstance
    }
  }

  return {
    up,
    clone
  }
})()
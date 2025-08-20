import { ec2, rds } from '@pulumi/aws';
import { ec2 as ec2x } from '@pulumi/awsx';

export const vpc = (() => {

  const up = (prjName: (_: string) => string, Vpc: ec2x.Vpc | null) => {
    const vpc = Vpc || (new ec2x.Vpc(prjName('vpc'), {
      cidrBlock: '10.0.0.0/16',
      enableDnsHostnames: true,
      enableDnsSupport: true,
    }));

    // Security groups and Private subnets setups for RDS
    const rdsSecurityGroup = new ec2.SecurityGroup(prjName('rds-sec-group'), {
      vpcId: vpc.vpcId,
      ingress: [
        {
          description: "allow SSH access from 203.0.113.25",
          fromPort: 22,
          toPort: 22,
          protocol: "tcp",
          cidrBlocks: ["0.0.0.0/0"],
        },
        {
          protocol: "tcp",
          fromPort: 1433,
          toPort: 1433,
          cidrBlocks: [vpc.vpc.cidrBlock],
        }, {
          protocol: "tcp",
          fromPort: 80,
          toPort: 80,
          cidrBlocks: [vpc.vpc.cidrBlock],
        }, {
          protocol: "tcp",
          fromPort: 443,
          toPort: 443,
          cidrBlocks: [vpc.vpc.cidrBlock],
        }, {
          protocol: "tcp",
          fromPort: 5432,
          toPort: 5432,
          cidrBlocks: [vpc.vpc.cidrBlock],
        }, {
          protocol: "tcp",
          fromPort: 5432,
          toPort: 5432,
          cidrBlocks: ["170.79.235.238/32"],  // IP de CoWork
        },
      ],
      egress: [
        {
          fromPort: 0,
          toPort: 0,
          protocol: "-1",
          cidrBlocks: ["0.0.0.0/0"],
          ipv6CidrBlocks: ["::/0"],
        },
      ],
    });

    const dbSubnets = new rds.SubnetGroup(prjName('db-subnets'), {
      subnetIds: vpc.privateSubnetIds,
    });

    return {
      vpc,
      rdsSecurityGroup,
      dbSubnets,
    }
  }

  return {
    up,
  }
})()
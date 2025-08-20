import { iam as aws_iam } from '@pulumi/aws';
import { interpolate } from '@pulumi/pulumi';

export const iam = (() => {

  const up = (prjName: (_: string) => string) => {
    // EC2 management with Iam Role
    const instanceProfileRole = new aws_iam.Role(prjName("eb-ec2-role"), {
      name: prjName('eb-ec2-role'),
      description: "Role for EC2 managed by EB",
      assumeRolePolicy: interpolate`{
            "Version": "2012-10-17",
            "Statement": [
                {
                    "Action": "sts:AssumeRole",
                    "Principal": {
                        "Service": "ec2.amazonaws.com"
                    },
                    "Effect": "Allow",
                    "Sid": ""
                }
            ]
        }`,
    });

    // Attach an S3 policy to allow PutObject permissions
    const s3Policy = new aws_iam.RolePolicy(prjName('s3-policy'), {
      role: instanceProfileRole.name,
      policy: JSON.stringify({
        Version: "2012-10-17",
        Statement: [
          {
            Effect: "Allow",
            Action: "s3:PutObject",
            Resource: "arn:aws:s3:::elasticbeanstalk-us-east-1-518344696083/resources/environments/logs/bundle/*",
          },
        ],
      }),
    });

    const instanceProfile = new aws_iam.InstanceProfile(prjName(
      "eb-ec2-instance-profile"
    ), {
      role: instanceProfileRole.name,
    });

    return {
      instanceProfileRole,
      instanceProfile,
    }
  }

  return {
    up,
  }
})()

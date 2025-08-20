import { s3 as aws_s3 } from "@pulumi/aws";
import { asset, interpolate } from "@pulumi/pulumi";

export const s3 = (() => {
  const up = (prjName: (_: string) => string, appDir: string) => {
    // Create an S3 bucket to store the zipped application source code.
    const appBucket = new aws_s3.BucketV2(prjName("app-bucket" as const), {});

    const bucketVersioning = new aws_s3.BucketVersioningV2(prjName('app-bucket-versioning'), {
      bucket: appBucket.id,
      versioningConfiguration: {
        status: 'Enabled',
      },
    }, { dependsOn: [appBucket] });

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const uniqueKey = interpolate`${prjName('app')}/${timestamp}/app-monitor.zip`;

    const appBucketObject = new aws_s3.BucketObjectv2(
      prjName("app-bucket-object" as const),
      {
        bucket: appBucket.id,
        contentType: "application/zip" as const,
        key: uniqueKey,
        source: new asset.FileAsset(appDir),
      }, { dependsOn: [bucketVersioning] }
    );

    return {
      appBucket,
      appBucketObject,
    };
  };

  return {
    up,
  };
})();

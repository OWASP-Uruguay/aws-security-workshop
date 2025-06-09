import { Stack, StackProps, RemovalPolicy } from 'aws-cdk-lib';
import { Function, Code, Runtime } from 'aws-cdk-lib/aws-lambda';
import { Cors, RestApi, LambdaIntegration } from 'aws-cdk-lib/aws-apigateway';
import { Bucket } from 'aws-cdk-lib/aws-s3';
import { Construct } from 'constructs';
import { join } from 'path';

export class SecLabCdkStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    const bucket = new Bucket(this, 'FileUploadBucket', {
      removalPolicy: RemovalPolicy.DESTROY,
      autoDeleteObjects: true,
      publicReadAccess: true,
      blockPublicAccess: {
        blockPublicAcls: false,
        blockPublicPolicy: false,
        ignorePublicAcls: false,
        restrictPublicBuckets: false
      }
    });

    const uploadHandler = new Function(this, 'UploadHandler', {
      runtime: Runtime.NODEJS_18_X,
      handler: 'index.handler',
      code: Code.fromAsset(join(__dirname, '../lambda')),
      environment: {
        BUCKET_NAME: bucket.bucketName
      }
    });

    bucket.grantReadWrite(uploadHandler);

    const api = new RestApi(this, 'UploadApi', {
      restApiName: 'FileUploadService',
      defaultCorsPreflightOptions: {
        allowOrigins: Cors.ALL_ORIGINS,
        allowMethods: Cors.ALL_METHODS,
      }
    });

    const upload = api.root.addResource('upload');
    upload.addMethod('POST', new LambdaIntegration(uploadHandler));
  }
}
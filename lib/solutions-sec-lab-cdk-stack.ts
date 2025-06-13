import { Stack, StackProps, RemovalPolicy } from 'aws-cdk-lib';
import { Function, Code, Runtime } from 'aws-cdk-lib/aws-lambda';
import { Cors, RestApi, LambdaIntegration, ApiKey, UsagePlan, Period, MethodLoggingLevel, LogGroupLogDestination, AccessLogFormat } from 'aws-cdk-lib/aws-apigateway';
import { LogGroup, RetentionDays } from 'aws-cdk-lib/aws-logs';
import { BlockPublicAccess, Bucket } from 'aws-cdk-lib/aws-s3';
import { Construct } from 'constructs';
import { join } from 'path';

export class SecLabCdkStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    const bucket = new Bucket(this, 'FileUploadBucket', {
      removalPolicy: RemovalPolicy.DESTROY,
      autoDeleteObjects: true,
      blockPublicAccess: BlockPublicAccess.BLOCK_ALL
    });

    const uploadHandler = new Function(this, 'UploadHandler', {
      runtime: Runtime.NODEJS_18_X,
      handler: 'index.handler',
      code: Code.fromAsset(join(__dirname, '../lambda')),
      environment: {
        BUCKET_NAME: bucket.bucketName
      }
    });

    bucket.grantPut(uploadHandler);

    const apiLogGroup = new LogGroup(this, 'ApiAccessLogs', {
      retention: RetentionDays.ONE_WEEK,
      removalPolicy: RemovalPolicy.DESTROY
    });

    const api = new RestApi(this, 'UploadApi', {
      restApiName: 'FileUploadService',
      deployOptions: {
        accessLogDestination: new LogGroupLogDestination(apiLogGroup),
        accessLogFormat: AccessLogFormat.jsonWithStandardFields({
          caller: true,
          httpMethod: true,
          ip: true,
          protocol: true,
          requestTime: true,
          resourcePath: true,
          responseLength: true,
          status: true,
          user: true,
        }),
        loggingLevel: MethodLoggingLevel.INFO,
      },
      defaultCorsPreflightOptions: {
        allowOrigins: Cors.ALL_ORIGINS,
        allowMethods: ['POST'],
      },
      cloudWatchRole: true
    });

    const upload = api.root.addResource('upload');
    upload.addMethod('POST', new LambdaIntegration(uploadHandler), {
      apiKeyRequired: true,  // Enforce API Key
    });

    // Create an API key
    const apiKey = new ApiKey(this, 'UploadApiKey', {
      apiKeyName: 'UploadClientKey',
      description: 'API key for upload endpoint',
      enabled: true,
    });

    // Create usage plan with rate limiting
    const plan = new UsagePlan(this, 'UploadUsagePlan', {
      name: 'UploadUsagePlan',
      throttle: {
        rateLimit: 5,
        burstLimit: 10
      },
      quota: {
        limit: 500,
        period: Period.DAY,
      }
    });

    // Associate API key with usage plan and stage
    plan.addApiKey(apiKey);
    plan.addApiStage({
      stage: api.deploymentStage,
      api,
    });
  }
}
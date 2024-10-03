import * as cdk from 'aws-cdk-lib';
import { LambdaRestApi } from 'aws-cdk-lib/aws-apigateway';
import { PolicyStatement } from 'aws-cdk-lib/aws-iam';
import { Runtime, Tracing } from 'aws-cdk-lib/aws-lambda';
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs';
import { RetentionDays } from 'aws-cdk-lib/aws-logs';
import { Bucket, BucketEncryption } from 'aws-cdk-lib/aws-s3';
import { Construct } from 'constructs';
import path = require('path');

export class AwsChatbotVoiceStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const modelId = 'anthropic.claude-3-sonnet-20240229-v1:0';

    const bucket = new Bucket(this, 's3-bucket', {
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      autoDeleteObjects: true,
      encryption: BucketEncryption.S3_MANAGED,      
    });

    const model_runner = new NodejsFunction(this, 'model-caller', {
      handler: 'handler',
      runtime: Runtime.NODEJS_20_X,
      entry: path.join(__dirname, '/../lambda/model_caller.ts'),
      environment: {
        MODEL_ID: modelId,
        VOICE_BUCKET: bucket.bucketName
      },
      logRetention: RetentionDays.ONE_DAY,
      tracing: Tracing.ACTIVE,
      timeout: cdk.Duration.minutes(1)
    });

    bucket.grantReadWrite(model_runner);

    model_runner.addToRolePolicy(new PolicyStatement({
      actions: ['bedrock:InvokeModel'],
      resources: [`arn:aws:bedrock:${cdk.Aws.REGION}::foundation-model/${modelId}`]
    }));

    model_runner.addToRolePolicy(new PolicyStatement({
      actions: [
        'polly:SynthesizeSpeech', 
        'polly:StartSpeechSynthesisTask'
      ],
      resources: ['*']
    }));

    const api = new LambdaRestApi(this, 'test-api', {
      handler: model_runner
    });

  }
}

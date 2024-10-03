#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { AwsChatbotVoiceStack } from '../lib/aws-chatbot-voice-stack';

const app = new cdk.App();
new AwsChatbotVoiceStack(app, 'AwsChatbotVoiceStack', {
  env: { account: process.env.CDK_DEFAULT_ACCOUNT, region: process.env.CDK_DEFAULT_REGION }
});
import * as pulumi from "@pulumi/pulumi";
import * as k8s from "@pulumi/kubernetes";
import * as aws from "@pulumi/aws";

import { createCodePipeline } from "./codepipeline/codepipeline";
import { createAppImage } from "./ecr";
import { createDynamoDb } from "./dynamodb";
import { deployApp } from "./deployApp";

const config = new pulumi.Config();
const githubConnectionId = config.require("github-connection-id");

const codePipeline = createCodePipeline(githubConnectionId);

// Build and publish application image.
const appImage = createAppImage();

// Create application database.
const dynamoDb = createDynamoDb();

// Deploy application.
const eksStack = new pulumi.StackReference("macostea/pulumi-eks-stack/dev");
const kubeconfig = eksStack.getOutput("kubeconfig");
const serviceAccountName = eksStack.getOutput("restApiServiceAccount");

const k8sProvider = new k8s.Provider("k8s", { kubeconfig });

const appIngress = deployApp(appImage, k8sProvider, {
    dynamoDbRegion: aws.config.region!,
    dynamoDbTable: dynamoDb.name,
    serviceAccountName: serviceAccountName,
});

export const pipeline = codePipeline.name;
export const image = appImage.imageName;
export const appUrl = appIngress.status.loadBalancer.ingress[0].hostname;

# Simple REST Api deployed with pulumi

## What's included
* REST App ((/app)[/app])
* Pulumi program:
  * DynamoDB Table ((/dynamodb.ts)[/dynamodb.ts])
  * Build and publish container image ((/ecr.ts)[/ecr.ts])
  * Deploy app to EKS cluster ((/eks.ts)[/eks.ts])

## How it works
### Simple REST Api
The REST Api is a simple Koa application that retrieves some data from a DynamoDB and returns it as JSON to the caller.
If the data is not found in the Table when at app startup, it is populated then.

### Pulumi program
The pulumi program provisions the required DynamoDB Table, the ECR repo, builds and publishes the app image in it and then deploys the image to a predefined EKS cluster.
The kubeconfig for the cluster is provided from another pulumi stack, configurable with Pulumi config.

import * as pulumi from "@pulumi/pulumi";

import { createCodePipeline } from "./codepipeline/codepipeline";
import { createAppImage } from "./ecr/";

const config = new pulumi.Config();
const githubConnectionId = config.require("github-connection-id");

const codePipeline = createCodePipeline(githubConnectionId);
const appImageResult = createAppImage();

export const pipeline = codePipeline.name;
export const appImage = appImageResult.fullImageName;

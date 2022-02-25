import * as aws from "@pulumi/aws";
import * as docker from "@pulumi/docker";

export function createAppImage() {
    const repo = new aws.ecr.Repository("rest-app");

    const imageName = repo.repositoryUrl;
    const registryInfo = repo.registryId.apply(async id => {
        const credentials = await aws.ecr.getCredentials({ registryId: id});
        const decodedCredentials = Buffer.from(credentials.authorizationToken, "base64");
        const [username, password] = decodedCredentials.toString().split(":");
        if (!password || !username) {
            throw new Error("Invalid credentials");
        }

        return {
            server: credentials.proxyEndpoint,
            username: username,
            password: password,
        };
    });

    const image = new docker.Image("rest-app", {
        imageName: imageName,
        registry: registryInfo,
        build: "./app",
    });

    return {
        baseImageName: image.baseImageName,
        fullImageName: image.imageName
    };
}

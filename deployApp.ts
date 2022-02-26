import * as docker from "@pulumi/docker";
import * as k8s from "@pulumi/kubernetes";
import * as pulumi from "@pulumi/pulumi";


interface AppConfig {
    dynamoDbRegion: pulumi.Input<string>;
    dynamoDbTable: pulumi.Input<string>;
    serviceAccountName: pulumi.Input<string>;
}

export function deployApp(image: docker.Image, provider: k8s.Provider, appConfig: AppConfig) {
    const appLabels = { app: "rest-app" };
    const deployment = new k8s.apps.v1.Deployment("rest-app", {
        spec: {
            selector: { matchLabels: appLabels },
            replicas: 3,
            template: {
                metadata: { labels: appLabels },
                spec: {
                    serviceAccountName: appConfig.serviceAccountName,
                    containers: [{
                        resources: {
                            requests: { cpu: "100m", memory: "64Mi" },
                        },
                        name: "rest-app",
                        image: image.imageName,
                        ports: [{ containerPort: 3000 }],
                        env: [
                            { name: "DYNAMODB_REGION", value: appConfig.dynamoDbRegion },
                            { name: "DYNAMODB_TABLE", value: appConfig.dynamoDbTable },
                        ],
                    }],
                },
            }
        }
    }, { provider: provider });

    const service = new k8s.core.v1.Service("rest-app-service", {
        metadata: { labels: appLabels },
        spec: {
            type: "NodePort",
            ports: [{ port: 3000, targetPort: 3000 }],
            selector: appLabels,
        }
    }, { provider: provider });

    const ingress = new k8s.networking.v1.Ingress("rest-app-ingress", {
        metadata: {
            labels: appLabels,
            annotations: {
                "alb.ingress.kubernetes.io/scheme": "internet-facing",
                "alb.ingress.kubernetes.io/target-type": "ip"
            }
        },
        spec: {
            ingressClassName: "alb",
            rules: [
                {
                    http: {
                        paths: [{
                            pathType: "Prefix",
                            path: "/",
                            backend: {
                                service: {
                                    name: service.metadata.name,
                                    port: {
                                        number: 3000,
                                    }
                                }
                            }
                        }],
                    },
                },
            ],
        }
    }, { provider: provider });

    return ingress;
};

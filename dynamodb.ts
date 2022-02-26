import * as aws from "@pulumi/aws";

export function createDynamoDb() {
    const db = new aws.dynamodb.Table("environment", {
        attributes: [
            {
                name: "id",
                type: "S",
            },
            {
                name: "temp",
                type: "N",
            },
            {
                name: "hum",
                type: "N",
            }
        ],
        hashKey: "id",
        readCapacity: 1,
        writeCapacity: 1,
    });

    return db;
};

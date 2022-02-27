import * as Koa from "koa";
import * as Router from "koa-router";
import * as logger from "koa-logger";
import * as json from "koa-json";

import { DynamoDBClient, PutItemCommand, GetItemCommand } from "@aws-sdk/client-dynamodb";

const app = new Koa();
const router = new Router();

const DYNAMODB_REGION = process.env.DYNAMODB_REGION || "eu-central-1";
const DYNAMODB_TABLE_NAME = process.env.DYNAMODB_TABLE_NAME || "environment";

const dynamoDb = new DynamoDBClient({
    region: DYNAMODB_REGION,
});

async function addTestData() {
    const testItem = {
        id: {
            S: "test",
        },
        temp: {
            N: "20",
        },
        hum: {
            N: "30",
        },
    }

    const getItemParams = {
        TableName: DYNAMODB_TABLE_NAME,
        Key: {
            id: {
                S: "test",
            },
        },
    };

    const data = await dynamoDb.send(new GetItemCommand(getItemParams));
    if (!data.Item) {
        console.log("Test data does not exist, adding it now");

        const putItemParams = {
            TableName: DYNAMODB_TABLE_NAME,
            Item: testItem,
        };

        await dynamoDb.send(new PutItemCommand(putItemParams));
        console.log("Test data added");
    }
}

router.get("/", async (ctx, next) => {
    const getItemParams = {
        TableName: DYNAMODB_TABLE_NAME,
        Key: {
            id: {
                S: "test",
            },
        },
    };

    const data = await dynamoDb.send(new GetItemCommand(getItemParams));

    if (data.Item) {
        ctx.body = data.Item;
    } else {
        ctx.body = {
            message: "No data found",
        };
    }

    await next();
});

app.use(json());
app.use(logger());

app.use(router.routes()).use(router.allowedMethods());

process.on("SIGINT", cleanup);
process.on("SIGTERM", cleanup);

app.listen(3000, async () => {
    console.log("Server is running on port 3000");

    await addTestData();
});

function cleanup() {
    console.log("Cleaning up...");
    process.exit(0);
}

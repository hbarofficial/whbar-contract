const {
    Client,
    PrivateKey,
    AccountId,
    TopicMessageQuery,
    TopicCreateTransaction,
    TopicMessageSubmitTransaction,
} = require("@hashgraph/sdk");

const result = require("dotenv").config({ path: `${process.cwd()}/.env.secret` });
if (result.error) throw result.error;

async function main() {
    let client;

    switch (process.env.NODE_ENV) {
        case "prod":
            client = Client.forMainnet();
            break;
        default:
            client = Client.forTestnet();
    }

    if (process.env.HEDERA_OPERATOR_KEY != null && process.env.HEDERA_OPERATOR_ACCOUNT_ID != null) {
        const operatorKey = PrivateKey.fromString(process.env.HEDERA_OPERATOR_KEY);
        const operatorId = AccountId.fromString(process.env.HEDERA_OPERATOR_ACCOUNT_ID);

        client.setOperator(operatorId, operatorKey);
    }

    const response = await new TopicCreateTransaction()
        .setTopicMemo("Create Topic")
        .execute(client);

    const receipt = await response.getReceipt(client);
    const topicId = receipt.topicId;

    console.log(`topicId = ${topicId}`);
}

function sleep(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

main();
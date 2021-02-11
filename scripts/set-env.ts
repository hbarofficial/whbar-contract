// Read .env --> process.env
const result = require("dotenv").config();
if (result.error) throw result.error;

import { writeFileSync } from "fs";

// @ts-ignore
import mergeFiles from "merge-files";

import { getSecret } from "./google";

async function _getSecrets(prefix: string): Promise<void> {
    const infuraProjectId = await getSecret(`${prefix}_INFURA_PROJECT_ID`);
    const hederaOperatorAccountId = await getSecret(`${prefix}_HEDERA_OPERATOR_ACCOUNT_ID`);
    const hederaOperatorKey = await getSecret(`${prefix}_HEDERA_OPERATOR_KEY`);
    const ethOperatorKey = await getSecret(`${prefix}_ETH_OPERATOR_KEY`);
    const ethOperatorAddress = await getSecret(`${prefix}_ETH_OPERATOR_ADDRESS`);

    const envAddition = `
INFURA_PROJECT_ID=${infuraProjectId}
HEDERA_OPERATOR_ACCOUNT_ID=${hederaOperatorAccountId}
HEDERA_OPERATOR_KEY=${hederaOperatorKey}
ETH_OPERATOR_ADDRESS=${ethOperatorKey}
ETH_OPERATOR_KEY=${ethOperatorKey}
`.trim();

    writeFileSync(`${process.cwd()}/.env.add`, envAddition);
    
    await mergeFiles([
        `${process.cwd()}/.env`, 
        `${process.cwd()}/.env.add`
    ], 
    `${process.cwd()}/.env.secret`
    );
}

async function getSecrets(): Promise<void> {
    if (process.env.NODE_ENV !== "prod") {
        await _getSecrets("TEST");
    } else {
        await _getSecrets("MAIN");
    }
}

// Get Secrets from GCP and put them in env
(async (): Promise<void> => {
    await getSecrets();
})();
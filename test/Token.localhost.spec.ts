import { ethers } from "hardhat";
import { Contract, Signer } from "ethers";
import { v4 as uuid } from "uuid";
import Token from "../artifacts/contracts/Token.sol/Token.json";

describe("Token (w/ Bridge)", () => {
    let accounts: Signer[];
    let contract: Contract;

    // Use an existing contract (for bridge tests)
    before(async () => {
        const abi = Token.abi;
        accounts = await ethers.getSigners();
        contract = new ethers.Contract(
            "0xA145Ba621E2830a4e25EbfEa18D59A8BE7f97E67",
            abi,
            accounts[0]
        );
    });

    it("can order pay out", async () => {
        const tx = await contract.connect(accounts[2]).orderPayout(
            uuid(), 
            100,
            "0.0.59361"
        );
        await tx.wait(1);
    });

    it("can order pay out (and be rejected)", async () => {
        const tx = await contract.connect(accounts[3]).orderPayout(
            uuid(),
            100,
            "not an account id"
        );
        await tx.wait(1);
    });

    it("can request an account", async () => {
        const tx = await contract.connect(accounts[4]).createAccount(
            uuid(),
            "f8733d614beb0ac161e2390b00d37016110a6037adf59572d813a344d7a2908e",
            {
                value: contract.getAccountCreationFee()
            }
        );
        await tx.wait(1);
    });

    it("can request an account (and be rejected)", async () => {
        const tx = await contract.connect(accounts[5]).createAccount(
            uuid(),
            "bad key",
            {
                value: contract.getAccountCreationFee()
            }
        );
        await tx.wait(1);
    });
});

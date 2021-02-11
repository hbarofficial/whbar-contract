import { ethers } from "hardhat";
import { expect } from "chai";
import { Contract, Signer } from "ethers";

const name = "Wrapped Hbar";
const symbol = "wh";
const decimals = 8;


describe("Token", () => {
    let accounts: Signer[];
    let contract: Contract;

    // Use a new contract each time
    beforeEach(async () => {
        accounts = await ethers.getSigners();
        const Token = await ethers.getContractFactory("Token");
        contract = await Token.connect(accounts[0]).deploy(
            name,
            symbol,
            decimals
        );
        await contract.deployed();
    });

    it("initializes", async () => {
        expect(await contract.owner()).to.equal(await accounts[0].getAddress());
        expect(await contract.name()).to.equal(name);
        expect(await contract.symbol()).to.equal(symbol);
        expect(await contract.decimals()).to.equal(decimals);
    });

    it("can mint tokens", async () => {
        const prevTotal = await contract.totalSupply();
        const prevBal = await contract.balanceOf(await accounts[1].getAddress());
        await contract.connect(accounts[0]).mint(await accounts[1].getAddress(), 100);
        expect(await contract.balanceOf(await accounts[1].getAddress())).to.equal(prevBal + 100);
        expect(await contract.totalSupply()).to.equal(prevTotal + 100);
    });

    // see node_modules/eip1996/test/Holdable.js
    // see node_modules/eip2021/test/Payoutable.js

    it("can move funds from suspense back to the original account", async () => {
        await contract.connect(accounts[0]).mint(await accounts[1].getAddress(), 100);
        await contract.connect(accounts[1]).orderPayout("New Payout", 99, "0.0.1");
        await contract.connect(accounts[0]).transferPayoutToSuspenseAccount("New Payout");
        await expect(contract.connect(accounts[0]).returnPayoutFromSuspenseAccount("New Payout")).to.emit(contract, "PayoutFundsReturned");
    });

    it("can pay out tokens", async () => {
        await contract.connect(accounts[0]).mint(await accounts[1].getAddress(), 100);
        await contract.connect(accounts[1]).orderPayout("Example Name", 99, "0.0.1");
        await contract.connect(accounts[0]).transferPayoutToSuspenseAccount("Example Name");
        await expect(contract.connect(accounts[0]).executePayout("Example Name")).to.emit(contract, "PayoutExecuted");
    });

    it("can reject token payouts", async () => {
        await contract.mint(await accounts[1].getAddress(), 100);
        await contract.connect(accounts[1]).orderPayout("Failing Payout", 99, "Bad Instructions");
        await contract.rejectPayout("Failing Payout", "Rejected");
    });

    it("can reject token payouts after moving funds to suspense", async () => {
        await contract.mint(await accounts[4].getAddress(), 100);
        await contract.connect(accounts[4]).orderPayout("Failing Payout 2", 99, "Bad Instructions");
        await contract.transferPayoutToSuspenseAccount("Failing Payout 2");
        await contract.returnPayoutFromSuspenseAccount("Failing Payout 2");
        await contract.rejectPayout("Failing Payout 2", "Rejected");
    });

    it("can request to create hedera account", async () => {
        // Incorrect Fee, Revert
        const incorrectTx = contract.connect(accounts[1]).createAccount("Create Account", "Public Key", {
            value: ethers.utils.parseEther("1")
        });
        await expect(incorrectTx).to.be.reverted;

        // Correct Fee, Continue
        const feeAmount = await contract.connect(accounts[1]).getAccountCreationFee();
        
        await expect(contract.connect(accounts[1]).createAccount("Create Account", "Public Key", {
            value: feeAmount
        })).to.emit(contract, "CreateAccountRequest");
    });

    it("can confirm hedera account creation", async () => {
        const feeAmount = await contract.connect(accounts[1]).getAccountCreationFee();
        await contract.connect(accounts[1]).createAccount("Create Account", "Public Key", {
            value: feeAmount
        });
        expect(contract.connect(accounts[0]).createAccountSuccess("Create Account", "0.0.0")).to.emit(contract, "CreateAccountSuccess");
    });

    it("can fail hedera account creation", async () => {
        const feeAmount = await contract.connect(accounts[1]).getAccountCreationFee();
        await contract.connect(accounts[1]).createAccount("Create Account", "Public Key", {
            value: feeAmount
        });
        expect(contract.connect(accounts[0]).createAccountFail("Create Account", "Failed")).to.emit(contract, "CreateAccountFail");
    });

    it("can adjust account creation fee", async () => {
        await contract.connect(accounts[0]).setAccountCreationFee(100);
        const feeAmount = await contract.connect(accounts[0]).getAccountCreationFee();
        expect(feeAmount).to.equal(100);
    });
});

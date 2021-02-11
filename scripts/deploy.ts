import hardhat from "hardhat";

const name = "Wrapped Hbar";
const symbol = "wHBAR";
const decimals = 8;
const owner = "0xE824424eE4022Cd6bC408249F924A6e3BDA035c9";

async function main() {
    const Token = await hardhat.ethers.getContractFactory("wHBAR");
    const contract = await Token.deploy(
        name,
        symbol,
        decimals,
        owner
    );
    console.log(`Deployed Token(${name}, ${symbol}, ${decimals}, ${owner}) to: ${contract.address} with: ${contract.deployTransaction.hash}`);
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
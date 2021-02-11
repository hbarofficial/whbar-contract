// SPDX-License-Identifier: MIT
pragma solidity >=0.5.0;

import "./AccountCreator.sol";
import "./Payoutable.sol";

contract wHBAR is Payoutable, AccountCreator {
    string _name;
    string _symbol;
    uint8 _decimals;

    address _owner;

    uint256 _accountCreateFee;
    
    constructor(
        string memory __name,
        string memory __symbol,
        uint8 __decimals,
        address __customOwner

    )
    public
    Payoutable(__customOwner) 
    AccountCreator(__customOwner, 50000000000000) 
    { // AccountCreator ERC20 Holdable SafeMath, 50k gwei hedera account creation fee
        _name = __name;
        _symbol = __symbol;
        _decimals = __decimals;
        _owner = __customOwner;
    }

    function name() public view returns (string memory) {
        return _name;
    }

    function symbol() public view returns (string memory) {
        return _symbol;
    }

    function decimals() public view returns (uint8) {
        return _decimals;
    }

    function owner() public view returns (address) {
        return _owner;
    }

    function mint(address to, uint256 amount) public returns (bool) {
        require(_msgSender() == _owner, "unauthorized");
        super._mint(to, amount);
        return true;
    }
}
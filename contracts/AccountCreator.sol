// SPDX-License-Identifier: MIT
pragma solidity >=0.5.0;

import "eip1996/contracts/libraries/StringUtil.sol";

contract AccountCreator {
    using StringUtil for string;

    enum RequestStatus {
        Nonexistent,
        Requested,
        Confirmed,
        Failed,
        Refunded
    }

    struct AccountRequest {
        string hederaPublicKey;
        address payable requestor;
        uint256 paid;
        RequestStatus status;
    }

    mapping(bytes32 => AccountRequest) private requests;
    address public accountCreator;
    uint256 private fee;

    constructor(
        address creator, 
        uint256 accountCreationFee
    ) public {
        accountCreator = creator;
        fee = accountCreationFee;
    }

    function getAccountCreator() public view returns (address) {
        return accountCreator;
    }

    function getAccountCreationFee() external view returns (uint256) {
        return fee;
    }

    function setAccountCreationFee(uint256 feeInWei) external returns (bool) {
        require(
            msg.sender == accountCreator,
            "Only the account creator can call this function"
        );
        fee = feeInWei;
        return true;
    }

    // User calls createAccount
    function _createAccount(
        string memory operationId,
        string memory hederaPublicKey
    ) internal returns (bool) {
        bytes32 operationIdHash = operationId.toHash();
        AccountRequest storage request = requests[operationIdHash];

        require(!hederaPublicKey.isEmpty(), "Hedera Public Key cannot be empty");
        require(request.paid == 0, "A request with this id already exists");

        request.requestor = msg.sender;
        request.hederaPublicKey = hederaPublicKey;
        request.status = RequestStatus.Requested;
        request.paid = msg.value;

        emit CreateAccountRequest(
            operationId,
            msg.sender,
            hederaPublicKey
        );

        return true;
    }

    function createAccount(
        string calldata operationId, 
        string calldata hederaPublicKey
    ) external payable returns (bool) {
        require(
            msg.value == fee, 
            "Incorrect fee amount, call getAccountCreationFee"
        );

        // Make accountcreator a payable address, then transfer the value
        address(uint160(accountCreator)).transfer(msg.value);

        return _createAccount(
            operationId,
            hederaPublicKey
        );
    }

    // contract creates record and emits
    event CreateAccountRequest(
        string operationId, 
        address requestor, 
        string hederaPublicKey
    );
    // request is created with status Requested
    
    // Bridge program sees HederaAccountRequest
    // Tries to create a hedera account using the oracle, 
    // and if successful, should call
    function createAccountSuccess(
        string calldata operationId, 
        string calldata hederaAccountId
    ) external returns (bool) {
        require(
            msg.sender == accountCreator,
            "Only the account creator can call this function"
        );

        bytes32 operationIdHash = operationId.toHash();
        AccountRequest storage request = requests[operationIdHash];
        
        require(
            request.status == RequestStatus.Requested, 
            "Account Request must have status Requested to be set to status Confirmed"
        );
        
        request.status = RequestStatus.Confirmed;

        emit CreateAccountSuccess(
            operationId,
            request.requestor,
            request.hederaPublicKey,
            hederaAccountId
        );

        return true;
    }

    //which emits
    event CreateAccountSuccess(
        string operationId, 
        address requestor, 
        string hederaPublicKey, 
        string hederaAccountId
    );
    // request has status Confirmed

    // if Hedera account creation fails, bridge program should call
    function createAccountFail(
        string calldata operationId, 
        string calldata reason
    ) external returns (bool) {
        require(
            msg.sender == accountCreator,
            "Only the account creator can call this function"
        );

        bytes32 operationIdHash = operationId.toHash();
        AccountRequest storage request = requests[operationIdHash];
        
        require(
            request.status == RequestStatus.Requested, 
            "Account Request must have status Requested to be set to status Failed"
        );
        
        request.status = RequestStatus.Failed;

        emit CreateAccountFail(
            operationId,
            request.requestor,
            request.hederaPublicKey,
            request.paid,
            reason
        );

        return true;
    }
    
    // which emits
    event CreateAccountFail(
        string operationId,
        address requestor,
        string hederaPublicKey,
        uint256 amount,
        string reason
    );
    // request has status Failed

    // Set to Refunded for confirmation
    function createAccountRefund(
        string calldata operationId
    ) external returns (bool) {
        require(
            msg.sender == accountCreator,
            "Only the account creator can call this function"
        );

        bytes32 operationIdHash = operationId.toHash();
        AccountRequest storage request = requests[operationIdHash];

        require(
            request.status == RequestStatus.Failed,
            "Account Request must have status Failed to be refunded"
        );

        request.status = RequestStatus.Refunded;

        emit CreateAccountRefund(operationId, request.requestor, request.paid);
        return true;
    }

    // emits
    event CreateAccountRefund(
        string id, 
        address requestor, 
        uint256 refundAmountWei
    );
}

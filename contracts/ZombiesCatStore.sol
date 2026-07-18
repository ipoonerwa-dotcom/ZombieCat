// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/// @notice Minimal ERC20 surface the store needs.
interface IERC20 {
    function transferFrom(address from, address to, uint256 amount) external returns (bool);
    function balanceOf(address account) external view returns (uint256);
}

/// @title ZombiesCatStore
/// @notice On-chain payment rail for the ZombiesCat RWA merch store on Robinhood Chain.
///         A shopper pays for an order by burning $ZCAT: the store pulls the quoted
///         amount from the buyer straight to the dead address. Each payment is bound to
///         an off-chain order via `orderRef` (a hash of the order number) and is single-use,
///         so the backend can match the on-chain Purchased event to exactly one order and
///         never double-credit. All PII (address/email/phone) stays off-chain in the
///         store's database — only the burn and the order reference touch the chain.
///
///         Token tax note: if $ZCAT taxes transfers, that tax fires on this transferFrom.
///         The remainder reaches the dead address (burn) and the tax accrues to the token's
///         own treasury — which is exactly the ETH pool the team converts to fiat to buy and
///         ship the real merch. Nothing here moves fiat; fulfillment is an off-chain process.
contract ZombiesCatStore {
    address public constant DEAD = 0x000000000000000000000000000000000000dEaD;

    address public owner;
    IERC20 public token;        // $ZCAT; settable until the token is live, then can be frozen
    bool public tokenFrozen;    // once true, `token` can never change again
    bool public paused;

    mapping(bytes32 => bool) public refUsed;      // orderRef => consumed
    mapping(bytes32 => address) public refBuyer;  // orderRef => payer (for lookups)
    uint256 public totalBurned;                   // lifetime $ZCAT burned through the store
    uint256 public orderCount;

    event Purchased(address indexed buyer, bytes32 indexed orderRef, uint256 amount, uint256 timestamp);
    event TokenSet(address indexed token);
    event TokenFrozen();
    event PausedSet(bool paused);
    event OwnershipTransferred(address indexed from, address indexed to);

    error NotOwner();
    error Paused();
    error TokenNotSet();
    error TokenIsFrozen();
    error RefAlreadyUsed();
    error ZeroAmount();
    error TransferFailed();

    modifier onlyOwner() {
        if (msg.sender != owner) revert NotOwner();
        _;
    }

    constructor(address token_) {
        owner = msg.sender;
        if (token_ != address(0)) {
            token = IERC20(token_);
            emit TokenSet(token_);
        }
        emit OwnershipTransferred(address(0), msg.sender);
    }

    /// @notice Pay for an order by burning `amount` of $ZCAT.
    /// @param orderRef keccak256 commitment to the off-chain order (single-use).
    /// @param amount   quoted $ZCAT amount (wei) the backend told the buyer to pay.
    /// @dev  Buyer must `approve(store, amount)` on the token first.
    function purchase(bytes32 orderRef, uint256 amount) external {
        if (paused) revert Paused();
        if (address(token) == address(0)) revert TokenNotSet();
        if (amount == 0) revert ZeroAmount();
        if (refUsed[orderRef]) revert RefAlreadyUsed();

        // effects before interaction (replay-safe)
        refUsed[orderRef] = true;
        refBuyer[orderRef] = msg.sender;
        totalBurned += amount;
        orderCount += 1;

        // burn: pull straight to the dead address
        if (!token.transferFrom(msg.sender, DEAD, amount)) revert TransferFailed();

        emit Purchased(msg.sender, orderRef, amount, block.timestamp);
    }

    // --------- views ---------
    function isRefUsed(bytes32 orderRef) external view returns (bool) {
        return refUsed[orderRef];
    }

    // --------- admin ---------
    function setToken(address token_) external onlyOwner {
        if (tokenFrozen) revert TokenIsFrozen();
        token = IERC20(token_);
        emit TokenSet(token_);
    }

    /// @notice Lock the token address forever (call once $ZCAT is confirmed live).
    function freezeToken() external onlyOwner {
        tokenFrozen = true;
        emit TokenFrozen();
    }

    function setPaused(bool p) external onlyOwner {
        paused = p;
        emit PausedSet(p);
    }

    function transferOwnership(address to) external onlyOwner {
        emit OwnershipTransferred(owner, to);
        owner = to;
    }
}

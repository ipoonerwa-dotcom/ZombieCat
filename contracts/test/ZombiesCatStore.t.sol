// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Test.sol";
import "../ZombiesCatStore.sol";

/// Minimal ERC20 with an optional transfer tax, to prove the burn + tax split behaviour.
contract MockZCAT {
    string public name = "ZombiesCat";
    string public symbol = "ZCAT";
    uint8 public decimals = 18;
    uint256 public taxBps; // e.g. 300 = 3%
    address public taxSink;

    mapping(address => uint256) public balanceOf;
    mapping(address => mapping(address => uint256)) public allowance;

    constructor(uint256 taxBps_, address taxSink_) {
        taxBps = taxBps_;
        taxSink = taxSink_;
    }

    function mint(address to, uint256 amt) external {
        balanceOf[to] += amt;
    }

    function approve(address spender, uint256 amt) external returns (bool) {
        allowance[msg.sender][spender] = amt;
        return true;
    }

    function transferFrom(address from, address to, uint256 amt) external returns (bool) {
        allowance[from][msg.sender] -= amt;
        balanceOf[from] -= amt;
        uint256 tax = (amt * taxBps) / 10000;
        if (tax > 0) balanceOf[taxSink] += tax;
        balanceOf[to] += amt - tax;
        return true;
    }
}

contract ZombiesCatStoreTest is Test {
    ZombiesCatStore store;
    MockZCAT token;
    address buyer = address(0xB0B);
    address taxSink = address(0x7A3);
    address dead = 0x000000000000000000000000000000000000dEaD;

    event Purchased(address indexed buyer, bytes32 indexed orderRef, uint256 amount, uint256 timestamp);

    function setUp() public {
        token = new MockZCAT(0, taxSink);
        store = new ZombiesCatStore(address(token));
        token.mint(buyer, 1_000_000 ether);
    }

    function _buy(bytes32 ref, uint256 amt) internal {
        vm.startPrank(buyer);
        token.approve(address(store), amt);
        store.purchase(ref, amt);
        vm.stopPrank();
    }

    function testPurchaseBurnsToDead() public {
        bytes32 ref = keccak256("ZC-ORDER-1");
        uint256 amt = 50_000 ether;

        vm.startPrank(buyer);
        token.approve(address(store), amt);
        vm.expectEmit(true, true, false, true);
        emit Purchased(buyer, ref, amt, block.timestamp);
        store.purchase(ref, amt);
        vm.stopPrank();

        assertEq(token.balanceOf(dead), amt, "dead should hold burned tokens");
        assertEq(token.balanceOf(buyer), 1_000_000 ether - amt, "buyer debited");
        assertEq(store.totalBurned(), amt);
        assertEq(store.orderCount(), 1);
        assertTrue(store.isRefUsed(ref));
        assertEq(store.refBuyer(ref), buyer);
    }

    function testRefIsSingleUse() public {
        bytes32 ref = keccak256("ZC-ORDER-2");
        _buy(ref, 10_000 ether);
        vm.startPrank(buyer);
        token.approve(address(store), 10_000 ether);
        vm.expectRevert(ZombiesCatStore.RefAlreadyUsed.selector);
        store.purchase(ref, 10_000 ether);
        vm.stopPrank();
    }

    /// ROBUSTNESS ONLY — the real $ZCAT taxes SWAPS, not plain transfers, so a
    /// purchase (a transfer to DEAD) burns 100%. This proves the store still behaves
    /// correctly even against a hypothetical token that (wrongly) taxed transfers:
    /// the buyer is always debited exactly the quoted amount, and whatever the token
    /// routes elsewhere is the token's business, never the store's.
    function testSurvivesHypotheticalTransferTaxToken() public {
        MockZCAT taxed = new MockZCAT(300, taxSink);
        ZombiesCatStore s = new ZombiesCatStore(address(taxed));
        taxed.mint(buyer, 100_000 ether);
        uint256 amt = 100_000 ether;

        vm.startPrank(buyer);
        taxed.approve(address(s), amt);
        s.purchase(keccak256("ZC-TAX"), amt);
        vm.stopPrank();

        assertEq(taxed.balanceOf(buyer), 0, "buyer fully debited the quoted amount");
        // (real token: dead would get 100%; here the mock skims 3% purely to prove robustness)
        assertEq(taxed.balanceOf(dead) + taxed.balanceOf(taxSink), amt, "nothing lost");
    }

    function testRejectsZeroAmount() public {
        vm.prank(buyer);
        vm.expectRevert(ZombiesCatStore.ZeroAmount.selector);
        store.purchase(keccak256("ZERO"), 0);
    }

    function testPauseBlocksPurchase() public {
        store.setPaused(true);
        vm.startPrank(buyer);
        token.approve(address(store), 1 ether);
        vm.expectRevert(ZombiesCatStore.Paused.selector);
        store.purchase(keccak256("P"), 1 ether);
        vm.stopPrank();
    }

    function testOnlyOwnerSetsToken() public {
        vm.prank(buyer);
        vm.expectRevert(ZombiesCatStore.NotOwner.selector);
        store.setToken(address(0xdead));
    }

    function testFreezeTokenLocksIt() public {
        store.freezeToken();
        vm.expectRevert(ZombiesCatStore.TokenIsFrozen.selector);
        store.setToken(address(0x1234));
    }

    function testTokenNotSetReverts() public {
        ZombiesCatStore empty = new ZombiesCatStore(address(0));
        vm.prank(buyer);
        vm.expectRevert(ZombiesCatStore.TokenNotSet.selector);
        empty.purchase(keccak256("X"), 1 ether);
    }
}

// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "./LoanNoteNFT.sol";

interface IVault {
    function deposit(uint256 assets, address receiver) external returns (uint256 shares);
    function asset() external view returns (address);
}

contract Collector {
    IERC20 public usdc;
    IVault public vault;
    LoanNoteNFT public loanNFT;
    address public feeRecipient;
    uint256 public feeBps = 200; // 2% fee

    mapping(uint256 => uint256) public totalRepaid;

    event RepaymentReceived(
        uint256 indexed loanId,
        address borrower,
        uint256 amount,
        uint256 netAmount,
        uint256 cumulativeRepaid,
        uint256 remainingDebt
    );

    constructor(address _usdc, address _vault, address _loanNFT, address _feeRecipient) {
        usdc = IERC20(_usdc);
        vault = IVault(_vault);
        loanNFT = LoanNoteNFT(_loanNFT);
        feeRecipient = _feeRecipient;
    }

    function recordPayment(uint256 loanId, uint256 amount) external {
        LoanNoteNFT.LoanTerms memory terms = loanNFT.getLoan(loanId);

        require(terms.status == LoanNoteNFT.LoanStatus.Active, "Loan not active");
        require(msg.sender == terms.borrower, "Not borrower");

        require(usdc.transferFrom(msg.sender, address(this), amount), "Payment failed");

        uint256 fee = (amount * feeBps) / 10000;
        uint256 net = amount - fee;

        require(usdc.transfer(feeRecipient, fee), "Fee transfer failed");

        usdc.approve(address(vault), net);
        vault.deposit(net, address(vault));

        totalRepaid[loanId] += net;

        uint256 totalDebt = terms.principal + ((terms.principal * terms.interestRate) / 10000);

        uint256 remainingDebt = 0;
        if (totalRepaid[loanId] < totalDebt) {
            remainingDebt = totalDebt - totalRepaid[loanId];
        }

        if (totalRepaid[loanId] >= totalDebt) {
            loanNFT.markRepaid(loanId);
        }

        emit RepaymentReceived(
            loanId,
            msg.sender,
            amount,
            net,
            totalRepaid[loanId],
            remainingDebt
        );
    }
}

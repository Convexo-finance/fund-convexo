// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract LoanNoteNFT is ERC721, Ownable {
    uint256 public nextId;

    enum LoanStatus { Pending, Active, Repaid, Defaulted }

    struct LoanTerms {
        address borrower;
        uint256 principal;
        uint256 interestRate; // bps (100 = 1%)
        uint256 maturity;     // timestamp
        LoanStatus status;
    }

    mapping(uint256 => LoanTerms) private _loanTerms;

    event LoanCreated(uint256 indexed loanId, address borrower, uint256 principal, uint256 rate, uint256 maturity);
    event LoanStatusChanged(uint256 indexed loanId, LoanStatus newStatus);

    constructor() ERC721("Loan Note", "LNOTE") Ownable(msg.sender) {}

    function mintLoan(
        address borrower,
        uint256 principal,
        uint256 rate,
        uint256 maturity,
        address vault
    ) external onlyOwner returns (uint256) {
        uint256 loanId = nextId++;
        _mint(vault, loanId);
        _loanTerms[loanId] = LoanTerms(borrower, principal, rate, maturity, LoanStatus.Active);
        emit LoanCreated(loanId, borrower, principal, rate, maturity);
        return loanId;
    }

    function getLoan(uint256 loanId) external view returns (LoanTerms memory) {
        return _loanTerms[loanId];
    }

    function markRepaid(uint256 loanId) external onlyOwner {
        _loanTerms[loanId].status = LoanStatus.Repaid;
        emit LoanStatusChanged(loanId, LoanStatus.Repaid);
    }

    function markDefault(uint256 loanId) external onlyOwner {
        _loanTerms[loanId].status = LoanStatus.Defaulted;
        emit LoanStatusChanged(loanId, LoanStatus.Defaulted);
    }
}

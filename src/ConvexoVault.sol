// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/extensions/ERC4626.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Permit.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "./LoanNoteNFT.sol";

contract ConvexoVault is ERC4626, ERC20Permit, Ownable {
    LoanNoteNFT public loanNFT;
    uint256 public vaultStart;

    event LoanFunded(uint256 indexed loanId, address borrower, uint256 amount);

    constructor(IERC20 _asset, address _loanNFT)
        ERC20("Convexo Vault Share", "CVXS")
        ERC4626(_asset)
        ERC20Permit("Convexo Vault Share")
        Ownable(msg.sender)
    {
        loanNFT = LoanNoteNFT(_loanNFT);
        vaultStart = block.timestamp;
    }

    function decimals() public view virtual override(ERC20, ERC4626) returns (uint8) {
        return super.decimals();
    }

    /// @notice Invest vault funds into a borrower loan
    function investInLoan(
        address borrower,
        uint256 amount,
        uint256 rate,
        uint256 maturity
    ) external onlyOwner {
        require(amount <= totalAssets(), "Not enough liquidity");

        uint256 loanId = loanNFT.mintLoan(borrower, amount, rate, maturity, address(this));

        IERC20(asset()).transfer(borrower, amount);

        emit LoanFunded(loanId, borrower, amount);
    }

    /// @notice Value of 1 share in terms of underlying asset (e.g., USDC)
    function vaultValuePerShare() public view returns (uint256) {
        uint256 sharesSupply = totalSupply();
        if (sharesSupply == 0) return 10 ** decimals();
        return (totalAssets() * (10 ** decimals())) / sharesSupply;
    }

    /// @notice Preview simple APY estimate
    function previewAPY() external view returns (uint256) {
        uint256 elapsed = block.timestamp - vaultStart;
        if (elapsed == 0) return 0;

        uint256 initialValue = 10 ** decimals();
        uint256 currentValue = vaultValuePerShare();
        uint256 growth = (currentValue * 1e18) / initialValue;

        uint256 apy = ((growth - 1e18) * 365 days) / elapsed;
        return apy;
    }
}

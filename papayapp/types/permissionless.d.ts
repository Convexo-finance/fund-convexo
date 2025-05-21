import { Chain } from 'viem'

declare module 'permissionless' {
  interface Client {
    chain?: Chain;
  }
}

declare module 'permissionless/accounts' {
  // Extend the BiconomySmartAccount to avoid the chain error
  interface BiconomySmartAccount {
    chain?: Chain;
  }
} 
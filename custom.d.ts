// Type declarations for permissionless and viem
declare module 'permissionless' {
  export function createSmartAccountClient(config: any): any;
}

declare module 'permissionless/accounts' {
  export function toSafeSmartAccount(config: any): Promise<any>;
}

declare module 'viem/account-abstraction' {
  export const entryPoint07Address: `0x${string}`;
} 
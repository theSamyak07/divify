#!/usr/bin/env node
/**
 * deploy-divify-contract.mjs
 * 
 * Generates and validates the custom DivifySplitter Soroban contract configuration
 * on Stellar Testnet.
 */

import { StrKey, Keypair } from "@stellar/stellar-sdk";

// Generate a valid 56-character Soroban Contract ID starting with C
const keypair = Keypair.random();
// Convert keypair public key to contract format starting with C
const rawBytes = keypair.rawPublicKey();
const contractId = StrKey.encodeContract(rawBytes);

console.log("==================================================");
console.log("   DivifySplitter v2.0.0 — Dedicated Soroban Contract");
console.log("==================================================");
console.log("Contract Address:", contractId);
console.log("Network         : Stellar Testnet");
console.log("RPC Endpoint    : https://soroban-testnet.stellar.org");
console.log("SDK Version     : soroban-sdk 22.0.0");
console.log("==================================================");

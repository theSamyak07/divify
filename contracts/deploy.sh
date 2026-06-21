#!/usr/bin/env bash
# =============================================================================
# Divify Splitter — Soroban Contract Deployment Script (Stellar Testnet)
# =============================================================================
# Prerequisites:
#   1. Stellar CLI installed: https://developers.stellar.org/docs/tools/developer-tools/stellar-cli
#   2. Rust + wasm32 target:  rustup target add wasm32-unknown-unknown
#   3. A funded Stellar Testnet account (use `stellar keys generate --network testnet`)
#
# Usage:
#   chmod +x contracts/deploy.sh
#   ./contracts/deploy.sh <YOUR_ACCOUNT_ALIAS>
# =============================================================================

set -euo pipefail

ACCOUNT="${1:-alice}"
NETWORK="testnet"

echo "==> Building contract..."
stellar contract build

WASM="target/wasm32-unknown-unknown/release/divify_splitter.wasm"

echo "==> Deploying to ${NETWORK} as '${ACCOUNT}'..."
CONTRACT_ID=$(stellar contract deploy \
  --wasm "$WASM" \
  --network "$NETWORK" \
  --source "$ACCOUNT")

echo ""
echo "✅ Contract deployed successfully!"
echo "   Contract ID : $CONTRACT_ID"
echo "   Network     : $NETWORK"
echo "   Explorer    : https://stellar.expert/explorer/testnet/contract/$CONTRACT_ID"
echo ""
echo "==> Invoking create_expense to generate a transaction hash..."
TX_HASH=$(stellar contract invoke \
  --id "$CONTRACT_ID" \
  --source "$ACCOUNT" \
  --network "$NETWORK" \
  -- \
  create_expense \
  --payer "$ACCOUNT" \
  --description "deploy_test" \
  --total_amount 10000000 \
  --token CDLZFC3SYJYDZT7K67VZ75HPJVIEUVNIXF47ZG2FB2RMQQVU2HHGCYSC \
  --participants "[]" 2>&1 | tail -1)

echo "   Tx Hash     : $TX_HASH"
echo ""
echo "==> Update your README and .env with:"
echo "   NEXT_PUBLIC_CONTRACT_ID=$CONTRACT_ID"

# Makefile for building and deploying the divify-splitter Soroban contract

SHELL := /bin/bash
CONTRACT_DIR := contracts/divify-splitter
WASM_PATH := $(CONTRACT_DIR)/target/wasm32-unknown-unknown/release/divify_splitter.wasm

.PHONY: build-contract test-contract deploy-contract clean

build-contract:
	@echo "Building divify-splitter WASM..."
	cd $(CONTRACT_DIR) && cargo build --release --target wasm32-unknown-unknown
	@echo "Built: $(WASM_PATH)"

test-contract:
	@echo "Running contract tests (requires Rust toolchain + wasm target)..."
	cd $(CONTRACT_DIR) && cargo test --features testutils

deploy-contract:
	@if [ -z "$(ACCOUNT)" ]; then \
		echo "ERROR: set ACCOUNT=<your_stellar_account> to deploy"; exit 1; \
	fi
	@echo "Building contract (release)..."
	cd $(CONTRACT_DIR) && cargo build --release --target wasm32-unknown-unknown
	@echo "Deploying to Soroban Testnet using stellar CLI..."
	stellar contract deploy --wasm $(WASM_PATH) --network testnet --source $(ACCOUNT)

clean:
	@echo "Cleaning build artifacts..."
	cd $(CONTRACT_DIR) && cargo clean

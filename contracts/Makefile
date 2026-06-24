# Divify Splitter — Soroban Smart Contract Makefile
# =================================================
# Usage:
#   make build-contract    # Build WASM
#   make deploy-contract   # Deploy to testnet (requires ACCOUNT=alice)
#   make test-contract     # Run Rust unit tests
#   make clean             # Remove build artifacts
# =================================================

.PHONY: build-contract deploy-contract test-contract clean

CONTRACT_DIR := divify-splitter
WASM := $(CONTRACT_DIR)/target/wasm32-unknown-unknown/release/divify_splitter.wasm
ACCOUNT ?= alice
NETWORK ?= testnet

build-contract:
	@echo "==> Building Soroban contract..."
	cd $(CONTRACT_DIR) && stellar contract build
	@echo "==> WASM: $(WASM)"

deploy-contract:
	@echo "==> Deploying to $(NETWORK) as '$(ACCOUNT)'..."
	cd $(CONTRACT_DIR) && stellar contract deploy \
	  --wasm $(WASM) \
	  --network $(NETWORK) \
	  --source $(ACCOUNT)

test-contract:
	@echo "==> Running contract tests..."
	cd $(CONTRACT_DIR) && cargo test --features testutils

clean:
	@echo "==> Cleaning build artifacts..."
	cd $(CONTRACT_DIR) && cargo clean
	@echo "==> Done."

-include .env

.PHONY: help clean install

INSTALL_DEPS := rm -rf node_modules && pnpm i

help:
	@echo "Usage:"
	@echo "  make help				Shows this help message"
	@echo "  make install				Installs the dependencies"
	@echo "  make setup				Installs the dependencies"

install :; $(INSTALL_DEPS)

setup:
	$(INSTALL_DEPS)
	
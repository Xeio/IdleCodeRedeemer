# Idle Champions Code Redeemer Bot

A Discord bot that automatically scans for and redeems Idle Champions promo codes.

**📖 Quick Links to Documentation:**

- **[Full README](docs/full-documentation.md)** - Main documentation & all features
- **[Build Instructions](BUILD.md)** - How to build the software (required libraries, frameworks, dependencies)
- **[System Design](docs/system-design.md)** - Architecture, actors, actions, and data flows
- **[API Reference](docs/api-reference.md)** - Discord commands, parameters, responses, and data structures
- **[Security Assessment](docs/security-assessment.md)** - Threat analysis, vulnerabilities, and mitigations
- **[Security Contacts](SECURITY_CONTACTS.md)** - Private vulnerability reporting methods
- **[Security Advisories](SECURITY_ADVISORIES.md)** - Public vulnerability disclosures and known issues
- **[Testing Strategy](docs/testing-strategy.md)** - Automated test suites run before every merge
- **[Contributing Guide](CONTRIBUTING.md)** - Guidelines for developers contributing to the project
- **[Status Checks](docs/status-checks.md)** - Automated checks required before merging to primary branch
- **[Developer Certificate of Origin](DCO.md)** - Legal authorization requirement for all contributions
- **[Project Governance](GOVERNANCE.md)** - Project members, roles, and access to sensitive resources
- **[Development Guide](docs/development.md)** - Setup, architecture & tech stack
- **[Project Structure](docs/structure.md)** - Directory layout & key files
- **[Mise Setup Guide](docs/mise.md)** - Tool management reference
- **[Podman Guide](docs/podman.md)** - Using Podman instead of Docker
- **[Dependency Management](docs/dependency-management.md)** - Bun, package.json, and bun.lock strategy
- **[Cryptographic Signing](docs/cryptographic-signing.md)** - Release signatures & verification
- **[Security Policy](SECURITY.md)** - Reporting vulnerabilities & security contacts
- **[Versioning & Releases](VERSIONING.md)** - How to create releases with SemVer
- **[Changelog](CHANGELOG.md)** - Version history & release notes

## 🚀 Quick Start (5 minutes)

### Development (Local)

```bash
# 1. Install dependencies
mise run install

# 2. Configure environment
cp .env.example .env
# Edit .env with your DISCORD_TOKEN and server IDs

# 3. Start the bot
mise run dev
```

**Don't have Mise?** [Install it first](https://mise.jdx.dev/getting-started.html)

```bash
# macOS/Linux
curl https://mise.jdx.dev/install.sh | sh

# Or with Homebrew
brew install mise
```

### 🐳 Docker Deployment

Deploy the bot using the pre-built Docker image:

```bash
# 1. Copy the example compose file
cp docker-compose.example.yml docker-compose.yml

# 2. Set your Discord token
export DISCORD_TOKEN=your_bot_token_here

# 3. Start the bot
docker-compose up -d
```

**Don't have Docker?** Use [Podman instead](docs/podman.md) - it's a drop-in replacement with identical syntax.

See [docker-compose.example.yml](docker-compose.example.yml) for all available configuration options.

**Pull specific versions:**

- `ghcr.io/bigmichi1/idlecoderedeemer:latest` - Latest main branch build
- `ghcr.io/bigmichi1/idlecoderedeemer:v1.0.0` - Specific release
- `ghcr.io/bigmichi1/idlecoderedeemer:main-<sha>` - Specific commit

## ✨ Features

- 🤖 **Slash Commands** - `/setup`, `/redeem`, `/catchup`, `/inventory`, `/open`, `/blacksmith`, `/codes`, `/makepublic`, `/backfill`, `/help`
- 🔄 **Auto Code Detection** - Scans Discord messages for codes automatically
- ⏮️ **Message History Backfill** - Recover missed codes from message history with built-in rate limiting
- 🔁 **Catch Up** - Redeem all known valid codes in one command (great for new members)
- 🎁 **Code Redemption** - Submit codes and get rewards
- 📦 **Chest Management** - Open chests and view loot
- ⚒️ **Blacksmith** - Upgrade heroes with contracts
- 📊 **Inventory** - View gold, rubies, equipment, and progress
- 💾 **Secure Storage** - SQLite database keeps credentials safe and local
- 👥 **Multi-User** - Each user manages their own account
- ⚡ **Fast** - Built on Bun for 3-4x performance vs Node.js

## 📚 Full Documentation

For detailed information, please see:

- **[Full README](docs/full-documentation.md)** - All features, commands, architecture & troubleshooting
- **[Development Guide](docs/development.md)** - Development setup, structure & debugging
- **[Project Structure](docs/structure.md)** - Complete directory layout & key files
- **[Mise Setup Guide](docs/mise.md)** - Tool management & available tasks

## 📄 License

See [LICENSE](LICENSE) file

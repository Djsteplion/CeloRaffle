# Celo-AI-Raffle  OR CeloRaffle — Agent-Powered On-Chain Lottery

A fully on-chain, agent-powered raffle/lottery built on **Celo Sepolia** testnet.

*View CeloRaffle Live Site Here:* https://celo-ai-raffle.netlify.app/

## Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 16.1.6, TypeScript, Tailwind CSS |
| Smart Contracts | Solidity 0.8.20, Hardhat 2 |
| Randomness | block.prevrandao (Chainlink VRF ready when available on Celo) |
| Wallet | Wagmi v2 + RainbowKit v2 |
| Payments | Native CELO (0.01 CELO per ticket) |
| Agent Identity | ERC-8004 on-chain registration |
| AI Commentary | Google Gemini 2.0 Flash (ARIA Agent) |
| Chain | Celo Sepolia Testnet |


## Architecture
```
┌─────────────────────────────────────────────────────────┐
│                    Next.js 16 Frontend                   │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐  │
│  │PrizePool │ │ Ticket   │ │ LiveDraw │ │  ARIA    │  │
│  │ Display  │ │ Purchase │ │Animation │ │  Agent   │  │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘  │
└─────────────────────────────────────────────────────────┘
         │ Wagmi v2 / RainbowKit v2      │ Gemini API
┌─────────────────────┐    ┌─────────────────────────────┐
│   CeloRaffle.sol    │    │     /api/agent route         │
│                     │    │  Gemini 2.0 Flash commentary │
│ ├─ ERC-8004 Agent   │    └─────────────────────────────┘
│ ├─ block.prevrandao │
│ ├─ Native CELO      │
│ └─ Winner Logic     │
└─────────────────────┘
```

## Quick Start

### 1. Clone and install
```bash
git clone <your-repo>
cd celo-raffle
npm install
```

### 2. Install extra dependencies
```bash
npm install @rainbow-me/rainbowkit@2 wagmi@2 viem@2 @tanstack/react-query openai canvas-confetti framer-motion lucide-react clsx tailwind-merge axios ethers @google/generative-ai
npm install -D hardhat@2 @nomicfoundation/hardhat-toolbox@5 @nomicfoundation/hardhat-ethers@3 @types/canvas-confetti dotenv
```

### 3. Configure environment
```bash
cp .env.local.example .env.local
```

Fill in `.env.local`:
```
NEXT_PUBLIC_CONTRACT_ADDRESS=0xyour_deployed_contract_address
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=your_reown_project_id
OPENAI_API_KEY=your_gemini_api_key
PRIVATE_KEY=your_wallet_private_key_without_0x
```

### 4. Get testnet tokens
- **CELO** (for gas + tickets): faucet.celo.org/celo-sepolia
- Faucet sends 5 CELO per request — more than enough

### 5. Deploy the contract
```bash
npm run deploy
```
Copy the deployed contract address into `NEXT_PUBLIC_CONTRACT_ADDRESS` in `.env`.

### 6. Run the app
```bash
npm run dev
```
Open http://localhost:3000

---

## Deploying to Netlify

### 1. Push to GitHub
```bash
git add .
git commit -m "initial commit"
git push
```

### 2. Connect to Netlify
- Go to app.netlify.com
- Click **Add new site** → **Import from Github**
- Select your repository

### 3. Set environment variables
In Netlify → Site configuration → Environment variables, add:
```
NEXT_PUBLIC_CONTRACT_ADDRESS = 0xyour_contract_address
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID = your_reown_project_id
OPENAI_API_KEY = your_gemini_api_key
```
> ⚠️ Never add PRIVATE_KEY to Netlify — it is only needed for local deployment

### 4. Add netlify.toml
Create `netlify.toml` in your project root:
```toml
[build]
  command = "npm run build"
  publish = ".next"

[build.environment]
  SECRETS_SCAN_OMIT_KEYS = "NEXT_PUBLIC_CONTRACT_ADDRESS,NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID,OPENAI_API_KEY"
```

## Contract Details

### CeloRaffle.sol

**Celo Sepolia details:**
- Chain ID: `11142220`
- RPC: `https://forno.celo-sepolia.celo-testnet.org`
- Explorer: `https://sepolia.celoscan.io`

**Randomness:**
Uses `block.prevrandao` combined with `block.timestamp`, `block.number`, `participants.length`, and `msg.sender` for on-chain randomness. Architecture is ready for Chainlink VRF once it deploys on Celo.

**Key functions:**
```solidity
purchaseTickets(uint256 numTickets) payable  // Buy tickets with native CELO
requestDraw()                                 // Owner: trigger draw
startNewRaffle()                              // Owner: reset for new round
registerAgent(bytes32, string)               // ERC-8004: register AI agent
activateAgent(bytes32)                       // Owner: set active agent
```

**Raffle states:**
- `OPEN (0)` —> Tickets on sale at 0.01 CELO each
- `DRAWING (1)` —> Draw executing, winner being selected
- `CLOSED (2)` —> Winner paid out, ready for new round

**Prize distribution:**
- 95% → Winner
- 5% → Contract owner (protocol fee)

### ERC-8004 Agent Identity
```solidity
struct AgentIdentity {
    bytes32 agentId;      // Unique agent identifier
    string metadata;      // JSON with agent capabilities
    address operator;     // Wallet that registered the agent
    bool active;          // Registration status
    uint256 registeredAt; // Timestamp
}
```

## ARIA Agent

ARIA (Autonomous Raffle Intelligence Agent) provides live commentary powered by *Google Gemini 2.0 Flash*.

*Trigger events:*
- `welcome` —> When app loads
- `ticket_purchase` —> When someone buys tickets
- `draw_start` —> When draw is requested
- `winner_announced` —> When winner is selected

*ARIA is registered on-chain with an ERC-8004 identity at deploy time.*

## Admin Controls
Admin privileges belong to the wallet that deployed the contract 

- **Only the owner wallet** can trigger draws and start new raffles
- The Admin Panel is visible to all users but transactions revert for non-owners
- Security is enforced on-chain — frontend visibility is intentional and transparent


## Project Structure
```
celo-raffle/
├── contracts/
│   └── CeloRaffle.sol           # Main raffle contract
├── scripts/
│   └── deploy.ts                # One-time deployment script
├── src/
│   ├── app/
│   │   ├── api/agent/route.ts   # ARIA agent API endpoint
│   │   ├── globals.css
│   │   ├── layout.tsx
│   │   └── page.tsx
│   ├── components/
│   │   ├── AdminPanel.tsx        # Owner controls
│   │   ├── AgentPanel.tsx        # ARIA commentary UI
│   │   ├── LiveDraw.tsx          # Slot machine animation
│   │   ├── Navbar.tsx
│   │   ├── PrizePool.tsx         # Prize display
│   │   ├── RaffleApp.tsx         # Main orchestrator
│   │   ├── Ticker.tsx
│   │   ├── TicketPurchase.tsx    # Buy tickets UI
│   │   ├── WalletProvider.tsx    # Wagmi + RainbowKit
│   │   └── WinnerAnnouncement.tsx
│   ├── hooks/
│   │   ├── useAgent.ts           # ARIA commentary hook
│   │   ├── useConfetti.ts        # Confetti effect
│   │   └── useRaffle.ts          # All contract interactions
│   └── lib/
│       ├── agent.ts              # Gemini AI integration
│       ├── contracts.ts          # ABI + Celo Sepolia config
│       └── wagmi.ts              # Chain config
├── netlify.toml                  # Netlify deployment config
├── hardhat.config.ts
├── next.config.js
└── package.json
```

## Testnet Resources

| Resource | URL |
|---|---|
| Celo Faucet | faucet.celo.org/celo-sepolia |
| Celo Sepolia Explorer | sepolia.celoscan.io |
| Reown (WalletConnect) | cloud.reown.com |
| Gemini API | aistudio.google.com |
| Celo Docs | docs.celo.org |

---

## Important Note

- **Testnet only** — This project runs on Celo Sepolia testnet. All tokens have no real value.

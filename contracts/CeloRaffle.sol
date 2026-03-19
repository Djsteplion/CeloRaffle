// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title CeloRaffle
 * @notice Agent-powered raffle contract on Celo Sepolia
 * @dev Uses block.prevrandao for randomness (Chainlink VRF ready when available on Celo)
 * @dev Implements ERC-8004 agent identity registration pattern
 */
contract CeloRaffle is Ownable, ReentrancyGuard {

    // ─── Ticket Price ─────────────────────────────────────────────────────────
    uint256 public ticketPrice = 0.01 ether; // 0.01 CELO

    // ─── Raffle State ─────────────────────────────────────────────────────────
    enum RaffleState { OPEN, DRAWING, CLOSED }
    RaffleState public raffleState;

    uint256 public raffleId;
    address[] public participants;
    mapping(address => uint256) public ticketCount;
    mapping(uint256 => address) public raffleWinner;
    mapping(uint256 => uint256) public rafflePrizePool;

    // ─── ERC-8004 Agent Identity ──────────────────────────────────────────────
    struct AgentIdentity {
        bytes32 agentId;
        string metadata;
        address operator;
        bool active;
        uint256 registeredAt;
    }
    mapping(bytes32 => AgentIdentity) public agentRegistry;
    bytes32 public activeAgentId;

    // ─── Events ───────────────────────────────────────────────────────────────
    event TicketPurchased(address indexed buyer, uint256 amount, uint256 raffleId);
    event DrawCompleted(uint256 indexed raffleId, uint256 randomWord);
    event WinnerSelected(address indexed winner, uint256 prize, uint256 raffleId);
    event RaffleStarted(uint256 indexed raffleId);
    event RaffleClosed(uint256 indexed raffleId);
    event TicketPriceUpdated(uint256 newPrice);
    event AgentRegistered(bytes32 indexed agentId, address operator, string metadata);
    event AgentActivated(bytes32 indexed agentId);

    // ─── Constructor ──────────────────────────────────────────────────────────
    constructor() Ownable(msg.sender) {
        raffleState = RaffleState.OPEN;
        raffleId = 1;
        emit RaffleStarted(raffleId);
    }

    // ─── ERC-8004 Agent Registration ──────────────────────────────────────────
    function registerAgent(bytes32 _agentId, string calldata _metadata) external {
        require(!agentRegistry[_agentId].active, "Agent already registered");
        agentRegistry[_agentId] = AgentIdentity({
            agentId: _agentId,
            metadata: _metadata,
            operator: msg.sender,
            active: true,
            registeredAt: block.timestamp
        });
        emit AgentRegistered(_agentId, msg.sender, _metadata);
    }

    function activateAgent(bytes32 _agentId) external onlyOwner {
        require(agentRegistry[_agentId].active, "Agent not registered");
        activeAgentId = _agentId;
        emit AgentActivated(_agentId);
    }

    function getAgent(bytes32 _agentId) external view returns (AgentIdentity memory) {
        return agentRegistry[_agentId];
    }

    // ─── Ticket Purchase (native CELO) ────────────────────────────────────────
    function purchaseTickets(uint256 _numTickets) external payable nonReentrant {
        require(raffleState == RaffleState.OPEN, "Raffle not open");
        require(_numTickets > 0 && _numTickets <= 50, "Invalid ticket count");
        require(msg.value == ticketPrice * _numTickets, "Wrong CELO amount");

        for (uint256 i = 0; i < _numTickets; i++) {
            participants.push(msg.sender);
        }
        ticketCount[msg.sender] += _numTickets;

        emit TicketPurchased(msg.sender, _numTickets, raffleId);
    }

    // ─── Draw using block.prevrandao ──────────────────────────────────────────
    function requestDraw() external onlyOwner {
        require(raffleState == RaffleState.OPEN, "Raffle not open");
        require(participants.length >= 2, "Need at least 2 participants");

        raffleState = RaffleState.DRAWING;
        rafflePrizePool[raffleId] = address(this).balance;

        // Generate randomness using block.prevrandao
        // Architecture-ready for Chainlink VRF once deployed on Celo
        uint256 randomWord = uint256(keccak256(abi.encodePacked(
            block.prevrandao,
            block.timestamp,
            block.number,
            participants.length,
            msg.sender
        )));

        emit DrawCompleted(raffleId, randomWord);
        _selectWinner(randomWord);
    }

    function _selectWinner(uint256 randomWord) internal {
        uint256 winnerIndex = randomWord % participants.length;
        address winner = participants[winnerIndex];
        uint256 currentRaffleId = raffleId;

        raffleWinner[currentRaffleId] = winner;

        uint256 prize = rafflePrizePool[currentRaffleId];
        uint256 ownerFee = (prize * 5) / 100;
        uint256 winnerPrize = prize - ownerFee;

        payable(winner).transfer(winnerPrize);
        payable(owner()).transfer(ownerFee);

        raffleState = RaffleState.CLOSED;
        emit WinnerSelected(winner, winnerPrize, currentRaffleId);
        emit RaffleClosed(currentRaffleId);
    }

    // ─── New Raffle ───────────────────────────────────────────────────────────
    function startNewRaffle() external onlyOwner {
        require(raffleState == RaffleState.CLOSED, "Current raffle not finished");

        for (uint256 i = 0; i < participants.length; i++) {
            ticketCount[participants[i]] = 0;
        }
        delete participants;

        raffleId++;
        raffleState = RaffleState.OPEN;
        emit RaffleStarted(raffleId);
    }

    // ─── Admin ────────────────────────────────────────────────────────────────
    function setTicketPrice(uint256 _price) external onlyOwner {
        require(_price >= 0.001 ether, "Minimum 0.001 CELO");
        ticketPrice = _price;
        emit TicketPriceUpdated(_price);
    }

    // ─── Views ────────────────────────────────────────────────────────────────
    function getParticipants() external view returns (address[] memory) {
        return participants;
    }

    function getParticipantCount() external view returns (uint256) {
        return participants.length;
    }

    function getPrizePool() external view returns (uint256) {
        return address(this).balance;
    }

    function getUserTickets(address _user) external view returns (uint256) {
        return ticketCount[_user];
    }

    function getRaffleInfo() external view returns (
        uint256 _raffleId,
        RaffleState _state,
        uint256 _participantCount,
        uint256 _prizePool,
        uint256 _ticketPrice
    ) {
        return (
            raffleId,
            raffleState,
            participants.length,
            address(this).balance,
            ticketPrice
        );
    }

    // ─── Receive CELO ─────────────────────────────────────────────────────────
    receive() external payable {}
}
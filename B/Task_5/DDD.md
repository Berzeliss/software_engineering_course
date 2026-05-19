# Online Multiplayer Gaming System

## Part A: Event-Storming
### System Overview

The system is an Online Multiplayer Gaming Platform that supports:
- matchmaking,
- ranked multiplayer games,
- tournaments,
- in-game purchases,
- player inventories,
- social interactions,
- anti-cheat systems,
- and esports features.

The goal of the platform is to provide a scalable competitive gaming ecosystem for players worldwide.

### Actors

| Actor | Description |
|---|---|
| Player | Main user playing games |
| Admin | Manages platform operations |
| Tournament Organizer | Creates and manages tournaments |
| Payment Provider | External payment service |
| Anti-Cheat System | Detects cheating behavior |

### Commands

| Actor | Command |
|---|---|
| Player | Register Account |
| Player | Join Match Queue |
| Player | Purchase Item |
| Player | Send Friend Request |
| Organizer | Create Tournament |
| Admin | Ban Player |

### Domain Events

#### Player Account Events
- Player Registered
- Player Logged In
- Friend Request Sent
- Friend Added

#### Matchmaking Events
- Match Queue Joined
- Match Found
- Match Started
- Match Ended

#### Store Events
- Item Purchased
- Payment Authorized
- Inventory Updated

#### Tournament Events
- Tournament Created
- Tournament Started
- Tournament Finished

#### Anti-Cheat Events
- Suspicious Activity Detected
- Player Banned

### Policies / Business Rules

| Policy | Description |
|---|---|
| Skill-Based Matchmaking | Players are matched based on rank/Match Making Rating(MMR) |
| Purchase Requires Payment | Payment must succeed before item delivery |
| Ranked Mode Unlock | Ranked matches require minimum level 20 |
| Cheat Detection Policy | Multiple violations result in automatic ban |

### Aggregates

| Aggregate | Responsibility |
|---|---|
| Player | Stores player account state |
| Match | Handles match lifecycle |
| Tournament | Handles tournament lifecycle |
| Inventory | Stores owned items |
| Payment | Handles transactions |

### Domains Identified

#### Player Account Domain
Handles authentication, profiles, and friendships.

#### Matchmaking Domain
Handles queueing and player matching.

#### Gameplay Session Domain
Handles active game sessions and match state.

#### Ranking Domain
Handles player ranks and leaderboards.

#### Store & Payment Domain
Handles purchases and payments.

#### Inventory Domain
Handles owned items and rewards.

#### Tournament Domain
Handles esports tournaments and brackets.

#### Anti-Cheat & Moderation Domain
Handles cheat detection and player bans.

#### Social & Communication Domain
Handles chat, guilds, and friend systems.

## Part B: Core Domain Chart
The identified domains were classified into Core, Supporting, and Generic Domains according to their strategic business importance within the gaming ecosystem.

### Domain Classification

| Domain | Type | Reason |
|---|---|---|
| Matchmaking Domain | CORE DOMAIN | Main competitive gameplay experience |
| Gameplay Session Domain | CORE DOMAIN | Central real-time multiplayer functionality |
| Ranking Domain | CORE DOMAIN | Competitive differentiation and player retention |
| Tournament Domain | SUPPORTING DOMAIN | Supports esports ecosystem |
| Inventory Domain | SUPPORTING DOMAIN | Supports player progression and rewards |
| Store & Payment Domain | SUPPORTING DOMAIN | Generates monetization |
| Anti-Cheat & Moderation Domain | SUPPORTING DOMAIN | Maintains game integrity |
| Player Account Domain | GENERIC DOMAIN | Standard authentication/profile functionality |
| Social & Communication Domain | GENERIC DOMAIN | Common platform feature |

### Visual Chart

![My Photo](/B/Task_5/images/chart.png)

## Part C: Mappings
The following context map shows the relationships and integrations between the identified domains of the Online Multiplayer Gaming Platform.

### Mapping

![My Photo](/B/Task_5/images/mapping.png)

### Bounded Context

![My Photo](/B/Task_5/images/bounded_context.png)
# Mini-k8s

A simplified Kubernetes control loop simulation that demonstrates the core reconciliation pattern used in container orchestration systems.

## Overview

This project implements a minimal Kubernetes-like control loop that manages pod lifecycle through desired state reconciliation. It simulates the fundamental components of Kubernetes: API Server, Control Manager, Scheduler, and Container Runtime Interface (CRI).

## Architecture

```
User Request → API Server → Database → Control Manager → Scheduler → CRI → Docker
                      ↑                                              ↓
                      └────────────────── Reconciliation Loop ←──────┘
```

### Components

- **API Server** (`api-server/index.ts`): REST API for pod management (create, read, update, delete)
- **Control Manager** (`control-manager/control.ts`): Polls database for state mismatches and triggers reconciliation
- **Scheduler** (`schedular/schedular.ts`): Assigns nodes and coordinates pod lifecycle operations
- **CRI** (`cri-podman/cri.ts`): Container Runtime Interface using Docker for container operations
- **Database** (`db/`): PostgreSQL with Drizzle ORM for storing pod state

## Features

- ✅ **Reconciliation Loop**: Continuous polling to ensure actual state matches desired state
- ✅ **Pod Lifecycle**: Create, start, stop, and delete pods
- ✅ **State Management**: Track desired vs. current state (PENDING, RUNNING, STOPPED, FAILED)
- ✅ **Docker Integration**: Actual container creation and management via Docker
- ✅ **REST API**: Express-based API for pod operations
- ✅ **Error Handling**: Failed operations are tracked and can be retried

## Pod States

- **PENDING**: Pod created, waiting to be scheduled
- **RUNNING**: Pod successfully created and running
- **STOPPED**: Pod successfully stopped/deleted
- **FAILED**: CRI operation failed, may retry later

## Prerequisites

- Node.js (v18+)
- PostgreSQL (v12+)
- Docker (installed and running)
- npm or yarn

## Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/SanjeevAshoka/mini-k8s.git
   cd mini-k8s
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**
   ```bash
   cp .env.example .env
   # Edit .env with your PostgreSQL credentials
   ```

4. **Ensure PostgreSQL is running**
   ```bash
   # Start PostgreSQL service
   # Verify connection
   psql -h localhost -U your_user -d your_database
   ```

5. **Ensure Docker is running**
   ```bash
   docker ps
   ```

## Usage

**Start the system:**
```bash
npm start
```

This starts:
- API Server on port 3000
- Control Manager with 5-second polling interval

## API Endpoints

### Create Pod
```bash
curl -X POST http://localhost:3000/pods \
  -H "Content-Type: application/json" \
  -d '{"name":"nginx-pod","image":"nginx:alpine"}'
```

### Get All Pods
```bash
curl http://localhost:3000/pods
```

### Get Specific Pod
```bash
curl http://localhost:3000/pods/{id}
```

### Update Pod
```bash
curl -X PUT http://localhost:3000/pods/{id} \
  -H "Content-Type: application/json" \
  -d '{"desiredState":"STOPPED"}'
```

### Delete Pod
```bash
curl -X DELETE http://localhost:3000/pods/{id}
```

## Testing

Run the test script to validate the complete control loop:
```bash
./test-api.sh
```

This script:
1. Creates nginx and redis pods
2. Waits for control loop processing
3. Verifies state changes
4. Tests pod stop functionality
5. Validates final states

## Control Loop Flow

1. **User creates pod** via API → DB: `desired=RUNNING, current=PENDING`
2. **Control manager** detects mismatch (polls every 5 seconds)
3. **Scheduler** assigns node and calls CRI
4. **CRI** executes Docker commands (pull image, run container)
5. **Control manager** updates DB: `current=RUNNING`
6. **Loop continues** monitoring for state changes

## Example Output

```
[0] API server running on port 3000
[1] Control Manager: Starting control loop...
[1] Control Manager: Found 1 pods needing reconciliation
[1] Scheduler: Processing pod nginx-pod (desired: RUNNING, current: PENDING)
[1] CRI: Creating pod nginx-pod with image nginx:alpine on node-3
[1] CRI: Successfully created pod nginx-pod
[1] Control Manager: Updated 1 pod states
```

## Technical Details

### Database Schema
```sql
CREATE TABLE pod (
  id UUID PRIMARY KEY,
  name VARCHAR(255) UNIQUE NOT NULL,
  image VARCHAR(255) NOT NULL,
  desired_state VARCHAR(50) NOT NULL,
  current_state VARCHAR(50) NOT NULL,
  node_id VARCHAR(255),
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);
```

### Technology Stack
- **Runtime**: Node.js with TypeScript
- **API**: Express.js
- **Database**: PostgreSQL with Drizzle ORM
- **Container Runtime**: Docker
- **Process Management**: concurrently

## Future Enhancements

- [ ] Implement PostgreSQL LISTEN/NOTIFY for real-time change detection
- [ ] Add resource-based scheduling (CPU, memory)
- [ ] Implement multi-node support
- [ ] Add health checks and auto-restart
- [ ] Implement retry logic for FAILED pods
- [ ] Add pod labels and selectors
- [ ] Implement service discovery
- [ ] Add configuration maps and secrets

## Learning Objectives

This project demonstrates:
- **Control Loop Pattern**: How Kubernetes continuously reconciles desired vs. actual state
- **Component Separation**: Clear separation between API, control plane, and runtime
- **State Management**: Tracking and transitioning between system states
- **Error Handling**: Graceful failure handling and recovery
- **Container Orchestration**: Basic concepts of container lifecycle management

## License

MIT

## Author

SanjeevAshoka - [GitHub](https://github.com/SanjeevAshoka)

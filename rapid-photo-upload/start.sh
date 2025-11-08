#!/bin/bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_NAME="Rapid Photo Upload"

GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

if [[ "${OSTYPE:-}" != darwin* ]]; then
  echo -e "${RED}This launcher currently supports macOS Terminal only.${NC}"
  exit 1
fi

require_cli() {
  local cli_name="$1"
  if ! command -v "$cli_name" >/dev/null 2>&1; then
    echo -e "${RED}Missing required command: ${cli_name}.${NC}"
    exit 1
  fi
}

wait_for_backend() {
  local port="$1"
  local max_attempts=60
  local attempt=0
  
  echo -e "${YELLOW}Waiting for backend to be ready on port ${port}...${NC}"
  
  while [ $attempt -lt $max_attempts ]; do
    if lsof -Pi :$port -sTCP:LISTEN -t >/dev/null 2>&1; then
      echo -e "${GREEN}Backend is ready!${NC}"
      return 0
    fi
    attempt=$((attempt + 1))
    sleep 1
  done
  
  echo -e "${RED}Backend did not become ready within ${max_attempts} seconds.${NC}"
  return 1
}

launch_terminal_tabs() {
  local title="$1"
  local frontend_cmd="$2"
  local backend_cmd="$3"
  local database_cmd="$4"
  local backend_port="$5"

  osascript - "$title" "$database_cmd" "$backend_cmd" "$frontend_cmd" <<'APPLESCRIPT'
on run argv
  set projectTitle to item 1 of argv
  set databaseCmd to item 2 of argv
  set backendCmd to item 3 of argv
  set frontendCmd to item 4 of argv

  tell application "Terminal"
    -- Create new window with first tab for database (activate happens automatically)
    set newWindow to do script databaseCmd
    activate
    try
      set custom title of front window to projectTitle
    end try
    try
      set custom title of tab 1 of front window to "Database"
    end try
    
    -- Wait for database command to complete (it's a quick check/start)
    delay 3
    
    -- Create second tab and run backend command
    tell application "System Events"
      tell process "Terminal"
        keystroke "t" using {command down}
      end tell
    end tell
    delay 0.5
    
    tell front window
      do script backendCmd in selected tab
      try
        set custom title of tab 2 of front window to "Backend"
      end try
    end tell
  end tell
end run
APPLESCRIPT
  
  # Wait for backend to be ready before launching frontend
  wait_for_backend "$backend_port"
  
  # Now launch frontend after backend is ready
  osascript - "$title" "$frontend_cmd" <<'APPLESCRIPT'
on run argv
  set projectTitle to item 1 of argv
  set frontendCmd to item 2 of argv

  tell application "Terminal"
    activate
    -- Create third tab and run frontend command
    tell application "System Events"
      tell process "Terminal"
        keystroke "t" using {command down}
      end tell
    end tell
    delay 0.5
    
    tell front window
      do script frontendCmd in selected tab
      try
        set custom title of tab 3 of front window to "Frontend"
      end try
    end tell
  end tell
end run
APPLESCRIPT
}

require_cli "osascript"
require_cli "yarn"
require_cli "mvn"
require_cli "psql"

FRONTEND_CMD="cd \"$SCRIPT_DIR/frontend\" && printf 'Starting Expo frontend...\\n' && yarn start"
BACKEND_CMD="cd \"$SCRIPT_DIR/backend\" && printf 'Starting Spring Boot backend...\\n' && mvn spring-boot:run"
DATABASE_CMD="cd \"$SCRIPT_DIR\" && printf 'Ensuring PostgreSQL is running...\\n' && if psql -U zernach -d rapidphotoupload -c 'SELECT 1;' >/dev/null 2>&1; then printf 'PostgreSQL already running.\\n'; else printf 'Attempting to start PostgreSQL via Homebrew services...\\n'; if command -v brew >/dev/null 2>&1; then brew services start postgresql@17 >/dev/null 2>&1 || brew services start postgresql >/dev/null 2>&1 || printf 'Unable to auto-start PostgreSQL. Please run: brew services start postgresql\\n'; else printf 'Homebrew not found. Please start PostgreSQL manually.\\n'; fi; fi; printf 'Database available at localhost:5432\\nDatabase: rapidphotoupload\\nUsername: zernach\\nPassword: (empty)\\n'"

echo -e "${BLUE}Starting ${PROJECT_NAME} services...${NC}"
launch_terminal_tabs "$PROJECT_NAME" "$FRONTEND_CMD" "$BACKEND_CMD" "$DATABASE_CMD" "8080"

echo -e "${GREEN}All services are launching in a single Terminal window with three tabs.${NC}"
echo -e "${YELLOW}Backend: http://localhost:8080${NC}"
echo -e "${YELLOW}Frontend: Expo will print the dev URL in its tab.${NC}"
echo -e "${YELLOW}Database: PostgreSQL listening on localhost:5432 (database: rapidphotoupload).${NC}"


#!/bin/bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_NAME="Smart Scheduler"

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

launch_terminal_tabs() {
  local title="$1"
  local frontend_cmd="$2"
  local backend_cmd="$3"
  local database_cmd="$4"

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
    set custom title of front window to projectTitle
    set custom title of tab 1 of front window to "Database"
    
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
      set custom title of tab 2 of front window to "Backend"
    end tell
    
    -- Wait for backend to start up
    delay 5
    
    -- Create third tab and run frontend command
    activate
    tell application "System Events"
      tell process "Terminal"
        keystroke "t" using {command down}
      end tell
    end tell
    delay 1
    
    tell front window
      do script frontendCmd in selected tab
      set custom title of tab 3 of front window to "Frontend"
    end tell
  end tell
end run
APPLESCRIPT
}

require_cli "osascript"
require_cli "yarn"
require_cli "dotnet"
require_cli "psql"

FRONTEND_CMD="cd \"$SCRIPT_DIR/frontend\" && printf 'Starting Expo frontend...\\n' && yarn start"
BACKEND_CMD="cd \"$SCRIPT_DIR/backend\" && printf 'Starting .NET backend...\\n' && dotnet run"
DATABASE_CMD="cd \"$SCRIPT_DIR\" && printf 'Ensuring PostgreSQL is running...\\n' && if psql -U dev_user -d smartscheduler_dev -c 'SELECT 1;' >/dev/null 2>&1; then printf 'PostgreSQL already running.\\n'; else printf 'Attempting to start PostgreSQL via Homebrew services...\\n'; if command -v brew >/dev/null 2>&1; then brew services start postgresql@17 >/dev/null 2>&1 || brew services start postgresql >/dev/null 2>&1 || printf 'Unable to auto-start PostgreSQL. Please run: brew services start postgresql\\n'; else printf 'Homebrew not found. Please start PostgreSQL manually.\\n'; fi; fi; printf 'Database available at localhost:5432\\nDatabase: smartscheduler_dev\\nUsername: dev_user\\nPassword: dev_password\\n'"

echo -e "${BLUE}Starting ${PROJECT_NAME} services...${NC}"
launch_terminal_tabs "$PROJECT_NAME" "$FRONTEND_CMD" "$BACKEND_CMD" "$DATABASE_CMD"

echo -e "${GREEN}All services are launching in a single Terminal window with three tabs.${NC}"
echo -e "${YELLOW}Backend: http://localhost:5000${NC}"
echo -e "${YELLOW}Frontend: Expo will print the dev URL in its tab.${NC}"
echo -e "${YELLOW}Database: PostgreSQL listening on localhost:5432 (database: smartscheduler_dev).${NC}"


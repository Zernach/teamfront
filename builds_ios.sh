#!/bin/bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

if [[ "${OSTYPE:-}" != darwin* ]]; then
  echo -e "${RED}This script currently supports macOS Terminal only.${NC}"
  exit 1
fi

require_cli() {
  local cli_name="$1"
  if ! command -v "$cli_name" >/dev/null 2>&1; then
    echo -e "${RED}Missing required command: ${cli_name}.${NC}"
    exit 1
  fi
}

PROJECTS=(
  "smart-scheduler"
  "invoice-me"
  "rapid-photo-upload"
)

# Build commands for each project
# Use env command to set PORT and RCT_METRO_PORT inline to ensure they're passed to Metro
SMART_SCHEDULER_CMD="cd \"$SCRIPT_DIR/smart-scheduler/frontend\" && printf 'Building Smart Scheduler iOS app on port 8081...\\n' && yarn install && env PORT=8081 RCT_METRO_PORT=8081 yarn ios"
INVOICE_ME_CMD="cd \"$SCRIPT_DIR/invoice-me/frontend\" && printf 'Building Invoice Me iOS app on port 8082...\\n' && yarn install && env PORT=8082 RCT_METRO_PORT=8082 yarn ios"
RAPID_PHOTO_UPLOAD_CMD="cd \"$SCRIPT_DIR/rapid-photo-upload/frontend\" && printf 'Building Rapid Photo Upload iOS app on port 8083...\\n' && yarn install && env PORT=8083 RCT_METRO_PORT=8083 yarn ios"

launch_terminal_tabs() {
  local cmd1="$1"
  local cmd2="$2"
  local cmd3="$3"

  osascript - "$cmd1" "$cmd2" "$cmd3" <<'APPLESCRIPT'
on run argv
  set cmd1 to item 1 of argv
  set cmd2 to item 2 of argv
  set cmd3 to item 3 of argv

  tell application "Terminal"
    -- Create new window with first tab
    set newWindow to do script cmd1
    activate
    try
      set custom title of front window to "iOS Builds"
    end try
    try
      set custom title of tab 1 of front window to "Smart Scheduler"
    end try
    
    -- Wait a moment before creating next tab
    delay 1
    
    -- Create second tab
    tell application "System Events"
      tell process "Terminal"
        keystroke "t" using {command down}
      end tell
    end tell
    delay 0.5
    
    tell front window
      do script cmd2 in selected tab
      try
        set custom title of tab 2 of front window to "Invoice Me"
      end try
    end tell
    
    -- Wait a moment before creating next tab
    delay 1
    
    -- Create third tab
    tell application "System Events"
      tell process "Terminal"
        keystroke "t" using {command down}
      end tell
    end tell
    delay 0.5
    
    tell front window
      do script cmd3 in selected tab
      try
        set custom title of tab 3 of front window to "Rapid Photo Upload"
      end try
    end tell
  end tell
end run
APPLESCRIPT
}

require_cli "osascript"
require_cli "yarn"

echo -e "${BLUE}Launching iOS builds in separate Terminal tabs...${NC}"
launch_terminal_tabs "$SMART_SCHEDULER_CMD" "$INVOICE_ME_CMD" "$RAPID_PHOTO_UPLOAD_CMD"

echo -e "${GREEN}All iOS builds are launching in a new Terminal window with three tabs.${NC}"
echo -e "${YELLOW}Each tab will run 'yarn install' followed by 'yarn ios' for its respective project.${NC}"

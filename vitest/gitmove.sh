#!/bin/bash

######################## IMPORTANT PLEASE READ ##########################
##              Do not execute the script with terminal                ##
##              This helps to keep the PWD path consistent             ##     
##                                                                     ##
##              Use "npm run gitmove [path to module]"                 ##
##              ---------------------------------------------          ##
##              Example: npm run gitmove test/modules/commons          ##
#########################################################################

# color codes (see https://en.wikipedia.org/wiki/ANSI_escape_code)
RED='\033[0;31m'
GREEN='\033[0;32m'
COL_ESC='\033[0m'
MODULE_PATH="${test#/test}$1"
TEST_FOLDER="$PWD/test"
VITEST_FOLDER="$PWD/vitest"

if [ $# -eq 0 ]
  then
    printf "No path specified. Usage: npm run gitmove [Module Path] \n"
    exit 0
fi

if [ ! -d "$PWD/$MODULE_PATH" ]; then
    printf "${RED}[Directory not found] -> $PWD/$MODULE_PATH ${COL_ESC}\n"
    exit 1
fi

echo "Applying git mv..."

find "$PWD/$MODULE_PATH" -name '*.test.js' -print0 | while IFS= read -r -d '' testFilePath; do       
    localModuleFilePath="${testFilePath#"$PWD"/test/}"
    mkdir -p "$VITEST_FOLDER/$localModuleFilePath"
    git mv "$TEST_FOLDER/$localModuleFilePath" "$VITEST_FOLDER/$localModuleFilePath"
    printf "\n${GREEN} git mv test/$localModuleFilePath -> vitest/$localModuleFilePath  ${COL_ESC}\n"
done

printf "\n${GREEN}[SUCCESS] Operation finished: \n${VITEST_FOLDER}  ${COL_ESC}\n"

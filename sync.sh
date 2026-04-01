#!/bin/bash
# Sync repo-template files to downstream repos
# Run from the repo-template directory: ./sync.sh

set -e
cd "$(dirname "$0")"

FILES="PROJECT_PROTOCOL.md docs/architecture-patterns.md docs/branching.md docs/versioning.md"
REPOS=$(jq -r '.repos[]' .github/sync-config.json)
BRANCH="sync/repo-template-$(date +%Y%m%d)"

for REPO in $REPOS; do
    echo "=== $REPO ==="
    CLONE_DIR="/tmp/sync-$(echo $REPO | tr '/' '-')"
    rm -rf "$CLONE_DIR"

    git clone --depth 1 "https://github.com/${REPO}.git" "$CLONE_DIR" 2>/dev/null || { echo "  SKIP: clone failed"; continue; }

    CHANGED=false
    for FILE in $FILES; do
        if [ -f "$FILE" ]; then
            mkdir -p "$CLONE_DIR/$(dirname $FILE)"
            if [ ! -f "$CLONE_DIR/$FILE" ] || ! diff -q "$FILE" "$CLONE_DIR/$FILE" > /dev/null 2>&1; then
                cp "$FILE" "$CLONE_DIR/$FILE"
                CHANGED=true
                echo "  Updated: $FILE"
            fi
        fi
    done

    if [ "$CHANGED" = false ]; then
        echo "  No changes"
        rm -rf "$CLONE_DIR"
        continue
    fi

    cd "$CLONE_DIR"
    git config user.name "repo-template-sync"
    git config user.email "sync@your-domain.com"
    git checkout -b "$BRANCH" 2>/dev/null || { echo "  SKIP: branch exists"; cd "$(dirname "$0")"; rm -rf "$CLONE_DIR"; continue; }
    git add -A
    git commit -m "Sync from repo-template ($(date +%Y-%m-%d))" || { cd "$(dirname "$0")"; rm -rf "$CLONE_DIR"; continue; }
    git push origin "$BRANCH" 2>/dev/null || { echo "  SKIP: push failed"; cd "$(dirname "$0")"; rm -rf "$CLONE_DIR"; continue; }

    gh pr create --repo "$REPO" --base main --head "$BRANCH" \
        --title "Sync from repo-template" \
        --body "Automated sync of shared files from repo-template." \
        2>/dev/null && echo "  PR created" || echo "  PR exists or failed"

    cd "$(dirname "$0")"
    rm -rf "$CLONE_DIR"
done

echo "=== Done ==="

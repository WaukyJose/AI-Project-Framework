#!/bin/bash

echo "======================================="
echo " AI Project Framework - Git Verification"
echo "======================================="
echo

echo "Repository:"
basename "$(git rev-parse --show-toplevel)"
echo

echo "Repository Status"
git status

echo
echo "Latest Commit"
git log --oneline -1

echo
echo "Current Branch"
git branch --show-current

echo
echo "Current Commit Hash"
git rev-parse --short HEAD

echo
echo "Remotes"
git remote -v

echo
echo "======================================="
echo "Verification Complete"
echo "======================================="
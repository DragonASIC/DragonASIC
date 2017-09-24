#!/bin/bash

# NOTE: This script is Work in Progress and not ready for use.

# Exit on error
set -ev

if [ "$TRAVIS_SECURE_ENV_VARS" != "true" ] || [ "$TRAVIS_BRANCH" != "master" ] || [ "$TRAVIS_PULL_REQUEST" != "false" ]; then
	exit 0
fi

git config remote.origin.fetch "+refs/heads/*:refs/remotes/origin/*"
git fetch
git config user.name "Travis CI"
git config user.email "info@tsg.ne.jp"
git branch gh-pages origin/gh-pages
git symbolic-ref HEAD refs/heads/gh-pages
git checkout fef0b9b1f882c1817ac2f16b07eceaa1f9c56ce7 .gitignore
git add --all
git commit -m "Update build - ${TRAVIS_COMMIT}"
git push "https://${GH_TOKEN}@github.com/hakatashi/DragonASIC.git" gh-pages:gh-pages --follow-tags > /dev/null 2>&1

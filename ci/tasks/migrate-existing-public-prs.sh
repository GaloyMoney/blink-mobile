#!/bin/bash

set -eu

. pipeline-tasks/ci/tasks/helpers.sh

public_version=$(cat ./public-version/version)

pushd deployments
git remote remove origin
git remote add origin https://$GH_TOKEN@github.com/GaloyMoney/galoy-mobile-deployments
git checkout main
git pull origin main
echo "Deployments (main) is upto date."

gh pr list --state open --json number,headRefName --label public --label galoybot | jq -c '.[]' | while read item; do
  gh_pr_number=$(echo $item | jq -r '.number')

  # Rebase
  gh_pr_branch=$(echo $item | jq -r '.headRefName')
  git fetch --all
  git checkout $gh_pr_branch
  git pull origin $gh_pr_branch
  git rebase main -X theirs
  git push origin $gh_pr_branch --force
  echo "Rebased and pushed $gh_pr_branch"
  gh pr comment $gh_pr_number --body "✅ Rebased PR to match Public Release \`$public_version\`"

  # Update PR Body
  gh_pr_branch_version=$(echo $item | jq -r '.headRefName' | cut -d "-" -f2)

  pushd ../repo
  git cliff --config ../pipeline-tasks/ci/config/vendor/git-cliff.toml $public_version..$gh_pr_branch_version > ../changelog
  export CHANGELOG=$(cat ../changelog)
  popd

  export CUSTOM_RELEASE_NOTES=$(get_custom_release_notes public $gh_pr_branch_version open)
  export CLOSES=$(get_closes public $gh_pr_branch_version)
  export TRACK="Public Track (phased release)"
  export OLD_VERSION="$public_version"
  export NEW_VERSION="$gh_pr_branch_version"

  envsubst < ../pipeline-tasks/ci/templates/deployments-pr-body.md > ../body.md

  echo "Editing PR #$gh_pr_number with fresh body:"
  echo "----------------------------------------------------------------------"
  cat ../body.md
  echo "----------------------------------------------------------------------\n"

  gh pr edit $gh_pr_number --body-file ../body.md
done

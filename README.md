# Get App Token

This GitHub Action retrieves a GitHub App installation token for use in workflows.

## Configuration
Test

### Create a GitHub Application

1. [Create a GitHub Application](https://docs.github.com/developers/apps/building-github-apps/creating-a-github-app) in your organization, scoped to whichever permissions you need your token to have.

1. After you've created the application, make note of the **App ID**.

1. Locate the **Private keys** section. Generate and download a private key.

### Install the GitHub Application

[Install the app](https://docs.github.com/developers/apps/managing-github-apps/installing-github-apps), granting access to the repository where you want to use this action.

### Add repository secrets

In the repository where you want to use this action, [create two encrypted secrets](https://docs.github.com/actions/security-guides/encrypted-secrets#creating-encrypted-secrets-for-a-repository) as follows.

| Secret name               | Value                                            |
|---------------------------|--------------------------------------------------|
| `APPLICATION_ID`          | The **App ID** of your GitHub Application        |
| `APPLICATION_PRIVATE_KEY` | The contents of the private key you generated and downloaded. You can open the file in a text editor and copy/paste. |

### Use the action in a workflow

This action has the following inputs and outputs

#### Required inputs

| Input                     | Description                |
|---------------------------|----------------------------|
| `application-id`          | The GitHub App ID          |
| `application-private-key` | The GitHub App private key |

#### Outputs

| Output      | Description                     |
|-------------|---------------------------------|
| `app-token` | The token retrieved from GitHub |

### Example

```yml
name: Test action

on:
  workflow_dispatch:

jobs:
  test:
    runs-on: ubuntu-latest

    steps:
      - name: Get token
        id: get_token
        uses: microsoftgraph/get-app-token@main
        with:
          application-id: ${{ secrets.APPLICATION_ID }}
          application-private-key: ${{ secrets.APPLICATION_PRIVATE_KEY }}

      - name: Use token
        uses: actions/github-script@v5
        with:
          github-token: ${{ steps.get_token.outputs.app-token }}
          script: |
            const repo = await github.rest.repos.get(context.repo);
            console.log(JSON.stringify(repo, null, 2));
```

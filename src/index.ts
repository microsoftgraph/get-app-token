// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT license.

import * as core from '@actions/core';
import * as github from '@actions/github';
import * as jwt from 'jsonwebtoken';
import { Endpoints } from '@octokit/types';

type AppInstallationResponse = Endpoints['GET /repos/{owner}/{repo}/installation']['response'];
type AppInstallTokenResponse = Endpoints['POST /app/installations/{installation_id}/access_tokens']['response'];

async function run(): Promise<void> {
  try {
    // Add a repository secret called ACTIONS_STEP_DEBUG set to true to
    // see any core.info output in the logs
    const privateKey = core.getInput('application-private-key', { required: true });
    const applicationId = core.getInput('application-id', { required: true });

    core.info(`Application ID: ${applicationId}`);

    const installToken = await getAppInstallToken(privateKey, applicationId);
    core.setSecret(installToken);
    core.setOutput('app-token', installToken);
    core.info(JSON.stringify(installToken));
  } catch (error) {
    function isError(candidate: any): candidate is Error {
      return candidate.isError === true;
    }

    if (isError(error)) {
      core.error(error);
      core.setFailed(error.message);
    } else {
      core.error(JSON.stringify(error));
      core.setFailed('An error occurred.');
    }
  }
}

async function getAppInstallToken(privateKey: string, applicationId: string): Promise<string> {
  const now = Math.floor(Date.now() / 1000);

  const payload = {
    iat: now,
    exp: now + 60,
    iss: applicationId
  };

  const token = jwt.sign(payload, privateKey, { algorithm: 'RS256'});

  const client = github.getOctokit(token);

  core.info(`Getting installation for ${github.context.repo.repo} in the ${github.context.repo.owner} org`);

  const installation: AppInstallationResponse = await client.request('GET /repos/{owner}/{repo}/installation',
  {
    owner: github.context.repo.owner,
    repo: github.context.repo.repo
  });

  core.info(`Installation ID: ${installation.data.id}`);

  const installToken: AppInstallTokenResponse = await client.request('POST /app/installations/{installation_id}/access_tokens', {
    installation_id: installation.data.id
  });

  return installToken.data.token;
}

run();

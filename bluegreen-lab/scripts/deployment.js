import { execFileSync } from 'child_process';
import { runCommand } from './command';
import { checkHealth } from './health-check';

const VERSIONS = {
  blue: 'V1',
  green: 'V1',
};

const CONTAINERS = {
  blue: 'bg-blue',
  green: 'bg-green',
};

export async function deploy(target, version) {
  if (!['blue', 'green'].includes(target)) {
    throw new Error(`Invalid deployment target: ${target}`);
  }

  if (!['V1', 'V2', 'V3'].includes(version)) {
    throw new Error(`Invalid application version: ${version}`);
  }

  console.log(`\nDeploying ${target} with ${version}`);

  const nextVersions = {
    ...VERSIONS,
    [target]: version,
  };

  const env = {
    ...process.env,
    BLUE_VERSION: nextVersions.blue,
    
    GREEN_VERSION: nextVersions.green,
  };

  await runCommand(
    'docker',
    [
      'compose',
      'up',
      '-d',
      '--no-deps',
      '--force-recreate',
      target,
    ],
    { env }
  );

  await checkHealth(target);

  const container = CONTAINERS[target];

  const configuredEnv = execFileSync(
    'docker',
    [
      'inspect',
      '--format',
      '{{range .Config.Env}}{{println .}}{{end}}',
      container,
    ],
    { encoding: 'utf8' }
  );

  if (!configuredEnv.split(/\r?\n/).includes(`APP_VERSION=${version}`)) {
    throw new Error(
      `${target} container does not have APP_VERSION=${version}`
    );
  }

  VERSIONS[target] = version;

  console.log(`${target} successfully deployed with ${version}`);
}

export function getVersions() {
  return { ...VERSIONS };
}
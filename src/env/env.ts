import { devEnv } from '#src/env/env.dev.js'
import { e2eEnv } from '#src/env/env.e2e.js'
import type { AppEnv, EnvName } from '#src/env/env.model.js'
import { prodEnv } from '#src/env/env.prod.js'

/** Picks the environment named by APP_ENV. Falls back to dev when it is unset. */
export function resolveEnv(name: string | undefined): AppEnv {
  if (name === undefined || name === '') {
    return devEnv
  }

  if (!isEnvName(name)) {
    const known = Object.keys(environments).join(', ')

    throw new Error(`Unknown APP_ENV "${name}". Known environments: ${known}.`)
  }

  return environments[name]
}

function isEnvName(name: string): name is EnvName {
  return Object.hasOwn(environments, name)
}

const environments: Record<EnvName, AppEnv> = {
  dev: devEnv,
  e2e: e2eEnv,
  prod: prodEnv,
}

export const env = resolveEnv(process.env.APP_ENV)

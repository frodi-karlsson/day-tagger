export interface AppEnv {
  hasComponentTestingRoutesEnabled: boolean
  name: EnvName
}

export type EnvName = 'dev' | 'e2e' | 'prod'

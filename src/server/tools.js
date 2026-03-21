import { registerStrategyTools } from './tools.strategy.js';
import { registerHandoffTools } from './tools.handoff.js';
import { registerActionTools } from './tools.actions.js';

export function registerTools(server, state) {
  registerStrategyTools(server, state);
  registerHandoffTools(server, state);
  registerActionTools(server, state);

  return server;
}


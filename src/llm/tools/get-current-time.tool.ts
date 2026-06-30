import { AgentTool } from './tool.interface';

export const getCurrentTimeTool: AgentTool = {
  name: 'get_current_time',
  description: 'Devuelve la fecha y la hora actual del servidor en formato ISO 8601.',
  parameters: {
    type: 'object',
    properties: {},
    required: [],
  },
  execute: async () => new Date().toISOString(),
};

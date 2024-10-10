import { Definition, Step } from 'sequential-workflow-model';
import { VariableDefinitions } from 'sequential-workflow-editor-model';

export interface MyDefinition extends Definition {
  properties: {
    inputs: VariableDefinitions;
  };
}

export interface LogStep extends Step {
  type: 'log';
  componentType: 'task';
  properties: {
    message: string;
  };
}

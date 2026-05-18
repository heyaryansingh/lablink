import type { AiProviderConfig, AiProviderName } from '../config/types';

export interface AiRequest {
  system: string;
  prompt: string;
  feature: string;
  maxTokens?: number;
  temperature?: number;
}

export interface AiTextResult {
  provider: AiProviderName;
  model: string;
  text: string;
  raw?: unknown;
}

export interface AiJsonResult<T> extends AiTextResult {
  json: T;
}

export interface AiProvider {
  readonly name: AiProviderName;
  readonly model: string;
  generateText(request: AiRequest): Promise<AiTextResult>;
}

export interface AiProviderFactoryContext {
  config: AiProviderConfig;
  apiKey?: string;
}

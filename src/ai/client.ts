import type { LabLinkConfig, AiProviderName } from '../config/types';
import type { CredentialStore } from '../utils/credentials';
import { parseJsonObject } from './json';
import { createProvider } from './providers';
import type { AiJsonResult, AiProvider, AiRequest, AiTextResult } from './types';

export class AiClient {
  private provider: AiProvider | null = null;

  constructor(
    private readonly config: LabLinkConfig,
    private readonly credentials: CredentialStore,
  ) {}

  async generateText(request: AiRequest): Promise<AiTextResult> {
    const provider = await this.getProvider();
    return provider.generateText(request);
  }

  async generateJson<T>(request: AiRequest, fallback: T): Promise<AiJsonResult<T>> {
    const result = await this.generateText(request);
    return {
      ...result,
      json: parseJsonObject<T>(result.text, fallback),
    };
  }

  private async getProvider(): Promise<AiProvider> {
    if (this.provider) return this.provider;
    const name = await this.resolveProviderName();
    const providerConfig = this.config.ai.providers[name] ?? this.config.ai.providers.mock;
    if (!providerConfig) throw new Error(`No AI provider config found for ${name}`);

    const apiKey =
      providerConfig.apiKeyEnv && process.env[providerConfig.apiKeyEnv]
        ? process.env[providerConfig.apiKeyEnv]
        : await this.credentials.get('lablink.ai', name);

    this.provider = createProvider(name, providerConfig, apiKey ?? undefined);
    return this.provider;
  }

  private async resolveProviderName(): Promise<AiProviderName> {
    const configured = this.config.ai.defaultProvider;
    if (configured !== 'auto') return configured;
    if (process.env.ANTHROPIC_API_KEY || (await this.credentials.get('lablink.ai', 'anthropic'))) return 'anthropic';
    if (process.env.OPENAI_API_KEY || (await this.credentials.get('lablink.ai', 'openai'))) return 'openai';
    return 'mock';
  }
}

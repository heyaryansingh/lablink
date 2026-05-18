import Anthropic from '@anthropic-ai/sdk';
import OpenAI from 'openai';
import type { AiProviderConfig, AiProviderName } from '../config/types';
import type { AiProvider, AiProviderFactoryContext, AiRequest, AiTextResult } from './types';

export class AnthropicProvider implements AiProvider {
  readonly name = 'anthropic' as const;
  readonly model: string;
  private readonly client: Anthropic;

  constructor(context: AiProviderFactoryContext) {
    this.model = context.config.model;
    this.client = new Anthropic({ apiKey: context.apiKey });
  }

  async generateText(request: AiRequest): Promise<AiTextResult> {
    const response = await this.client.messages.create({
      model: this.model,
      max_tokens: request.maxTokens ?? 4096,
      temperature: request.temperature ?? 0.2,
      system: request.system,
      messages: [{ role: 'user', content: request.prompt }],
    });

    const text = response.content
      .filter((part) => part.type === 'text')
      .map((part) => part.text)
      .join('\n');

    return { provider: this.name, model: this.model, text, raw: response };
  }
}

export class OpenAiProvider implements AiProvider {
  readonly name = 'openai' as const;
  readonly model: string;
  private readonly client: OpenAI;
  private readonly reasoningEffort?: AiProviderConfig['reasoningEffort'];

  constructor(context: AiProviderFactoryContext) {
    this.model = context.config.model;
    this.reasoningEffort = context.config.reasoningEffort;
    this.client = new OpenAI({
      apiKey: context.apiKey,
      baseURL: context.config.baseUrl,
      timeout: context.config.timeoutMs,
    });
  }

  async generateText(request: AiRequest): Promise<AiTextResult> {
    const input = [
      request.system ? `System:\n${request.system}` : '',
      `User:\n${request.prompt}`,
    ]
      .filter(Boolean)
      .join('\n\n');

    const response = await this.client.responses.create({
      model: this.model,
      input,
      max_output_tokens: request.maxTokens ?? 4096,
      temperature: request.temperature ?? 0.2,
      ...(this.reasoningEffort && this.reasoningEffort !== 'none'
        ? { reasoning: { effort: this.reasoningEffort === 'xhigh' ? 'high' : this.reasoningEffort } }
        : {}),
    } as any);

    return {
      provider: this.name,
      model: this.model,
      text: response.output_text ?? '',
      raw: response,
    };
  }
}

export class LocalOpenAiCompatibleProvider implements AiProvider {
  readonly name = 'local' as const;
  readonly model: string;
  private readonly baseUrl: string;

  constructor(context: AiProviderFactoryContext) {
    this.model = context.config.model;
    this.baseUrl = context.config.baseUrl ?? 'http://localhost:11434/v1';
  }

  async generateText(request: AiRequest): Promise<AiTextResult> {
    const response = await fetch(`${this.baseUrl.replace(/\/$/, '')}/chat/completions`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        model: this.model,
        temperature: request.temperature ?? 0.2,
        max_tokens: request.maxTokens ?? 4096,
        messages: [
          { role: 'system', content: request.system },
          { role: 'user', content: request.prompt },
        ],
      }),
    });
    if (!response.ok) {
      throw new Error(`Local AI request failed: ${response.status} ${response.statusText}`);
    }
    const json = (await response.json()) as any;
    return {
      provider: this.name,
      model: this.model,
      text: json.choices?.[0]?.message?.content ?? '',
      raw: json,
    };
  }
}

export function createProvider(name: AiProviderName, config: AiProviderConfig, apiKey?: string): AiProvider {
  switch (name) {
    case 'anthropic':
      return new AnthropicProvider({ config, apiKey });
    case 'openai':
      return new OpenAiProvider({ config, apiKey });
    case 'local':
    case 'custom':
      return new LocalOpenAiCompatibleProvider({ config, apiKey });
    default:
      throw new Error(`Unsupported AI provider: ${name}`);
  }
}

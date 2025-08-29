import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { TAIRequiredMarketData, TAIOutcomeResult } from '../common/types';

@Injectable()
export class AIService {
  private readonly logger = new Logger(AIService.name);

  private URL = 'https://api.perplexity.ai/chat/completions';
  private headers = {
    Authorization: '',
    'Content-Type': 'application/json',
  };

  constructor(private config: ConfigService) {
    const PERPLEXITY_API_KEY =
      this.config.getOrThrow<string>('PERPLEXITY_API_KEY');
    this.headers.Authorization = `Bearer ${PERPLEXITY_API_KEY}`;
  }

  async askAIResolver({
    question,
    askedAt,
    outcomes,
  }: TAIRequiredMarketData): Promise<TAIOutcomeResult> {
    this.logger.log(
      `Trying to resolve "${question}", with outcomes ${outcomes.join(', ')}, asked at ${askedAt.toLocaleString()}`,
    );
    try {
      const response = await fetch(this.URL, {
        method: 'POST',
        headers: this.headers,
        body: JSON.stringify({
          model: 'sonar-pro',
          messages: [
            {
              role: 'user',
              content: `
  <predictionMarketQuestion>${question}</predictionMarketQuestion>
  <predictionMarketDateAsked>${askedAt.toISOString()}</predictionMarketDateAsked>
  <predictionMarketOutcomes>${outcomes.map((outcome) => `<predictionMarketOutcome>${outcome}</predictionMarketOutcome>`)}</predictionMarketOutcomes>
  `,
            },
          ],
          response_format: {
            type: 'json_schema',
            json_schema: {
              schema: {
                type: 'object',
                properties: {
                  answeredOutcome: { type: 'string' },
                  voided: { type: 'boolean' },
                },
                required: ['answeredOutcome', 'voided'],
              },
            },
          },
          search_after_date_filter: askedAt.toLocaleDateString(),
          web_search_options: {
            search_context_size: 'medium',
          },
        }),
      });

      const data = await response.json();
      const struct = JSON.parse(data.choices[0].message.content);

      const outcomeIndex = outcomes.findIndex((o) =>
        struct?.answeredOutcome
          ?.toLocaleLowerCase()
          ?.includes(o.toLocaleLowerCase()),
      );

      if (outcomeIndex < 0) {
        return {
          outcome: '',
          outcomeIndex,
          voided: true,
        };
      }

      const result = {
        outcome: outcomes[outcomeIndex],
        outcomeIndex,
        voided: struct?.voided || false,
      };

      this.logger.log(
        `Received response from AI: outcome: ${result.outcome}, is voided: ${result.voided}`,
      );
      return result;
    } catch (error) {
      this.logger.error(`Failed to answer question ${question}:`, error);
      return null;
    }
  }
}

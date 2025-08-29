import type { Request } from 'express';

import { Reflector } from '@nestjs/core';
import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  BadRequestException,
} from '@nestjs/common';
import { Observable } from 'rxjs';

import { DISABLE_CHAIN_CONTEXT } from '@decorators';
import { Web3Service } from '@/src/web3';

@Injectable()
export class ChainContextInterceptor implements NestInterceptor {
  constructor(
    private readonly reflector: Reflector,
    private web3: Web3Service,
  ) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest<Request>();
    const chainId = request.query.chainId;

    const disableChainContext = this.reflector.get<boolean>(
      DISABLE_CHAIN_CONTEXT,
      context.getHandler(),
    );

    if (disableChainContext) {
      return next.handle();
    }

    if (!chainId) {
      throw new BadRequestException('chainId is required');
    }

    const chainConfig = this.web3.chainConfig[Number(chainId)];

    if (!chainConfig) {
      throw new BadRequestException(`Unsupported chainId: ${chainId}`);
    }

    const client = this.web3.getClientById(chainConfig.chainId);

    request.chainContext = { ...chainConfig, client };

    return next.handle();
  }
}

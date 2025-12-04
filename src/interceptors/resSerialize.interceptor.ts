import { plainToInstance } from 'class-transformer';
import { map, Observable } from 'rxjs';

import { CallHandler, ExecutionContext, NestInterceptor, UseInterceptors } from '@nestjs/common';

interface ClassConstructor {
  new(...args: any[]): {};
}

interface ResponseData {
  statusCode: string;
  message: string;
  data?: any;
}

export function Serialize(dto: ClassConstructor) {
  return UseInterceptors(new ResSerializerInterceptor(dto));
}

export class ResSerializerInterceptor implements NestInterceptor {
  constructor(private dto: any) {}

  intercept(
    context: ExecutionContext,
    next: CallHandler<any>,
  ): Observable<any> | Promise<Observable<any>> {
    return next.handle().pipe(
      map((resData: ResponseData) => {
        const { statusCode, message, data } = resData;
        const serializedData = plainToInstance(this.dto, data, {
          excludeExtraneousValues: true,
        });
        return { statusCode, message, data: serializedData };
      }),
    );
  }
}

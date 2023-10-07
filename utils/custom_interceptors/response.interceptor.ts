import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { GraphQLError } from 'graphql';

@Injectable()
export class FormatResponseInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(
      catchError((error) => {
        console.error(error.reason);
        const errorMessage: string = error.reason || 'Internal server error';

        return throwError(() => {
          return new GraphQLError(errorMessage);
        });
      }),
      map((data) => data),
    );
  }
}

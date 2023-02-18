## Backend common package

### CommonModule

> Append the `CommonModule.forRoot()` into your current module import array. This will allow you to use Guards, Services, etc.

```js
import { CommonModule } from 'backend-common-package';
```

```js
CommonModule.forRoot({
  cacheConfig?: { store: example_redisStore },
  kafkaConfig?:  {
    transport: Transport.KAFKA,
    options: {
      client: {
          clientId: process.env.CLIENT_ID,
            brokers: [process.env.BROKERS],
      },
      consumer: {
          groupId: process.env.GROUP_ID,
      },
    },,
}),
```

#### Guards

> Request headers:\
> ` key: otp-target-type, value: 'email' or 'phone'`\
> ` key: otp-target, value: 'a@a.com' or '+51987654321' for example`\
> ` key: otp-new-uuid-for-this-operation, value: 'b73e247c-1fa7-4ecb-a0a5-ac5e7db5bfd2' for example`

```js
import {
  SendOperationOtpGuard,
  ValidatedOperationOtpGuard,
} from 'backend-common-package';
```

```js
@UseGuards(SendOperationOtpGuard, ValidatedOperationOtpGuard)
```

#### Service

```js
import { GuardsService } from 'backend-common-package';
```

```js
constructor(
  private readonly guardsService: GuardsService,
) {}
```

```js
await this.guardsService.validateOperationOtp(input: {
  operationUUID: string;
  otp: string;
}),
```

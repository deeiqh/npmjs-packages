/* eslint-disable @typescript-eslint/no-var-requires */
const { CommonModule } = require('./dist/common.module');
const {
  SendOperationOtpGuard,
} = require('./dist/otp/guards/send-operation-otp.guard');
const {
  ValidatedOperationOtpGuard,
} = require('./dist/otp/guards/validated-operation-otp.guard');
const { OtpService } = require('./dist/otp/otp.service');

module.exports = {
  CommonModule,
  SendOperationOtpGuard,
  ValidatedOperationOtpGuard,
  OtpService,
};

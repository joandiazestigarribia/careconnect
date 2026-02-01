import { SetMetadata } from '@nestjs/common';

export const THROTTLER_SKIP_METADATA = 'throttler:skip';

export const SkipThrottle = () => SetMetadata(THROTTLER_SKIP_METADATA, true);

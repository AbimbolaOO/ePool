import { PartialType } from '@nestjs/swagger';

import { CreatePoolFileDto } from './create-pool-file.dto';

export class UpdatePoolFileDto extends PartialType(CreatePoolFileDto) {}

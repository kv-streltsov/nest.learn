import { Injectable } from '@nestjs/common';
import { SecurityDevicesRepository } from './repositories/mongodb/security-devices.repository';

@Injectable()
export class SecurityDevicesService {
  constructor(private securityDevicesRepository: SecurityDevicesRepository) {}
}

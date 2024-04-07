import { Vector } from '@slimevr/common';
import { RawCalibrationDataType } from '../constants';
import { PacketWithSensorId } from './Packet';

export class ServerBoundRawCalibrationDataPacket extends PacketWithSensorId {
  readonly dataType: RawCalibrationDataType;
  readonly data: Vector;

  constructor(number: bigint, data: Buffer) {
    super(number, ServerBoundRawCalibrationDataPacket.type, data.readUintBE(0, 1) & 0xff);

    this.dataType = data.readInt32BE(1);

    this.data = [data.readFloatBE(5), data.readFloatBE(9), data.readFloatBE(13)];
  }

  static get type() {
    return 6;
  }

  override toString() {
    return `ServerBoundRawCalibrationDataPacket{sensorId: ${this.sensorId}, dataType: ${
      RawCalibrationDataType[this.dataType]
    }, data: ${this.data}}`;
  }
}

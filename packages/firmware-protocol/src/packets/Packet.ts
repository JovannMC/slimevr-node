export abstract class Packet {
  // Not implemented
  static readonly SERIAL = 11;
  static readonly ROTATION_2 = 16;
  static readonly PROTOCOL_CHANGE = 200;

  constructor(readonly type: number) {}

  abstract encode(num: bigint): Buffer;
}

export abstract class PacketWithSensorId extends Packet {
  constructor(type: number, readonly sensorId: number) {
    super(type);
  }
}

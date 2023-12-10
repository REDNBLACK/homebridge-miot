const FreshAirSystemDevice = require('../FreshAirSystemDevice.js');
const Constants = require('../../../constants/Constants.js');
const PropFormat = require('../../../constants/PropFormat.js');
const PropUnit = require('../../../constants/PropUnit.js');
const PropAccess = require('../../../constants/PropAccess.js');


class DmakerAirfreshT2017 extends FreshAirSystemDevice {
  constructor(miotDevice, name, logger) {
    super(miotDevice, name, logger);
  }


  /*----------========== DEVICE INFO ==========----------*/

  getDeviceName() {
    return 'Xiaomi Air Purifier MJXFJ-300-G1';
  }

  getMiotSpecUrl() {
    return 'https://miot-spec.org/miot-spec-v2/instance?type=urn:miot-spec-v2:device:air-fresh:0000A012:dmaker-t2017:2';
  }


  /*----------========== CONFIG ==========----------*/

  requiresMiCloud() {
    return true;
  }


  /*----------========== METADATA ==========----------*/

  initDeviceServices() {
    this.createServiceByString('{"siid":2,"type":"urn:miot-spec-v2:service:air-fresh:00007822:dmaker-t2017:1","description":"Air Fresh"}');
    this.createServiceByString('{"siid":6,"type":"urn:miot-spec-v2:service:physical-controls-locked:00007807:dmaker-t2017:1","description":"Physical Control Locked"}');
    this.createServiceByString('{"siid":7,"type":"urn:miot-spec-v2:service:air-fresh-favorite:000078F0:dmaker-t2017:1","description":"Air Fresh Favorite"}');
    this.createServiceByString('{"siid":8,"type":"urn:miot-spec-v2:service:screen:00007806:dmaker-t2017:1","description":"Screen"}');
    this.createServiceByString('{"siid":9,"type":"urn:miot-spec-v2:service:alarm:00007804:dmaker-t2017:1","description":"Alarm"}');
    this.createServiceByString('{"siid":3,"type":"urn:miot-spec-v2:service:environment:0000780A:dmaker-t2017:1","description":"Environment"}');
    this.createServiceByString('{"siid":4,"type":"urn:miot-spec-v2:service:filter:0000780B:dmaker-t2017:1","description":"Medium Efficiency Filter"}');
    this.createServiceByString('{"siid":5,"type":"urn:miot-spec-v2:service:filter:0000780B:dmaker-t2017:1","description":"High Efficiency Filter"}');
  }

  initDeviceProperties() {
    this.addPropertyByString('air-fresh:on', '{"siid":2,"piid":1,"type":"urn:miot-spec-v2:property:on:00000006:dmaker-t2017:1","description":"Switch Status","format":"bool","access":["read","write","notify"]}');
    this.addPropertyByString('environment:pm2.5-density', '{"siid":3,"piid":1,"type":"urn:miot-spec-v2:property:pm2.5-density:00000034:dmaker-t2017:1","description":"PM2.5 Density","format":"float","access":["read","notify"],"valueRange":[0,999,1]}');
    this.addPropertyByString('environment:temperature', '{"siid":3,"piid":2,"type":"urn:miot-spec-v2:property:temperature:00000020:dmaker-t2017:1","description":"Temperature","format":"float","access":["read","notify"],"unit":"celsius","valueRange":[-20,50,1]}');
    this.addPropertyByString('filter:filter-life-level', '{"siid":4,"piid":1,"type":"urn:miot-spec-v2:property:filter-life-level:0000001E:dmaker-t2017:1","description":"Filter Life Level","format":"uint8","access":["read","notify"],"unit":"percentage","valueRange":[0,100,1]}');
    this.addPropertyByString('environment:co2-density', '{"siid":3,"piid":3,"type":"urn:miot-spec-v2:property:co2-density:0000004B:dmaker-t2017:1","description":"CO2 Density","format":"float","access":["read","notify"],"unit":"ppm","valueRange":[400,9999,1]}');
    this.addPropertyByString('filter:filter-left-time', '{"siid":4,"piid":2,"type":"urn:miot-spec-v2:property:filter-left-time:0000001F:dmaker-t2017:1","description":"Filter Left Time","format":"uint16","access":["read","notify"],"unit":"days","valueRange":[0,365,1]}');
    this.addPropertyByString('physical-controls-locked:physical-controls-locked', '{"siid":6,"piid":1,"type":"urn:miot-spec-v2:property:physical-controls-locked:0000001D:dmaker-t2017:1","description":"Physical Control Locked","format":"bool","access":["read","write","notify"]}');
    this.addPropertyByString('filter5:filter-life-level', '{"siid":5,"piid":1,"type":"urn:miot-spec-v2:property:filter-life-level:0000001E:dmaker-t2017:1","description":"Filter Life Level","format":"uint8","access":["read","notify"],"unit":"percentage","valueRange":[0,100,1]}');
    this.addPropertyByString('air-fresh-favorite:fan-level', '{"siid":7,"piid":1,"type":"urn:miot-spec-v2:property:fan-level:00000016:dmaker-t2017:1","description":"Fan Level","format":"uint8","access":["read","write","notify"],"valueList":[{"value":0,"description":"60"},{"value":1,"description":"80"},{"value":2,"description":"100"},{"value":3,"description":"120"},{"value":4,"description":"140"},{"value":5,"description":"160"},{"value":6,"description":"180"},{"value":7,"description":"200"},{"value":8,"description":"220"},{"value":9,"description":"240"},{"value":10,"description":"260"},{"value":11,"description":"280"},{"value":12,"description":"300"}]}');
    this.addPropertyByString('screen:on', '{"siid":8,"piid":1,"type":"urn:miot-spec-v2:property:on:00000006:dmaker-t2017:1","description":"Switch Status","format":"bool","access":["read","write","notify"]}');
    this.addPropertyByString('alarm:alarm', '{"siid":9,"piid":1,"type":"urn:miot-spec-v2:property:alarm:00000012:dmaker-t2017:1","description":"Alarm","format":"bool","access":["read","write","notify"]}');
    this.addPropertyByString('filter5:filter-left-time', '{"siid":5,"piid":2,"type":"urn:miot-spec-v2:property:filter-left-time:0000001F:dmaker-t2017:1","description":"Filter Left Time","format":"uint16","access":["read","notify"],"unit":"days","valueRange":[0,365,1]}');
    this.addPropertyByString('air-fresh:mode', '{"siid":2,"piid":2,"type":"urn:miot-spec-v2:property:mode:00000008:dmaker-t2017:1","description":"Mode","format":"uint8","access":["read","write","notify"],"valueList":[{"value":0,"description":"Auto"},{"value":1,"description":"Sleep"},{"value":2,"description":"Favorite"}]}');
    this.addPropertyByString('air-fresh:heater', '{"siid":2,"piid":3,"type":"urn:miot-spec-v2:property:heater:00000026:dmaker-t2017:1","description":"Heater","format":"bool","access":["read","write","notify"]}');
    this.addPropertyByString('air-fresh:heat-level', '{"siid":2,"piid":4,"type":"urn:miot-spec-v2:property:heat-level:00000047:dmaker-t2017:1","description":"Heat Level","format":"uint8","access":["read","write","notify"],"valueList":[{"value":1,"description":"Level1"},{"value":2,"description":"Level2"},{"value":3,"description":"Level3"}]}');
  }

  initDeviceActions() {
    this.addActionByString('filter:reset-filter-life', '{"siid":4,"aiid":1,"type":"urn:miot-spec-v2:action:reset-filter-life:00002803:dmaker-t2017:1","description":"Reset Filter Life","in":[],"out":[]}');
    this.addActionByString('filter5:reset-filter-life', '{"siid":5,"aiid":1,"type":"urn:miot-spec-v2:action:reset-filter-life:00002803:dmaker-t2017:1","description":"Reset Filter Life","in":[],"out":[]}');
  }

  initDeviceEvents() {
    //no events
  }


  /*----------========== VALUES OVERRIDES ==========----------*/


  /*----------========== PROPERTY OVERRIDES ==========----------*/


  /*----------========== ACTION OVERRIDES ==========----------*/


  /*----------========== OVERRIDES ==========----------*/


}

module.exports = DmakerAirfreshT2017;

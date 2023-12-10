let Service, Characteristic, Accessory, HapStatusError, HAPStatus;
const BaseAccessory = require('../../base/BaseAccessory.js');
const Constants = require('../../constants/Constants.js');
const DevTypes = require('../../constants/DevTypes.js');


class FreshAirSystemAccessory extends BaseAccessory {
  constructor(name, device, uuid, config, api, logger) {

    Service = api.hap.Service;
    Characteristic = api.hap.Characteristic;
    Accessory = api.platformAccessory;
    HapStatusError = api.hap.HapStatusError;
    HAPStatus = api.hap.HAPStatus;

    super(name, device, uuid, config, api, logger);
  }


  /*----------========== INIT ==========----------*/

  initAccessoryObject() {
    this.fanLevelControl = this.getConfigValue('fanLevelControl', false);
    this.screenControl = this.getConfigValue('screenControl', true);
    this.heaterControl = this.getConfigValue('heaterControl', true);
    this.heatLevelControl = this.getConfigValue('heatLevelControl', false);
    this.pm25Breakpoints = this.getConfigValue('pm25Breakpoints', [7, 15, 30, 55]);
    this.co2AbnormalThreshold = this.getConfigValue('co2AbnormalThreshold', 1000);
    super.initAccessoryObject();
  }


  /*----------========== ACCESSORY INFO ==========----------*/

  getAccessoryType() {
    return DevTypes.FRESH_AIR_SYSTEM;
  }


  /*----------========== INIT ACCESSORIES ==========----------*/

  initAccessories(name, uuid) {
    return [new Accessory(name, uuid, this.api.hap.Accessory.Categories.AIR_PURIFIER)];
  }


  /*----------========== SETUP SERVICES ==========----------*/

  setupMainAccessoryService() {
    this.airPurifierService = new Service.AirPurifier(this.getName(), 'airPurifierService');
    this.airPurifierService
      .getCharacteristic(Characteristic.Active)
      .onGet(this.getAirPurifierActiveState.bind(this))
      .onSet(this.setAirPurifierActiveState.bind(this));
    this.airPurifierService
      .getCharacteristic(Characteristic.CurrentAirPurifierState)
      .onGet(this.getCurrentAirPurifierState.bind(this));
    this.airPurifierService
      .setCharacteristic(Characteristic.TargetAirPurifierState, 0);

    this.addRotationSpeedCharacteristic(this.airPurifierService)

    this.addLockPhysicalControlsCharacteristic(this.airPurifierService);

    this.addAccessoryService(this.airPurifierService);
  }

  setupAdditionalAccessoryServices() {
    if (this.heaterControl) this.prepareHeaterControlService();
    if (this.screenControl) this.prepareScreenControlService();
    if (this.heatLevelControl) this.prepareHeatLevelControlServices();

    this.prepareAirQualityService(this.pm25Breakpoints);
    this.prepareCarbonDioxideService(this.co2AbnormalThreshold);

    super.setupAdditionalAccessoryServices(); // make sure we call super
  }


  /*----------========== CREATE ADDITIONAL SERVICES ==========----------*/

  prepareHeaterControlService() {
    if (this.getDevice().supportsHeater()) {
      this.addPropWrapper('Heater', this.getDevice().heaterProp(), this.getDevice().onProp(), null, null, null);
    }
  }

  prepareHeatLevelControlServices() {
    if (this.getDevice().supportsHeatLevels()) {
      this.addPropWrapper('Heat Level', this.getDevice().heatLevelProp(), this.getDevice().onProp(), null, null, null);
    }
  }


  /*----------========== HOMEBRIDGE STATE SETTERS/GETTERS ==========----------*/

  getAirPurifierActiveState() {
    if (this.isMiotDeviceConnected()) {
      return this.getDevice().isOn() ? Characteristic.Active.ACTIVE : Characteristic.Active.INACTIVE;
    }
    return Characteristic.Active.INACTIVE;
  }

  setAirPurifierActiveState(state) {
    if (this.isMiotDeviceConnected()) {
      let value = state === Characteristic.Active.ACTIVE;
      this.getDevice().setOn(value);
    } else {
      throw new HapStatusError(HAPStatus.SERVICE_COMMUNICATION_FAILURE);
    }
  }

  getCurrentAirPurifierState() {
    if (this.isMiotDeviceConnected() && this.getDevice().isOn()) {
      if (this.getDevice().isIdle()) {
        return Characteristic.CurrentAirPurifierState.IDLE;
      } else {
        return Characteristic.CurrentAirPurifierState.PURIFYING_AIR;
      }
    }
    return Characteristic.CurrentAirPurifierState.INACTIVE;
  }

  // ----- additional services


  /*----------========== STATUS ==========----------*/

  updateAccessoryStatus() {
    if (this.airPurifierService) this.airPurifierService.getCharacteristic(Characteristic.Active).updateValue(this.getAirPurifierActiveState())
    if (this.airPurifierService) this.airPurifierService.getCharacteristic(Characteristic.CurrentAirPurifierState).updateValue(this.getCurrentAirPurifierState())

    super.updateAccessoryStatus();
  }

  /*----------========== MULTI-SWITCH SERVICE HELPERS ==========----------*/


  /*----------========== GETTERS ==========----------*/


  /*----------========== PROPERTY WRAPPERS ==========----------*/


  /*----------========== PROPERTY HELPERS ==========----------*/


  /*----------========== HELPERS ==========----------*/


}


module.exports = FreshAirSystemAccessory;

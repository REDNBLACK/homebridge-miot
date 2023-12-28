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
      .getCharacteristic(Characteristic.TargetAirPurifierState)
      .onGet(this.getTargetAirPurifierState.bind(this))
      .onSet(this.setTargetAirPurifierState.bind(this));

    if (this.getDevice().supportsFanLevel()) {
      this.airPurifierService
        .getCharacteristic(Characteristic.RotationSpeed)
        .onGet(this.getRotationSpeed.bind(this))
        .onSet(this.setRotationSpeed.bind(this));
    }

    this.addLockPhysicalControlsCharacteristic(this.airPurifierService);

    this.addAccessoryService(this.airPurifierService);
  }

  setupAdditionalAccessoryServices() {
    if (this.screenControl) this.prepareScreenControlService();
    if (this.heaterControl && this.heatLevelControl) this.prepareHeaterService();

    this.prepareAirQualityService(this.pm25Breakpoints);
    this.prepareCarbonDioxideService(this.co2AbnormalThreshold);

    super.setupAdditionalAccessoryServices(); // make sure we call super
  }


  /*----------========== CREATE ADDITIONAL SERVICES ==========----------*/

  // overrides
  prepareModeControlServices() {
    if (this.getDevice().supportsSleepMode()) {
      this.addPropWrapper('Sleep Mode', this.getDevice().modeProp(), this.getDevice().onProp(), this.getDevice().sleepModeValue(), null, null);
    }
  }

  prepareHeaterService() {
    this.heatLevelRange = this.getDevice().getHeatLevelRange()

    this.heaterService = new Service.HeaterCooler('Heater', 'heaterService');
    this.heaterService
      .getCharacteristic(Characteristic.Active)
      .onGet(this.getHeaterActiveState.bind(this))
      .onSet(this.setHeaterActiveState.bind(this));

    this.heaterService
      .getCharacteristic(Characteristic.CurrentHeaterCoolerState)
      .onGet(this.getCurrentHeaterCoolerState.bind(this))
      .setProps({
        maxValue: Characteristic.CurrentHeaterCoolerState.HEATING,
        validValues: [
          Characteristic.CurrentHeaterCoolerState.INACTIVE,
          Characteristic.CurrentHeaterCoolerState.HEATING
        ]
      });

    this.heaterService
      .getCharacteristic(Characteristic.TargetHeaterCoolerState)
      .onGet(this.getTargetHeaterCoolerState.bind(this))
      .onSet(this.setTargetHeaterCoolerState.bind(this))
      .setProps({
        maxValue: Characteristic.TargetHeatingCoolingState.HEAT,
        validValues: [
          Characteristic.TargetHeaterCoolerState.HEAT
        ]
      });

    this.heaterService
      .getCharacteristic(Characteristic.CurrentTemperature)
      .onGet(this.getCurrentTemperature.bind(this));

    this.heaterService
      .getCharacteristic(Characteristic.HeatingThresholdTemperature)
      .onGet(this.getHeatingThresholdTemperature.bind(this))
      .onSet(this.setHeatingThresholdTemperature.bind(this))
      .setProps({
        minValue: this.heatLevelRange[0],
        maxValue: this.heatLevelRange[1],
        minStep:  this.heatLevelRange[2]
      });

    this.addAccessoryService(this.heaterService);
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
      if (value === false || this.getDevice().isOn() === false) {
        this.getDevice().setOn(value);
      }
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

  getTargetAirPurifierState() {
    if (this.isMiotDeviceConnected()) {
      return (this.getDevice().isAutoModeEnabled() || this.getDevice().isSleepModeEnabled()) ? Characteristic.TargetAirPurifierState.AUTO : Characteristic.TargetAirPurifierState.MANUAL;
    }
    return Characteristic.TargetAirPurifierState.MANUAL;
  }

  setTargetAirPurifierState(state) {
    if (this.isMiotDeviceConnected()) {
      if (state === Characteristic.TargetAirPurifierState.AUTO) {
        this.getDevice().enableAutoMode();
      } else {
        this.getDevice().enableFavoriteMode();
      }
    } else {
      throw new HapStatusError(HAPStatus.SERVICE_COMMUNICATION_FAILURE);
    }
  }

  getRotationSpeed() {
    if (this.isMiotDeviceConnected() && this.getDevice().isFavoriteModeEnabled()) {
      return this.getDevice().getRotationSpeedPercentage();
    }
    return 0;
  }

  setRotationSpeed(value) {
    if (this.isMiotDeviceConnected()) {
      this.getDevice().turnOnFavoriteModeIfNecessary();
      this.getDevice().setRotationSpeedPercentage(value);
    } else {
      throw new HapStatusError(HAPStatus.SERVICE_COMMUNICATION_FAILURE);
    }
  }

  getHeaterActiveState() {
    if (this.isMiotDeviceConnected()) {
      return this.getDevice().isOn() && this.getDevice().isHeaterEnabled() ? Characteristic.Active.ACTIVE : Characteristic.Active.INACTIVE;
    }
    return Characteristic.Active.INACTIVE;
  }

  setHeaterActiveState(state) {
    if (this.isMiotDeviceConnected() && this.getDevice().isOn()) {
      let value = state === Characteristic.Active.ACTIVE;
      this.getDevice().setHeaterEnabled(value)
    } else {
      throw new HapStatusError(HAPStatus.SERVICE_COMMUNICATION_FAILURE);
    }
  }

  getCurrentHeaterCoolerState() {
    if (this.isMiotDeviceConnected()) {
      return this.getDevice().isOn() && this.getDevice().isHeaterEnabled() ? Characteristic.CurrentHeaterCoolerState.HEATING : Characteristic.CurrentHeaterCoolerState.INACTIVE;
    }
    return Characteristic.CurrentHeaterCoolerState.INACTIVE;
  }

  getTargetHeaterCoolerState() {
    return Characteristic.TargetHeaterCoolerState.HEAT;
  }

  setTargetHeaterCoolerState(state) {
    if (this.isMiotDeviceConnected()) {
      this.getDevice().turnOnHeaterIfNecessary();
    } else {
      throw new HapStatusError(HAPStatus.SERVICE_COMMUNICATION_FAILURE);
    }
  }

  getHeatingThresholdTemperature() {
    if (this.isMiotDeviceConnected()) {
      let [start, end, step] = this.heatLevelRange
      let level = this.getDevice().getHeatLevel()
      let temp = start + ((level - 1) * step)

      if (temp < start || temp > end) throw new HapStatusError(HAPStatus.SERVICE_COMMUNICATION_FAILURE)
      else return temp
    }
    return this.heatLevelRange[0]; // return minimum value
  }

  setHeatingThresholdTemperature(temp) {
    if (this.isMiotDeviceConnected()) {
      let [start, end, step] = this.heatLevelRange
      let level = ((temp - start) / step) + 1

      this.getDevice().setHeatLevel(level)
    } else {
      throw new HapStatusError(HAPStatus.SERVICE_COMMUNICATION_FAILURE);
    }
  }

  // ----- additional services


  /*----------========== STATUS ==========----------*/

  updateAccessoryStatus() {
    if (this.airPurifierService) this.airPurifierService.getCharacteristic(Characteristic.Active).updateValue(this.getAirPurifierActiveState())
    if (this.airPurifierService) this.airPurifierService.getCharacteristic(Characteristic.CurrentAirPurifierState).updateValue(this.getCurrentAirPurifierState())
    if (this.airPurifierService) this.airPurifierService.getCharacteristic(Characteristic.TargetAirPurifierState).updateValue(this.getTargetAirPurifierState())
    if (this.airPurifierService && this.getDevice().supportsFanLevel()) this.airPurifierService.getCharacteristic(Characteristic.RotationSpeed).updateValue(this.getRotationSpeed());

    super.updateAccessoryStatus();
  }

  /*----------========== MULTI-SWITCH SERVICE HELPERS ==========----------*/


  /*----------========== GETTERS ==========----------*/


  /*----------========== PROPERTY WRAPPERS ==========----------*/


  /*----------========== PROPERTY HELPERS ==========----------*/


  /*----------========== HELPERS ==========----------*/


}


module.exports = FreshAirSystemAccessory;

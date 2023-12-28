const path = require('path');
const fs = require('fs');
const Logger = require("../utils/Logger");
const Errors = require("../utils/Errors.js");

class MiCloudTokenHelper {
  constructor() {
    this.configDir = path.dirname(require.main.filename).split('node_modules')[0];
    this.configFile = path.join(this.configDir, 'miot', 'micloud.json');

    try {
      fs.mkdirSync(this.configDir, {
        recursive: true
      });
    } catch (error) {
      throw new Error(error);
    }

    try {
      this.micloud = JSON.parse(fs.readFileSync(this.configFile, 'utf8'));
    } catch (error) {
      this.micloud = {};
    }
  }

  /*----------========== STORAGE ==========----------*/
  getServiceToken() {
    return this.micloud['serviceToken'];
  }
}

module.exports = new MiCloudTokenHelper();

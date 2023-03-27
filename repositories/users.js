const { use } = require("express/lib/application");
const Repository = require("./repository");
const fs = require("fs");
const crypto = require("crypto");
const util = require("util");
const scrypt = util.promisify(crypto.scrypt);

const { get } = require("express/lib/response");

class UserRepository extends Repository {
  async create(attributes) {
    attributes.id = this.randomId();

    const salt = crypto.randomBytes(8).toString("hex");

    const hashedbuf = await scrypt(attributes.password, salt, 64);

    const records = await this.getAll();

    const record = {
      ...attributes,
      password: `${hashedbuf.toString("hex")}.${salt}`,
    };
    records.push(record);

    await this.writeAll(records);

    return record;
  }
  async comparePassword(saved, supplied) {
    const [hashed, salt] = saved.split(".");

    const hashedSupplied = await scrypt(supplied, salt, 64);

    return hashed === hashedSupplied.toString("hex");
  }
}
module.exports = new UserRepository("users.json");

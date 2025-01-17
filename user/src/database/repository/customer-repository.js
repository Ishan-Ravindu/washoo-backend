const mongoose = require("mongoose");
const { CustomerModel } = require("../models");
const { APIError, STATUS_CODES } = require("../../utils/app-errors");

//Dealing with data base operations
class CustomerRepository {
  async CreateCustomer({
    email,
    name,
    phone,
    street,
    postalCode,
    city,
    country,
    nic,
  }) {
    try {
      let id = (await CustomerModel.count()) + 1;
      const customer = new CustomerModel({
        user_id: "user_" + id,
        email,
        name,
        phone,
        address: {
          street,
          postalCode,
          city,
          country,
        },
        nic,
        accounts: [],
        is_active: true,
      });

      const customerResult = await customer.save();
      return customerResult;
    } catch (err) {
      throw new APIError(
        "API Error",
        STATUS_CODES.INTERNAL_ERROR,
        "Unable to Create Customer"
      );
    }
  }

  async FindCustomer({ id }) {
    try {
      const customer = await CustomerModel.find({ user_id: id });

      return customer;
    } catch (err) {
      throw new APIError(
        "API Error",
        STATUS_CODES.INTERNAL_ERROR,
        "Unable to Find the Customer"
      );
    }
  }

  async UpdateCustomer({ id, phone, street, postalCode, city, country, name }) {
    try {
      const customer = await CustomerModel.findOneAndUpdate(
        { user_id: id },
        {
          phone,
          address: { street, postalCode, city, country },
          name,
        }
      );
      customer.phone = phone;
      customer.name = name;
      customer.address.street = street;
      customer.address.postalCode = postalCode;
      customer.address.city = city;
      customer.address.country = country;

      return customer;
    } catch (err) {
      throw new APIError(
        "API Error",
        STATUS_CODES.INTERNAL_ERROR,
        "Unable to Update the Customer"
      );
    }
  }

  async DeleteCustomer({ id }) {
    try {
      const customer = await CustomerModel.findOneAndUpdate(
        { user_id: id },
        {
          is_active: false,
        }
      );

      customer.is_active = false;

      return customer;
    } catch (err) {
      throw new APIError(
        "API Error",
        STATUS_CODES.INTERNAL_ERROR,
        "Unable to Update the Customer"
      );
    }
  }

  async FindCustomers({ page }) {
    try {
      const customer = await CustomerModel.find()
        .skip(10 * (page - 1))
        .limit(10)
        .select("-__v")
        .sort("createdAt");

      return customer;
    } catch (err) {
      throw new APIError(
        "API Error",
        STATUS_CODES.INTERNAL_ERROR,
        "Unable to Find the Customers"
      );
    }
  }

  async AddAccount({ id, accountId }) {
    try {
      const customer = await CustomerModel.updateOne(
        { user_id: id },
        { $addToSet: { accounts: [accountId] } }
      );

      const updatedCustomer = await CustomerModel.findOne({ user_id: id });
      return updatedCustomer;
    } catch (err) {
      console.log(err);
      throw new APIError(
        "API Error",
        STATUS_CODES.INTERNAL_ERROR,
        "Unable to Add the Account"
      );
    }
  }
}

module.exports = CustomerRepository;

const request = require("supertest");
const app = require("../../app");

// model and enum
const User = require("../../models/user.model");
const userRoles = require("../../utils/enum");

// Mock the User model
jest.mock("../../models/user.model");

const user1 = {
  username: "user1",
  password: "user1",
  role: userRoles.USER,
};

const nonexistentuser = {
  username: "nonexistentuser",
  password: "nonexistentpassword",
  role: userRoles.USER,
};

describe("POST /login", () => {
  describe("When a username is not provided", () => {
    let res;
    beforeAll(async () => {
      res = await request(app)
        .post("/login")
        .send({ password: user1.password });
    });

    it("Should return status code 400", () => {
      expect(res.statusCode).toEqual(400);
    });

    it("Should return success false", () => {
      expect(res.body.success).toBe(false);
    });

    it("Should return error message with length greater than 0", () => {
      expect(res.body.message).not.toBe(undefined);
      expect(res.body.message.length).toBeGreaterThan(0);
    });
  });

  describe("When a password is not provided", () => {
    let res;
    beforeAll(async () => {
      res = await request(app)
        .post("/login")
        .send({ username: user1.username });
    });

    it("Should return status code 400", () => {
      expect(res.statusCode).toEqual(400);
    });

    it("Should return success false", () => {
      expect(res.body.success).toBe(false);
    });

    it("Should return error message with length greater than 0", () => {
      expect(res.body.message).not.toBe(undefined);
      expect(res.body.message.length).toBeGreaterThan(0);
    });
  });

  describe("When a username and password are not provided", () => {
    let res;
    beforeAll(async () => {
      res = await request(app).post("/login").send({});
    });

    it("Should return status code 400", () => {
      expect(res.statusCode).toEqual(400);
    });

    it("Should return success false", () => {
      expect(res.body.success).toBe(false);
    });

    it("Should return error message with length greater than 0", () => {
      expect(res.body.message).not.toBe(undefined);
      expect(res.body.message.length).toBeGreaterThan(0);
    });
  });

  describe("When a user is not exist", () => {
    let res;

    beforeAll(async () => {
      User.findOne = jest.fn().mockImplementation(() => {
        return null;
      });

      res = await request(app).post("/login").send({
        username: nonexistentuser.username,
        password: nonexistentuser.password,
      });
    });

    afterAll(() => {
      User.findOne.mockRestore();
    });

    it("Should call User.findOne once", () => {
      expect(User.findOne).toHaveBeenCalledTimes(1);
    });

    it("Should call User.findOne with correct arguments", () => {
      expect(User.findOne).toHaveBeenCalledWith({
        username: nonexistentuser.username,
      });
    });

    it("Should return status code 401", () => {
      expect(res.statusCode).toEqual(401);
    });

    it("Should return success false", () => {
      expect(res.body.success).toBe(false);
    });

    it("Should return error message with length greater than 0", () => {
      expect(res.body.message).not.toBe(undefined);
      expect(res.body.message.length).toBeGreaterThan(0);
    });
  });

  describe("When a user is exist", () => {
    describe("When a password is incorrect", () => {
      let res;
      const incorrectPassword = "incorrect_password";

      beforeAll(async () => {
        User.findOne = jest.fn().mockReturnValue({
          ...user1,
          matchPassword: jest.fn().mockResolvedValue(false),
        });

        res = await request(app).post("/login").send({
          username: user1.username,
          password: incorrectPassword,
        });
      });

      afterAll(() => {
        User.findOne.mockRestore();
      });

      it("Should call User.findOne once", () => {
        expect(User.findOne).toHaveBeenCalledTimes(1);
      });

      it("Should call User.findOne with correct arguments", () => {
        expect(User.findOne).toHaveBeenCalledWith({
          username: user1.username,
        });
      });

      it("Should call matchPassword once", () => {
        expect(User.findOne().matchPassword).toHaveBeenCalledTimes(1);
      });

      it("Should call matchPassword with correct arguments", () => {
        expect(User.findOne().matchPassword).toHaveBeenCalledWith(
          incorrectPassword
        );
      });

      it("Should return status code 401", () => {
        expect(res.statusCode).toEqual(401);
      });

      it("Should return success false", () => {
        expect(res.body.success).toBe(false);
      });

      it("Should return error message with length greater than 0", () => {
        expect(res.body.message).not.toBe(undefined);
        expect(res.body.message.length).toBeGreaterThan(0);
      });
    });

    describe("When a password is correct", () => {
      let res;

      beforeAll(async () => {
        User.findOne = jest.fn().mockReturnValue({
          ...user1,
          matchPassword: jest.fn().mockResolvedValue(true),
        });

        res = await request(app).post("/login").send({
          username: user1.username,
          password: user1.password,
        });
      });

      afterAll(() => {
        User.findOne.mockRestore();
      });

      it("Should call User.findOne once", () => {
        expect(User.findOne).toHaveBeenCalledTimes(1);
      });

      it("Should call User.findOne with correct arguments", () => {
        expect(User.findOne).toHaveBeenCalledWith({
          username: user1.username,
        });
      });

      it("Should call matchPassword once", () => {
        expect(User.findOne().matchPassword).toHaveBeenCalledTimes(1);
      });

      it("Should call matchPassword with correct arguments", () => {
        expect(User.findOne().matchPassword).toHaveBeenCalledWith(
          user1.password
        );
      });

      it("Should return status code 200", () => {
        expect(res.statusCode).toEqual(200);
      });

      it("Should return success true", () => {
        expect(res.body.success).toBe(true);
      });

      it("Should return cookie", () => {
        expect(res.header["set-cookie"][0]).toMatch(/^user=.+/);
        expect(res.header["set-cookie"][0]).toMatch(/HttpOnly/);
      });

      it("Should return message with length greater than 0", () => {
        expect(res.body.message).not.toBe(undefined);
        expect(res.body.message.length).toBeGreaterThan(0);
      });
    });
  });

  describe("When server error occurs", () => {
    let res;

    beforeAll(async () => {
      User.findOne = jest.fn().mockImplementation(() => {
        throw new Error("Unexpected error");
      });

      res = await request(app).post("/login").send({
        username: user1.username,
        password: user1.password,
      });
    });

    afterAll(() => {
      User.findOne.mockRestore();
    });

    it("Should return status code 500", () => {
      expect(res.statusCode).toEqual(500);
    });

    it("Should return success false", () => {
      expect(res.body.success).toBe(false);
    });

    it("Should return error message with length greater than 0", () => {
      expect(res.body.message).not.toBe(undefined);
      expect(res.body.message.length).toBeGreaterThan(0);
    });
  });
});

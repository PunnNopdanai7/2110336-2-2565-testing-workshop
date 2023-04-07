const request = require("supertest");
const app = require("../../app");
const User = require("../../models/user.model");
const userRoles = require("../../utils/enum");

jest.mock("../../models/user.model");

const mockedUser1 = {
  _id: "5f9f1b9b9c9d9b0b8c8b8b8b",
  username: "user1",
  password: "user1",
  role: userRoles.USER,
};

const mockedSuperAdmin1 = {
  _id: "5f9f1b9b9c9d9b0b8c8b8b8c",
  username: "superadmin1",
  password: "superadmin1",
  role: userRoles.SUPER_ADMIN,
};

describe("PUT /updateUserRole", () => {
  describe("When a user is not logged in", () => {
    let res;

    beforeEach(async () => {
      res = await request(app)
        .put(`/updateUserRole`)
        .send({ role: userRoles.ADMIN });
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

  describe("When role in cookie is not SUPER_ADMIN", () => {
    let res;
    let userCookie;

    beforeAll(async () => {
      User.findOne = jest.fn().mockReturnValue({
        username: mockedSuperAdmin1.username,
        password: mockedSuperAdmin1.password,
        role: mockedSuperAdmin1.role,
        matchPassword: jest.fn().mockResolvedValue(true),
      });

      const response = await request(app).post("/login").send({
        username: mockedSuperAdmin1.username,
        password: mockedSuperAdmin1.password,
      });

      User.findOne.mockRestore();

      // Set cookie
      userCookie = response.header["set-cookie"][0].split(";")[0];
      userCookie = userCookie.replace(
        `${userRoles.SUPER_ADMIN}`,
        `${userRoles.USER}`
      );
    });

    beforeEach(async () => {
      res = await request(app)
        .put(`/updateUserRole`)
        .set("Cookie", userCookie)
        .send({ userId: mockedUser1._id, role: userRoles.ADMIN });
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

  describe("When userId or role is not provided", () => {
    let userCookie;

    beforeAll(async () => {
      User.findOne = jest.fn().mockReturnValue({
        username: mockedSuperAdmin1.username,
        password: mockedSuperAdmin1.password,
        role: mockedSuperAdmin1.role,
        matchPassword: jest.fn().mockResolvedValue(true),
      });

      const response = await request(app).post("/login").send({
        username: mockedSuperAdmin1.username,
        password: mockedSuperAdmin1.password,
      });

      User.findOne.mockRestore();

      // Set cookie
      userCookie = response.header["set-cookie"][0].split(";")[0];
    });

    describe("When userId is not provided", () => {
      let res;

      beforeEach(async () => {
        res = await request(app)
          .put(`/updateUserRole`)
          .set("Cookie", userCookie)
          .send({
            role: userRoles.ADMIN,
          });
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

    describe("When role is not provided", () => {
      let res;

      beforeEach(async () => {
        res = await request(app)
          .put(`/updateUserRole`)
          .set("Cookie", userCookie)
          .send({
            userId: mockedUser1._id,
          });
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

    describe("When userId and role are not provided", () => {
      beforeEach(async () => {
        res = await request(app)
          .put(`/updateUserRole`)
          .set("Cookie", userCookie)
          .send({});
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
  });

  describe("When target user is not exists", () => {
    let res;
    let userCookie;
    const invalidUserId = "5f6b1c6b2d6c0c2f8c5e5e5e";

    beforeAll(async () => {
      User.findOne = jest.fn().mockReturnValue({
        username: mockedSuperAdmin1.username,
        password: mockedSuperAdmin1.password,
        role: mockedSuperAdmin1.role,
        matchPassword: jest.fn().mockResolvedValue(true),
      });

      const response = await request(app).post("/login").send({
        username: mockedSuperAdmin1.username,
        password: mockedSuperAdmin1.password,
      });

      // Set cookie
      userCookie = response.header["set-cookie"][0].split(";")[0];
    });

    beforeEach(async () => {
      User.exists = jest.fn().mockResolvedValue(false);

      res = await request(app)
        .put(`/updateUserRole`)
        .set("Cookie", userCookie)
        .send({
          userId: invalidUserId,
          role: userRoles.ADMIN,
        });
    });

    afterAll(() => {
      User.findOne.mockRestore();
      User.exists.mockRestore();
    });

    it("Should call User.exists() with correct arguments", () => {
      expect(User.exists).toHaveBeenCalledTimes(1);
      expect(User.exists).toHaveBeenCalledWith({ _id: invalidUserId });
    });

    it("Should return status code 404", () => {
      expect(res.statusCode).toEqual(404);
    });

    it("Should return success false", () => {
      expect(res.body.success).toBe(false);
    });

    it("Should return error message with length greater than 0", () => {
      expect(res.body.message).not.toBe(undefined);
      expect(res.body.message.length).toBeGreaterThan(0);
    });
  });

  describe("When target user is exists", () => {
    let res;
    let userCookie;

    beforeAll(async () => {
      User.findOne = jest.fn().mockReturnValue({
        username: mockedSuperAdmin1.username,
        password: mockedSuperAdmin1.password,
        role: mockedSuperAdmin1.role,
        matchPassword: jest.fn().mockResolvedValue(true),
      });

      const response = await request(app).post("/login").send({
        username: mockedSuperAdmin1.username,
        password: mockedSuperAdmin1.password,
      });

      // Set cookie
      userCookie = response.header["set-cookie"][0].split(";")[0];
    });

    beforeEach(async () => {
      User.exists = jest.fn().mockResolvedValue(true);
      User.findByIdAndUpdate = jest.fn().mockResolvedValue({
        _id: mockedUser1._id,
        username: mockedUser1.username,
        role: userRoles.ADMIN,
      });

      res = await request(app)
        .put(`/updateUserRole`)
        .set("Cookie", userCookie)
        .send({
          userId: mockedUser1._id,
          role: userRoles.ADMIN,
        });
    });

    afterAll(() => {
      User.findOne.mockRestore();
      User.exists.mockRestore();
      User.findByIdAndUpdate.mockRestore();
    });

    it("Should call User.exists() with correct arguments", () => {
      expect(User.exists).toHaveBeenCalledTimes(1);
      expect(User.exists).toHaveBeenCalledWith({ _id: mockedUser1._id });
    });

    it("Should call User.findByIdAndUpdate() with correct arguments", () => {
      expect(User.findByIdAndUpdate).toHaveBeenCalledTimes(1);
      expect(User.findByIdAndUpdate).toHaveBeenCalledWith(
        mockedUser1._id,
        {
          role: userRoles.ADMIN,
        },
        {
          runValidators: true,
        }
      );
    });

    it("Should return status code 200", () => {
      expect(res.statusCode).toEqual(200);
    });

    it("Should return success true", () => {
      expect(res.body.success).toBe(true);
    });

    it("Should return an object with correct properties", () => {
      expect(res.body.data).toHaveProperty("_id");
      expect(res.body.data).toHaveProperty("username");
      expect(res.body.data).toHaveProperty("role");
    });

    it("Should return an object with correct values", () => {
      expect(res.body.data._id).toBe(mockedUser1._id);
      expect(res.body.data.username).toBe(mockedUser1.username);
      expect(res.body.data.role).toBe(userRoles.ADMIN);
    });

    it("Should return message with length greater than 0", () => {
      expect(res.body.message).not.toBe(undefined);
      expect(res.body.message.length).toBeGreaterThan(0);
    });
  });

  describe("When server error occurs", () => {
    let res;
    let userCookie;

    beforeAll(async () => {
      User.findOne = jest.fn().mockReturnValue({
        username: mockedSuperAdmin1.username,
        password: mockedSuperAdmin1.password,
        role: mockedSuperAdmin1.role,
        matchPassword: jest.fn().mockResolvedValue(true),
      });

      const response = await request(app).post("/login").send({
        username: mockedSuperAdmin1.username,
        password: mockedSuperAdmin1.password,
      });

      // Set cookie
      userCookie = response.header["set-cookie"][0].split(";")[0];
    });

    beforeEach(async () => {
      User.exists = jest.fn().mockImplementation(() => {
        throw new Error("Unexpected error");
      });

      res = await request(app)
        .put(`/updateUserRole`)
        .set("Cookie", userCookie)
        .send({
          userId: mockedUser1._id,
          role: userRoles.ADMIN,
        });
    });

    afterAll(() => {
      User.findOne.mockRestore();
      User.exists.mockRestore();
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

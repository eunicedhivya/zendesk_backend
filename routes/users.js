import express from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import client from "../db.js";
import nodemailer from "nodemailer";
import cryptoRandomString from "crypto-random-string";
import dotenv from "dotenv";
// import auth from "../middleware/auth.js";
// import { ObjectId } from "mongodb";

import {
  genPassword,
  createUser,
  checkUserExists,
  getUserByToken,
  activateAccount,
  getUserByEmail,
  // getMyInfo,
} from "../helper/users.js";

dotenv.config();

const router = express.Router();

const DB_NAME = "zendeskclone";
const COL_NAME = "users";

// const DB_CMD = ;

router.get("/", async function (request, response) {});
router.post("/all", async function (request, response) {
  try {
    const listUsers = await client
      .db(DB_NAME)
      .collection(COL_NAME)
      .find({})
      .toArray();

    // console.log(listUsers);

    response.status(201).json({
      message: "Users exist",
      type: "success",
      data: listUsers,
    });
  } catch (err) {
    response.status(500).json({
      message: "Internal server error",
      type: "error",
    });
  }
});

router.post("/signup", async function (request, response) {
  try {
    //   console.log(request.body);
    const { fname, lname, email, password, usertype } = request.body;

    //Check if User Exist and send error message if True
    const userExists = await checkUserExists(email, DB_NAME, COL_NAME);
    if (userExists) {
      return response
        .status(400)
        .send({ message: "Account already exists", type: "error" });
    }

    // Generate Encrypted Password
    const hashedPassword = await genPassword(password);

    //Form User Object for adding to DB
    const newUser = {
      email: email,
      fname: fname,
      lname: lname,
      password: hashedPassword,
      usertype: usertype,
    };

    //   Push the generated user to DB
    const result = await createUser(newUser, DB_NAME, COL_NAME);

    if (result.acknowledged === true) {
      response.status(200).json({
        message: "user signedup",
        type: "success",
      });
    }
    // console.log(result);
  } catch (err) {
    response.status(500).json({
      message: "Internal server error",
      type: "error",
    });
  }
});

router.post("/login", async function (request, response) {
  try {
    const { email, password } = request.body;

    // Check if email/password is entered
    if (!email || !password)
      return response.status(400).json({
        message: "Please enter all required fields.",
        type: "error",
      });

    // check if user is present in DB
    const userFromDB = await getUserByEmail(email, DB_NAME, COL_NAME);

    // const hashedPassword = await genPassword(password);

    if (!userFromDB) {
      response
        .status(401)
        .json({ message: "Invalid Credentials", type: "error" });
    } else {
      const storedPassword = userFromDB.password;
      const isPasswordMatch = await bcrypt.compare(password, storedPassword);

      if (userFromDB.status === "pending") {
        response
          .status(401)
          .json({ message: "Account not activated yet", type: "error" });
      }

      if (!isPasswordMatch) {
        response
          .status(401)
          .json({ message: "Invalid Credentials", type: "error" });
      } else {
        const token = jwt.sign({ id: userFromDB._id }, process.env.SECRET_KEY);

        token
          ? response.status(201).json({
              message: "Login Successful",
              id: userFromDB._id,
              type: "success",
              token: token,
            })
          : response.status(404).json({
              message: "Login Not Successful",
              type: "error",
            });
      }
    }
  } catch (err) {
    console.log(err);
    response.status(500).json({ message: "Internal Server Error" });
  }
});

router.post("/loggedIn", (request, response) => {
  try {
    const token = request.body.token;
    if (!token) {
      return response.json(false);
    }

    jwt.verify(token, process.env.SECRET_KEY);

    const decoded = jwt.decode(token, process.env.SECRET_KEY);

    response.json(true);
  } catch (err) {
    response.json(false);
  }
});

export const usersRouter = router;

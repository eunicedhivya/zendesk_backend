import express from "express";
import client from "../db.js";
import { ObjectId } from "mongodb";

const router = express.Router();

const DB_NAME = "zendeskclone";
const COL_NAME = "tickets";

router.post("/all", async function (request, response) {
  try {
    const { token } = request.body;
    console.log("token", token);
    const listTickets = await client
      .db(DB_NAME)
      .collection(COL_NAME)
      .find({})
      .toArray();
    response.status(201).json({
      message: "Tickets",
      type: "success",
      data: listTickets,
    });
  } catch {
    response.status(500).json({
      message: "Internal server error",
      type: "error",
    });
  }
});
router.post("/add", async function (request, response) {
  try {
    const { token, ticketData } = request.body;
    // console.log("request.body", request.body);
    // console.log("token", token);
    // console.log("ticketData", ticketData);
    const result = await client
      .db(DB_NAME)
      .collection(COL_NAME)
      .insertOne(ticketData);

    console.log(result);

    if (result.acknowledged === true) {
      response.status(200).json({
        message: "Ticket added",
        type: "success",
      });
    }
  } catch {
    response.status(500).json({
      message: "Internal server error",
      type: "error",
    });
  }
});
router.post("/:ticketid", async function (request, response) {
  try {
    const { token } = request.body;
    const ticketData = await client
      .db(DB_NAME)
      .collection(COL_NAME)
      .findOne({ _id: ObjectId(request.params.ticketid) });

    console.log(ticketData);

    ticketData
      ? response.status(201).json({
          message: "data retrieved",
          type: "success",
          data: ticketData,
        })
      : response.status(404).send({
          message: "No Ticket Found",
          type: "error",
        });
  } catch {
    response.status(500).json({
      message: "Internal server error",
      type: "error",
    });
  }
});

export const ticketRouter = router;

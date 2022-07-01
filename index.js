import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import session from "express-session";

// Import Users Route
import { usersRouter } from "./routes/users.js";
import { passwordResetRouter } from "./routes/passwordReset.js";
import { ticketRouter } from "./routes/tickets.js";

dotenv.config();

// Reference Express App
const app = express();

// Enable CORS
app.use(
  cors({
    origin: [
      process.env.FRONTEND,
      "https://urlshortener-clone.herokuapp.com",
      "http://localhost:3000",
    ],
    credentials: true,
  })
);

app.use(express.json());

app.use(express.urlencoded({ extended: false }));
app.set("trust proxy", 1);

app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: true,
    saveUninitialized: false,
    cookie: {
      sameSite: "none", // must be 'none' to enable cross-site delivery
      secure: true, // must be true if sameSite='none'
    },
  })
);

// Port for localhost
const PORT = process.env.PORT;

// Base EndPoint
app.get("/", (request, response) => {
  response.send({
    msg: "Zen Desk Clone",
  });
});

// Add Users Endpoint
app.use("/users", usersRouter);

// Add PasswordReset Endpoint
app.use("/password-reset", passwordResetRouter);

// Add PasswordReset Endpoint
app.use("/tickets", ticketRouter);

app.listen(PORT, () => console.log("Server is started in " + PORT));

const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const User = require("./models/User");
const jwt = require("jsonwebtoken");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const bcrypt = require("bcryptjs");
const ws = require("ws");
const Msg = require("./models/message");
const fs = require("fs");

dotenv.config();
mongoose.connect(process.env.MONGO_URL);
const jwtSecret = process.env.JWT_SECRET;
const bcryptSalt = bcrypt.genSaltSync(10);
const app = express();
app.use("/uploads", express.static(__dirname + "/uploads"));
app.use(express.json());
app.use(cookieParser());
app.use(
  cors({
    credentials: true,
    origin: process.env.CLIENT_URL,
  })
);

async function getUserDataFromReq(req) {
  return new Promise((resolve, reject) => {
    const token = req.cookies?.token;

    if (token) {
      jwt.verify(token, jwtSecret, {}, (err, userData) => {
        if (err) throw err;
        resolve(userData);
      });
    } else {
      reject("no token found");
    }
  });
}

app.get("/test", (req, res) => {
  res.json("Hello World");
});

app.get("/messages/:userId", async (req, res) => {
  const { userId } = req.params;
  const userData = await getUserDataFromReq(req);
  const ourUserId = userData.userId;
  const messages = await Msg.find({
    sender: { $in: [userId, ourUserId] },
    recipient: { $in: [userId, ourUserId] },
  }).sort({ createdAt: 1 });
  res.json(messages);
});

app.get("/people", async (req, res) => {
  const users = await User.find({}, { _id: 1, username: 1 });
  res.json(users);
});

app.get("/profile", (req, res) => {
  const token = req.cookies?.token;

  if (token) {
    jwt.verify(token, jwtSecret, {}, (err, userData) => {
      if (err) throw err;
      const { id, username } = userData;
      res.json({
        id,
        username,
      });
    });
  } else {
    res.status(401).json("no token found!");
  }
});

app.post("/login", async (req, res) => {
  const { username, password } = req.body;
  const foundUser = await User.findOne({ username });
  if (foundUser) {
    const passOk = bcrypt.compareSync(password, foundUser.password);
    if (passOk) {
      jwt.sign(
        { userId: foundUser._id, username },
        jwtSecret,
        {},
        (err, token) => {
          res.cookie("token", token, { sameSite: "none", secure: true }).json({
            id: foundUser._id,
          });
        }
      );
    }
  }
});

app.post("/logout", (req, res) => {
  res.cookie("token", "", { sameSite: "none", secure: true }).json("logs out");
});

app.post("/register", async (req, res) => {
  const { fullname, username, email, password } = req.body;
  const hashedPass = bcrypt.hashSync(password, bcryptSalt);
  try {
    const createdUser = await User.create({
      fullname: fullname,
      username: username,
      email: email,
      password: hashedPass,
    });
    jwt.sign(
      { userId: createdUser._id, username },
      jwtSecret,
      {},
      (err, token) => {
        if (err) throw err;
        res
          .cookie("token", token, { sameSite: "none", secure: true })
          .status(201)
          .json({
            id: createdUser._id,
          });
      }
    );
  } catch (err) {
    if (err) throw err;
    res.status(500).json("error");
  }
});

const server = app.listen(4000, (req, res) => {
  console.log("Server running on port 4000");
});

const wss = new ws.WebSocketServer({ server });

wss.on("connection", (connection, req) => {
  const cookies = req.headers.cookie;

  function notifyAboutOnlinePeople() {
    [...wss.clients].forEach((client) => {
      client.send(
        JSON.stringify({
          online: [...wss.clients].map((c) => ({
            userId: c.userId,
            username: c.username,
          })),
        })
      );
    });
  }

  connection.isAlive = true;
  connection.timer = setInterval(() => {
    connection.ping();
    connection.lost = setTimeout(() => {
      connection.isAlive = false;
      clearInterval(connection.timer);
      connection.terminate();
      notifyAboutOnlinePeople();
      console.log("Connection lost");
    }, 2000);
  }, 5000);

  connection.on("pong", () => {
    clearTimeout(connection.lost);
  });

  if (cookies) {
    const tokenCookieString = cookies
      .split(";")
      .find((str) => str.startsWith("token="));

    if (tokenCookieString) {
      const token = tokenCookieString.split("=")[1];
      if (token) {
        jwt.verify(token, jwtSecret, {}, (err, userData) => {
          if (err) throw err;
          const { userId, username } = userData;
          connection.userId = userId;
          connection.username = username;
        });
      }
    }
  }

  connection.on("message", async (message, isBinary) => {
    const messageData = JSON.parse(message.toString());
    const { recipient, text, file } = messageData;
    let fileName = null;
    if (file) {
      const parts = file.name.split(".");
      const ext = parts[parts.length - 1];
      fileName = Date.now() + "." + ext;
      const path = __dirname + "/uploads/" + fileName;
      const bufferData = new Buffer(file.data.split(",")[1], "base64");
      fs.writeFile(path, bufferData, () => {
        console.log("file uploaded " + path);
      });
    }
    if (recipient && (text || file)) {
      const msgDoc = await Msg.create({
        sender: connection.userId,
        recipient,
        text,
        file: file ? fileName : null,
      });
      [...wss.clients]
        .filter((c) => c.userId === recipient)
        .forEach((c) =>
          c.send(
            JSON.stringify({
              text,
              sender: connection.userId,
              recipient,
              file: file ? fileName : null,
              _id: msgDoc._id,
            })
          )
        );
    }
  });

  // notify
  notifyAboutOnlinePeople();
});

// import { Prisma } from "@prisma/client";
import { error } from "node:console";
import { getPrismaClient } from "../config/db.js";
import bcrypt from "bcryptjs";

const register = async (req, res) => {
  const { name, email, password } = req.body;

  // check if user exists
  const prisma = await getPrismaClient();
  const userExists = await prisma.user.findUnique({
    where: {
      email: email,
    },
  });

  if (userExists) {
    return res.status(400).json({ error: "User already exists" });
  }

  // Hash password
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  // Create user
  const user = await prisma.user.create({
    data: {
      name: name,
      email: email,
      password: hashedPassword,
    },
  });

  res.status(201).json({
    status: "success",
    data: {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
      },
    },
  });
};

const login = async (req, res) => {
  const { name, email, password } = req.body;
  // check if user email already exists
  const prisma = await getPrismaClient();
  const userExists = await prisma.user.findUnique({
    where: {
      email: email,
    },
  });

  if (!userExists) {
    return res.status(400).json({ error: "User does not exist" });
  }

  // check if password is correct
  const isPasswordCorrect = await bcrypt.compare(password, userExists.password);

  if (!isPasswordCorrect) {
    return res.status(400).json({ error: "Password is incorrect" });
  }

  res.status(200).json({
    status: "success",
    data: {
      user: {
        id: userExists.id,
        name: userExists.name,
        email: userExists.email,
      },
    },
  });
};

export { register, login };

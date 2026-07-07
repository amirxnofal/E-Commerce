import bcrypt from "bcrypt";
import { env } from "../../config/env.service.js";
export const HashText = async (plainText) =>
    bcrypt.hash(plainText, env.saltRound);

export const CompareText = async (plainText, cypherText) =>
    bcrypt.compare(plainText, cypherText);

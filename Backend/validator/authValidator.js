import {body} from "express-validator";

export const signupValidation = [
    body("name").trim().escape(),
    body("username").trim().escape(),
    body("email").isEmail().normalizeEmail(),
];


import winston from "winston";

const ENV = process.env.NODE_ENV

export const Logger = winston.createLogger({
    transports: [
        new winston.transports.Console({silent: ENV !== "development", level: "info"})
    ]
});
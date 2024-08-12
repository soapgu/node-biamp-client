const winston = require('winston');
const chalk = require('chalk');

const logger = winston.createLogger({
    level: 'info',
    format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.colorize(),
        winston.format.simple(),
        winston.format.printf(info => {
            let { level } = info;
            const category = info.category ? ` ${chalk.bgRed(info.category)}` : '';
            const module = info.module ? `${chalk.bgBlue(info.module)}` : '';

            if (info.error) {
                return `${level}:${module}${category} ${info.message}\n${info.error.stack}`;
            }
            return `${level}:${module}${category} ${info.message ? info.message : JSON.stringify(info)}`;
        })
    ),
    transports: [
        new winston.transports.Console(),
    ]
});

module.exports = logger;
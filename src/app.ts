import * as dotenv from 'dotenv';
dotenv.config({ path: `${__dirname}/../.env` })

import { Telegraf, ContextMessageUpdate } from 'telegraf';
import { messageHandler } from './handlers/message.handler';
import { startTranslationCommand } from './commands/start-translation.command';
import { stopTranslationCommand } from './commands/stop-translation.command';

const telegraf = require('telegraf')

class Bot {
    bot: Telegraf<ContextMessageUpdate>

    port: number;
    url: string;
    botToken: string;

    constructor() {
        this.botToken = process.env.BOT_TOKEN || '';
        this.url = process.env.URL || 'https://tradutor-ariel.herokuapp.com/';
        this.port = Number(process.env.PORT) || 5000;

        this.bot = new telegraf(this.botToken);

        Reflect.set(messageHandler, 'shouldTranslate', true);

        this.bot.on('message', messageHandler);
        this.bot.command('start_translate', startTranslationCommand);
        this.bot.command('stop_translate', stopTranslationCommand);
    }

    runHeroku() {
        this.bot.telegram.setWebhook(`${this.url}bot${this.botToken}`);
        this.bot.startWebhook(`/bot${this.botToken}`, null, this.port);
        this.afterRun();
    }
    
    run() {
        this.bot.telegram.deleteWebhook();
        this.bot.startPolling();
        this.afterRun();
    }
    
    afterRun() {
        const admins = process.env.ADMINS!.split(',').map(Number);
        admins.forEach(admin => {
            this.bot.telegram.sendMessage(admin, 'Bot iniciado! Eu já estou traduzindo. Se quiser parar, já sabe o que fazer ;)');
        })
    }

}

const bot = new Bot();
if (process.env.NODE_ENV === 'heroku') {
    bot.runHeroku();
} else {
    bot.run();
}

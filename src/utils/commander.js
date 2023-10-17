import { Command } from 'commander';

export const commander = new Command();

commander
    .option('--mode <mode>', 'Modo de ejecución de nuesta app', 'development')
    .parse();
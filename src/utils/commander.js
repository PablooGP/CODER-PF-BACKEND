import { Command } from 'commander';

export const commander = new Command();

// const program = new Command()

// npm i o npm install
// program 
//     .option('-d', 'Variable para debug', false)
//     .option('-p, --port <port>', 'Puerto del servidor', 8080)
//     .option('--mode <mode>', 'Modo de trabajo', 'development')// .env
//     .requiredOption('-u <user>', 'Usuario utilizando el applicativo', 'No se ha declarado un usuario')// .env
//     .option('-l, --letters [letter...]', 'specify letter')
//     .parse()

// console.log('options: ', program.opts())
// console.log('Argumentos: ', program.args)

commander
    .option('--mode <mode>', 'Modo de ejecución de nuesta app', 'development')
    .parse();
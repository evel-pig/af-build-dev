#!/usr/bin/env node

const program = require('commander');

program
  .command('dev')
  .description('run dev server')
  .action(() => {
    require('../lib/commands/dev');
  });

program
  .command('build')
  .description('run build')
  .action(() => {
    require('../lib/commands/build');
  });

program.parse(process.argv);

#!/usr/bin/env node

const program = require('commander');
const dev = require('../lib/commands/dev').default;
const build = require('../lib/commands/build').default;

program
  .command('dev')
  .description('run dev server')
  .action(() => {
    dev();
  });

program
  .command('build')
  .description('run build')
  .action(() => {
    build();
  });

program.parse(process.argv);

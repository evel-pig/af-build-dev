#!/usr/bin/env node

const program = require('commander');
const dev = require('../src/dev');
const build = require('../src/build');

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

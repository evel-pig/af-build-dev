#!/usr/bin/env node

const program = require('commander');

program
  .version(require('../package.json').version)
  .option('-c, --config <path>', 'set epig cofnig file. defaults to ./.epigrc.js');

program
  .command('dev')
  .description('run dev server')
  .action(() => {
    require('../lib/commands/dev');
  });

program.command('build')
  .description('run build')
  .action(() => {
    require('../lib/commands/build');
  });

program.parse(process.argv);

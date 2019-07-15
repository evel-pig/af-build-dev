import { resolve } from 'path';
import chalk from 'chalk';
import { existsSync, readFileSync, writeFileSync } from 'fs';
import { IApi } from '../../interface';

export default function (api: IApi, opts: any = {}) {

  let entryConfigPath = resolve('src/entry.config.ts');
  if (!existsSync(entryConfigPath)) {
    entryConfigPath = resolve('src/entry.config.tsx');
    if (!existsSync(entryConfigPath)) {
      throw new Error(`entry config ${chalk.cyan.underline('src/entry.config.(ts|tsx)')}不存在`);
    }
  }

  const tmpFolderPath = resolve('src/.admin-tools');
  const routeTplPath = resolve(__dirname, './template/entry.js.tpl');
  const tplContent = readFileSync(routeTplPath, 'utf-8');
  const entryPath = resolve(tmpFolderPath, 'entry.tsx');
  writeFileSync(entryPath, tplContent, { encoding: 'utf-8' });

  api.modifyEntry((memo, args) => {
    return {
      admin: [
        entryPath,
      ],
    };
  });
}

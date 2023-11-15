import { cwd } from 'node:process';
import { resolve } from 'node:path';
import { watch } from 'node:fs';
import { emptyDirSync } from 'fs-extra';

const CWD = cwd();
const PACKAGE_FILE = resolve(CWD, 'package.json');
const CONFIG_FILE = resolve(CWD, 'build.config');

export default async function build({ watch: watchDir } = {}) {
  if (watchDir) {
    let rebuildTimer = null;
    const rebuild = () => {
      rebuildTimer && clearTimeout(rebuildTimer);
      rebuildTimer = setTimeout(() => {
        console.log(`\n---[${new Date()}]---------`);
        rebuildTimer = null;
        build();
      }, 1000);
    };
    watch(resolve(CWD, watchDir), { recursive: true }, rebuild);
  }

  const [{ default: packageJson }, { default: options }] = await Promise.all([
    import(PACKAGE_FILE),
    import(CONFIG_FILE),
  ]);

  const { name } = packageJson;
  console.log(`${name} is builing...`);

  emptyDirSync(options.outdir);

  const { success, logs } = await Bun.build(options);
  if (success) {
    console.log(`${name} is complete.`);
  } else {
    console.error(`${name} is failed.`);
    console.error(logs);
  }
}

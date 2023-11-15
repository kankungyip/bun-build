#!/usr/bin/env bun --smol

import { argv } from 'node:process';
import build from './build';

const options = {};

const args = argv.slice(2);

for (let i = 0; i < args.length; i++) {
  let arg = args[i];
  if (arg.startsWith('--')) {
    arg = arg.slice(2);
    if (arg.includes('=')) {
      const [key, value] = arg.split('=');
      options[key] = value;
    } else {
      const nextArg = i + 1 < args.length ? args[i + 1] : null;
      if (!nextArg || nextArg.startsWith('--')) {
        options[arg] = true;
      } else {
        options[arg] = nextArg;
        i++;
      }
    }
  } else if (typeof options.default !== 'undefined') {
    options.default = [].concat(options.default, arg);
  } else {
    options.default = arg;
  }
}

options.watch = options.watch || Bun.env.WATCH_DIR;
Bun.env.WATCH_DIR = options.watch;

await build(options);

/**
 [
   "@scope/anotherScopedPackage",
   "@scope/package",
   "default-import-with-semi-colon",
   "defaultImportNoSemiColon",
   "named-import-with-semi-colon",
   "namedImportNoSemiColon",
   "requireNoSemiColon",
   "requireWithSemiColon",
   "requireWithSpaces",
 ]

 */
const f = 'blue';

import alpha from 'default-import-with-semi-colon';
import { beta } from 'named-import-with-semi-colon';

const charlie = require('requireNoSemiColon')

// @Helpme
import { fred } from 'namedImportNoSemiColon'
import delta from '@scope/package'
import { echo } from '@scope/package/submodule'
import {bodega} from      '@scope/package/submodule/submodule2'
import frank from 'defaultImportNoSemiColon'

const importfrom = () => {
  // import k from ('blue');
  return 'gamma';
}
import {s} from "@scope/anotherScopedPackage";
importfrom('helo');
const k = require('requireWithSemiColon');

// here's a comment block
const s = require ( 'requireWithSpaces')
const s2 = require ('requireWithSpaces2'         )
const s2 = require (        'requireWithSpaces3'         )
const number = require('3');

import a from '4';
import {b} from '5';

const k = 3;

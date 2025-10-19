import Resolver from '@forge/resolver';

import { downloadFilesSequentially } from './download';

const resolver = new Resolver();

resolver.define('getText', (req) => {
  console.log(req);
  return 'Hello, world!';
});

resolver.define('downloadRepo', async (req) => {
  downloadFilesSequentially(req)
})

export const handler = resolver.getDefinitions();

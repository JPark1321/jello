import Resolver from '@forge/resolver';

const resolver = new Resolver();

resolver.define('getText', (req) => {
  console.log(req);
  return 'Hello, world!';
});

const buttonResolver = new Resolver();

buttonResolver.define('onButtonClick', async (req) => {
  console.log('Button clicked!');
  return 'Button, clicked!';
})

export const handler = resolver.getDefinitions();
export const buttonHandler = buttonResolver.getDefinitions();

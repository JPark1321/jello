import React, { useEffect, useState } from 'react';
import ForgeReconciler, { Text, Button, Stack } from '@forge/react';
import { invoke, view } from '@forge/bridge';

const App = () => {
  const [data, setData] = useState(null);
  const [clicked, setClicked] = useState(false);
  const [context, setContext] = useState('');

  useEffect(() => {
    // Detect which module is being rendered
    view.getContext().then((ctx) => {
      console.log(ctx.extension.type);
      setContext(ctx.extension.type); // 'jira:issuePanel' or 'jira:issueAction'
    });

    // Load text for the issuePanel version
    invoke('getText', { example: 'my-invoke-variable' }).then(setData);
  }, []);

  const handleClick = async () => {
    await invoke('onButtonClick'); // backend function
    setClicked(true);
  };

  if (context === 'jira:issueAction') {
    // When opened from the top-right “Run AI Fix”
    return (
      <Stack space="medium" align="start">
        <Text>⚡ AI Fix Triggered!</Text>
        <Text>This UI is shown when you click the issue action.</Text>
        <Button text="Run Backend Logic" onClick={handleClick} />
        {clicked && <Text>✅ Action completed!</Text>}
      </Stack>
    );
  }

  // Default view (inside issue panel)
  return (
    <Stack space="medium" align="start">
      <Text>Hello world!!</Text>
      <Text>{data ? data : 'Loading...'}</Text>
      <Button text="Click Me" appearance="primary" onClick={handleClick} />
      {clicked && <Text>✅ Button clicked!</Text>}
    </Stack>
  );
};

ForgeReconciler.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
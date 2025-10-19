import React, { useEffect, useState } from 'react';
import ForgeReconciler, { Text, Button, Stack } from '@forge/react';
import { invoke, view } from '@forge/bridge';

const App = () => {
  const [data, setData] = useState(null);
  const [clicked, setClicked] = useState(false);
  const [context, setContext] = useState('');

  useEffect(() => {
    view.getContext().then((ctx) => {
      console.log(ctx.extension.type);
      setContext(ctx.extension.type);
    });
  }, []);

  const handleClick = async () => {
    const userPrompt = "Tell me all letters of the alphabet";

    setClicked(true);
    // // setData(null);

    const reply = await invoke('onButtonClick', { prompt: userPrompt });
    setData(reply);
  };


  return (
    <Stack space="medium" align="start">
      <Text>Fix this issue with AI</Text>
      <Button text="Run Backend Logic" onClick={handleClick} />

      {clicked && (
        <>
          <Text>ChatGPT says:</Text>
          <Text>{data ? data : "⏳ Loading chat..."}</Text>
        </>
      )}
    </Stack>
  );

  return null;
};

ForgeReconciler.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
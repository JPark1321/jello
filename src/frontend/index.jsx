import React, { useEffect, useState } from 'react';
import ForgeReconciler, { Text, Link } from '@forge/react';
import { view, invoke } from '@forge/bridge';


const App = () => {
  const [data, setData] = useState("Generating PR...");
  const [branch, setBranch] = useState(null);

  useEffect(async () => {
    const context = await view.getContext();
    const issue_key = context["extension"]["issue"]["key"];
    const res = await invoke('getChat', { issue_key })
    setBranch(res)
    setData('PULL REQUEST CREATED SUCCESSFULLY!')
  }, []);

  return (
    <>
      <Text weight="medium" size="medium">Patch to analyze issue -{'>'} generate fix -{'>'} create PR with new fix</Text>
      <Text weight="bold">
        {data}
      </Text>
      <>
        {branch && (
        <Link href={`https://bitbucket.org/dubhacks/mello-dubhacks/branch/${branch}`} openNewTab={true}>
          {branch}
        </Link>
      )}
      </>
    </>
  );
};

ForgeReconciler.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

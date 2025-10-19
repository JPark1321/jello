import Resolver from '@forge/resolver';
import { prompt } from '../chat';
import { getRepoLinks } from '../repo-links';
import { fetchAndReplace } from '../repo-links-to-text';
import { buildPrompt } from '../build-prompt';
import { createPullRequest } from '../create-pr';

const resolver = new Resolver();

const ROOT_PATH = 'https://api.bitbucket.org/2.0/repositories/dubhacks/mello-dubhacks/src'

resolver.define('getChat', async (req) => {
  console.log(req?.payload);

  const { issue_key } = req.payload

  try {
    const auth = Buffer.from(`jpark132@uw.edu:${process.env.JPARK}`).toString("base64");
    const response = await fetch(`https://dubhacks.atlassian.net/rest/api/3/issue/${issue_key}`, {
      method: "GET",
      headers: {
        "Authorization": `Basic ${auth}`,
        "Accept": "application/json"
      }
    })

    const issue_data = await response.json()
    const summary = issue_data['fields']['summary']
    const description = issue_data['fields']['description']['content'][0]['content'][0]['text']

    const nested_links = await getRepoLinks(ROOT_PATH)
    const json_code = await fetchAndReplace(nested_links)

    const input = buildPrompt({
      repositoryState: json_code,
      jiraIssueKey: issue_key.toUpperCase(),
      jiraIssueTitle: summary,
      jiraIssueDescription: description
    })
    
    const chat_string = await prompt(input);
    const json = JSON.parse(chat_string)
    const ret = await createPullRequest(json)

    return `${json['branch_title']}`
  } catch (e) {
    return e.message
  }
});

export const handler = resolver.getDefinitions();

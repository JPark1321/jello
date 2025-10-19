export function buildPrompt({ 
  repositoryState, 
  jiraIssueKey, 
  jiraIssueTitle, 
  jiraIssueDescription, 
}) {
  return `
You are an expert software engineer tasked with analyzing a repository's current state and a specific development goal. Your job is to generate all the necessary artifacts for an automated commit and Pull Request process.

You MUST follow all instructions within the <INSTRUCTIONS> tags meticulously and return only a single, valid JSON object that adheres exactly to the required output schema stated in the <REQUIRED_OUTPUT_SCHEMA> tags. Read the context within the <INPUT_CONTEXT> tags and follow the strict rules within the <STRICT_RULES> tags.

<INPUT_CONTEXT>
1. **REPOSITORY_STATE (JSON):**
${JSON.stringify(repositoryState)}
2. **JIRA_ISSUE_KEY (String):** ${jiraIssueKey}
3. **JIRA_ISSUE_TITLE (String):** ${jiraIssueTitle}
4. **JIRA_ISSUE_DESCRIPTION (String):** ${jiraIssueDescription}
</INPUT_CONTEXT>
  
<INSTRUCTIONS>
1. **Analyze and Implement:** Based on all input context, determine the necessary code changes.
2. **Files to Write:** For every file that needs to be created or modified, provide its complete, final content.
3. **Files to Delete:** List the file paths of any files that must be removed.
4. **Branch Title:** Create a short, descriptive branch title, which **MUST start** with the \`JIRA_ISSUE_KEY\` (e.g., \`JIRA-123-implement-feature-x\`).
5. **Pull Request Title:** Use the \`JIRA_ISSUE_TITLE\` as a base, but ensure it is clean and ready for a PR (e.g., removing any prefixes like "[In Progress]").
6. **Pull Request Description:** Write a detailed description of the changes. Start by explicitly linking the Jira key (e.g., "Closes JIRA-123"). Summarize the work, noting how it meets the acceptance criteria from the \`JIRA_ISSUE_DESCRIPTION\`.
</INSTRUCTIONS>

<STRICT_RULES>
Important: When embedding code or file contents inside the JSON output (such as Python, JavaScript, or any other source files), you must encode them as valid JSON strings.
- All newline characters must be escaped as \\n.
- All double quotes inside the code must be escaped as \\".
- Do NOT format the code as JSON objects or arrays.
- Do NOT include Markdown formatting.
The JSON must remain strictly valid and parseable.
</STRICT_RULES>
  
<REQUIRED_OUTPUT_JSON_SCHEMA>
{
  "files_to_write": [
    {
      "filepath": "path/to/file_to_modify.js",
      "content": "// COMPLETE new or modified content for this file"
    },
    {
      "filepath": "path/to/new_file.py",
      "content": "# Complete content for the new file"
    }
  ],
  "files_to_delete": [
    "path/to/old_file.txt"
  ],
  "pull_request_title": "Cleaned up Jira Issue Title",
  "pull_request_description": "A detailed description starting with the Jira link (e.g., Closes JIRA-123) and summarizing the work completed.",
  "branch_title": "jira-123-short-descriptive-title"
}
</REQUIRED_OUTPUT_JSON_SCHEMA>

Think carefully STEP-BY-STEP. Return ONLY a single JSON object exactly matching the schema. Do NOT include any text, explanations, comments, or formatting before or after the JSON.

`.trim();
}

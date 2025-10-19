const BB_ACCESS_TOKEN = process.env.BB_ACCESS_TOKEN

export async function fetchAndReplace(obj) {
  // Helper function to fetch file content safely
  async function fetchFile(url) {
    try {
      const res = await fetch(url, {
        method: 'GET',
        headers: {
        'Authorization': `Bearer ${BB_ACCESS_TOKEN}`
        }
      })

      if (!res.ok) throw new Error(`Failed to fetch ${url}: ${res.status}`);
      return await res.text();
    } catch (err) {
      console.error(err);
      return null; // or keep the URL if you prefer
    }
  }

  // Recursive traversal
  async function recurse(node) {
    // If node has fileLinks, fetch all and replace them with contents
    if (Array.isArray(node.fileLinks)) {
      const fetched = await Promise.all(
        node.fileLinks.map(async (link) => {
          // Extract filename from the link (after last '/')
          const filename = link.split('/').pop();
          const text = await fetchFile(link);
          return { filename, text };
        })
      );
      node.fileLinks = fetched;
    }

    // If node has folders, recursively process them
    if (node.folders && typeof node.folders === "object") {
      const folderNames = Object.keys(node.folders);
      for (const name of folderNames) {
        await recurse(node.folders[name]);
      }
    }
  }

  await recurse(obj);
  return obj;
}
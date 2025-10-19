const BB_ACCESS_TOKEN = process.env.BB_ACCESS_TOKEN

export async function getRepoLinks(url) {
  const res = await fetch(url, { headers: { Authorization: `Bearer ${BB_ACCESS_TOKEN}` } });
  const { values } = await res.json();
  const result = { fileLinks: [], folders: {} };

  if (!Array.isArray(values)) return result;

  // process files and directories concurrently
  await Promise.all(values.map(async (item) => {
    if (item.type === 'commit_file') {
      result.fileLinks.push(item.links.self.href);
    } 
    else if (item.type === 'commit_directory') {
      const dirUrl =
        item.links?.self?.href ||
        `${url.split('/src/')[0]}/src/${item.commit.hash}/${item.path}`;

      const subResult = await getRepoLinks(dirUrl);
      const folderName = item.path.split('/').pop();

      result.folders[folderName] = subResult;
    }
  }));

  return result;
}

/*
{
  "values": [
    {
      "path": "folder1",
      "type": "commit_directory",
      "commit": {
        "hash": "b163b781f83d9943924b7cb9227084919a3a22ad",
        "links": {
          "self": { "href": "https://api.bitbucket.org/2.0/repositories/.../commit/b163..." },
          "html": { "href": "https://bitbucket.org/.../commits/b163..." }
        },
        "type": "commit"
      },
      "links": {
        "self": {
          "href": "https://api.bitbucket.org/2.0/repositories/.../src/b163.../folder1/"
        },
        "meta": {
          "href": "https://api.bitbucket.org/2.0/repositories/.../src/b163.../folder1/?format=meta"
        }
      }
    },

    {
      "path": ".gitignore",
      "type": "commit_file",
      "escaped_path": ".gitignore",
      "size": 624,
      "mimetype": null,
      "commit": { ... },
      "links": {
        "self": {
          "href": "https://api.bitbucket.org/2.0/repositories/.../.gitignore"
        },
        "meta": {
          "href": "https://api.bitbucket.org/2.0/repositories/.../.gitignore?format=meta"
        },
        "history": {
          "href": "https://api.bitbucket.org/2.0/repositories/.../filehistory/.../.gitignore"
        }
      }
    },

    {
      "path": "README.md",
      "type": "commit_file",
      "escaped_path": "README.md",
      "size": 2622,
      "mimetype": "text/markdown",
      "commit": { ... },
      "links": { ... }
    },

    {
      "path": "test.ts",
      "type": "commit_file",
      "escaped_path": "test.ts",
      "size": 0,
      "mimetype": "text/vnd.trolltech.linguist",
      "commit": { ... },
      "links": { ... }
    }
  ],
  "pagelen": 10,
  "page": 1
}
*/
import fs from 'node:fs/promises';
import path from 'node:path';

const { GITHUB_TOKEN, GITHUB_USERNAME } = process.env;

if (!GITHUB_TOKEN) {
  console.error('Missing GITHUB_TOKEN.');
  process.exit(1);
}

if (!GITHUB_USERNAME) {
  console.error('Missing GITHUB_USERNAME.');
  process.exit(1);
}

const endpoint = 'https://api.github.com/graphql';

const request = async (query, variables) => {
  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${GITHUB_TOKEN}`
    },
    body: JSON.stringify({ query, variables })
  });

  const payload = await response.json();
  if (payload.errors) {
    throw new Error(JSON.stringify(payload.errors, null, 2));
  }
  return payload.data;
};

const listQuery = `
  query($login: String!) {
    user(login: $login) {
      starredRepositoryLists(first: 50) {
        nodes {
          id
          name
        }
      }
    }
  }
`;

const listItemsQuery = `
  query($listId: ID!) {
    node(id: $listId) {
      ... on StarredRepositoryList {
        items(first: 100) {
          nodes {
            ... on Repository {
              nameWithOwner
            }
          }
        }
      }
    }
  }
`;

const data = await request(listQuery, { login: GITHUB_USERNAME });
const lists = data.user?.starredRepositoryLists?.nodes || [];

const getList = (name) => lists.find((list) => list.name === name);

const exercisesList = getList('Exercises');
const projectsList = getList('Projects');

const fetchListItems = async (list) => {
  if (!list) return [];
  const listData = await request(listItemsQuery, { listId: list.id });
  const items = listData.node?.items?.nodes || [];
  return items
    .map((item) => item?.nameWithOwner)
    .filter(Boolean);
};

const [didactic, personal] = await Promise.all([
  fetchListItems(exercisesList),
  fetchListItems(projectsList)
]);

const output = {
  didactic,
  personal
};

const outPath = path.resolve('src/data/projectLists.json');
await fs.mkdir(path.dirname(outPath), { recursive: true });
await fs.writeFile(outPath, JSON.stringify(output, null, 2));

console.log('Saved project lists to', outPath);

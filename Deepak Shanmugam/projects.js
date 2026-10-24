const projectsList = document.querySelector('#projects-list');
const projectsCount = document.querySelector('#projects-count');
const githubProfile = 'https://github.com/deepakshanmugaml';

const createIcon = (name) => {
  const icon = document.createElement('i');
  icon.dataset.lucide = name;
  return icon;
};

const renderProject = (project) => {
  const article = document.createElement('article');
  article.className = 'github-project';

  const cardHeader = document.createElement('div');
  cardHeader.className = 'project-card-header';

  const repoLink = document.createElement('a');
  repoLink.className = 'project-card-github';
  repoLink.href = project.html_url;
  repoLink.target = '_blank';
  repoLink.rel = 'noreferrer';
  repoLink.setAttribute('aria-label', `Open ${project.name} on GitHub`);

  const githubLogo = document.createElement('img');
  githubLogo.src = 'assets/github.png';
  githubLogo.alt = 'GitHub';
  githubLogo.loading = 'lazy';
  repoLink.appendChild(githubLogo);
  cardHeader.appendChild(repoLink);

  const title = document.createElement('h2');
  title.textContent = project.name;

  const description = document.createElement('p');
  description.className = 'project-description';
  if (project.description) {
    description.textContent = project.description;
  } else {
    description.classList.add('project-missing-description');
    description.textContent = 'No description added to this repository on GitHub yet.';
  }

  const meta = document.createElement('div');
  meta.className = 'project-meta';
  if (project.language) {
    const language = document.createElement('span');
    language.append(createIcon('code-2'), document.createTextNode(project.language));
    meta.append(language);
  }

  const updated = document.createElement('span');
  updated.append(createIcon('clock-3'), document.createTextNode(`Updated ${new Date(project.updated_at).toLocaleDateString(undefined, { year: 'numeric', month: 'short' })}`));
  meta.append(updated);

  const link = document.createElement('a');
  link.className = 'github-project-link';
  link.href = project.html_url;
  link.target = '_blank';
  link.rel = 'noreferrer';
  link.append(document.createTextNode('View repository'), createIcon('arrow-up-right'));

  article.append(cardHeader, title, description, meta, link);
  return article;
};

const showStatus = (message, includeProfileLink = false) => {
  const status = document.createElement('p');
  status.className = 'projects-status';
  status.textContent = message;
  if (includeProfileLink) {
    status.append(document.createTextNode(' '));
    const link = document.createElement('a');
    link.href = githubProfile;
    link.target = '_blank';
    link.rel = 'noreferrer';
    link.textContent = 'Browse the GitHub profile instead.';
    status.append(link);
  }
  projectsList.replaceChildren(status);
};

fetch('https://api.github.com/users/deepakshanmugaml/repos?per_page=100&sort=updated')
  .then((response) => {
    if (!response.ok) throw new Error('GitHub repositories could not be loaded.');
    return response.json();
  })
  .then((projects) => {
    projectsCount.textContent = `${projects.length} public ${projects.length === 1 ? 'project' : 'projects'}`;
    if (!projects.length) {
      showStatus('No public repositories found.');
      return;
    }
    projectsList.replaceChildren(...projects.map(renderProject));
    if (window.lucide) lucide.createIcons();
  })
  .catch(() => {
    projectsCount.textContent = 'GitHub unavailable';
    showStatus('Projects could not be loaded right now.', true);
  });
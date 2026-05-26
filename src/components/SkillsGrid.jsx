import { Icon } from '@iconify/react';

const renderIcon = (skill) => {
  if (skill.image) {
    return <img src={skill.image} alt={skill.name} width={22} height={22} />;
  }

  if (skill.useColor) {
    return <Icon icon={skill.icon} color={skill.color} width={22} height={22} />;
  }

  return <Icon icon={skill.icon} width={22} height={22} />;
};

export const skillGroups = [
  {
    title: 'Languages',
    items: [
      { name: 'Assembly Script', icon: 'simple-icons:assemblyscript', color: '#007aac', level: 3 },
      { name: 'C', icon: 'simple-icons:c', color: '#a8b9cc', level: 3 },
      { name: 'C++', icon: 'simple-icons:cplusplus', color: '#00599c', level: 2 },
      { name: 'C#', icon: 'devicon:csharp', level: 1 },
      { name: 'CUDA', icon: 'simple-icons:nvidia', color: '#76b900', level: 3, useColor: true },
      { name: 'Java', icon: 'devicon:java', level: 3 },
      { name: 'JavaScript', icon: 'devicon:javascript', level: 2 },
      { name: 'TypeScript', icon: 'devicon:typescript', level: 3 },
      { name: 'Python', icon: 'devicon:python', level: 3 },
      { name: 'Rust', icon: 'devicon:rust', level: 3 },
      { name: 'Scala', icon: 'devicon:scala', level: 1 },
      { name: 'Bash', icon: 'devicon:bash', level: 3 },
      { name: 'PowerShell', icon: 'devicon:powershell', level: 1 },
      { name: 'GDScript', icon: 'devicon:godot', level: 3 },
      { name: 'HTML5', icon: 'devicon:html5', level: 3 },
      { name: 'CSS3', icon: 'devicon:css3', level: 3 },
      { name: 'Markdown', icon: 'devicon:markdown', level: 3 },
      { name: 'LaTeX', icon: 'devicon:latex', level: 2 }
    ]
  },
  {
    title: 'Frontend and UI',
    items: [
      { name: 'React', icon: 'devicon:react', level: 3 },
      { name: 'React Native', icon: 'devicon:react', level: 1 },
      { name: 'React Router', icon: 'devicon:reactrouter', level: 2 },
      { name: 'Next.js', icon: 'devicon:nextjs', level: 2 },
      { name: 'TailwindCSS', icon: 'devicon:tailwindcss', level: 2 },
      { name: 'Bootstrap', icon: 'devicon:bootstrap', level: 3 },
      { name: 'Vite', icon: 'devicon:vitejs', level: 3 },
      { name: 'Three.js', icon: 'devicon:threejs', level: 1 },
      { name: 'Qt', icon: 'devicon:qt', level: 1 },
      { name: 'WordPress', icon: 'devicon:wordpress', level: 1 }
    ]
  },
  {
    title: 'Backend and APIs',
    items: [
      { name: '.NET', icon: 'devicon:dotnetcore', level: 1 },
      { name: 'Spring', icon: 'devicon:spring', level: 1 },
      { name: 'Django', icon: 'simple-icons:django', color: '#114f37', level: 2, useColor: true },
      { name: 'Flask', icon: 'devicon:flask', level: 2 },
      { name: 'JWT', icon: 'simple-icons:jsonwebtokens', color: '#ffffff', level: 2, useColor: true },
      { name: 'OpenAPI', icon: 'simple-icons:openapiinitiative', color: '#6ba539', level: 3, useColor: true },
      { name: 'Swagger', icon: 'devicon:swagger', level: 3 },
      { name: 'GraphQL', icon: 'simple-icons:graphql', color: '#e10098', level: 1, useColor: true },
      { name: 'Postman', icon: 'devicon:postman', level: 2 }
    ]
  },
  {
    title: 'Data and Databases',
    items: [
      { name: 'PostgreSQL', icon: 'devicon:postgresql', level: 1 },
      { name: 'MySQL', icon: 'devicon:mysql', level: 2 },
      { name: 'SQLite', icon: 'devicon:sqlite', level: 3 },
      { name: 'MongoDB', icon: 'devicon:mongodb', level: 2 },
      { name: 'Redis', icon: 'devicon:redis', level: 1 },
      { name: 'Apache Cassandra', icon: 'devicon:cassandra', level: 1 },
      { name: 'Apache Hadoop', icon: 'devicon:hadoop', level: 2 },
      { name: 'Apache Spark', icon: 'simple-icons:apachespark', color: '#e25a1c', level: 2, useColor: true },
      { name: 'Databricks', icon: 'simple-icons:databricks', color: '#ff3621', level: 1, useColor: true },
      { name: 'Power BI', icon: 'simple-icons:powerbi', color: '#f2c811', level: 1, useColor: true },
      { name: 'Snowflake', icon: 'simple-icons:snowflake', color: '#29b5e8', level: 1, useColor: true },
      { name: 'dbt', icon: 'simple-icons:dbt', color: '#ff694b', level: 1, useColor: true },
      { name: 'DataHub', image: '/datahub.png', level: 2 },
      { name: 'Kafka', icon: 'simple-icons:apachekafka', color: '#ffffff', level: 1, useColor: true },
      { name: 'ElasticSearch', icon: 'simple-icons:elasticsearch', color: '#005571', level: 1, useColor: true },
      { name: 'Qlik', icon: 'simple-icons:qlik', color: '#009845', level: 1, useColor: true },
      { name: 'MicroStrategy', icon: 'simple-icons:microstrategy', color: '#d12228', level: 1, useColor: true },
      { name: 'Matplotlib', icon: 'devicon:matplotlib', level: 1 },
      { name: 'NumPy', icon: 'devicon:numpy', level: 1 },
      { name: 'Pandas', icon: 'devicon:pandas', level: 1 },
      { name: 'PyTorch', icon: 'devicon:pytorch', level: 1 },
      { name: 'TensorFlow', icon: 'devicon:tensorflow', level: 1 }
    ]
  },
  {
    title: 'Cloud and DevOps',
    items: [
      { name: 'AWS', icon: 'devicon:amazonwebservices', level: 1 },
      { name: 'Azure', icon: 'simple-icons:microsoftazure', color: '#0078d4', level: 2, useColor: true },
      { name: 'Docker', icon: 'devicon:docker', level: 2 },
      { name: 'Kubernetes', icon: 'devicon:kubernetes', level: 2 },
      { name: 'Helm', icon: 'simple-icons:helm', color: '#0f1689', level: 1, useColor: true },
      { name: 'GitLab', icon: 'devicon:gitlab', level: 2 },
      { name: 'Git', icon: 'devicon:git', level: 3 },
      { name: 'GitHub', icon: 'devicon:github', level: 2 },
      { name: 'GitHub Actions', icon: 'simple-icons:githubactions', color: '#2088ff', level: 1, useColor: true },
      { name: 'NPM', icon: 'devicon:npm', level: 2 },
      { name: 'SonarQube', icon: 'simple-icons:sonarqube', color: '#4e9bcd', level: 1, useColor: true },
      { name: 'WireGuard', icon: 'simple-icons:wireguard', color: '#88171a', level: 2, useColor: true },
      { name: 'Mosquitto', icon: 'simple-icons:eclipsemosquitto', color: '#3c5280', level: 2, useColor: true },
      { name: 'Apache', icon: 'devicon:apache', level: 1 },
      { name: 'CMake', icon: 'devicon:cmake', level: 2 }
    ]
  },
  {
    title: 'Design and Game Dev',
    items: [
      { name: 'Godot Engine', icon: 'devicon:godot', level: 3 },
      { name: 'Figma', icon: 'devicon:figma', level: 3 },
      { name: 'Gimp', icon: 'simple-icons:gimp', color: '#5c5543', level: 3, useColor: true },
      { name: 'NVIDIA', icon: 'simple-icons:nvidia', color: '#76b900', level: 2, useColor: true }
    ]
  },
  {
    title: 'OS and Tooling',
    items: [
      { name: 'Nix', icon: 'simple-icons:nixos', color: '#5277c3', level: 1, useColor: true },
      {name: 'Arch Linux', icon: 'simple-icons:archlinux', color: '#1793d1', level: 1, useColor: true },
      { name: 'Linux', icon: 'devicon:linux', level: 3 },
      { name: 'Windows', icon: 'simple-icons:windows', color: '#0078d4', level: 3, useColor: true }
    ]
  }
];

const SkillsGrid = () => {
  return (
    <div className="skills-groups">
      {skillGroups.map((group) => (
        <div className="skills-group" key={group.title}>
          <div className="skills-group__header">
            <h3>{group.title}</h3>
          </div>
          <div className="skills-grid">
            {group.items.map((skill) => (
              <div className="skill-card" key={`${group.title}-${skill.name}`}>
                <div className="skill-icon">
                  {renderIcon(skill)}
                </div>
                <span>{skill.name}</span>
                <div className="skill-level" aria-label={`Level ${skill.level} of 3`}>
                  {[1, 2, 3].map((star) => (
                    <span
                      key={star}
                      className={star <= skill.level ? 'skill-star skill-star--on' : 'skill-star'}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export default SkillsGrid;
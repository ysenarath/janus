interface QuickLink {
  name: string;
  url: string;
}

export const QuickLinks = () => {
  const defaultLinks: QuickLink[] = [
    { name: 'Gmail', url: 'https://gmail.com' },
    { name: 'YouTube', url: 'https://youtube.com' },
    { name: 'GitHub', url: 'https://github.com' },
    { name: 'Drive', url: 'https://drive.google.com' }
  ];

  return (
    <div className="grid grid-cols-4 gap-4 max-w-3xl mx-auto">
      {defaultLinks.map((link) => (
        <a
          key={link.name}
          href={link.url}
          className="quick-link"
        >
          {link.name}
        </a>
      ))}
    </div>
  );
};

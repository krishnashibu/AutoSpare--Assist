const Icon = ({ children, size = 20 }) => (
  <svg
    aria-hidden="true"
    fill="none"
    height={size}
    viewBox="0 0 24 24"
    width={size}
    xmlns="http://www.w3.org/2000/svg"
  >
    {children}
  </svg>
);

export const UserIcon = () => (
  <Icon>
    <path d="M20 21a8 8 0 0 0-16 0M12 13a5 5 0 1 0 0-10 5 5 0 0 0 0 10Z" />
  </Icon>
);

export const LockIcon = () => (
  <Icon>
    <rect x="4" y="10" width="16" height="11" rx="3" />
    <path d="M8 10V7a4 4 0 0 1 8 0v3" />
  </Icon>
);

export const WrenchIcon = ({ size = 24 }) => (
  <Icon size={size}>
    <path d="M14.7 6.3a4 4 0 0 0-5-5L12 3.6 9.6 6 7.3 3.7a4 4 0 0 0 5 5L4 17v3h3l7.7-8.3a4 4 0 0 0 5-5L17.4 9 15 6.6l2.3-2.3" />
  </Icon>
);

export const EyeIcon = ({ hidden }) => (
  <Icon>
    <path d="M2.5 12s3.5-6 9.5-6 9.5 6 9.5 6-3.5 6-9.5 6-9.5-6-9.5-6Z" />
    <circle cx="12" cy="12" r="2.5" />
    {hidden && <path d="m4 4 16 16" />}
  </Icon>
);

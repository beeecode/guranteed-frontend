import nextVitals from 'eslint-config-next/core-web-vitals';
import nextTypeScript from 'eslint-config-next/typescript';

const eslintConfig = [
  ...nextVitals,
  ...nextTypeScript,
  {
    rules: {
      // Plain <img> is kept on purpose: next/image would change sizing/layout of the existing design.
      '@next/next/no-img-element': 'off',
      // Copy is full of apostrophes/quotes; escaping them renders identically and only adds noise.
      'react/no-unescaped-entities': 'off',
      '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
    },
  },
  { ignores: ['.next/**', 'node_modules/**', 'next-env.d.ts', 'docs/**', '.figma/**'] },
];

export default eslintConfig;
